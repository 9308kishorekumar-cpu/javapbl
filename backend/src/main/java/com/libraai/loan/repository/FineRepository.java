package com.libraai.loan.repository;

import com.libraai.loan.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    List<Fine> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Fine> findByUserIdAndStatus(Long userId, String status);

    Optional<Fine> findByLoanId(Long loanId);

    @Query("SELECT COALESCE(SUM(f.amount - f.paidAmount), 0) FROM Fine f WHERE f.user.id = :userId AND f.status = 'UNPAID'")
    BigDecimal sumUnpaidFinesByUserId(@Param("userId") Long userId);
}
