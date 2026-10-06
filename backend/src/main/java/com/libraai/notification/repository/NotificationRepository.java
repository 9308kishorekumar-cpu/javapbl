package com.libraai.notification.repository;

import com.libraai.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);

    Page<Notification> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseOrderBySentAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.loan.id = :loanId AND n.type = :type AND n.sentAt >= :cutoff")
    boolean existsByLoanIdAndTypeAndSentAtAfter(@Param("loanId") Long loanId,
                                                @Param("type") String type,
                                                @Param("cutoff") Instant cutoff);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);
}
