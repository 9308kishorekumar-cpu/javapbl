package com.libraai.book.dto;

import java.util.List;

public class BookDto {
    private Long id;
    private String title;
    private String isbn;
    private Integer publicationYear;
    private String summary;
    private Long categoryId;
    private String categoryName;
    private List<String> authors;
    private long totalCopies;
    private long availableCopies;
    private boolean available;
    private String language = "en";
    private String originalLanguage;
    private Long translatedFromId;
    private String translatedFromTitle;

    public BookDto() {}

    public BookDto(Long id, String title, String isbn, Integer publicationYear, String summary,
                   Long categoryId, String categoryName, List<String> authors,
                   long totalCopies, long availableCopies) {
        this(id, title, isbn, publicationYear, summary, categoryId, categoryName, authors, totalCopies, availableCopies, "en", null, null, null);
    }

    public BookDto(Long id, String title, String isbn, Integer publicationYear, String summary,
                   Long categoryId, String categoryName, List<String> authors,
                   long totalCopies, long availableCopies,
                   String language, String originalLanguage, Long translatedFromId, String translatedFromTitle) {
        this.id = id;
        this.title = title;
        this.isbn = isbn;
        this.publicationYear = publicationYear;
        this.summary = summary;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.authors = authors;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.available = availableCopies > 0;
        this.language = language != null && !language.isBlank() ? language : "en";
        this.originalLanguage = originalLanguage;
        this.translatedFromId = translatedFromId;
        this.translatedFromTitle = translatedFromTitle;
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<String> getAuthors() {
        return authors;
    }

    public void setAuthors(List<String> authors) {
        this.authors = authors;
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
}
