package com.libraai.loan.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class FineDto {
    private Long id;
    private Long loanId;
    private String bookTitle;
    private String barcode;
    private Long userId;
    private String username;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private String status;
    private Instant createdAt;

    public FineDto() {}

    public FineDto(Long id, Long loanId, String bookTitle, String barcode, Long userId, String username,
                   BigDecimal amount, BigDecimal paidAmount, String status, Instant createdAt) {
        this.id = id;
        this.loanId = loanId;
        this.bookTitle = bookTitle;
        this.barcode = barcode;
        this.userId = userId;
        this.username = username;
        this.amount = amount;
        this.paidAmount = paidAmount != null ? paidAmount : BigDecimal.ZERO;
        this.remainingAmount = this.amount.subtract(this.paidAmount);
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
        if (this.amount != null) {
            this.remainingAmount = this.amount.subtract(this.paidAmount);
        }
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
