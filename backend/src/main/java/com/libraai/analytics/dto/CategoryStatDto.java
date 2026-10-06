package com.libraai.analytics.dto;

public class CategoryStatDto {
    private String categoryName;
    private long bookCount;

    public CategoryStatDto() {}

    public CategoryStatDto(String categoryName, long bookCount) {
        this.categoryName = categoryName;
        this.bookCount = bookCount;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public long getBookCount() {
        return bookCount;
    }

    public void setBookCount(long bookCount) {
        this.bookCount = bookCount;
    }
}
