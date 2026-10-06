package com.libraai.book.dto;

import java.util.List;

public class BookCopyDto {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private String bookCategory;
    private String bookLanguage;
    private List<String> bookAuthors;
    private String barcode;
    private String conditionNote;
    private String status;
    private String qrCodeImage;

    public BookCopyDto() {}

    public BookCopyDto(Long id, Long bookId, String barcode, String conditionNote, String status) {
        this.id = id;
        this.bookId = bookId;
        this.barcode = barcode;
        this.conditionNote = conditionNote;
        this.status = status;
    }

    public BookCopyDto(Long id, Long bookId, String bookTitle, String bookIsbn,
                       String bookCategory, String bookLanguage, List<String> bookAuthors,
                       String barcode, String conditionNote, String status, String qrCodeImage) {
        this.id = id;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookIsbn = bookIsbn;
        this.bookCategory = bookCategory;
        this.bookLanguage = bookLanguage;
        this.bookAuthors = bookAuthors;
        this.barcode = barcode;
        this.conditionNote = conditionNote;
        this.status = status;
        this.qrCodeImage = qrCodeImage;
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

    public String getBookCategory() {
        return bookCategory;
    }

    public void setBookCategory(String bookCategory) {
        this.bookCategory = bookCategory;
    }

    public String getBookLanguage() {
        return bookLanguage;
    }

    public void setBookLanguage(String bookLanguage) {
        this.bookLanguage = bookLanguage;
    }

    public List<String> getBookAuthors() {
        return bookAuthors;
    }

    public void setBookAuthors(List<String> bookAuthors) {
        this.bookAuthors = bookAuthors;
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
}
