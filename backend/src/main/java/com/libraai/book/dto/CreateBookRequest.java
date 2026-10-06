package com.libraai.book.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateBookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "ISBN is required")
    private String isbn;

    private Integer publicationYear;

    private String summary;

    private String language = "en";

    private String originalLanguage;

    private Long translatedFromId;

    private Long categoryId;

    private String categoryName; // If categoryId is null, find or create category by name

    @NotEmpty(message = "At least one author is required")
    private List<String> authors; // Author names (find or create)

    private int initialCopies = 1; // Default 1 copy created

    public CreateBookRequest() {}

    public CreateBookRequest(String title, String isbn, Integer publicationYear, String summary,
                             Long categoryId, String categoryName, List<String> authors, int initialCopies) {
        this(title, isbn, publicationYear, summary, "en", null, null, categoryId, categoryName, authors, initialCopies);
    }

    public CreateBookRequest(String title, String isbn, Integer publicationYear, String summary,
                             String language, String originalLanguage, Long translatedFromId,
                             Long categoryId, String categoryName, List<String> authors, int initialCopies) {
        this.title = title;
        this.isbn = isbn;
        this.publicationYear = publicationYear;
        this.summary = summary;
        this.language = language != null && !language.isBlank() ? language : "en";
        this.originalLanguage = originalLanguage;
        this.translatedFromId = translatedFromId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.authors = authors;
        this.initialCopies = initialCopies;
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

    public int getInitialCopies() {
        return initialCopies;
    }

    public void setInitialCopies(int initialCopies) {
        this.initialCopies = initialCopies;
    }
}
