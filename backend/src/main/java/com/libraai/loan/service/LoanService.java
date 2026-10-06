package com.libraai.loan.service;

import com.libraai.audit.service.AuditService;
import com.libraai.book.entity.Author;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.common.exception.BadRequestException;
import com.libraai.common.exception.BusinessRuleViolationException;
import com.libraai.common.exception.ResourceNotFoundException;
import com.libraai.loan.dto.*;
import com.libraai.loan.entity.Fine;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.entity.Reservation;
import com.libraai.loan.repository.FineRepository;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.loan.repository.ReservationRepository;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final ReservationRepository reservationRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Value("${libraai.rules.max-books-per-member:5}")
    private int maxBooksPerMember;

    @Value("${libraai.rules.max-renewal-count:2}")
    private int maxRenewalCount;

    @Value("${libraai.rules.loan-period-days:14}")
    private int defaultLoanPeriodDays;

    @Value("${libraai.rules.daily-fine-rate:1.00}")
    private BigDecimal dailyFineRate;

    public LoanService(LoanRepository loanRepository,
                       FineRepository fineRepository,
                       ReservationRepository reservationRepository,
                       BookCopyRepository bookCopyRepository,
                       BookRepository bookRepository,
                       UserRepository userRepository,
                       AuditService auditService) {
        this.loanRepository = loanRepository;
        this.fineRepository = fineRepository;
        this.reservationRepository = reservationRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public LoanDto issueLoan(IssueLoanRequest request, String librarianUsername) {
        BookCopy copy = bookCopyRepository.findByBarcode(request.getBarcode())
                .orElseThrow(() -> new ResourceNotFoundException("BookCopy", "barcode", request.getBarcode()));

        if (!"AVAILABLE".equalsIgnoreCase(copy.getStatus())) {
            throw new BusinessRuleViolationException("Cannot issue book copy: Copy is currently " + copy.getStatus());
        }

        User member = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", request.getUsername()));

        User librarian = librarianUsername != null
                ? userRepository.findByUsername(librarianUsername).orElse(null)
                : null;

        // 1. Enforce Borrowing Limit
        long activeLoans = loanRepository.countByUserIdAndStatus(member.getId(), "ACTIVE");
        if (activeLoans >= maxBooksPerMember) {
            throw new BusinessRuleViolationException(
                    "Borrowing limit exceeded: Member '" + member.getUsername() + "' already has " + activeLoans + " active loans (Max: " + maxBooksPerMember + ")"
            );
        }

        // 2. Enforce Fine Block Rule (if unpaid fines exceed $20.00)
        BigDecimal unpaidFines = fineRepository.sumUnpaidFinesByUserId(member.getId());
        if (unpaidFines != null && unpaidFines.compareTo(BigDecimal.valueOf(20.00)) > 0) {
            throw new BusinessRuleViolationException(
                    "Borrowing blocked: Member has ₹" + unpaidFines + " in unpaid overdue fines. Please clear fines first."
            );
        }

        // 3. Mark copy as BORROWED
        copy.setStatus("BORROWED");
        bookCopyRepository.save(copy);

        // 4. Calculate Due Date (default 14 days)
        int loanDays = request.getLoanPeriodDays() != null && request.getLoanPeriodDays() > 0
                ? request.getLoanPeriodDays()
                : defaultLoanPeriodDays;
        Instant dueDate = Instant.now().plus(Duration.ofDays(loanDays));

        Loan loan = new Loan(copy, member, librarian, dueDate);
        Loan savedLoan = loanRepository.save(loan);

        // 5. If member had a pending reservation for this book, fulfill it
        List<Reservation> userReservations = reservationRepository.findByUserIdAndStatus(member.getId(), "PENDING");
        for (Reservation res : userReservations) {
            if (res.getBook().getId().equals(copy.getBook().getId())) {
                res.setStatus("FULFILLED");
                reservationRepository.save(res);
                break;
            }
        }

        // Audit log
        auditService.log("LOAN_ISSUED", "Loan", savedLoan.getId(),
                "Issued copy " + copy.getBarcode() + " (" + copy.getBook().getTitle() + ") to member " + member.getUsername(),
                librarianUsername, null);

        return mapToLoanDto(savedLoan);
    }

    @Transactional
    public LoanDto returnLoan(ReturnLoanRequest request, String librarianUsername) {
        Loan loan = loanRepository.findActiveLoanByBarcode(request.getBarcode())
                .orElseThrow(() -> new ResourceNotFoundException("Active loan not found for barcode: " + request.getBarcode()));

        Instant now = Instant.now();
        loan.setReturnDate(now);
        loan.setStatus("RETURNED");

        BookCopy copy = loan.getBookCopy();

        // 1. Calculate Overdue Fine & Late Days (if returned past due date)
        int lateDays = 0;
        BigDecimal fineAmount = BigDecimal.ZERO;
        if (now.isAfter(loan.getDueDate())) {
            long daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), now);
            if (daysOverdue == 0) daysOverdue = 1;
            lateDays = (int) daysOverdue;

            fineAmount = dailyFineRate.multiply(BigDecimal.valueOf(lateDays));
            Fine fine = new Fine(loan, loan.getUser(), fineAmount);
            fineRepository.save(fine);

            auditService.log("FINE_ASSESSED", "Fine", fine.getId(),
                    "Overdue fine of ₹" + fineAmount + " assessed for member " + loan.getUser().getUsername() + " (" + lateDays + " days late)",
                    librarianUsername, null);
        }
        loan.setLateDays(lateDays);
        loan.setFineAmount(fineAmount);

        // 2. Check if a member has a pending reservation for this book
        Optional<Reservation> nextReservation = reservationRepository
                .findFirstByBookIdAndStatusOrderByReservationDateAsc(copy.getBook().getId(), "PENDING");

        if (nextReservation.isPresent()) {
            copy.setStatus("RESERVED");
            Reservation res = nextReservation.get();
            res.setExpiryDate(now.plus(Duration.ofHours(48)));
            reservationRepository.save(res);
        } else {
            copy.setStatus("AVAILABLE");
        }

        bookCopyRepository.save(copy);
        Loan savedLoan = loanRepository.save(loan);

        auditService.log("LOAN_RETURNED", "Loan", savedLoan.getId(),
                "Returned copy " + copy.getBarcode() + " (" + copy.getBook().getTitle() + ") - Late days: " + lateDays + ", Fine: ₹" + fineAmount,
                librarianUsername, null);

        return mapToLoanDto(savedLoan);
    }

    @Transactional
    public LoanDto returnLoanById(Long loanId, String requesterUsername) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", loanId));

        if (!"ACTIVE".equalsIgnoreCase(loan.getStatus())) {
            throw new BusinessRuleViolationException("Cannot return loan: Loan status is already " + loan.getStatus());
        }

        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", requesterUsername));

        boolean isLibrarianOrAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_LIBRARIAN") || r.getName().equals("ROLE_ADMIN"));

        if (!isLibrarianOrAdmin && !loan.getUser().getId().equals(requester.getId())) {
            throw new BusinessRuleViolationException("You are not authorized to return a loan belonging to another member");
        }

        Instant now = Instant.now();
        loan.setReturnDate(now);
        loan.setStatus("RETURNED");

        BookCopy copy = loan.getBookCopy();

        // 1. Calculate Overdue Fine & Late Days (if returned past due date)
        int lateDays = 0;
        BigDecimal fineAmount = BigDecimal.ZERO;
        if (now.isAfter(loan.getDueDate())) {
            long daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), now);
            if (daysOverdue == 0) daysOverdue = 1;
            lateDays = (int) daysOverdue;

            fineAmount = dailyFineRate.multiply(BigDecimal.valueOf(lateDays));
            Fine fine = new Fine(loan, loan.getUser(), fineAmount);
            fineRepository.save(fine);

            auditService.log("FINE_ASSESSED", "Fine", fine.getId(),
                    "Overdue fine of ₹" + fineAmount + " assessed for member " + loan.getUser().getUsername() + " (" + lateDays + " days late)",
                    requesterUsername, null);
        }
        loan.setLateDays(lateDays);
        loan.setFineAmount(fineAmount);

        // 2. Increment Stock / Check Reservation Queue
        Optional<Reservation> nextReservation = reservationRepository
                .findFirstByBookIdAndStatusOrderByReservationDateAsc(copy.getBook().getId(), "PENDING");

        if (nextReservation.isPresent()) {
            copy.setStatus("RESERVED");
            Reservation res = nextReservation.get();
            res.setExpiryDate(now.plus(Duration.ofHours(48)));
            reservationRepository.save(res);
        } else {
            copy.setStatus("AVAILABLE");
        }

        bookCopyRepository.save(copy);
        Loan savedLoan = loanRepository.save(loan);

        auditService.log("LOAN_RETURNED", "Loan", savedLoan.getId(),
                "Returned copy " + copy.getBarcode() + " (" + copy.getBook().getTitle() + ") by " + requesterUsername + " - Late days: " + lateDays + ", Fine: ₹" + fineAmount,
                requesterUsername, null);

        return mapToLoanDto(savedLoan);
    }

    @Transactional
    public LoanDto renewLoan(Long loanId, String requesterUsername) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", loanId));

        if (!"ACTIVE".equalsIgnoreCase(loan.getStatus())) {
            throw new BusinessRuleViolationException("Cannot renew loan: Loan status is " + loan.getStatus());
        }

        User user = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", requesterUsername));

        boolean isLibrarianOrAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_LIBRARIAN") || r.getName().equals("ROLE_ADMIN"));

        if (!isLibrarianOrAdmin && !loan.getUser().getId().equals(user.getId())) {
            throw new BusinessRuleViolationException("You cannot renew a loan belonging to another member");
        }

        // 1. Check Renewal Limit
        if (loan.getRenewalCount() >= maxRenewalCount) {
            throw new BusinessRuleViolationException(
                    "Maximum renewal limit reached (" + maxRenewalCount + " renewals allowed per loan)"
            );
        }

        // 2. Check Overdue Status
        Instant now = Instant.now();
        if (now.isAfter(loan.getDueDate())) {
            throw new BusinessRuleViolationException(
                    "Overdue loans cannot be renewed. Please return the book and clear any overdue fines."
            );
        }

        // 3. Check if there are pending reservations for this book
        boolean hasPendingReservations = !reservationRepository
                .findByBookIdAndStatusOrderByReservationDateAsc(loan.getBookCopy().getBook().getId(), "PENDING")
                .isEmpty();

        if (hasPendingReservations) {
            throw new BusinessRuleViolationException(
                    "Cannot renew: Another member is waiting in queue with a reservation for this title."
            );
        }

        // Extend due date by standard loan period
        loan.setDueDate(loan.getDueDate().plus(Duration.ofDays(defaultLoanPeriodDays)));
        loan.setRenewalCount(loan.getRenewalCount() + 1);

        Loan updated = loanRepository.save(loan);

        auditService.log("LOAN_RENEWED", "Loan", updated.getId(),
                "Renewed loan for copy " + loan.getBookCopy().getBarcode() + " (Renewal " + updated.getRenewalCount() + "/2)",
                requesterUsername, null);

        return mapToLoanDto(updated);
    }

    @Transactional(readOnly = true)
    public List<LoanDto> getUserLoans(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return loanRepository.findByUserIdOrderByIssueDateDesc(user.getId()).stream()
                .map(this::mapToLoanDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanDto> getActiveLoans() {
        return loanRepository.findByStatusOrderByDueDateAsc("ACTIVE").stream()
                .map(this::mapToLoanDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FineDto> getUserFines(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return fineRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(f -> new FineDto(
                        f.getId(),
                        f.getLoan().getId(),
                        f.getLoan().getBookCopy().getBook().getTitle(),
                        f.getLoan().getBookCopy().getBarcode(),
                        f.getUser().getId(),
                        f.getUser().getUsername(),
                        f.getAmount(),
                        f.getPaidAmount(),
                        f.getStatus(),
                        f.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public FineDto payFine(Long fineId, PayFineRequest request) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine", "id", fineId));

        BigDecimal newPaidAmount = fine.getPaidAmount().add(request.getAmount());
        fine.setPaidAmount(newPaidAmount);

        if (newPaidAmount.compareTo(fine.getAmount()) >= 0) {
            fine.setStatus("PAID");
        } else {
            fine.setStatus("PARTIALLY_PAID");
        }

        fine.setUpdatedAt(Instant.now());
        Fine saved = fineRepository.save(fine);

        auditService.log("FINE_PAID", "Fine", saved.getId(),
                "Fine payment of ₹" + request.getAmount() + " processed for user " + fine.getUser().getUsername(),
                fine.getUser().getUsername(), null);

        return new FineDto(
                saved.getId(),
                saved.getLoan().getId(),
                saved.getLoan().getBookCopy().getBook().getTitle(),
                saved.getLoan().getBookCopy().getBarcode(),
                saved.getUser().getId(),
                saved.getUser().getUsername(),
                saved.getAmount(),
                saved.getPaidAmount(),
                saved.getStatus(),
                saved.getCreatedAt()
        );
    }

    @Transactional
    public ReservationDto createReservation(Long bookId, String username) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (reservationRepository.existsByBookIdAndUserIdAndStatus(bookId, user.getId(), "PENDING")) {
            throw new BadRequestException("You already have an active pending reservation for this book");
        }

        Reservation res = new Reservation(book, user);
        Reservation saved = reservationRepository.save(res);

        auditService.log("RESERVATION_CREATED", "Reservation", saved.getId(),
                "Placed title reservation on '" + book.getTitle() + "'",
                username, null);

        return new ReservationDto(
                saved.getId(),
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                user.getId(),
                user.getUsername(),
                saved.getReservationDate(),
                saved.getExpiryDate(),
                saved.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getUserReservations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        return reservationRepository.findByUserIdOrderByReservationDateDesc(user.getId()).stream()
                .map(r -> new ReservationDto(
                        r.getId(),
                        r.getBook().getId(),
                        r.getBook().getTitle(),
                        r.getBook().getIsbn(),
                        r.getUser().getId(),
                        r.getUser().getUsername(),
                        r.getReservationDate(),
                        r.getExpiryDate(),
                        r.getStatus()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelReservation(Long reservationId, String username) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isLibrarianOrAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_LIBRARIAN") || r.getName().equals("ROLE_ADMIN"));

        if (!isLibrarianOrAdmin && !res.getUser().getId().equals(user.getId())) {
            throw new BusinessRuleViolationException("You cannot cancel another member's reservation");
        }

        res.setStatus("CANCELLED");
        reservationRepository.save(res);

        auditService.log("RESERVATION_CANCELLED", "Reservation", res.getId(),
                "Cancelled reservation on '" + res.getBook().getTitle() + "'",
                username, null);
    }

    @Transactional(readOnly = true)
    public Page<LoanDto> getMemberLoanHistory(Long memberId, Instant from, Instant to, String status,
                                              Pageable pageable, String requestingUsername) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", requestingUsername));

        boolean isLibrarianOrAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_LIBRARIAN") || r.getName().equals("ROLE_ADMIN"));

        if (!isLibrarianOrAdmin && !requester.getId().equals(memberId)) {
            throw new BusinessRuleViolationException("You are not authorized to view another member's borrowing history");
        }

        // Verify member exists
        userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));

        String sanitizedStatus = (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL"))
                ? status.toUpperCase().trim()
                : null;

        Page<Loan> loansPage = loanRepository.findMemberHistory(memberId, from, to, sanitizedStatus, pageable);
        return loansPage.map(this::mapToLoanDto);
    }

    @Transactional(readOnly = true)
    public MemberLoanStatsDto getMemberLoanStats(Long memberId, String requestingUsername) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", requestingUsername));

        boolean isLibrarianOrAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_LIBRARIAN") || r.getName().equals("ROLE_ADMIN"));

        if (!isLibrarianOrAdmin && !requester.getId().equals(memberId)) {
            throw new BusinessRuleViolationException("You are not authorized to view another member's loan statistics");
        }

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));

        long total = loanRepository.countByUserId(memberId);
        long active = loanRepository.countByUserIdAndStatus(memberId, "ACTIVE");
        long returned = loanRepository.countByUserIdAndStatus(memberId, "RETURNED");
        long overdue = loanRepository.countByUserIdAndStatus(memberId, "OVERDUE");
        Double avgLate = loanRepository.getAverageLateDaysByUserId(memberId);
        BigDecimal totalFines = loanRepository.sumFineAmountByUserId(memberId);

        return new MemberLoanStatsDto(
                member.getId(),
                member.getUsername(),
                total,
                active,
                returned,
                overdue,
                avgLate != null ? Math.round(avgLate * 10.0) / 10.0 : 0.0,
                totalFines
        );
    }

    @Transactional(readOnly = true)
    public RentalQuoteDto getRentalQuote(Long bookId, int days) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        int rentalDays = (days > 0 && days <= 90) ? days : defaultLoanPeriodDays;
        BigDecimal dailyRate = new BigDecimal("0.50");
        BigDecimal totalFee = dailyRate.multiply(BigDecimal.valueOf(rentalDays)).setScale(2, java.math.RoundingMode.HALF_UP);
        Instant dueDatePreview = Instant.now().plus(rentalDays, ChronoUnit.DAYS);

        List<BookCopy> copies = bookCopyRepository.findByBookId(bookId);
        long availableCount = copies.stream().filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus())).count();

        return new RentalQuoteDto(
                book.getId(),
                book.getTitle(),
                book.getLanguage() != null ? book.getLanguage() : "en",
                rentalDays,
                dailyRate,
                totalFee,
                dueDatePreview,
                availableCount > 0,
                (int) availableCount
        );
    }

    @Transactional
    public LoanDto bookAndPayRental(BookRentalRequest request, String username) {
        if (username == null) {
            throw new BadRequestException("You must be authenticated to book and rent a book");
        }

        User member = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // 1. Enforce Borrowing Limit
        long activeLoans = loanRepository.countByUserIdAndStatus(member.getId(), "ACTIVE");
        if (activeLoans >= maxBooksPerMember) {
            throw new BusinessRuleViolationException(
                    "Borrowing limit exceeded: Member '" + member.getUsername() + "' already has " + activeLoans + " active loans (Max: " + maxBooksPerMember + ")"
            );
        }

        // 2. Enforce Fine Block Rule (if unpaid fines exceed $20.00)
        BigDecimal unpaidFines = fineRepository.sumUnpaidFinesByUserId(member.getId());
        if (unpaidFines != null && unpaidFines.compareTo(new BigDecimal("20.00")) > 0) {
            throw new BusinessRuleViolationException(
                    "Account blocked from new rentals due to unpaid fines: ₹" + unpaidFines + " (Threshold: ₹20.00). Please settle outstanding fines first."
            );
        }

        // 3. Find Book and Available Copy
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", request.getBookId()));

        BookCopy copyToRent;
        if (request.getBarcode() != null && !request.getBarcode().isBlank()) {
            copyToRent = bookCopyRepository.findByBarcode(request.getBarcode())
                    .orElseThrow(() -> new ResourceNotFoundException("BookCopy", "barcode", request.getBarcode()));
            if (!"AVAILABLE".equalsIgnoreCase(copyToRent.getStatus())) {
                throw new BusinessRuleViolationException("Requested copy '" + request.getBarcode() + "' is currently " + copyToRent.getStatus());
            }
        } else {
            List<BookCopy> copies = bookCopyRepository.findByBookId(book.getId());
            copyToRent = copies.stream()
                    .filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessRuleViolationException("No copies of '" + book.getTitle() + "' are currently available for rental. Please place a reservation hold."));
        }

        // 4. Calculate Rental Duration & Upfront Fee
        int rentalDays = request.getRentalPeriodDays() > 0 ? request.getRentalPeriodDays() : defaultLoanPeriodDays;
        BigDecimal dailyRate = new BigDecimal("0.50");
        BigDecimal totalRentalFee = dailyRate.multiply(BigDecimal.valueOf(rentalDays)).setScale(2, java.math.RoundingMode.HALF_UP);
        Instant dueDate = Instant.now().plus(rentalDays, ChronoUnit.DAYS);

        // 5. Generate Payment Reference
        String paymentRef = request.getPaymentReference() != null && !request.getPaymentReference().isBlank()
                ? request.getPaymentReference()
                : "PAY-LBR-" + (System.currentTimeMillis() % 1000000);

        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : "CREDIT_CARD";

        // 6. Create Loan & Mark Copy Borrowed
        Loan loan = new Loan(
                copyToRent,
                member,
                null,
                dueDate,
                totalRentalFee,
                paymentRef,
                paymentMethod,
                "PAID",
                rentalDays,
                dailyRate
        );

        Loan savedLoan = loanRepository.save(loan);
        copyToRent.setStatus("BORROWED");
        bookCopyRepository.save(copyToRent);

        // 7. Audit Log
        auditService.log(
                "BOOK_RENTAL_PAID",
                "Loan",
                savedLoan.getId(),
                "Booked '" + book.getTitle() + "' for " + rentalDays + " days. Upfront fee paid: ₹" + totalRentalFee + " (Ref: " + paymentRef + ")",
                member.getUsername(),
                null
        );

        return mapToLoanDto(savedLoan);
    }

    @Transactional(readOnly = true)
    public List<LoanDto> getBookRentalHistory(Long bookId) {
        bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        List<Loan> loans = loanRepository.findByBookIdOrderByIssueDateDesc(bookId);
        return loans.stream().map(this::mapToLoanDto).collect(Collectors.toList());
    }

    public LoanDto mapToLoanDto(Loan loan) {
        Instant now = Instant.now();
        boolean overdue = "ACTIVE".equalsIgnoreCase(loan.getStatus()) && now.isAfter(loan.getDueDate());

        BigDecimal accruedFine = BigDecimal.ZERO;
        int currentOverdueDays = 0;
        if (overdue) {
            long days = ChronoUnit.DAYS.between(loan.getDueDate(), now);
            if (days <= 0) days = 1;
            currentOverdueDays = (int) days;
            accruedFine = dailyFineRate.multiply(BigDecimal.valueOf(days)).setScale(2, java.math.RoundingMode.HALF_UP);
        } else if ("RETURNED".equalsIgnoreCase(loan.getStatus()) && loan.getLateDays() > 0) {
            currentOverdueDays = loan.getLateDays();
            accruedFine = loan.getFineAmount();
        }

        BookCopy copy = loan.getBookCopy();
        Book book = copy.getBook();
        User member = loan.getUser();

        String bookLanguage = book.getLanguage() != null ? book.getLanguage() : "en";
        String bookCategory = book.getCategory() != null ? book.getCategory().getName() : "General";
        List<String> bookAuthors = book.getAuthors() != null
                ? book.getAuthors().stream().map(Author::getName).collect(Collectors.toList())
                : List.of();

        return new LoanDto(
                loan.getId(),
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                bookLanguage,
                bookCategory,
                bookAuthors,
                copy.getId(),
                copy.getBarcode(),
                member.getId(),
                member.getUsername(),
                member.getFullName(),
                member.getEmail(),
                loan.getIssueDate(),
                loan.getDueDate(),
                loan.getReturnDate(),
                loan.getRenewalCount(),
                loan.getFineAmount(),
                loan.getLateDays(),
                loan.getStatus(),
                overdue,
                accruedFine,
                currentOverdueDays,
                loan.getRentalFee(),
                loan.getPaymentReference(),
                loan.getPaymentMethod(),
                loan.getPaymentStatus(),
                loan.getBookingPeriodDays(),
                loan.getDailyRentalRate()
        );
    }
}
