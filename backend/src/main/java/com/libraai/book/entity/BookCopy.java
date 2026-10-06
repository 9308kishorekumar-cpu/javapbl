package com.libraai.book.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "book_copies")
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(length = 50, nullable = false, unique = true)
    private String barcode;

    @Column(name = "condition_note", length = 255)
    private String conditionNote = "GOOD";

    @Column(length = 30, nullable = false)
    private String status = "AVAILABLE"; // AVAILABLE, BORROWED, RESERVED, LOST, MAINTENANCE

    @Column(name = "qr_code_image", columnDefinition = "TEXT")
    private String qrCodeImage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public BookCopy() {}

    public BookCopy(Book book, String barcode, String conditionNote, String status) {
        this.book = book;
        this.barcode = barcode;
        this.conditionNote = conditionNote != null ? conditionNote : "GOOD";
        this.status = status != null ? status : "AVAILABLE";
    }

    public BookCopy(Book book, String barcode, String conditionNote, String status, String qrCodeImage) {
        this.book = book;
        this.barcode = barcode;
        this.conditionNote = conditionNote != null ? conditionNote : "GOOD";
        this.status = status != null ? status : "AVAILABLE";
        this.qrCodeImage = qrCodeImage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getConditionNote() {
        return conditionNote;
    }

    public void setConditionNote(String conditionNote) {
        this.conditionNote = conditionNote;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getQrCodeImage() {
        return qrCodeImage;
    }

    public void setQrCodeImage(String qrCodeImage) {
        this.qrCodeImage = qrCodeImage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
