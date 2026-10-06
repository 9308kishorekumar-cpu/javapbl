package com.libraai.book.dto;

import org.springframework.data.domain.Page;

public class BookRatingsSummaryDto {

    private Long bookId;
    private double averageRating;
    private long totalRatings;
    private Page<BookRatingDto> reviews;
    private BookRatingDto userRating;

    public BookRatingsSummaryDto() {}

    public BookRatingsSummaryDto(Long bookId, double averageRating, long totalRatings,
                                 Page<BookRatingDto> reviews, BookRatingDto userRating) {
        this.bookId = bookId;
        this.averageRating = averageRating;
        this.totalRatings = totalRatings;
        this.reviews = reviews;
        this.userRating = userRating;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalRatings() {
        return totalRatings;
    }

    public void setTotalRatings(long totalRatings) {
        this.totalRatings = totalRatings;
    }

    public Page<BookRatingDto> getReviews() {
        return reviews;
    }

    public void setReviews(Page<BookRatingDto> reviews) {
        this.reviews = reviews;
    }

    public BookRatingDto getUserRating() {
        return userRating;
    }

    public void setUserRating(BookRatingDto userRating) {
        this.userRating = userRating;
    }
}
