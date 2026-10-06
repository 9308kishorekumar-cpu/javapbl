package com.libraai.book;

import com.libraai.book.dto.BookDetailDto;
import com.libraai.book.dto.BookDto;
import com.libraai.book.dto.CreateBookRequest;
import com.libraai.book.service.BookService;
import com.libraai.common.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class BookServiceTest {

    @Autowired
    private BookService bookService;

    @Test
    void testSearchBooksReturnsSeededCatalogWithDefaultEnglishLanguage() {
        Page<BookDto> result = bookService.searchBooks(null, null, 0, 10, "title", "asc");
        assertNotNull(result);
        assertTrue(result.getTotalElements() >= 4, "Should have at least 4 seeded books");

        BookDto first = result.getContent().get(0);
        assertNotNull(first.getTitle());
        assertEquals("en", first.getLanguage(), "Existing books should have default 'en' language");
        assertTrue(first.getTotalCopies() > 0, "Book should have physical copies");
        assertTrue(first.getAvailableCopies() > 0, "Seeded copies should be AVAILABLE");
    }

    @Test
    void testKeywordSearch() {
        Page<BookDto> result = bookService.searchBooks("Space Odyssey", null, 0, 10, "title", "asc");
        assertEquals(1, result.getTotalElements());
        assertEquals("2001: A Space Odyssey", result.getContent().get(0).getTitle());
    }

    @Test
    void testAuthorSearch() {
        Page<BookDto> result = bookService.searchBooks("Russell", null, 0, 10, "title", "asc");
        assertEquals(1, result.getTotalElements());
        assertEquals("Artificial Intelligence: A Modern Approach", result.getContent().get(0).getTitle());
    }

    @Test
    void testGetBookById() {
        BookDetailDto book = bookService.getBookById(1L);
        assertNotNull(book);
        assertNotNull(book.getCategory());
        assertEquals("en", book.getLanguage());
        assertFalse(book.getAuthors().isEmpty());
        assertFalse(book.getCopies().isEmpty());
        assertTrue(book.isAvailable());
    }

    @Test
    void testCreateBookSuccess() {
        CreateBookRequest req = new CreateBookRequest(
                "Clean Architecture",
                "978-0134494166",
                2017,
                "A Craftsman's Guide to Software Structure and Design",
                null,
                "Software Engineering",
                List.of("Robert C. Martin"),
                3
        );

        BookDetailDto created = bookService.createBook(req);
        assertNotNull(created);
        assertEquals("Clean Architecture", created.getTitle());
        assertEquals("en", created.getLanguage());
        assertEquals(3, created.getTotalCopies());
        assertEquals(3, created.getAvailableCopies());
        assertEquals(3, created.getCopies().size());
    }

    @Test
    void testCreateMultilingualTranslatedBookAndQueryTranslations() {
        // 1. Create translated edition in Tamil (ta) linked to original book (ID 1)
        CreateBookRequest req = new CreateBookRequest(
                "செயற்கை நுண்ணறிவு: ஒரு நவீன அணுகுமுறை",
                "978-0134610993-TA",
                2023,
                "Tamil translation of Artificial Intelligence: A Modern Approach",
                "ta",
                "en",
                1L,
                1L,
                "Computer Science",
                List.of("Stuart Russell", "Peter Norvig"),
                2
        );

        BookDetailDto translated = bookService.createBook(req);
        assertNotNull(translated);
        assertEquals("ta", translated.getLanguage());
        assertEquals("en", translated.getOriginalLanguage());
        assertEquals(1L, translated.getTranslatedFromId());

        // 2. Query translations of the original book (ID 1)
        List<BookDto> translations = bookService.getTranslationsOf(1L);
        assertNotNull(translations);
        assertFalse(translations.isEmpty(), "Original book should have at least 1 translation");
        assertEquals("ta", translations.get(0).getLanguage());
        assertEquals("செயற்கை நுண்ணறிவு: ஒரு நவீன அணுகுமுறை", translations.get(0).getTitle());

        // 3. Query books by language
        Page<BookDto> tamilBooks = bookService.getBooksByLanguage("ta", 0, 10);
        assertTrue(tamilBooks.getTotalElements() >= 1, "Should have Tamil books");
        assertEquals("ta", tamilBooks.getContent().get(0).getLanguage());

        // 4. Check getBookById of original book includes the translation in translations list
        BookDetailDto original = bookService.getBookById(1L);
        assertNotNull(original.getTranslations());
        assertFalse(original.getTranslations().isEmpty());
        assertEquals("ta", original.getTranslations().get(0).getLanguage());
    }

    @Test
    void testCreateBookDuplicateIsbnFails() {
        CreateBookRequest req = new CreateBookRequest(
                "Duplicate AI",
                "978-0134610993", // existing ISBN in seed
                2020,
                "Summary",
                1L,
                null,
                List.of("Some Author"),
                1
        );

        assertThrows(BadRequestException.class, () -> bookService.createBook(req));
    }
}
