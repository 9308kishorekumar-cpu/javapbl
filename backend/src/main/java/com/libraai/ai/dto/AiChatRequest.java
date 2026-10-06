package com.libraai.ai.dto;

import jakarta.validation.constraints.NotBlank;

public class AiChatRequest {

    @NotBlank(message = "Message prompt is required")
    private String message;

    private String bookContext;

    public AiChatRequest() {}

    public AiChatRequest(String message, String bookContext) {
        this.message = message;
        this.bookContext = bookContext;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getBookContext() {
        return bookContext;
    }

    public void setBookContext(String bookContext) {
        this.bookContext = bookContext;
    }
}
