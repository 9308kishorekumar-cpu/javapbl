package com.libraai.notification.dto;

import java.time.Instant;

public class NotificationBatchResultDto {

    private int dueSoonCount;
    private int overdueCount;
    private int totalProcessed;
    private Instant executedAt;
    private String statusMessage;

    public NotificationBatchResultDto() {
        this.executedAt = Instant.now();
    }

    public NotificationBatchResultDto(int dueSoonCount, int overdueCount, int totalProcessed, String statusMessage) {
        this.dueSoonCount = dueSoonCount;
        this.overdueCount = overdueCount;
        this.totalProcessed = totalProcessed;
        this.executedAt = Instant.now();
        this.statusMessage = statusMessage;
    }

    public int getDueSoonCount() {
        return dueSoonCount;
    }

    public void setDueSoonCount(int dueSoonCount) {
        this.dueSoonCount = dueSoonCount;
    }

    public int getOverdueCount() {
        return overdueCount;
    }

    public void setOverdueCount(int overdueCount) {
        this.overdueCount = overdueCount;
    }

    public int getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(int totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }
}
