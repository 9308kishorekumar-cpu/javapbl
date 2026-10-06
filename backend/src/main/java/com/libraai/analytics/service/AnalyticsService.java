package com.libraai.analytics.service;

import com.libraai.analytics.dto.*;
import com.libraai.audit.repository.AuditLogRepository;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.Category;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRatingRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.book.repository.CategoryRepository;
import com.libraai.loan.entity.Fine;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.repository.FineRepository;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRatingRepository bookRatingRepository;
    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogRepository auditLogRepository;

    public AnalyticsService(BookRepository bookRepository,
                            BookCopyRepository bookCopyRepository,
                            BookRatingRepository bookRatingRepository,
                            LoanRepository loanRepository,
                            FineRepository fineRepository,
                            UserRepository userRepository,
                            CategoryRepository categoryRepository,
                            AuditLogRepository auditLogRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.bookRatingRepository = bookRatingRepository;
        this.loanRepository = loanRepository;
        this.fineRepository = fineRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalBooks = bookRepository.count();
        long totalCopies = bookCopyRepository.count();
        long totalAvailable = bookCopyRepository.findAll().stream()
                .filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus()))
                .count();

        List<Loan> allLoans = loanRepository.findAll();
        long activeLoans = allLoans.stream().filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus())).count();

        Instant now = Instant.now();
        long overdueLoans = allLoans.stream()
                .filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus()) && now.isAfter(l.getDueDate()))
                .count();

        long totalMembers = userRepository.count();

        List<Fine> fines = fineRepository.findAll();
        BigDecimal totalFinesCollected = fines.stream()
                .map(Fine::getPaidAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingFines = fines.stream()
                .filter(f -> !"PAID".equalsIgnoreCase(f.getStatus()) && !"WAIVED".equalsIgnoreCase(f.getStatus()))
                .map(f -> f.getAmount().subtract(f.getPaidAmount() != null ? f.getPaidAmount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Top borrowed books
        Map<Long, Long> bookLoanCounts = allLoans.stream()
                .filter(l -> l.getBookCopy() != null && l.getBookCopy().getBook() != null)
                .collect(Collectors.groupingBy(l -> l.getBookCopy().getBook().getId(), Collectors.counting()));

        List<TopBookDto> topBooks = bookLoanCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> bookRepository.findById(entry.getKey()).map(b ->
                        new TopBookDto(
                                b.getId(),
                                b.getTitle(),
                                b.getCategory() != null ? b.getCategory().getName() : "General",
                                entry.getValue()
                        )
                ).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Category distribution
        List<Category> categories = categoryRepository.findAll();
        List<CategoryStatDto> categoryStats = categories.stream()
                .map(c -> new CategoryStatDto(
                        c.getName(),
                        bookRepository.countByCategoryId(c.getId())
                ))
                .collect(Collectors.toList());

        return new DashboardStatsDto(
                totalBooks,
                totalCopies,
                totalAvailable,
                activeLoans,
                overdueLoans,
                totalMembers,
                totalFinesCollected,
                outstandingFines,
                topBooks,
                categoryStats
        );
    }

    /**
     * Heuristic Popularity & Demand Prediction:
     * Evaluates trailing borrow velocity, patron community ratings, category demand share,
     * and copy utilization/scarcity pressure.
     *
     * Demand Score Formula (Java-native heuristic, non-ML):
     * DemandScore = (BorrowCount * 3.0) + ((AvgRating / 5.0) * 2.5) + (CategoryDemandShare * 2.0) + StockPressure
     *
     * Acquisition Recommendations:
     * - DemandScore >= 10.0 and Available <= 1 -> +3 copies
     * - DemandScore >= 5.0 and Available <= 1 -> +2 copies
     * - DemandScore >= 2.0 and Available == 0 -> +1 copy
     * - Otherwise -> 0 copies
     */
    @Transactional(readOnly = true)
    public List<BookDemandPredictionDto> getPopularityPredictions(int limit) {
        List<Book> allBooks = bookRepository.findAll();
        List<Loan> allLoans = loanRepository.findAll();

        long totalLoansCount = Math.max(1, allLoans.size());

        // Map borrow count per book
        Map<Long, Long> bookBorrowCounts = allLoans.stream()
                .filter(l -> l.getBookCopy() != null && l.getBookCopy().getBook() != null)
                .collect(Collectors.groupingBy(l -> l.getBookCopy().getBook().getId(), Collectors.counting()));

        // Map borrow count per category
        Map<String, Long> categoryBorrowCounts = allLoans.stream()
                .filter(l -> l.getBookCopy() != null && l.getBookCopy().getBook() != null && l.getBookCopy().getBook().getCategory() != null)
                .collect(Collectors.groupingBy(l -> l.getBookCopy().getBook().getCategory().getName(), Collectors.counting()));

        List<BookDemandPredictionDto> predictions = new ArrayList<>();

        for (Book book : allBooks) {
            long borrows = bookBorrowCounts.getOrDefault(book.getId(), 0L);
            long totalCopies = bookCopyRepository.countByBookId(book.getId());
            long availableCopies = bookCopyRepository.countByBookIdAndStatus(book.getId(), "AVAILABLE");

            Double avgRating = bookRatingRepository.getAverageRatingByBookId(book.getId());
            double ratingValue = (avgRating != null && avgRating > 0) ? avgRating : 0.0;

            String categoryName = book.getCategory() != null ? book.getCategory().getName() : "General";
            long catBorrows = categoryBorrowCounts.getOrDefault(categoryName, 0L);
            double categoryDemandShare = (double) catBorrows / totalLoansCount;

            // 1. Borrow velocity component
            double borrowScore = borrows * 3.0;

            // 2. Community rating component (up to 2.5 pts)
            double ratingScore = (ratingValue > 0) ? (ratingValue / 5.0) * 2.5 : 1.0;

            // 3. Category popularity component (up to 2.0 pts)
            double categoryScore = categoryDemandShare * 2.0;

            // 4. Stock scarcity / utilization component
            double stockPressure = 0.0;
            if (totalCopies > 0 && availableCopies == 0) {
                stockPressure = 2.5; // Complete stock depletion
            } else if (totalCopies > 0 && (double) availableCopies / totalCopies <= 0.35) {
                stockPressure = 1.5; // High copy utilization
            }

            double rawScore = borrowScore + ratingScore + categoryScore + stockPressure;
            double demandScore = Math.round(rawScore * 10.0) / 10.0;

            // Acquisition recommendation
            int recommendedAcquire = 0;
            if (demandScore >= 10.0 && availableCopies <= 1) {
                recommendedAcquire = 3;
            } else if (demandScore >= 5.0 && availableCopies <= 1) {
                recommendedAcquire = 2;
            } else if (demandScore >= 2.0 && availableCopies == 0) {
                recommendedAcquire = 1;
            }

            String confidence = borrows >= 3 ? "HIGH" : (borrows >= 1 || ratingValue >= 4.0 ? "MEDIUM" : "LOW");

            String rationale = String.format(
                    "Heuristic demand score %.1f: %d borrow(s), %.1f★ rating, %.0f%% category velocity share, %d/%d copies available.",
                    demandScore, borrows, ratingValue, categoryDemandShare * 100, availableCopies, totalCopies
            );

            predictions.add(new BookDemandPredictionDto(
                    book.getId(),
                    book.getTitle(),
                    book.getIsbn(),
                    categoryName,
                    book.getLanguage() != null ? book.getLanguage() : "en",
                    totalCopies,
                    availableCopies,
                    borrows,
                    avgRating,
                    demandScore,
                    recommendedAcquire,
                    confidence,
                    rationale
            ));
        }

        // Sort descending by demand score
        return predictions.stream()
                .sorted(Comparator.comparingDouble(BookDemandPredictionDto::getDemandScore).reversed())
                .limit(limit > 0 ? limit : 10)
                .collect(Collectors.toList());
    }

    /**
     * Extended Member Overdue Risk Heuristic Assessment:
     * Evaluates member's historical late returns, average delay days, active checkout volume,
     * membership age/tenure, and outstanding fine balances.
     *
     * Risk Classification:
     * - Score >= 60 -> HIGH (Prompt librarian review, frequent or high delay)
     * - Score >= 30 -> MEDIUM (Moderate delay history or high active volume)
     * - Score < 30 -> LOW (Patron in good standing)
     */
    @Transactional(readOnly = true)
    public List<MemberOverdueRiskDto> getAllMemberOverdueRisks() {
        List<User> allUsers = userRepository.findAll();
        List<MemberOverdueRiskDto> riskList = new ArrayList<>();
        Instant now = Instant.now();

        for (User user : allUsers) {
            List<Loan> userLoans = loanRepository.findByUserIdOrderByIssueDateDesc(user.getId());
            BigDecimal unpaidFines = fineRepository.sumUnpaidFinesByUserId(user.getId());
            if (unpaidFines == null) unpaidFines = BigDecimal.ZERO;

            int totalHistoricalLoans = userLoans.size();
            int lateReturnsCount = 0;
            long totalLateDays = 0;
            int activeLoansCount = 0;

            for (Loan loan : userLoans) {
                if ("ACTIVE".equalsIgnoreCase(loan.getStatus())) {
                    activeLoansCount++;
                    if (now.isAfter(loan.getDueDate())) {
                        lateReturnsCount++;
                        long delay = Duration.between(loan.getDueDate(), now).toDays();
                        totalLateDays += Math.max(1, delay);
                    }
                } else if (loan.getReturnDate() != null && loan.getReturnDate().isAfter(loan.getDueDate())) {
                    lateReturnsCount++;
                    long delay = (loan.getLateDays() > 0)
                            ? loan.getLateDays()
                            : Duration.between(loan.getDueDate(), loan.getReturnDate()).toDays();
                    totalLateDays += Math.max(1, delay);
                } else if (loan.getLateDays() > 0) {
                    lateReturnsCount++;
                    totalLateDays += loan.getLateDays();
                }
            }

            double avgLateDays = lateReturnsCount > 0 ? (double) totalLateDays / lateReturnsCount : 0.0;
            avgLateDays = Math.round(avgLateDays * 10.0) / 10.0;

            long membershipAgeDays = (user.getCreatedAt() != null)
                    ? Math.max(1, Duration.between(user.getCreatedAt(), now).toDays())
                    : 30;

            // Heuristic Scoring Logic
            int riskScore = 10; // Baseline
            List<String> riskFactors = new ArrayList<>();

            // 1. Late return frequency
            if (lateReturnsCount >= 3) {
                riskScore += 40;
                riskFactors.add(lateReturnsCount + " historical return delays recorded");
            } else if (lateReturnsCount >= 1) {
                riskScore += 20;
                riskFactors.add(lateReturnsCount + " return delay recorded");
            }

            // 2. Average delay severity
            if (avgLateDays >= 7.0) {
                riskScore += 25;
                riskFactors.add("High average return delay (" + avgLateDays + " days late)");
            } else if (avgLateDays >= 3.0) {
                riskScore += 15;
                riskFactors.add("Moderate average return delay (" + avgLateDays + " days late)");
            } else if (avgLateDays > 0.0) {
                riskScore += 5;
            }

            // 3. Active checkout pressure
            if (activeLoansCount >= 4) {
                riskScore += 15;
                riskFactors.add("High active checkout volume (" + activeLoansCount + " books)");
            } else if (activeLoansCount >= 2) {
                riskScore += 5;
            }

            // 4. Unpaid fine balance
            if (unpaidFines.compareTo(BigDecimal.valueOf(10.00)) >= 0) {
                riskScore += 20;
                riskFactors.add("Outstanding unpaid fine balance (₹" + unpaidFines + ")");
            } else if (unpaidFines.compareTo(BigDecimal.ZERO) > 0) {
                riskScore += 10;
                riskFactors.add("Unpaid fine balance (₹" + unpaidFines + ")");
            }

            // 5. Membership tenure calibration
            if (membershipAgeDays < 14 && activeLoansCount >= 2) {
                riskScore += 10;
                riskFactors.add("New member (<14 days) with multiple concurrent checkouts");
            } else if (membershipAgeDays > 60 && lateReturnsCount == 0 && totalHistoricalLoans >= 2) {
                riskScore = Math.max(5, riskScore - 10);
            }

            riskScore = Math.min(100, Math.max(0, riskScore));

            String riskLevel;
            if (riskScore >= 60) {
                riskLevel = "HIGH";
            } else if (riskScore >= 30) {
                riskLevel = "MEDIUM";
            } else {
                riskLevel = "LOW";
            }

            if (riskFactors.isEmpty()) {
                riskFactors.add("Clean borrowing record in good standing");
            }

            String disclaimer = "Heuristic prediction based on borrow patterns and delay velocity. Not a factual guarantee.";

            riskList.add(new MemberOverdueRiskDto(
                    user.getId(),
                    user.getUsername(),
                    user.getFullName(),
                    user.getEmail(),
                    riskLevel,
                    riskScore,
                    lateReturnsCount,
                    avgLateDays,
                    activeLoansCount,
                    totalHistoricalLoans,
                    membershipAgeDays,
                    unpaidFines,
                    riskFactors,
                    disclaimer
            ));
        }

        // Sort descending by risk score
        riskList.sort(Comparator.comparingInt(MemberOverdueRiskDto::getRiskScore).reversed());
        return riskList;
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getRecentAuditLogs() {
        return auditLogRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(a -> new AuditLogDto(
                        a.getId(),
                        a.getUserId(),
                        a.getUsername(),
                        a.getAction(),
                        a.getEntityType(),
                        a.getEntityId(),
                        a.getDetails(),
                        a.getIpAddress(),
                        a.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
