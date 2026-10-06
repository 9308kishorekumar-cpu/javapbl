package com.libraai.book;

import com.libraai.book.dto.AddBookCopyRequest;
import com.libraai.book.dto.BookCopyDto;
import com.libraai.book.entity.Book;
import com.libraai.book.repository.BookRepository;
import com.libraai.book.service.BookService;
import com.libraai.book.service.QrCodeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class BookCopyQrServiceTest {

    @Autowired
    private QrCodeService qrCodeService;

    @Autowired
    private BookService bookService;

    @Autowired
    private BookRepository bookRepository;

    @Test
    void testQrCodeService_GeneratesValidPngAndDataUri() {
        String testBarcode = "BC-TEST-QR-12345";

        // 1. Test raw PNG bytes
        byte[] pngBytes = qrCodeService.generateQrCodeBytes(testBarcode);
        assertNotNull(pngBytes);
        assertTrue(pngBytes.length > 100);

        // Verify PNG magic header bytes: 0x89, 'P', 'N', 'G'
        assertEquals((byte) 0x89, pngBytes[0]);
        assertEquals((byte) 0x50, pngBytes[1]); // 'P'
        assertEquals((byte) 0x4E, pngBytes[2]); // 'N'
        assertEquals((byte) 0x47, pngBytes[3]); // 'G'

        // 2. Test Data URI
        String dataUri = qrCodeService.generateQrCodeDataUri(testBarcode);
        assertNotNull(dataUri);
        assertTrue(dataUri.startsWith("data:image/png;base64,"));
        assertTrue(dataUri.length() > 50);
    }

    @Test
    void testAddCopy_AutoGeneratesQrCodeImage() {
        Book book = bookRepository.findById(1L).orElseThrow();

        AddBookCopyRequest req = new AddBookCopyRequest();
        req.setBarcode("BC-AI-QR-TEST-001");
        req.setConditionNote("Pristine copy with QR barcode");

        BookCopyDto copy = bookService.addCopy(book.getId(), req);

        assertNotNull(copy);
        assertEquals("BC-AI-QR-TEST-001", copy.getBarcode());
        assertNotNull(copy.getQrCodeImage());
        assertTrue(copy.getQrCodeImage().startsWith("data:image/png;base64,"));
    }

    @Test
    void testGetCopyByBarcode_ReturnsEnrichedMetadata() {
        Book book = bookRepository.findById(1L).orElseThrow();

        AddBookCopyRequest req = new AddBookCopyRequest();
        req.setBarcode("BC-LOOKUP-TEST-002");
        req.setConditionNote("Reference copy");
        BookCopyDto created = bookService.addCopy(book.getId(), req);

        // Fast scan-to-issue lookup
        BookCopyDto lookup = bookService.getCopyByBarcode("BC-LOOKUP-TEST-002");

        assertNotNull(lookup);
        assertEquals(created.getId(), lookup.getId());
        assertEquals("BC-LOOKUP-TEST-002", lookup.getBarcode());
        assertEquals(book.getTitle(), lookup.getBookTitle());
        assertEquals(book.getIsbn(), lookup.getBookIsbn());
        assertEquals("AVAILABLE", lookup.getStatus());
        assertNotNull(lookup.getQrCodeImage());
    }

    @Test
    void testGetCopyQrImageBytes_ReturnsPng() {
        Book book = bookRepository.findById(1L).orElseThrow();

        AddBookCopyRequest req = new AddBookCopyRequest();
        req.setBarcode("BC-STREAM-TEST-003");
        BookCopyDto created = bookService.addCopy(book.getId(), req);

        byte[] pngBytes = bookService.getCopyQrImageBytes(created.getId());
        assertNotNull(pngBytes);
        assertTrue(pngBytes.length > 100);
        assertEquals((byte) 0x89, pngBytes[0]);
    }
}
