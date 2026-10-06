package com.libraai.book.repository;

import com.libraai.book.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);
    boolean existsByIsbn(String isbn);
    long countByCategoryId(Long categoryId);

    List<Book> findByLanguage(String language);
    Page<Book> findByLanguage(String language, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.translatedFrom.id = :bookId")
    List<Book> findTranslationsOf(@Param("bookId") Long bookId);

    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN b.category c " +
           "LEFT JOIN b.authors a " +
           "WHERE (:categoryId IS NULL OR c.id = :categoryId) " +
           "AND (:language IS NULL OR :language = '' OR LOWER(b.language) = LOWER(:language)) " +
           "AND (:query IS NULL OR :query = '' OR " +
           "     LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(b.summary) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Book> searchBooks(@Param("query") String query,
                           @Param("categoryId") Long categoryId,
                           @Param("language") String language,
                           Pageable pageable);
}
