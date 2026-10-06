package com.libraai.ai.dto;

public class CitationDto {
    private Long bookId;
    private String title;
    private String format; // APA, MLA, CHICAGO, HARVARD, BIBTEX
    private String citationText;

    public CitationDto() {}

    public CitationDto(Long bookId, String title, String format, String citationText) {
        this.bookId = bookId;
        this.title = title;
        this.format = format;
        this.citationText = citationText;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getCitationText() {
        return citationText;
    }

    public void setCitationText(String citationText) {
        this.citationText = citationText;
    }
}
