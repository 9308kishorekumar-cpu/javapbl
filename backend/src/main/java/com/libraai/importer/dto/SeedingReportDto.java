package com.libraai.importer.dto;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public class SeedingReportDto {
    private int totalImported;
    private int totalSkipped;
    private int totalCopiesSeeded;
    private int languagesCoveredCount;
    private Map<String, Integer> languageBreakdown = new HashMap<>();
    private Map<String, Integer> categoryBreakdown = new HashMap<>();
    private double durationSeconds;
    private String status;
    private Instant timestamp = Instant.now();

    public SeedingReportDto() {}

    public SeedingReportDto(int totalImported, int totalSkipped, int totalCopiesSeeded,
                            int languagesCoveredCount, Map<String, Integer> languageBreakdown,
                            Map<String, Integer> categoryBreakdown, double durationSeconds, String status) {
        this.totalImported = totalImported;
        this.totalSkipped = totalSkipped;
        this.totalCopiesSeeded = totalCopiesSeeded;
        this.languagesCoveredCount = languagesCoveredCount;
        this.languageBreakdown = languageBreakdown;
        this.categoryBreakdown = categoryBreakdown;
        this.durationSeconds = durationSeconds;
        this.status = status;
        this.timestamp = Instant.now();
    }

    public int getTotalImported() {
        return totalImported;
    }

    public void setTotalImported(int totalImported) {
        this.totalImported = totalImported;
    }

    public int getTotalSkipped() {
        return totalSkipped;
    }

    public void setTotalSkipped(int totalSkipped) {
        this.totalSkipped = totalSkipped;
    }

    public int getTotalCopiesSeeded() {
        return totalCopiesSeeded;
    }

    public void setTotalCopiesSeeded(int totalCopiesSeeded) {
        this.totalCopiesSeeded = totalCopiesSeeded;
    }

    public int getLanguagesCoveredCount() {
        return languagesCoveredCount;
    }

    public void setLanguagesCoveredCount(int languagesCoveredCount) {
        this.languagesCoveredCount = languagesCoveredCount;
    }

    public Map<String, Integer> getLanguageBreakdown() {
        return languageBreakdown;
    }

    public void setLanguageBreakdown(Map<String, Integer> languageBreakdown) {
        this.languageBreakdown = languageBreakdown;
    }

    public Map<String, Integer> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<String, Integer> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public double getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(double durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
