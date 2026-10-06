package com.libraai.ai.dto;

import java.util.List;

public class AiChatResponse {
    private String reply;
    private List<String> suggestedFollowUps;
    private List<Long> referencedBookIds;

    public AiChatResponse() {}

    public AiChatResponse(String reply, List<String> suggestedFollowUps, List<Long> referencedBookIds) {
        this.reply = reply;
        this.suggestedFollowUps = suggestedFollowUps;
        this.referencedBookIds = referencedBookIds;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
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
}
