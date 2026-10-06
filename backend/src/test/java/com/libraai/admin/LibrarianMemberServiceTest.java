package com.libraai.admin;

import com.libraai.admin.dto.MemberDetailDto;
import com.libraai.admin.service.LibrarianMemberService;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.entity.BookRating;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRatingRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.entity.Reservation;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.loan.repository.ReservationRepository;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class LibrarianMemberServiceTest {

    @Autowired
    private LibrarianMemberService librarianMemberService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private BookRatingRepository bookRatingRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Test
    void testGetMemberDetail_ConsolidatedPayload() {
        // 1. Create member
        User member = new User("dossier_member_" + System.currentTimeMillis(), "dossier@example.com", "$2a$10$hash", "Dossier Member");
        member.setMembershipStatus("ACTIVE");
        member = userRepository.save(member);

        Book book1 = bookRepository.findById(1L).orElseThrow();
        Book book2 = bookRepository.findById(2L).orElseThrow();
        List<BookCopy> copies1 = bookCopyRepository.findByBookId(book1.getId());
        List<BookCopy> copies2 = bookCopyRepository.findByBookId(book2.getId());

        Instant now = Instant.now();

        // 2. Active loan
        Loan activeLoan = new Loan();
        activeLoan.setUser(member);
        activeLoan.setBookCopy(copies1.get(0));
        activeLoan.setIssueDate(now.minus(5, ChronoUnit.DAYS));
        activeLoan.setDueDate(now.plus(9, ChronoUnit.DAYS));
        activeLoan.setStatus("ACTIVE");
        loanRepository.save(activeLoan);

        // 3. Returned late loan
        Loan returnedLoan = new Loan();
        returnedLoan.setUser(member);
        returnedLoan.setBookCopy(copies2.get(0));
        returnedLoan.setIssueDate(now.minus(30, ChronoUnit.DAYS));
        returnedLoan.setDueDate(now.minus(16, ChronoUnit.DAYS));
        returnedLoan.setReturnDate(now.minus(12, ChronoUnit.DAYS)); // 4 days late
        returnedLoan.setLateDays(4);
        returnedLoan.setFineAmount(BigDecimal.valueOf(4.00));
        returnedLoan.setStatus("RETURNED");
        loanRepository.save(returnedLoan);

        // 4. Rating & Review
        BookRating rating = new BookRating(member, book1, 5, "Magnificent AI textbook.");
        bookRatingRepository.save(rating);

        // 5. Reservation
        Reservation reservation = new Reservation(book2, member);
        reservation.setStatus("PENDING");
        reservationRepository.save(reservation);

        // Execute unified retrieval
        MemberDetailDto detail = librarianMemberService.getMemberDetail(member.getId(), null, null, null);

        assertNotNull(detail);

        // Assert Profile
        assertNotNull(detail.getProfile());
        assertEquals(member.getUsername(), detail.getProfile().getUsername());
        assertEquals(member.getFullName(), detail.getProfile().getFullName());
        assertEquals("ACTIVE", detail.getProfile().getMembershipStatus());

        // Assert Overdue Risk Heuristics
        assertNotNull(detail.getOverdueRisk());
        assertNotNull(detail.getOverdueRisk().getRiskLevel());
        assertNotNull(detail.getOverdueRisk().getHeuristicDisclaimer());

        // Assert Lifetime Stats
        assertNotNull(detail.getLifetimeStats());
        assertEquals(2, detail.getLifetimeStats().getTotalLoans());
        assertEquals(1, detail.getLifetimeStats().getActiveLoans());
        assertEquals(1, detail.getLifetimeStats().getReturnedLoans());
        assertEquals(4.0, detail.getLifetimeStats().getAvgReturnDelayDays());
        assertFalse(detail.getLifetimeStats().getTopCategories().isEmpty());

        // Assert Active Loans
        assertNotNull(detail.getActiveLoans());
        assertEquals(1, detail.getActiveLoans().size());
        assertEquals(book1.getTitle(), detail.getActiveLoans().get(0).getBookTitle());

        // Assert Borrowing History
        assertNotNull(detail.getBorrowingHistory());
        assertEquals(2, detail.getBorrowingHistory().size());

        // Assert Ratings
        assertNotNull(detail.getRatings());
        assertEquals(1, detail.getRatings().size());
        assertEquals(5, detail.getRatings().get(0).getRating());
        assertEquals("Magnificent AI textbook.", detail.getRatings().get(0).getReview());

        // Assert Reservations
        assertNotNull(detail.getReservations());
        assertEquals(1, detail.getReservations().size());
        assertEquals("PENDING", detail.getReservations().get(0).getStatus());
    }

    @Test
    void testGetMemberDetail_HistoryFiltering() {
        User member = new User("filter_member_" + System.currentTimeMillis(), "filter@example.com", "$2a$10$hash", "Filter Member");
        member = userRepository.save(member);

        Book book1 = bookRepository.findById(1L).orElseThrow();
        BookCopy copy = bookCopyRepository.findByBookId(book1.getId()).get(0);

        Instant now = Instant.now();

        // 1. Active Loan
        Loan l1 = new Loan();
        l1.setUser(member);
        l1.setBookCopy(copy);
        l1.setIssueDate(now.minus(2, ChronoUnit.DAYS));
        l1.setDueDate(now.plus(12, ChronoUnit.DAYS));
        l1.setStatus("ACTIVE");
        loanRepository.save(l1);

        // 2. Returned Loan
        Loan l2 = new Loan();
        l2.setUser(member);
        l2.setBookCopy(copy);
        l2.setIssueDate(now.minus(20, ChronoUnit.DAYS));
        l2.setDueDate(now.minus(6, ChronoUnit.DAYS));
        l2.setReturnDate(now.minus(6, ChronoUnit.DAYS));
        l2.setStatus("RETURNED");
        loanRepository.save(l2);

        // Filter by RETURNED status
        MemberDetailDto returnedOnly = librarianMemberService.getMemberDetail(member.getId(), null, null, "RETURNED");
        assertEquals(1, returnedOnly.getBorrowingHistory().size());
        assertEquals("RETURNED", returnedOnly.getBorrowingHistory().get(0).getStatus());

        // Filter by date range excluding the older loan
        Instant fromRecent = now.minus(5, ChronoUnit.DAYS);
        MemberDetailDto recentOnly = librarianMemberService.getMemberDetail(member.getId(), fromRecent, null, null);
        assertEquals(1, recentOnly.getBorrowingHistory().size());
        assertEquals("ACTIVE", recentOnly.getBorrowingHistory().get(0).getStatus());
    }
}
