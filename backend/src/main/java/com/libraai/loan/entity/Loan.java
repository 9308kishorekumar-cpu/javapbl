package com.libraai.loan.entity;

import com.libraai.book.entity.BookCopy;
import com.libraai.security.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "loans")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_copy_id", nullable = false)
    private BookCopy bookCopy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by_id")
    private User issuedBy;

    @Column(name = "issue_date", nullable = false)
    private Instant issueDate = Instant.now();

    @Column(name = "due_date", nullable = false)
    private Instant dueDate;

    @Column(name = "return_date")
    private Instant returnDate;

    @Column(name = "renewal_count", nullable = false)
    private int renewalCount = 0;

    @Column(name = "fine_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Column(name = "late_days", nullable = false)
    private int lateDays = 0;

    @Column(length = 20, nullable = false)
    private String status = "ACTIVE"; // ACTIVE, RETURNED, OVERDUE, LOST

    @Column(name = "rental_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal rentalFee = BigDecimal.ZERO;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "payment_method", length = 50, nullable = false)
    private String paymentMethod = "FREE"; // CREDIT_CARD, UPI, WALLET, FREE

    @Column(name = "payment_status", length = 30, nullable = false)
    private String paymentStatus = "PAID"; // PAID, PENDING, REFUNDED

    @Column(name = "booking_period_days", nullable = false)
    private int bookingPeriodDays = 14;

    @Column(name = "daily_rental_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal dailyRentalRate = new BigDecimal("0.50");

    public Loan() {}

    public Loan(BookCopy bookCopy, User user, User issuedBy, Instant dueDate) {
        this.bookCopy = bookCopy;
        this.user = user;
        this.issuedBy = issuedBy;
        this.dueDate = dueDate;
        this.issueDate = Instant.now();
        this.renewalCount = 0;
        this.status = "ACTIVE";
    }

    public Loan(BookCopy bookCopy, User user, User issuedBy, Instant dueDate,
                BigDecimal rentalFee, String paymentReference, String paymentMethod,
                String paymentStatus, int bookingPeriodDays, BigDecimal dailyRentalRate) {
        this.bookCopy = bookCopy;
        this.user = user;
        this.issuedBy = issuedBy;
        this.dueDate = dueDate;
        this.issueDate = Instant.now();
        this.renewalCount = 0;
        this.status = "ACTIVE";
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

    public BookCopy getBookCopy() {
        return bookCopy;
    }

    public void setBookCopy(BookCopy bookCopy) {
        this.bookCopy = bookCopy;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getIssuedBy() {
        return issuedBy;
    }

    public void setIssuedBy(User issuedBy) {
        this.issuedBy = issuedBy;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
