package com.libraai.chat.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ChatResponseDto {

    private String reply;
    private String sessionId;
    private boolean groundedInCatalog;
    private boolean isDegraded;
    private List<ToolExecutionDto> toolExecutions = new ArrayList<>();
    private List<String> suggestedFollowUps = new ArrayList<>();
    private List<Long> referencedBookIds = new ArrayList<>();
    private Instant timestamp = Instant.now();

    public ChatResponseDto() {}

    public ChatResponseDto(String reply, String sessionId, boolean groundedInCatalog) {
        this.reply = reply;
        this.sessionId = sessionId;
        this.groundedInCatalog = groundedInCatalog;
        this.isDegraded = false;
        this.timestamp = Instant.now();
    }

    public static ChatResponseDto generalKnowledge(String reply, String sessionId) {
        ChatResponseDto dto = new ChatResponseDto(reply, sessionId, false);
        dto.setGroundedInCatalog(false);
        return dto;
    }

    public static ChatResponseDto catalogGrounded(String reply, String sessionId, List<ToolExecutionDto> toolExecutions, List<Long> referencedBookIds) {
        ChatResponseDto dto = new ChatResponseDto(reply, sessionId, true);
        dto.setToolExecutions(toolExecutions != null ? toolExecutions : new ArrayList<>());
        dto.setReferencedBookIds(referencedBookIds != null ? referencedBookIds : new ArrayList<>());
        return dto;
    }

    public static ChatResponseDto fallback(String reply, String sessionId) {
        ChatResponseDto dto = new ChatResponseDto(reply, sessionId, false);
        dto.setDegraded(true);
        dto.setSuggestedFollowUps(List.of(
                "Search books by keyword",
                "Explore catalog by category",
                "Browse multilingual classics"
        ));
        return dto;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public boolean isGroundedInCatalog() {
        return groundedInCatalog;
    }

    public void setGroundedInCatalog(boolean groundedInCatalog) {
        this.groundedInCatalog = groundedInCatalog;
    }

    public boolean isDegraded() {
        return isDegraded;
    }

    public void setDegraded(boolean degraded) {
        isDegraded = degraded;
    }

    public List<ToolExecutionDto> getToolExecutions() {
        return toolExecutions;
    }

    public void setToolExecutions(List<ToolExecutionDto> toolExecutions) {
        this.toolExecutions = toolExecutions;
    }

    public List<String> getSuggestedFollowUps() {
        return suggestedFollowUps;
    }

    public void setSuggestedFollowUps(List<String> suggestedFollowUps) {
        this.suggestedFollowUps = suggestedFollowUps;
    }

    public List<Long> getReferencedBookIds() {
        return referencedBookIds;
    }

    public void setReferencedBookIds(List<Long> referencedBookIds) {
        this.referencedBookIds = referencedBookIds;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
