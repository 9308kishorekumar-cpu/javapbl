package com.libraai.loan.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class BookRentalRequest {

    @NotNull(message = "Book ID is required for rental booking")
    private Long bookId;

    private String barcode;

    @Min(value = 1, message = "Rental period must be at least 1 day")
    @Max(value = 90, message = "Rental period cannot exceed 90 days")
    private int rentalPeriodDays = 14;

    private String paymentMethod = "CREDIT_CARD"; // CREDIT_CARD, UPI, WALLET, CASH

    private String paymentReference;

    public BookRentalRequest() {}

    public BookRentalRequest(Long bookId, int rentalPeriodDays, String paymentMethod) {
        this.bookId = bookId;
        this.rentalPeriodDays = rentalPeriodDays;
        this.paymentMethod = paymentMethod;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public int getRentalPeriodDays() {
        return rentalPeriodDays;
    }

    public void setRentalPeriodDays(int rentalPeriodDays) {
        this.rentalPeriodDays = rentalPeriodDays;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }
}
