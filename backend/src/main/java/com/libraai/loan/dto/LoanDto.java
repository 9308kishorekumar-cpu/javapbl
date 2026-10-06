package com.libraai.loan.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class LoanDto {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private String bookLanguage;
    private String bookCategory;
    private List<String> bookAuthors;
    private Long bookCopyId;
    private String barcode;
    private Long userId;
    private String username;
    private String memberFullName;
    private String userEmail;
    private Instant issueDate;
    private Instant dueDate;
    private Instant returnDate;
    private int renewalCount;
    private BigDecimal fineAmount = BigDecimal.ZERO;
    private int lateDays = 0;
    private String status;
    private boolean overdue;
    private BigDecimal accruedFine = BigDecimal.ZERO;
    private int currentOverdueDays = 0;

    // Rental & Booking Payment Attributes
    private BigDecimal rentalFee = BigDecimal.ZERO;
    private String paymentReference;
    private String paymentMethod = "FREE";
    private String paymentStatus = "PAID";
    private int bookingPeriodDays = 14;
    private BigDecimal dailyRentalRate = new BigDecimal("0.50");

    public LoanDto() {}

    public LoanDto(Long id, Long bookId, String bookTitle, String bookIsbn, Long bookCopyId, String barcode,
                   Long userId, String username, String memberFullName, Instant issueDate, Instant dueDate,
                   Instant returnDate, int renewalCount, String status, boolean overdue, BigDecimal accruedFine) {
        this(id, bookId, bookTitle, bookIsbn, "en", "General", null, bookCopyId, barcode,
                userId, username, memberFullName, null, issueDate, dueDate, returnDate, renewalCount,
                accruedFine, 0, status, overdue, accruedFine, 0, BigDecimal.ZERO, null, "FREE", "PAID", 14, new BigDecimal("0.50"));
    }

    public LoanDto(Long id, Long bookId, String bookTitle, String bookIsbn, String bookLanguage,
                   String bookCategory, List<String> bookAuthors, Long bookCopyId, String barcode,
                   Long userId, String username, String memberFullName, Instant issueDate, Instant dueDate,
                   Instant returnDate, int renewalCount, BigDecimal fineAmount, int lateDays,
                   String status, boolean overdue, BigDecimal accruedFine) {
        this(id, bookId, bookTitle, bookIsbn, bookLanguage, bookCategory, bookAuthors, bookCopyId, barcode,
                userId, username, memberFullName, null, issueDate, dueDate, returnDate, renewalCount,
                fineAmount, lateDays, status, overdue, accruedFine, 0, BigDecimal.ZERO, null, "FREE", "PAID", 14, new BigDecimal("0.50"));
    }

    public LoanDto(Long id, Long bookId, String bookTitle, String bookIsbn, String bookLanguage,
                   String bookCategory, List<String> bookAuthors, Long bookCopyId, String barcode,
                   Long userId, String username, String memberFullName, String userEmail,
                   Instant issueDate, Instant dueDate, Instant returnDate, int renewalCount,
                   BigDecimal fineAmount, int lateDays, String status, boolean overdue,
                   BigDecimal accruedFine, int currentOverdueDays, BigDecimal rentalFee,
                   String paymentReference, String paymentMethod, String paymentStatus,
                   int bookingPeriodDays, BigDecimal dailyRentalRate) {
        this.id = id;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookIsbn = bookIsbn;
        this.bookLanguage = bookLanguage != null ? bookLanguage : "en";
        this.bookCategory = bookCategory;
        this.bookAuthors = bookAuthors;
        this.bookCopyId = bookCopyId;
        this.barcode = barcode;
        this.userId = userId;
        this.username = username;
        this.memberFullName = memberFullName;
        this.userEmail = userEmail;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.renewalCount = renewalCount;
        this.fineAmount = fineAmount != null ? fineAmount : BigDecimal.ZERO;
        this.lateDays = lateDays;
        this.status = status;
        this.overdue = overdue;
        this.accruedFine = accruedFine != null ? accruedFine : BigDecimal.ZERO;
        this.currentOverdueDays = currentOverdueDays;
        this.rentalFee = rentalFee != null ? rentalFee : BigDecimal.ZERO;
        this.paymentReference = paymentReference;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "FREE";
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PAID";
        this.bookingPeriodDays = bookingPeriodDays > 0 ? bookingPeriodDays : 14;
        this.dailyRentalRate = dailyRentalRate != null ? dailyRentalRate : new BigDecimal("0.50");
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getBookIsbn() {
        return bookIsbn;
    }

    public void setBookIsbn(String bookIsbn) {
        this.bookIsbn = bookIsbn;
    }

    public Long getBookCopyId() {
        return bookCopyId;
    }

    public void setBookCopyId(Long bookCopyId) {
        this.bookCopyId = bookCopyId;
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

    public String getMemberFullName() {
        return memberFullName;
    }

    public void setMemberFullName(String memberFullName) {
        this.memberFullName = memberFullName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Instant getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(Instant issueDate) {
        this.issueDate = issueDate;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public Instant getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(Instant returnDate) {
        this.returnDate = returnDate;
    }

    public int getRenewalCount() {
        return renewalCount;
    }

    public void setRenewalCount(int renewalCount) {
        this.renewalCount = renewalCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBookLanguage() {
        return bookLanguage;
    }

    public void setBookLanguage(String bookLanguage) {
        this.bookLanguage = bookLanguage;
    }

    public String getBookCategory() {
        return bookCategory;
    }

    public void setBookCategory(String bookCategory) {
        this.bookCategory = bookCategory;
    }

    public List<String> getBookAuthors() {
        return bookAuthors;
    }

    public void setBookAuthors(List<String> bookAuthors) {
        this.bookAuthors = bookAuthors;
    }

    public BigDecimal getFineAmount() {
        return fineAmount;
    }

    public void setFineAmount(BigDecimal fineAmount) {
        this.fineAmount = fineAmount != null ? fineAmount : BigDecimal.ZERO;
    }

    public int getLateDays() {
        return lateDays;
    }

    public void setLateDays(int lateDays) {
        this.lateDays = lateDays;
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public BigDecimal getAccruedFine() {
        return accruedFine;
    }

    public void setAccruedFine(BigDecimal accruedFine) {
        this.accruedFine = accruedFine;
    }

    public int getCurrentOverdueDays() {
        return currentOverdueDays;
    }

    public void setCurrentOverdueDays(int currentOverdueDays) {
        this.currentOverdueDays = currentOverdueDays;
    }

    public BigDecimal getRentalFee() {
        return rentalFee;
    }

    public void setRentalFee(BigDecimal rentalFee) {
        this.rentalFee = rentalFee != null ? rentalFee : BigDecimal.ZERO;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public int getBookingPeriodDays() {
        return bookingPeriodDays;
    }

    public void setBookingPeriodDays(int bookingPeriodDays) {
        this.bookingPeriodDays = bookingPeriodDays;
    }

    public BigDecimal getDailyRentalRate() {
        return dailyRentalRate;
    }

    public void setDailyRentalRate(BigDecimal dailyRentalRate) {
        this.dailyRentalRate = dailyRentalRate != null ? dailyRentalRate : new BigDecimal("0.50");
    }
}
