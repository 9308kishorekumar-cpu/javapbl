package com.libraai.loan.repository;

import com.libraai.loan.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserIdOrderByReservationDateDesc(Long userId);

    List<Reservation> findByUserIdAndStatus(Long userId, String status);

    List<Reservation> findByBookIdAndStatusOrderByReservationDateAsc(Long bookId, String status);

    Optional<Reservation> findFirstByBookIdAndStatusOrderByReservationDateAsc(Long bookId, String status);

    boolean existsByBookIdAndUserIdAndStatus(Long bookId, Long userId, String status);
}
