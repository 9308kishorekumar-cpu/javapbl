package com.libraai.importer;

import com.libraai.book.entity.Book;
import com.libraai.book.repository.BookRepository;
import com.libraai.importer.dto.SeedingReportDto;
import com.libraai.importer.entity.ImportProgress;
import com.libraai.importer.repository.ImportProgressRepository;
import com.libraai.importer.service.BookImporterService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class BookImporterServiceTest {

    @Autowired
    private BookImporterService importerService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ImportProgressRepository progressRepository;

    @Test
    void testCanonicalMultilingualSeedingPreservesUTF8AndCoversLanguages() {
        importerService.seedCanonicalMultilingualClassics();

        long totalBooks = bookRepository.count();
        assertTrue(totalBooks >= 40, "Should have at least 40 canonical books seeded across languages");

        // 1. Verify Tamil UTF-8 without mojibake
        List<Book> tamilBooks = bookRepository.findByLanguage("ta");
        assertFalse(tamilBooks.isEmpty(), "Should contain Tamil books");
        Book ponniyin = tamilBooks.stream()
                .filter(b -> b.getTitle().contains("பொன்னியின் செல்வன்"))
                .findFirst()
                .orElse(null);
        assertNotNull(ponniyin, "Ponniyin Selvan should be present with authentic Tamil UTF-8 script");
        assertEquals("ta", ponniyin.getLanguage());

        // 2. Verify Hindi UTF-8
        List<Book> hindiBooks = bookRepository.findByLanguage("hi");
        assertFalse(hindiBooks.isEmpty(), "Should contain Hindi books");
        Book godan = hindiBooks.stream()
                .filter(b -> b.getTitle().contains("गोदान"))
                .findFirst()
                .orElse(null);
        assertNotNull(godan, "Godan should be present with authentic Hindi Devanagari script");

        // 3. Verify Russian Cyrillic UTF-8
        List<Book> russianBooks = bookRepository.findByLanguage("ru");
        assertFalse(russianBooks.isEmpty(), "Should contain Russian books");
        assertTrue(russianBooks.stream().anyMatch(b -> b.getTitle().contains("Война и мир")), "War and Peace in Cyrillic");

        // 4. Verify Japanese Kanji/Kana UTF-8
        List<Book> japaneseBooks = bookRepository.findByLanguage("ja");
        assertFalse(japaneseBooks.isEmpty(), "Should contain Japanese books");
        assertTrue(japaneseBooks.stream().anyMatch(b -> b.getTitle().contains("源氏物語")), "Tale of Genji in Japanese");

        // 5. Verify Chinese Hanzi UTF-8
        List<Book> chineseBooks = bookRepository.findByLanguage("zh");
        assertFalse(chineseBooks.isEmpty(), "Should contain Chinese books");
        assertTrue(chineseBooks.stream().anyMatch(b -> b.getTitle().contains("三国演义")), "Three Kingdoms in Chinese");

        // 6. Verify Arabic script UTF-8
        List<Book> arabicBooks = bookRepository.findByLanguage("ar");
        assertFalse(arabicBooks.isEmpty(), "Should contain Arabic books");
        assertTrue(arabicBooks.stream().anyMatch(b -> b.getTitle().contains("ألف ليلة وليلة")), "Arabian Nights in Arabic");

        // 7. Verify Telugu script UTF-8
        List<Book> teluguBooks = bookRepository.findByLanguage("te");
        assertFalse(teluguBooks.isEmpty(), "Should contain Telugu books");
        assertTrue(teluguBooks.stream().anyMatch(b -> b.getTitle().contains("మహాప్రస్థానం")), "Maha Prasthanam in Telugu");

        // 8. Verify Bengali script UTF-8
        List<Book> bengaliBooks = bookRepository.findByLanguage("bn");
        assertFalse(bengaliBooks.isEmpty(), "Should contain Bengali books");
        assertTrue(bengaliBooks.stream().anyMatch(b -> b.getTitle().contains("গীতাঞ্জলি")), "Gitanjali in Bengali");

        // 9. Verify Sanskrit Devanagari UTF-8
        List<Book> sanskritBooks = bookRepository.findByLanguage("sa");
        assertFalse(sanskritBooks.isEmpty(), "Should contain Sanskrit books");
        assertTrue(sanskritBooks.stream().anyMatch(b -> b.getTitle().contains("श्रीमद्भगवद्गीता")), "Bhagavad Gita in Sanskrit");
    }

    @Test
    void testResumabilityAndProgressTracking() {
        ImportProgress p = new ImportProgress("es", "fiction");
        p.setLastPage(2);
        p.setImportedCount(25);
        p.setStatus("IN_PROGRESS");
        progressRepository.save(p);

        Optional<ImportProgress> saved = progressRepository.findByLanguageAndSubject("es", "fiction");
        assertTrue(saved.isPresent());
        assertEquals(2, saved.get().getLastPage());
        assertEquals(25, saved.get().getImportedCount());
        assertEquals("IN_PROGRESS", saved.get().getStatus());
    }

    @Test
    void testCurrentStatusGeneration() {
        SeedingReportDto status = importerService.getCurrentStatus();
        assertNotNull(status);
        assertNotNull(status.getLanguageBreakdown());
        assertNotNull(status.getCategoryBreakdown());
    }
}
