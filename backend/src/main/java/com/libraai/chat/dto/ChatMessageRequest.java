package com.libraai.chat.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatMessageRequest {

    @NotBlank(message = "Message cannot be blank")
    private String message;

    private String sessionId;
    private String bookContext;

    public ChatMessageRequest() {}

    public ChatMessageRequest(String message, String sessionId) {
        this.message = message;
        this.sessionId = sessionId;
    }

    public ChatMessageRequest(String message, String sessionId, String bookContext) {
        this.message = message;
        this.sessionId = sessionId;
        this.bookContext = bookContext;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getBookContext() {
        return bookContext;
    }

    public void setBookContext(String bookContext) {
        this.bookContext = bookContext;
    }
}
