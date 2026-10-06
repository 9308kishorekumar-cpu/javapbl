package com.libraai.book.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class BookDetailDto {
    private Long id;
    private String title;
    private String isbn;
    private Integer publicationYear;
    private String summary;
    private String language = "en";
    private String originalLanguage;
    private Long translatedFromId;
    private String translatedFromTitle;
    private CategoryDto category;
    private List<AuthorDto> authors;
    private List<BookCopyDto> copies;
    private List<BookDto> translations = new ArrayList<>();
    private long totalCopies;
    private long availableCopies;
    private boolean available;
    private Instant createdAt;

    public BookDetailDto() {}

    public BookDetailDto(Long id, String title, String isbn, Integer publicationYear, String summary,
                         CategoryDto category, List<AuthorDto> authors, List<BookCopyDto> copies,
                         long totalCopies, long availableCopies, Instant createdAt) {
        this(id, title, isbn, publicationYear, summary, "en", null, null, null, category, authors, copies, new ArrayList<>(), totalCopies, availableCopies, createdAt);
    }

    public BookDetailDto(Long id, String title, String isbn, Integer publicationYear, String summary,
                         String language, String originalLanguage, Long translatedFromId, String translatedFromTitle,
                         CategoryDto category, List<AuthorDto> authors, List<BookCopyDto> copies,
                         List<BookDto> translations, long totalCopies, long availableCopies, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.isbn = isbn;
        this.publicationYear = publicationYear;
        this.summary = summary;
        this.language = language != null && !language.isBlank() ? language : "en";
        this.originalLanguage = originalLanguage;
        this.translatedFromId = translatedFromId;
        this.translatedFromTitle = translatedFromTitle;
        this.category = category;
        this.authors = authors;
        this.copies = copies;
        this.translations = translations != null ? translations : new ArrayList<>();
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.available = availableCopies > 0;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language != null && !language.isBlank() ? language : "en";
    }

    public String getOriginalLanguage() {
        return originalLanguage;
    }

    public void setOriginalLanguage(String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }

    public Long getTranslatedFromId() {
        return translatedFromId;
    }

    public void setTranslatedFromId(Long translatedFromId) {
        this.translatedFromId = translatedFromId;
    }

    public String getTranslatedFromTitle() {
        return translatedFromTitle;
    }

    public void setTranslatedFromTitle(String translatedFromTitle) {
        this.translatedFromTitle = translatedFromTitle;
    }

    public CategoryDto getCategory() {
        return category;
    }

    public void setCategory(CategoryDto category) {
        this.category = category;
    }

    public List<AuthorDto> getAuthors() {
        return authors;
    }

    public void setAuthors(List<AuthorDto> authors) {
        this.authors = authors;
    }

    public List<BookCopyDto> getCopies() {
        return copies;
    }

    public void setCopies(List<BookCopyDto> copies) {
        this.copies = copies;
    }

    public List<BookDto> getTranslations() {
        return translations;
    }

    public void setTranslations(List<BookDto> translations) {
        this.translations = translations;
    }

    public long getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(long totalCopies) {
        this.totalCopies = totalCopies;
    }

    public long getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(long availableCopies) {
        this.availableCopies = availableCopies;
        this.available = availableCopies > 0;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
