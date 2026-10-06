package com.libraai.book.controller;

import com.libraai.book.dto.*;
import com.libraai.book.service.BookRatingService;
import com.libraai.book.service.BookService;
import com.libraai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Catalog Management", description = "Endpoints for books, multilingual editions, translations, ratings, authors, categories, and inventory copies")
public class BookController {

    private final BookService bookService;
    private final BookRatingService bookRatingService;

    public BookController(BookService bookService, BookRatingService bookRatingService) {
        this.bookService = bookService;
        this.bookRatingService = bookRatingService;
    }

    @GetMapping("/books")
    @Operation(summary = "Search and Browse Books Catalog", description = "Paginated catalog retrieval with title/author/ISBN search, category filtering, and ISO 639-1 language filtering")
    public ApiResponse<Page<BookDto>> getBooks(
            @Parameter(description = "Search query across title, ISBN, author, summary") @RequestParam(required = false) String query,
            @Parameter(description = "Filter by category ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Filter by ISO 639-1 language code (e.g. en, ta, hi, ja, fr, es, de, zh, ar, ru)") @RequestParam(required = false) String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Page<BookDto> books = bookService.searchBooks(query, categoryId, language, page, size, sortBy, sortDir);
        return ApiResponse.ok(books, "Books catalog retrieved successfully");
    }

    @GetMapping("/books/{id}")
    @Operation(summary = "Get Book Details", description = "Retrieves full book metadata, language info, translated editions, and physical copies availability")
    public ApiResponse<BookDetailDto> getBookById(@PathVariable Long id) {
        BookDetailDto book = bookService.getBookById(id);
        return ApiResponse.ok(book, "Book details retrieved successfully");
    }

    @GetMapping("/books/{id}/translations")
    @Operation(summary = "Get Translated Editions of a Book", description = "Retrieves all translated editions linked to this original work via translatedFrom FK")
    public ApiResponse<List<BookDto>> getTranslationsOf(@PathVariable Long id) {
        List<BookDto> translations = bookService.getTranslationsOf(id);
        return ApiResponse.ok(translations, "Translations retrieved successfully");
    }

    @GetMapping("/books/languages/{language}")
    @Operation(summary = "Get Books by Language", description = "Retrieves books filtered by ISO 639-1 language code")
    public ApiResponse<Page<BookDto>> getBooksByLanguage(
            @PathVariable String language,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<BookDto> books = bookService.getBooksByLanguage(language, page, size);
        return ApiResponse.ok(books, "Books for language '" + language + "' retrieved successfully");
    }

    @PostMapping("/books/{id}/ratings")
    @Operation(summary = "Submit or Update Book Rating and Review", description = "Allows an authenticated member to rate a book (1-5 stars) and optionally write a text review. Updates existing rating if already rated.")
    public ApiResponse<BookRatingDto> rateBook(
            @PathVariable Long id,
            @Valid @RequestBody RateBookRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookRatingDto rating = bookRatingService.rateBook(id, request, userDetails.getUsername());
        return ApiResponse.ok(rating, "Book rated successfully (" + rating.getRating() + " stars)");
    }

    @PutMapping("/books/{id}/ratings")
    @Operation(summary = "Update Book Rating and Review", description = "Updates an existing rating and review by the authenticated member.")
    public ApiResponse<BookRatingDto> updateRating(
            @PathVariable Long id,
            @Valid @RequestBody RateBookRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookRatingDto rating = bookRatingService.rateBook(id, request, userDetails.getUsername());
        return ApiResponse.ok(rating, "Book rating updated successfully");
    }

    @GetMapping("/books/{id}/ratings")
    @Operation(summary = "Get Book Ratings & Reviews Summary", description = "Retrieves paginated reviews, average star rating, and total rating count for a book")
    public ApiResponse<BookRatingsSummaryDto> getBookRatings(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Pageable pageable = PageRequest.of(page, size);
        String username = userDetails != null ? userDetails.getUsername() : null;
        BookRatingsSummaryDto summary = bookRatingService.getBookRatingsSummary(id, pageable, username);
        return ApiResponse.ok(summary, "Book ratings retrieved successfully");
    }

    @PostMapping("/books")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Register New Book", description = "Librarian/Admin endpoint to create a book, specify language/translation links, and seed copies")
    public ApiResponse<BookDetailDto> createBook(@Valid @RequestBody CreateBookRequest request) {
        BookDetailDto created = bookService.createBook(request);
        return ApiResponse.ok(created, "Book created successfully");
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Update Book", description = "Librarian/Admin endpoint to update book details, language, and translation links")
    public ApiResponse<BookDetailDto> updateBook(@PathVariable Long id, @Valid @RequestBody UpdateBookRequest request) {
        BookDetailDto updated = bookService.updateBook(id, request);
        return ApiResponse.ok(updated, "Book updated successfully");
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Book", description = "Admin endpoint to remove a book and its copies")
    public ApiResponse<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ApiResponse.ok("Book deleted successfully");
    }

    @PostMapping("/books/{id}/copies")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Add Physical Copy", description = "Adds a new barcode inventory copy to a book")
    public ApiResponse<BookCopyDto> addCopy(@PathVariable Long id, @RequestBody(required = false) AddBookCopyRequest request) {
        AddBookCopyRequest req = request != null ? request : new AddBookCopyRequest();
        BookCopyDto copy = bookService.addCopy(id, req);
        return ApiResponse.ok(copy, "Book copy registered successfully");
    }

    @PatchMapping("/books/copies/{copyId}/status")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Update Copy Status", description = "Updates copy status (e.g. AVAILABLE, MAINTENANCE, LOST)")
    public ApiResponse<BookCopyDto> updateCopyStatus(@PathVariable Long copyId, @RequestParam String status) {
        BookCopyDto copy = bookService.updateCopyStatus(copyId, status);
        return ApiResponse.ok(copy, "Copy status updated successfully");
    }

    @GetMapping(value = "/books/copies/{copyId}/qr", produces = org.springframework.http.MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "Render Copy QR Code Image", description = "Generates and streams high-resolution PNG QR Code image for the book copy")
    public org.springframework.http.ResponseEntity<byte[]> getCopyQrImage(@PathVariable Long copyId) {
        byte[] qrBytes = bookService.getCopyQrImageBytes(copyId);
        return org.springframework.http.ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                .body(qrBytes);
    }

    @GetMapping("/books/copies/barcode/{barcode}")
    @Operation(summary = "Lookup Copy by Barcode", description = "Fast circulation lookup for scan-to-issue flows with joined book title, category, and availability")
    public ApiResponse<BookCopyDto> getCopyByBarcode(@PathVariable String barcode) {
        BookCopyDto copy = bookService.getCopyByBarcode(barcode);
        return ApiResponse.ok(copy, "Book copy found for barcode: " + barcode);
    }

    @GetMapping("/categories")
    @Operation(summary = "List Categories")
    public ApiResponse<List<CategoryDto>> getCategories() {
        List<CategoryDto> categories = bookService.getCategories();
        return ApiResponse.ok(categories, "Categories retrieved successfully");
    }

    @GetMapping("/authors")
    @Operation(summary = "List Authors")
    public ApiResponse<List<AuthorDto>> getAuthors() {
        List<AuthorDto> authors = bookService.getAuthors();
        return ApiResponse.ok(authors, "Authors retrieved successfully");
    }
}
