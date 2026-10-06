package com.libraai.analytics;

import com.libraai.analytics.dto.AuditLogDto;
import com.libraai.analytics.dto.BookDemandPredictionDto;
import com.libraai.analytics.dto.DashboardStatsDto;
import com.libraai.analytics.dto.MemberOverdueRiskDto;
import com.libraai.analytics.service.AnalyticsService;
import com.libraai.audit.service.AuditService;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class AnalyticsServiceTest {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Test
    void testGetDashboardStats() {
        DashboardStatsDto stats = analyticsService.getDashboardStats();

        assertNotNull(stats);
        assertTrue(stats.getTotalBooks() >= 4, "Should have at least 4 seeded books");
        assertTrue(stats.getTotalCopies() >= 5, "Should have at least 5 seeded copies");
        assertTrue(stats.getTotalMembers() >= 3, "Should have at least 3 seeded users");
        assertNotNull(stats.getCategoryDistribution());
        assertFalse(stats.getCategoryDistribution().isEmpty());
    }

    @Test
    void testGetPopularityPredictions() {
        List<BookDemandPredictionDto> predictions = analyticsService.getPopularityPredictions(5);

        assertNotNull(predictions);
        assertFalse(predictions.isEmpty());
        assertTrue(predictions.size() <= 5);

        // Verify descending order
        for (int i = 0; i < predictions.size() - 1; i++) {
            assertTrue(predictions.get(i).getDemandScore() >= predictions.get(i + 1).getDemandScore(),
                    "Predictions should be sorted by demand score descending");
        }

        BookDemandPredictionDto top = predictions.get(0);
        assertNotNull(top.getTitle());
        assertNotNull(top.getHeuristicRationale());
        assertTrue(top.getDemandScore() >= 0.0);
        assertNotNull(top.getConfidenceLevel());
    }

    @Test
    void testOverdueRiskCalculation_MemberWithLateReturnsYieldsMediumOrHigh() {
        // Create test member with 3 late returns
        User lateUser = new User("late_patron_" + System.currentTimeMillis(), "late_patron@example.com", "$2a$10$hash", "Late Returner");
        lateUser.setMembershipStatus("ACTIVE");
        lateUser = userRepository.save(lateUser);

        Book book = bookRepository.findById(1L).orElseThrow();
        BookCopy copy = bookCopyRepository.findByBookId(book.getId()).get(0);

        Instant now = Instant.now();

        // 3 returned loans with overdue return dates
        for (int i = 1; i <= 3; i++) {
            Loan loan = new Loan();
            loan.setUser(lateUser);
            loan.setBookCopy(copy);
            loan.setIssueDate(now.minus(30 + i * 10, ChronoUnit.DAYS));
            loan.setDueDate(now.minus(16 + i * 10, ChronoUnit.DAYS));
            loan.setReturnDate(now.minus(10 + i * 10, ChronoUnit.DAYS)); // 6 days late
            loan.setLateDays(6);
            loan.setStatus("RETURNED");
            loanRepository.save(loan);
        }

        List<MemberOverdueRiskDto> risks = analyticsService.getAllMemberOverdueRisks();
        assertNotNull(risks);

        final Long targetUserId = lateUser.getId();
        MemberOverdueRiskDto targetRisk = risks.stream()
                .filter(r -> r.getUserId().equals(targetUserId))
                .findFirst()
                .orElse(null);

        assertNotNull(targetRisk, "Test user risk profile should be generated");
        assertEquals(3, targetRisk.getLateReturnsCount());
        assertTrue(targetRisk.getAvgLateDays() >= 5.0, "Average delay should be recorded");
        assertNotEquals("LOW", targetRisk.getRiskLevel(), "User with 3 late returns must NOT be classified as LOW risk");
        assertTrue("MEDIUM".equals(targetRisk.getRiskLevel()) || "HIGH".equals(targetRisk.getRiskLevel()));
        assertTrue(targetRisk.getRiskScore() >= 30);
        assertNotNull(targetRisk.getHeuristicDisclaimer());
        assertFalse(targetRisk.getRiskFactors().isEmpty());
    }

    @Test
    void testAuditLogRecordingAndRetrieval() {
        auditService.log("SYSTEM_TEST", "TestEntity", 999L, "Automated test audit event", "admin", "127.0.0.1");

        List<AuditLogDto> logs = analyticsService.getRecentAuditLogs();
        assertFalse(logs.isEmpty());

        boolean found = logs.stream().anyMatch(l -> "SYSTEM_TEST".equals(l.getAction()) && "admin".equals(l.getUsername()));
        assertTrue(found, "Audit log stream should contain the newly logged event");
    }
}
