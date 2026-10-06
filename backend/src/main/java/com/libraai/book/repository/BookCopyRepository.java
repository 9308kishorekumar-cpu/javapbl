package com.libraai.book.repository;

import com.libraai.book.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    List<BookCopy> findByBookId(Long bookId);
    Optional<BookCopy> findByBarcode(String barcode);
    boolean existsByBarcode(String barcode);
    long countByBookId(Long bookId);
    long countByBookIdAndStatus(Long bookId, String status);
    Optional<BookCopy> findFirstByBookIdAndStatus(Long bookId, String status);
}
