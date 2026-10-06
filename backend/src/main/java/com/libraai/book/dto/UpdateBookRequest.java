package com.libraai.book.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class UpdateBookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private Integer publicationYear;
    private String summary;
    private String language;
    private String originalLanguage;
    private Long translatedFromId;
    private Long categoryId;
    private List<String> authors;

    public UpdateBookRequest() {}

    public UpdateBookRequest(String title, Integer publicationYear, String summary, Long categoryId, List<String> authors) {
        this(title, publicationYear, summary, "en", null, null, categoryId, authors);
    }

    public UpdateBookRequest(String title, Integer publicationYear, String summary,
                             String language, String originalLanguage, Long translatedFromId,
                             Long categoryId, List<String> authors) {
        this.title = title;
        this.publicationYear = publicationYear;
        this.summary = summary;
        this.language = language;
        this.originalLanguage = originalLanguage;
        this.translatedFromId = translatedFromId;
        this.categoryId = categoryId;
        this.authors = authors;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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
        this.language = language;
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

    public List<String> getAuthors() {
        return authors;
    }

    public void setAuthors(List<String> authors) {
        this.authors = authors;
    }
}
