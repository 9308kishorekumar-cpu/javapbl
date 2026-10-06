package com.libraai.loan.repository;

import com.libraai.loan.entity.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByUserIdOrderByIssueDateDesc(Long userId);

    Page<Loan> findByUserIdOrderByIssueDateDesc(Long userId, Pageable pageable);

    List<Loan> findByUserIdAndStatus(Long userId, String status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

    Optional<Loan> findByBookCopyIdAndStatus(Long bookCopyId, String status);

    @Query("SELECT l FROM Loan l JOIN l.bookCopy c WHERE c.barcode = :barcode AND l.status = 'ACTIVE'")
    Optional<Loan> findActiveLoanByBarcode(@Param("barcode") String barcode);

    List<Loan> findByStatusOrderByDueDateAsc(String status);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId " +
           "AND l.issueDate >= :from AND l.issueDate <= :to " +
           "ORDER BY l.issueDate DESC")
    List<Loan> findAllByMemberAndDateRange(@Param("userId") Long userId,
                                           @Param("from") Instant from,
                                           @Param("to") Instant to);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId " +
           "AND (:status IS NULL OR :status = '' OR l.status = :status) " +
           "AND (cast(:fromDate as timestamp) IS NULL OR l.issueDate >= :fromDate) " +
           "AND (cast(:toDate as timestamp) IS NULL OR l.issueDate <= :toDate) " +
           "ORDER BY l.issueDate DESC")
    Page<Loan> findMemberHistory(@Param("userId") Long userId,
                                 @Param("fromDate") Instant fromDate,
                                 @Param("toDate") Instant toDate,
                                 @Param("status") String status,
                                 Pageable pageable);

    @Query("SELECT COALESCE(AVG(l.lateDays), 0.0) FROM Loan l WHERE l.user.id = :userId AND l.status = 'RETURNED'")
    Double getAverageLateDaysByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(l.fineAmount), 0.00) FROM Loan l WHERE l.user.id = :userId")
    BigDecimal sumFineAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' " +
           "AND l.dueDate >= :start AND l.dueDate <= :end " +
           "ORDER BY l.dueDate ASC")
    List<Loan> findActiveLoansDueBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT l FROM Loan l WHERE (l.status = 'ACTIVE' OR l.status = 'OVERDUE') " +
           "AND l.dueDate < :now " +
           "ORDER BY l.dueDate ASC")
    List<Loan> findActiveOverdueLoans(@Param("now") Instant now);

    @Query("SELECT l FROM Loan l WHERE l.bookCopy.book.id = :bookId ORDER BY l.issueDate DESC")
    List<Loan> findByBookIdOrderByIssueDateDesc(@Param("bookId") Long bookId);
}
