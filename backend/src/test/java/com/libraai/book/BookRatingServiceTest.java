package com.libraai.book;

import com.libraai.ai.dto.AiRecommendationDto;
import com.libraai.ai.service.AiService;
import com.libraai.book.dto.BookRatingDto;
import com.libraai.book.dto.BookRatingsSummaryDto;
import com.libraai.book.dto.RateBookRequest;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.book.service.BookRatingService;
import com.libraai.loan.dto.IssueLoanRequest;
import com.libraai.loan.service.LoanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class BookRatingServiceTest {

    @Autowired
    private BookRatingService bookRatingService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private LoanService loanService;

    @Autowired
    private AiService aiService;

    @Test
    void testRateBook_CreateAndCalculateAverage() {
        Book book = bookRepository.findById(1L).orElseThrow();

        // 1. Member rates book with 4 stars
        RateBookRequest req1 = new RateBookRequest(4, "Great comprehensive textbook on modern artificial intelligence.");
        BookRatingDto rating1 = bookRatingService.rateBook(book.getId(), req1, "member");

        assertNotNull(rating1);
        assertEquals(4, rating1.getRating());
        assertEquals("member", rating1.getUsername());

        // 2. Librarian rates book with 5 stars
        RateBookRequest req2 = new RateBookRequest(5, "The ultimate foundational guide to modern AI and algorithms.");
        BookRatingDto rating2 = bookRatingService.rateBook(book.getId(), req2, "librarian");

        assertNotNull(rating2);
        assertEquals(5, rating2.getRating());
        assertEquals("librarian", rating2.getUsername());

        // 3. Verify summary calculation (Average: 4.5, Count: 2)
        BookRatingsSummaryDto summary = bookRatingService.getBookRatingsSummary(book.getId(), PageRequest.of(0, 10), "member");
        assertNotNull(summary);
        assertEquals(4.5, summary.getAverageRating(), 0.01);
        assertEquals(2, summary.getTotalRatings());
        assertEquals(2, summary.getReviews().getTotalElements());
        assertNotNull(summary.getUserRating());
        assertEquals(4, summary.getUserRating().getRating());
    }

    @Test
    void testRateBook_UpdateExistingRatingUpsert() {
        Book book = bookRepository.findById(1L).orElseThrow();

        // Initial rating
        RateBookRequest reqInitial = new RateBookRequest(2, "Initial impression: quite dense.");
        bookRatingService.rateBook(book.getId(), reqInitial, "member");

        BookRatingsSummaryDto summaryBefore = bookRatingService.getBookRatingsSummary(book.getId(), PageRequest.of(0, 10), "member");
        assertEquals(2.0, summaryBefore.getAverageRating());
        assertEquals(1, summaryBefore.getTotalRatings());

        // Update rating to 5 stars
        RateBookRequest reqUpdated = new RateBookRequest(5, "Re-read and now appreciate its true depth and clarity.");
        BookRatingDto updated = bookRatingService.rateBook(book.getId(), reqUpdated, "member");

        assertEquals(5, updated.getRating());
        assertEquals("Re-read and now appreciate its true depth and clarity.", updated.getReview());

        // Verify summary has 1 total rating (not duplicated) and 5.0 average
        BookRatingsSummaryDto summaryAfter = bookRatingService.getBookRatingsSummary(book.getId(), PageRequest.of(0, 10), "member");
        assertEquals(5.0, summaryAfter.getAverageRating());
        assertEquals(1, summaryAfter.getTotalRatings());
    }

    @Test
    void testRecommendationRanking_WeightedByRatings() {
        // Find 2 books in Computer Science: Book #1 (AI) and Book #2 (TAOCP)
        Book b1 = bookRepository.findById(1L).orElseThrow();
        Book b2 = bookRepository.findById(2L).orElseThrow();

        // Ensure "librarian" borrows a Computer Science book to establish similar member profile
        BookCopy copy = bookCopyRepository.findByBookId(b1.getId()).stream().findFirst().orElseThrow();
        loanService.issueLoan(new IssueLoanRequest(copy.getBarcode(), "librarian", 14), "admin");

        // Similar member "librarian" rates Book #2 with 5 stars
        bookRatingService.rateBook(b2.getId(), new RateBookRequest(5, "Masterpiece for algorithm design!"), "librarian");

        // "member" also reads in Computer Science (borrows Book #1)
        BookCopy copyAI2 = bookCopyRepository.save(new BookCopy(b1, "BC-AI-TEST-99", "Good", "AVAILABLE"));
        loanService.issueLoan(new IssueLoanRequest(copyAI2.getBarcode(), "member", 14), "admin");

        // Get recommendations for "member" -> since member already borrowed Book #1, Book #2 (with 5-star rating from similar member) should rank top
        AiRecommendationDto recommendations = aiService.getRecommendations("member");
        assertNotNull(recommendations);
        assertFalse(recommendations.getRecommendedBooks().isEmpty());
        assertEquals(b2.getId(), recommendations.getRecommendedBooks().get(0).getId(),
                "Book #2 with high ratings from similar members should rank #1 in recommendations");
    }
}
