package com.libraai.notification.dto;

import java.time.Instant;

public class NotificationDto {

    private Long id;
    private Long userId;
    private String username;
    private Long loanId;
    private String bookTitle;
    private String bookAuthor;
    private String bookBarcode;
    private String type; // DUE_SOON, OVERDUE, SYSTEM
    private String title;
    private String message;
    private String channel;
    private boolean isRead;
    private Instant sentAt;
    private Instant createdAt;

    public NotificationDto() {}

    public NotificationDto(Long id, Long userId, String username, Long loanId, String bookTitle,
                           String bookAuthor, String bookBarcode, String type, String title,
                           String message, String channel, boolean isRead, Instant sentAt, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.loanId = loanId;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
        this.bookBarcode = bookBarcode;
        this.type = type;
        this.title = title;
        this.message = message;
        this.channel = channel;
        this.isRead = isRead;
        this.sentAt = sentAt;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getBookAuthor() {
        return bookAuthor;
    }

    public void setBookAuthor(String bookAuthor) {
        this.bookAuthor = bookAuthor;
    }

    public String getBookBarcode() {
        return bookBarcode;
    }

    public void setBookBarcode(String bookBarcode) {
        this.bookBarcode = bookBarcode;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
