package com.libraai.chat.model;

public class ToolResult {
    private String toolCallId;
    private String toolName;
    private String content;
    private boolean isError;

    public ToolResult() {}

    public ToolResult(String toolCallId, String toolName, String content, boolean isError) {
        this.toolCallId = toolCallId;
        this.toolName = toolName;
        this.content = content;
        this.isError = isError;
    }

    public static ToolResult success(String toolCallId, String toolName, String content) {
        return new ToolResult(toolCallId, toolName, content, false);
    }

    public static ToolResult error(String toolCallId, String toolName, String errorMessage) {
        return new ToolResult(toolCallId, toolName, errorMessage, true);
    }

    public String getToolCallId() {
        return toolCallId;
    }

    public void setToolCallId(String toolCallId) {
        this.toolCallId = toolCallId;
    }

    public String getToolName() {
        return toolName;
    }

    public void setToolName(String toolName) {
        this.toolName = toolName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isError() {
        return isError;
    }

    public void setError(boolean error) {
        isError = error;
    }
}
