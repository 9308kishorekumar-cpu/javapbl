package com.libraai.book.repository;

import com.libraai.book.entity.BookRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookRatingRepository extends JpaRepository<BookRating, Long> {

    Optional<BookRating> findByBookIdAndUserId(Long bookId, Long userId);

    Page<BookRating> findByBookIdOrderByCreatedAtDesc(Long bookId, Pageable pageable);

    List<BookRating> findByBookId(Long bookId);

    List<BookRating> findByUserId(Long userId);

    long countByBookId(Long bookId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM BookRating r WHERE r.book.id = :bookId")
    Double getAverageRatingByBookId(@Param("bookId") Long bookId);

    List<BookRating> findByRatingGreaterThanEqual(int minRating);

    @Query("SELECT r FROM BookRating r WHERE r.rating >= :minRating AND r.user.id IN :userIds")
    List<BookRating> findHighRatingsByUserIds(@Param("userIds") Collection<Long> userIds, @Param("minRating") int minRating);
}
