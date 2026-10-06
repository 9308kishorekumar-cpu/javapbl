package com.libraai.loan;

import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.loan.dto.BookRentalRequest;
import com.libraai.loan.dto.LoanDto;
import com.libraai.loan.dto.RentalQuoteDto;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.loan.service.LoanService;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
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
public class BookRentalServiceTest {

    @Autowired
    private LoanService loanService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoanRepository loanRepository;

    private User testMember;
    private Book testBook;
    private BookCopy testCopy;

    @BeforeEach
    void setUp() {
        testMember = userRepository.findByUsername("member")
                .orElseGet(() -> userRepository.save(new User("test_rental_member", "rental@example.com", "hash", "Rental Patron")));

        testBook = bookRepository.findAll().stream().findFirst().orElseThrow();
        testCopy = bookCopyRepository.findByBookId(testBook.getId()).stream()
                .filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus()))
                .findFirst()
                .orElseGet(() -> bookCopyRepository.save(new BookCopy(testBook, "BC-RENT-TEST-001", "Pristine", "AVAILABLE")));
    }

    @Test
    void testGetRentalQuote_CalculatesDailyRateAndTotalFee() {
        RentalQuoteDto quote7Days = loanService.getRentalQuote(testBook.getId(), 7);
        assertNotNull(quote7Days);
        assertEquals(7, quote7Days.getRentalPeriodDays());
        assertEquals(new BigDecimal("0.50"), quote7Days.getDailyRentalRate());
        assertEquals(new BigDecimal("3.50"), quote7Days.getTotalRentalFee());
        assertTrue(quote7Days.isAvailableForRental());

        RentalQuoteDto quote30Days = loanService.getRentalQuote(testBook.getId(), 30);
        assertEquals(30, quote30Days.getRentalPeriodDays());
        assertEquals(new BigDecimal("15.00"), quote30Days.getTotalRentalFee());
    }

    @Test
    void testBookAndPayRental_CreatesLoanWithPaymentReference() {
        BookRentalRequest req = new BookRentalRequest();
        req.setBookId(testBook.getId());
        req.setBarcode(testCopy.getBarcode());
        req.setRentalPeriodDays(7);
        req.setPaymentMethod("UPI");
        req.setPaymentReference("PAY-UPI-123456");

        LoanDto bookedLoan = loanService.bookAndPayRental(req, testMember.getUsername());
        assertNotNull(bookedLoan);
        assertEquals("ACTIVE", bookedLoan.getStatus());
        assertEquals(new BigDecimal("3.50"), bookedLoan.getRentalFee());
        assertEquals("UPI", bookedLoan.getPaymentMethod());
        assertEquals("PAY-UPI-123456", bookedLoan.getPaymentReference());
        assertEquals("PAID", bookedLoan.getPaymentStatus());
        assertEquals(7, bookedLoan.getBookingPeriodDays());

        // Verify copy is now BORROWED
        BookCopy updatedCopy = bookCopyRepository.findByBarcode(testCopy.getBarcode()).orElseThrow();
        assertEquals("BORROWED", updatedCopy.getStatus());
    }

    @Test
    void testGetBookRentalHistory_ReturnsLibrarianAuditView() {
        BookRentalRequest req = new BookRentalRequest();
        req.setBookId(testBook.getId());
        req.setBarcode(testCopy.getBarcode());
        req.setRentalPeriodDays(14);
        req.setPaymentMethod("CREDIT_CARD");

        loanService.bookAndPayRental(req, testMember.getUsername());

        List<LoanDto> bookings = loanService.getBookRentalHistory(testBook.getId());
        assertNotNull(bookings);
        assertFalse(bookings.isEmpty());

        LoanDto latestBooking = bookings.get(0);
        assertEquals(testMember.getUsername(), latestBooking.getUsername());
        assertEquals(testMember.getFullName(), latestBooking.getMemberFullName());
        assertEquals(new BigDecimal("7.00"), latestBooking.getRentalFee());
        assertEquals("PAID", latestBooking.getPaymentStatus());
    }

    @Test
    void testAutoOverdueFineCalculation_WhenBookingPeriodExpired() {
        // Create an overdue loan manually with due date 3 days in the past
        Instant threeDaysAgo = Instant.now().minus(3, ChronoUnit.DAYS);
        Loan overdueLoan = new Loan(
                testCopy,
                testMember,
                null,
                threeDaysAgo,
                new BigDecimal("7.00"),
                "PAY-TEST-EXPIRED",
                "CREDIT_CARD",
                "PAID",
                14,
                new BigDecimal("0.50")
        );
        overdueLoan.setStatus("ACTIVE");
        Loan saved = loanRepository.save(overdueLoan);

        LoanDto mapped = loanService.mapToLoanDto(saved);
        assertTrue(mapped.isOverdue(), "Loan should be flagged as overdue");
        assertEquals(3, mapped.getCurrentOverdueDays(), "Overdue days should be 3");
        assertEquals(new BigDecimal("3.00"), mapped.getAccruedFine(), "Accrued fine should be $3.00 ($1.00/day)");
    }
}
