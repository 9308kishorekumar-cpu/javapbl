package com.libraai.loan;

import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.common.exception.BusinessRuleViolationException;
import com.libraai.loan.dto.FineDto;
import com.libraai.loan.dto.IssueLoanRequest;
import com.libraai.loan.dto.LoanDto;
import com.libraai.loan.dto.PayFineRequest;
import com.libraai.loan.dto.ReturnLoanRequest;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.loan.service.LoanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class LoanServiceTest {

    @Autowired
    private LoanService loanService;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Test
    void testIssueAndReturnLoanFlow() {
        // Issue copy BC-AI-001 to member
        IssueLoanRequest issueReq = new IssueLoanRequest("BC-AI-001", "member", 14);
        LoanDto issued = loanService.issueLoan(issueReq, "librarian");

        assertNotNull(issued);
        assertEquals("BC-AI-001", issued.getBarcode());
        assertEquals("member", issued.getUsername());
        assertEquals("ACTIVE", issued.getStatus());

        // Verify copy status is now BORROWED
        BookCopy copy = bookCopyRepository.findByBarcode("BC-AI-001").orElseThrow();
        assertEquals("BORROWED", copy.getStatus());

        // Return copy BC-AI-001
        ReturnLoanRequest returnReq = new ReturnLoanRequest("BC-AI-001");
        LoanDto returned = loanService.returnLoan(returnReq, "librarian");

        assertNotNull(returned);
        assertEquals("RETURNED", returned.getStatus());

        // Verify copy status is back to AVAILABLE
        BookCopy copyReturned = bookCopyRepository.findByBarcode("BC-AI-001").orElseThrow();
        assertEquals("AVAILABLE", copyReturned.getStatus());
    }

    @Test
    void testRenewLoanSuccessAndLimit() {
        IssueLoanRequest issueReq = new IssueLoanRequest("BC-TAOCP-001", "member", 14);
        LoanDto loan = loanService.issueLoan(issueReq, "librarian");

        // First renewal
        LoanDto renewed1 = loanService.renewLoan(loan.getId(), "member");
        assertEquals(1, renewed1.getRenewalCount());

        // Second renewal
        LoanDto renewed2 = loanService.renewLoan(loan.getId(), "member");
        assertEquals(2, renewed2.getRenewalCount());

        // Third renewal should exceed max limit (2)
        assertThrows(BusinessRuleViolationException.class, () -> loanService.renewLoan(loan.getId(), "member"));
    }

    @Test
    void testOverdueFineCalculationOnReturn() {
        IssueLoanRequest issueReq = new IssueLoanRequest("BC-2001-001", "member", 14);
        LoanDto loanDto = loanService.issueLoan(issueReq, "librarian");

        // Artificially simulate loan being 5 days overdue in DB
        Loan loan = loanRepository.findById(loanDto.getId()).orElseThrow();
        loan.setDueDate(Instant.now().minus(Duration.ofDays(5)));
        loanRepository.save(loan);

        // Return loan
        ReturnLoanRequest returnReq = new ReturnLoanRequest("BC-2001-001");
        loanService.returnLoan(returnReq, "librarian");

        // Verify fine generated for member
        List<FineDto> fines = loanService.getUserFines("member");
        assertFalse(fines.isEmpty());
        FineDto fine = fines.get(0);
        assertTrue(fine.getAmount().compareTo(BigDecimal.valueOf(5.00)) >= 0, "Fine should be at least $5.00 for 5 days overdue");
        assertEquals("UNPAID", fine.getStatus());

        // Pay partial fine
        FineDto paidPartial = loanService.payFine(fine.getId(), new PayFineRequest(BigDecimal.valueOf(2.00)));
        assertEquals("PARTIALLY_PAID", paidPartial.getStatus());

        // Pay full fine
        FineDto paidFull = loanService.payFine(fine.getId(), new PayFineRequest(BigDecimal.valueOf(3.00)));
        assertEquals("PAID", paidFull.getStatus());
    }

    @Test
    void testBorrowingLimitEnforcement() {
        // Seed 5 copies and issue all 5 to member
        Book book = bookRepository.findById(1L).orElseThrow();
        for (int i = 10; i < 15; i++) {
            BookCopy copy = bookCopyRepository.save(new BookCopy(book, "TEST-LIMIT-" + i, "Good", "AVAILABLE"));
            loanService.issueLoan(new IssueLoanRequest(copy.getBarcode(), "member", 14), "librarian");
        }

        // 6th loan should exceed limit (5)
        BookCopy copy6 = bookCopyRepository.save(new BookCopy(book, "TEST-LIMIT-99", "Good", "AVAILABLE"));
        assertThrows(BusinessRuleViolationException.class, () ->
                loanService.issueLoan(new IssueLoanRequest(copy6.getBarcode(), "member", 14), "librarian")
        );
    }

    @Test
    void testMemberBorrowingHistoryAndFiltering() {
        Book book = bookRepository.findById(1L).orElseThrow();
        BookCopy c1 = bookCopyRepository.save(new BookCopy(book, "HIST-BC-001", "Good", "AVAILABLE"));
        BookCopy c2 = bookCopyRepository.save(new BookCopy(book, "HIST-BC-002", "Good", "AVAILABLE"));
        BookCopy c3 = bookCopyRepository.save(new BookCopy(book, "HIST-BC-003", "Good", "AVAILABLE"));

        // Issue 3 loans
        LoanDto l1 = loanService.issueLoan(new IssueLoanRequest(c1.getBarcode(), "member", 14), "librarian");
        LoanDto l2 = loanService.issueLoan(new IssueLoanRequest(c2.getBarcode(), "member", 14), "librarian");
        LoanDto l3 = loanService.issueLoan(new IssueLoanRequest(c3.getBarcode(), "member", 14), "librarian");

        Long memberId = l1.getUserId();

        // 1. Return l1 on time
        loanService.returnLoan(new ReturnLoanRequest(c1.getBarcode()), "librarian");

        // 2. Simulate l2 overdue by 4 days, then return
        Loan loan2 = loanRepository.findById(l2.getId()).orElseThrow();
        loan2.setDueDate(Instant.now().minus(Duration.ofDays(4)));
        loanRepository.save(loan2);
        loanService.returnLoan(new ReturnLoanRequest(c2.getBarcode()), "librarian");

        // 3. l3 remains ACTIVE

        // Test unfiltered history
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        org.springframework.data.domain.Page<LoanDto> historyAll = loanService.getMemberLoanHistory(memberId, null, null, "ALL", pageable, "member");
        assertTrue(historyAll.getTotalElements() >= 3);

        // Test status filtering: RETURNED
        org.springframework.data.domain.Page<LoanDto> historyReturned = loanService.getMemberLoanHistory(memberId, null, null, "RETURNED", pageable, "member");
        assertTrue(historyReturned.getContent().stream().allMatch(l -> "RETURNED".equals(l.getStatus())));
        assertTrue(historyReturned.getTotalElements() >= 2);

        // Test status filtering: ACTIVE
        org.springframework.data.domain.Page<LoanDto> historyActive = loanService.getMemberLoanHistory(memberId, null, null, "ACTIVE", pageable, "member");
        assertTrue(historyActive.getContent().stream().allMatch(l -> "ACTIVE".equals(l.getStatus())));

        // Test Date Range filtering
        Instant from = Instant.now().minus(Duration.ofHours(1));
        Instant to = Instant.now().plus(Duration.ofHours(1));
        org.springframework.data.domain.Page<LoanDto> historyDateRange = loanService.getMemberLoanHistory(memberId, from, to, null, pageable, "member");
        assertTrue(historyDateRange.getTotalElements() >= 3);

        // Test Member Loan Statistics
        com.libraai.loan.dto.MemberLoanStatsDto stats = loanService.getMemberLoanStats(memberId, "member");
        assertNotNull(stats);
        assertEquals("member", stats.getUsername());
        assertTrue(stats.getTotalLoans() >= 3);
        assertTrue(stats.getReturnedLoans() >= 2);
        assertTrue(stats.getAverageLateDays() > 0.0);
    }
}
