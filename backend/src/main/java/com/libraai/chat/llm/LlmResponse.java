package com.libraai.chat.llm;

import com.libraai.chat.model.ToolCall;

import java.util.ArrayList;
import java.util.List;

public class LlmResponse {
    private String content;
    private List<ToolCall> toolCalls = new ArrayList<>();
    private boolean isDegradedFallback;

    public LlmResponse() {}

    public LlmResponse(String content) {
        this.content = content;
        this.toolCalls = new ArrayList<>();
        this.isDegradedFallback = false;
    }

    public static LlmResponse message(String content) {
        return new LlmResponse(content);
    }

    public static LlmResponse withToolCalls(List<ToolCall> toolCalls) {
        LlmResponse response = new LlmResponse();
        response.setToolCalls(toolCalls != null ? toolCalls : new ArrayList<>());
        return response;
    }

    public static LlmResponse degraded(String message) {
        LlmResponse response = new LlmResponse(message);
        response.setDegradedFallback(true);
        return response;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<ToolCall> getToolCalls() {
        return toolCalls;
    }

    public void setToolCalls(List<ToolCall> toolCalls) {
        this.toolCalls = toolCalls;
    }

    public boolean hasToolCalls() {
        return toolCalls != null && !toolCalls.isEmpty();
    }

    public boolean isDegradedFallback() {
        return isDegradedFallback;
    }

    public void setDegradedFallback(boolean degradedFallback) {
        isDegradedFallback = degradedFallback;
    }
}
