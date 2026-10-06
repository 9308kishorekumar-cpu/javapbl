package com.libraai.analytics.dto;

public class TopBookDto {
    private Long bookId;
    private String title;
    private String category;
    private long borrowCount;

    public TopBookDto() {}

    public TopBookDto(Long bookId, String title, String category, long borrowCount) {
        this.bookId = bookId;
        this.title = title;
        this.category = category;
        this.borrowCount = borrowCount;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public long getBorrowCount() {
        return borrowCount;
    }

    public void setBorrowCount(long borrowCount) {
        this.borrowCount = borrowCount;
    }
}
