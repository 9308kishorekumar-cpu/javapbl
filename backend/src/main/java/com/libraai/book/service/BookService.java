package com.libraai.book.service;

import com.libraai.book.dto.*;
import com.libraai.book.entity.Author;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.entity.Category;
import com.libraai.book.repository.AuthorRepository;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.book.repository.CategoryRepository;
import com.libraai.common.exception.BadRequestException;
import com.libraai.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final QrCodeService qrCodeService;

    public BookService(BookRepository bookRepository,
                       BookCopyRepository bookCopyRepository,
                       CategoryRepository categoryRepository,
                       AuthorRepository authorRepository,
                       QrCodeService qrCodeService) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.categoryRepository = categoryRepository;
        this.authorRepository = authorRepository;
        this.qrCodeService = qrCodeService;
    }

    @Transactional(readOnly = true)
    public Page<BookDto> searchBooks(String query, Long categoryId, int page, int size, String sortBy, String sortDir) {
        return searchBooks(query, categoryId, null, page, size, sortBy, sortDir);
    }

    @Transactional(readOnly = true)
    public Page<BookDto> searchBooks(String query, Long categoryId, String language, int page, int size, String sortBy, String sortDir) {
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Book> bookPage = bookRepository.searchBooks(query, categoryId, language, pageable);

        return bookPage.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<BookDto> getTranslationsOf(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        Long originalWorkId = book.getTranslatedFrom() != null ? book.getTranslatedFrom().getId() : book.getId();

        return bookRepository.findTranslationsOf(originalWorkId).stream()
                .filter(b -> !b.getId().equals(book.getId()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BookDto> getBooksByLanguage(String language, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("title").ascending());
        Page<Book> bookPage = bookRepository.findByLanguage(language.toLowerCase().trim(), pageable);
        return bookPage.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public BookDetailDto getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        return mapToDetailDto(book);
    }

    @Transactional
    public BookDetailDto createBook(CreateBookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BadRequestException("Book with ISBN " + request.getIsbn() + " already exists");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        } else if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            category = categoryRepository.findByNameIgnoreCase(request.getCategoryName())
                    .orElseGet(() -> categoryRepository.save(new Category(request.getCategoryName(), null)));
        }

        Book translatedFrom = null;
        if (request.getTranslatedFromId() != null) {
            translatedFrom = bookRepository.findById(request.getTranslatedFromId())
                    .orElseThrow(() -> new ResourceNotFoundException("Original Book", "id", request.getTranslatedFromId()));
        }

        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublicationYear(request.getPublicationYear());
        book.setSummary(request.getSummary());
        book.setCategory(category);
        book.setLanguage(request.getLanguage() != null && !request.getLanguage().isBlank() ? request.getLanguage() : "en");
        book.setOriginalLanguage(request.getOriginalLanguage());
        book.setTranslatedFrom(translatedFrom);

        Set<Author> authors = new HashSet<>();
        if (request.getAuthors() != null) {
            for (String authorName : request.getAuthors()) {
                if (authorName != null && !authorName.isBlank()) {
                    String cleanName = authorName.trim();
                    Author author = authorRepository.findByNameIgnoreCase(cleanName)
                            .orElseGet(() -> authorRepository.save(new Author(cleanName, null)));
                    authors.add(author);
                }
            }
        }
        book.setAuthors(authors);

        Book savedBook = bookRepository.save(book);

        // Seed initial copies with ZXing QR codes
        int copiesToCreate = Math.max(1, request.getInitialCopies());
        for (int i = 1; i <= copiesToCreate; i++) {
            String cleanIsbn = request.getIsbn().replaceAll("[^a-zA-Z0-9]", "");
            String barcode = "BC-" + cleanIsbn + "-" + String.format("%03d", i);
            if (bookCopyRepository.existsByBarcode(barcode)) {
                barcode = "BC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            }
            String qrDataUri = qrCodeService.generateQrCodeDataUri(barcode);
            BookCopy copy = new BookCopy(savedBook, barcode, "Good condition", "AVAILABLE", qrDataUri);
            bookCopyRepository.save(copy);
        }

        return getBookById(savedBook.getId());
    }

    @Transactional
    public BookDetailDto updateBook(Long id, UpdateBookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        book.setTitle(request.getTitle());
        book.setPublicationYear(request.getPublicationYear());
        book.setSummary(request.getSummary());

        if (request.getLanguage() != null && !request.getLanguage().isBlank()) {
            book.setLanguage(request.getLanguage());
        }
        if (request.getOriginalLanguage() != null) {
            book.setOriginalLanguage(request.getOriginalLanguage());
        }
        if (request.getTranslatedFromId() != null) {
            Book translatedFrom = bookRepository.findById(request.getTranslatedFromId())
                    .orElseThrow(() -> new ResourceNotFoundException("Original Book", "id", request.getTranslatedFromId()));
            book.setTranslatedFrom(translatedFrom);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            book.setCategory(category);
        }

        if (request.getAuthors() != null) {
            Set<Author> authors = new HashSet<>();
            for (String authorName : request.getAuthors()) {
                if (authorName != null && !authorName.isBlank()) {
                    String cleanName = authorName.trim();
                    Author author = authorRepository.findByNameIgnoreCase(cleanName)
                            .orElseGet(() -> authorRepository.save(new Author(cleanName, null)));
                    authors.add(author);
                }
            }
            book.setAuthors(authors);
        }

        Book updated = bookRepository.save(book);
        return mapToDetailDto(updated);
    }

    @Transactional
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book", "id", id);
        }
        bookRepository.deleteById(id);
    }

    @Transactional
    public BookCopyDto addCopy(Long bookId, AddBookCopyRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        String barcode = request.getBarcode();
        if (barcode == null || barcode.isBlank()) {
            long count = bookCopyRepository.countByBookId(bookId) + 1;
            String cleanIsbn = book.getIsbn().replaceAll("[^a-zA-Z0-9]", "");
            barcode = "BC-" + cleanIsbn + "-" + String.format("%03d", count);
        }

        if (bookCopyRepository.existsByBarcode(barcode)) {
            barcode = "BC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        String qrDataUri = qrCodeService.generateQrCodeDataUri(barcode);
        BookCopy copy = new BookCopy(book, barcode, request.getConditionNote(), "AVAILABLE", qrDataUri);
        BookCopy saved = bookCopyRepository.save(copy);

        return mapToCopyDto(saved);
    }

    @Transactional
    public BookCopyDto updateCopyStatus(Long copyId, String status) {
        BookCopy copy = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new ResourceNotFoundException("BookCopy", "id", copyId));

        copy.setStatus(status.toUpperCase());
        BookCopy updated = bookCopyRepository.save(copy);
        return mapToCopyDto(updated);
    }

    @Transactional(readOnly = true)
    public BookCopyDto getCopyByBarcode(String barcode) {
        BookCopy copy = bookCopyRepository.findByBarcode(barcode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("BookCopy", "barcode", barcode));
        return mapToCopyDto(copy);
    }

    @Transactional(readOnly = true)
    public byte[] getCopyQrImageBytes(Long copyId) {
        BookCopy copy = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new ResourceNotFoundException("BookCopy", "id", copyId));
        return qrCodeService.generateQrCodeBytes(copy.getBarcode());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll(Sort.by("name")).stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getDescription()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuthorDto> getAuthors() {
        return authorRepository.findAll(Sort.by("name")).stream()
                .map(a -> new AuthorDto(a.getId(), a.getName(), a.getBiography()))
                .collect(Collectors.toList());
    }

    public BookCopyDto mapToCopyDto(BookCopy copy) {
        Book book = copy.getBook();
        String qrImage = copy.getQrCodeImage();
        if (qrImage == null || qrImage.isBlank()) {
            qrImage = qrCodeService.generateQrCodeDataUri(copy.getBarcode());
        }

        List<String> authors = book.getAuthors() != null
                ? book.getAuthors().stream().map(Author::getName).collect(Collectors.toList())
                : List.of();

        return new BookCopyDto(
                copy.getId(),
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                book.getCategory() != null ? book.getCategory().getName() : "General",
                book.getLanguage() != null ? book.getLanguage() : "en",
                authors,
                copy.getBarcode(),
                copy.getConditionNote(),
                copy.getStatus(),
                qrImage
        );
    }

    public BookDto mapToDto(Book book) {
        long totalCopies = bookCopyRepository.countByBookId(book.getId());
        long availableCopies = bookCopyRepository.countByBookIdAndStatus(book.getId(), "AVAILABLE");

        List<String> authorNames = book.getAuthors().stream()
                .map(Author::getName)
                .collect(Collectors.toList());

        Long translatedFromId = book.getTranslatedFrom() != null ? book.getTranslatedFrom().getId() : null;
        String translatedFromTitle = book.getTranslatedFrom() != null ? book.getTranslatedFrom().getTitle() : null;

        return new BookDto(
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                book.getPublicationYear(),
                book.getSummary(),
                book.getCategory() != null ? book.getCategory().getId() : null,
                book.getCategory() != null ? book.getCategory().getName() : "Uncategorized",
                authorNames,
                totalCopies,
                availableCopies,
                book.getLanguage(),
                book.getOriginalLanguage(),
                translatedFromId,
                translatedFromTitle
        );
    }

    private BookDetailDto mapToDetailDto(Book book) {
        long totalCopies = bookCopyRepository.countByBookId(book.getId());
        long availableCopies = bookCopyRepository.countByBookIdAndStatus(book.getId(), "AVAILABLE");

        CategoryDto catDto = book.getCategory() != null
                ? new CategoryDto(book.getCategory().getId(), book.getCategory().getName(), book.getCategory().getDescription())
                : null;

        List<AuthorDto> authorDtos = book.getAuthors().stream()
                .map(a -> new AuthorDto(a.getId(), a.getName(), a.getBiography()))
                .collect(Collectors.toList());

        List<BookCopyDto> copyDtos = bookCopyRepository.findByBookId(book.getId()).stream()
                .map(this::mapToCopyDto)
                .collect(Collectors.toList());

        Long translatedFromId = book.getTranslatedFrom() != null ? book.getTranslatedFrom().getId() : null;
        String translatedFromTitle = book.getTranslatedFrom() != null ? book.getTranslatedFrom().getTitle() : null;

        Long originalWorkId = book.getTranslatedFrom() != null ? book.getTranslatedFrom().getId() : book.getId();
        List<BookDto> translations = bookRepository.findTranslationsOf(originalWorkId).stream()
                .filter(b -> !b.getId().equals(book.getId()))
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new BookDetailDto(
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                book.getPublicationYear(),
                book.getSummary(),
                book.getLanguage(),
                book.getOriginalLanguage(),
                translatedFromId,
                translatedFromTitle,
                catDto,
                authorDtos,
                copyDtos,
                translations,
                totalCopies,
                availableCopies,
                book.getCreatedAt()
        );
    }
}
