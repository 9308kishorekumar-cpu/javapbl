package com.libraai.admin.service;

import com.libraai.admin.dto.CategoryCountDto;
import com.libraai.admin.dto.MemberDetailDto;
import com.libraai.admin.dto.MemberLifetimeStatsDto;
import com.libraai.admin.dto.MemberProfileDto;
import com.libraai.analytics.dto.MemberOverdueRiskDto;
import com.libraai.analytics.service.AnalyticsService;
import com.libraai.book.dto.BookRatingDto;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookRating;
import com.libraai.book.repository.BookRatingRepository;
import com.libraai.common.exception.ResourceNotFoundException;
import com.libraai.loan.dto.LoanDto;
import com.libraai.loan.dto.ReservationDto;
import com.libraai.loan.entity.Fine;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.entity.Reservation;
import com.libraai.loan.repository.FineRepository;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.loan.repository.ReservationRepository;
import com.libraai.loan.service.LoanService;
import com.libraai.security.entity.Role;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class LibrarianMemberService {

    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final LoanService loanService;
    private final FineRepository fineRepository;
    private final BookRatingRepository bookRatingRepository;
    private final ReservationRepository reservationRepository;
    private final AnalyticsService analyticsService;

    public LibrarianMemberService(UserRepository userRepository,
                                  LoanRepository loanRepository,
                                  LoanService loanService,
                                  FineRepository fineRepository,
                                  BookRatingRepository bookRatingRepository,
                                  ReservationRepository reservationRepository,
                                  AnalyticsService analyticsService) {
        this.userRepository = userRepository;
        this.loanRepository = loanRepository;
        this.loanService = loanService;
        this.fineRepository = fineRepository;
        this.bookRatingRepository = bookRatingRepository;
        this.reservationRepository = reservationRepository;
        this.analyticsService = analyticsService;
    }

    public MemberDetailDto getMemberDetail(Long userId, Instant fromDate, Instant toDate, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Instant now = Instant.now();

        // 1. Member Profile
        long membershipAgeDays = (user.getCreatedAt() != null)
                ? Math.max(1, Duration.between(user.getCreatedAt(), now).toDays())
                : 1;

        List<String> roles = user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
                : Collections.singletonList("ROLE_MEMBER");

        MemberProfileDto profile = new MemberProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getMembershipStatus(),
                roles,
                user.getCreatedAt(),
                membershipAgeDays
        );

        // 2. Overdue Risk Profile (from AnalyticsService heuristic engine)
        List<MemberOverdueRiskDto> allRisks = analyticsService.getAllMemberOverdueRisks();
        MemberOverdueRiskDto overdueRisk = allRisks.stream()
                .filter(r -> r.getUserId().equals(userId))
                .findFirst()
                .orElseGet(() -> new MemberOverdueRiskDto(
                        userId, user.getUsername(), user.getFullName(), user.getEmail(),
                        "LOW", 10, 0, 0.0, 0, 0, membershipAgeDays,
                        BigDecimal.ZERO, Collections.singletonList("Clean borrowing record in good standing"),
                        "Deterministic heuristic prediction based on historical return delays and loan volume."
                ));

        // 3. Lifetime Stats Calculation
        List<Loan> allLoans = loanRepository.findByUserIdOrderByIssueDateDesc(userId);
        long activeCount = 0;
        long returnedCount = 0;
        long overdueCount = 0;
        long totalLateDays = 0;
        long lateReturnsCount = 0;
        BigDecimal totalFinesAssessed = BigDecimal.ZERO;
        Map<String, Long> categoryFrequencies = new HashMap<>();

        for (Loan loan : allLoans) {
            String s = loan.getStatus();
            if ("ACTIVE".equalsIgnoreCase(s)) {
                activeCount++;
                if (loan.getDueDate() != null && now.isAfter(loan.getDueDate())) {
                    overdueCount++;
                }
            } else if ("RETURNED".equalsIgnoreCase(s)) {
                returnedCount++;
                if (loan.getLateDays() > 0) {
                    lateReturnsCount++;
                    totalLateDays += loan.getLateDays();
                }
            } else if ("OVERDUE".equalsIgnoreCase(s)) {
                overdueCount++;
            }

            if (loan.getFineAmount() != null) {
                totalFinesAssessed = totalFinesAssessed.add(loan.getFineAmount());
            }

            if (loan.getBookCopy() != null && loan.getBookCopy().getBook() != null &&
                loan.getBookCopy().getBook().getCategory() != null) {
                String cat = loan.getBookCopy().getBook().getCategory().getName();
                categoryFrequencies.put(cat, categoryFrequencies.getOrDefault(cat, 0L) + 1);
            }
        }

        double avgDelay = lateReturnsCount > 0 ? (double) totalLateDays / lateReturnsCount : 0.0;
        avgDelay = Math.round(avgDelay * 10.0) / 10.0;

        List<Fine> userFines = fineRepository.findByUserIdOrderByCreatedAtDesc(userId);
        BigDecimal totalFinesPaid = BigDecimal.ZERO;
        BigDecimal outstandingFines = BigDecimal.ZERO;

        for (Fine fine : userFines) {
            if (fine.getPaidAmount() != null) {
                totalFinesPaid = totalFinesPaid.add(fine.getPaidAmount());
            }
            if ("UNPAID".equalsIgnoreCase(fine.getStatus()) || "PARTIALLY_PAID".equalsIgnoreCase(fine.getStatus())) {
                BigDecimal remaining = fine.getAmount().subtract(fine.getPaidAmount() != null ? fine.getPaidAmount() : BigDecimal.ZERO);
                outstandingFines = outstandingFines.add(remaining.max(BigDecimal.ZERO));
            }
        }

        List<CategoryCountDto> topCategories = categoryFrequencies.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .map(e -> new CategoryCountDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        MemberLifetimeStatsDto lifetimeStats = new MemberLifetimeStatsDto(
                allLoans.size(),
                activeCount,
                returnedCount,
                overdueCount,
                totalFinesAssessed,
                totalFinesPaid,
                outstandingFines,
                avgDelay,
                topCategories
        );

        // 4. Currently Active Loans (with days remaining / overdue calculation)
        List<LoanDto> activeLoans = allLoans.stream()
                .filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus()))
                .sorted(Comparator.comparing(Loan::getDueDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(loanService::mapToLoanDto)
                .collect(Collectors.toList());

        // 5. Filterable Full Borrowing History
        List<LoanDto> borrowingHistory = loanRepository.findMemberHistory(
                        userId, fromDate, toDate, status, PageRequest.of(0, 100))
                .stream()
                .map(loanService::mapToLoanDto)
                .collect(Collectors.toList());

        // 6. Ratings and Reviews left by this member
        List<BookRatingDto> ratings = bookRatingRepository.findByUserId(userId).stream()
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .map(this::mapToRatingDto)
                .collect(Collectors.toList());

        // 7. Reservation History
        List<ReservationDto> reservations = reservationRepository.findByUserIdOrderByReservationDateDesc(userId).stream()
                .map(this::mapToReservationDto)
                .collect(Collectors.toList());

        return new MemberDetailDto(
                profile,
                overdueRisk,
                lifetimeStats,
                activeLoans,
                borrowingHistory,
                ratings,
                reservations
        );
    }

    private BookRatingDto mapToRatingDto(BookRating r) {
        Book book = r.getBook();
        User u = r.getUser();
        return new BookRatingDto(
                r.getId(),
                book != null ? book.getId() : null,
                book != null ? book.getTitle() : null,
                u != null ? u.getId() : null,
                u != null ? u.getUsername() : null,
                u != null ? u.getFullName() : null,
                r.getRating(),
                r.getReview(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    private ReservationDto mapToReservationDto(Reservation res) {
        Book book = res.getBook();
        return new ReservationDto(
                res.getId(),
                book != null ? book.getId() : null,
                book != null ? book.getTitle() : null,
                book != null ? book.getIsbn() : null,
                res.getUser() != null ? res.getUser().getId() : null,
                res.getUser() != null ? res.getUser().getUsername() : null,
                res.getReservationDate(),
                res.getExpiryDate(),
                res.getStatus()
        );
    }
}
