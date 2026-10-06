package com.libraai.loan.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class RentalQuoteDto {

    private Long bookId;
    private String bookTitle;
    private String bookLanguage;
    private int rentalPeriodDays;
    private BigDecimal dailyRentalRate;
    private BigDecimal totalRentalFee;
    private Instant dueDatePreview;
    private boolean availableForRental;
    private int availableCopies;

    public RentalQuoteDto() {}

    public RentalQuoteDto(Long bookId, String bookTitle, String bookLanguage,
                          int rentalPeriodDays, BigDecimal dailyRentalRate,
                          BigDecimal totalRentalFee, Instant dueDatePreview,
                          boolean availableForRental, int availableCopies) {
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookLanguage = bookLanguage;
        this.rentalPeriodDays = rentalPeriodDays;
        this.dailyRentalRate = dailyRentalRate;
        this.totalRentalFee = totalRentalFee;
        this.dueDatePreview = dueDatePreview;
        this.availableForRental = availableForRental;
        this.availableCopies = availableCopies;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookLanguage() {
        return bookLanguage;
    }

    public void setBookLanguage(String bookLanguage) {
        this.bookLanguage = bookLanguage;
    }

    public int getRentalPeriodDays() {
        return rentalPeriodDays;
    }

    public void setRentalPeriodDays(int rentalPeriodDays) {
        this.rentalPeriodDays = rentalPeriodDays;
    }

    public BigDecimal getDailyRentalRate() {
        return dailyRentalRate;
    }

    public void setDailyRentalRate(BigDecimal dailyRentalRate) {
        this.dailyRentalRate = dailyRentalRate;
    }

    public BigDecimal getTotalRentalFee() {
        return totalRentalFee;
    }

    public void setTotalRentalFee(BigDecimal totalRentalFee) {
        this.totalRentalFee = totalRentalFee;
    }

    public Instant getDueDatePreview() {
        return dueDatePreview;
    }

    public void setDueDatePreview(Instant dueDatePreview) {
        this.dueDatePreview = dueDatePreview;
    }

    public boolean isAvailableForRental() {
        return availableForRental;
    }

    public void setAvailableForRental(boolean availableForRental) {
        this.availableForRental = availableForRental;
    }

    public int getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(int availableCopies) {
        this.availableCopies = availableCopies;
    }
}
