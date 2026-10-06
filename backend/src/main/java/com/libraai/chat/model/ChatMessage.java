package com.libraai.chat.model;

import java.time.Instant;
import java.util.List;

public class ChatMessage {

    public enum Role {
        SYSTEM,
        USER,
        ASSISTANT,
        TOOL
    }

    private Role role;
    private String content;
    private List<ToolCall> toolCalls;
    private String toolCallId;
    private String toolName;
    private Instant timestamp = Instant.now();

    public ChatMessage() {}

    public ChatMessage(Role role, String content) {
        this.role = role;
        this.content = content;
        this.timestamp = Instant.now();
    }

    public static ChatMessage system(String content) {
        return new ChatMessage(Role.SYSTEM, content);
    }

    public static ChatMessage user(String content) {
        return new ChatMessage(Role.USER, content);
    }

    public static ChatMessage assistant(String content) {
        return new ChatMessage(Role.ASSISTANT, content);
    }

    public static ChatMessage assistantWithTools(String content, List<ToolCall> toolCalls) {
        ChatMessage msg = new ChatMessage(Role.ASSISTANT, content);
        msg.setToolCalls(toolCalls);
        return msg;
    }

    public static ChatMessage tool(String toolCallId, String toolName, String content) {
        ChatMessage msg = new ChatMessage(Role.TOOL, content);
        msg.setToolCallId(toolCallId);
        msg.setToolName(toolName);
        return msg;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
