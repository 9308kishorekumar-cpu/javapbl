package com.libraai.admin.dto;

import java.math.BigDecimal;

public class SystemConfigDto {
    private int maxBooksPerMember;
    private int maxRenewalCount;
    private int defaultLoanPeriodDays;
    private BigDecimal dailyFineRate;
    private boolean nluSearchEnabled;
    private boolean semanticSearchEnabled;
    private boolean aiRecommendationsEnabled;

    public SystemConfigDto() {}

    public SystemConfigDto(int maxBooksPerMember, int maxRenewalCount, int defaultLoanPeriodDays,
                           BigDecimal dailyFineRate, boolean nluSearchEnabled,
                           boolean semanticSearchEnabled, boolean aiRecommendationsEnabled) {
        this.maxBooksPerMember = maxBooksPerMember;
        this.maxRenewalCount = maxRenewalCount;
        this.defaultLoanPeriodDays = defaultLoanPeriodDays;
        this.dailyFineRate = dailyFineRate;
        this.nluSearchEnabled = nluSearchEnabled;
        this.semanticSearchEnabled = semanticSearchEnabled;
        this.aiRecommendationsEnabled = aiRecommendationsEnabled;
    }

    public int getMaxBooksPerMember() {
        return maxBooksPerMember;
    }

    public void setMaxBooksPerMember(int maxBooksPerMember) {
        this.maxBooksPerMember = maxBooksPerMember;
    }

    public int getMaxRenewalCount() {
        return maxRenewalCount;
    }

    public void setMaxRenewalCount(int maxRenewalCount) {
        this.maxRenewalCount = maxRenewalCount;
    }

    public int getDefaultLoanPeriodDays() {
        return defaultLoanPeriodDays;
    }

    public void setDefaultLoanPeriodDays(int defaultLoanPeriodDays) {
        this.defaultLoanPeriodDays = defaultLoanPeriodDays;
    }

    public BigDecimal getDailyFineRate() {
        return dailyFineRate;
    }

    public void setDailyFineRate(BigDecimal dailyFineRate) {
        this.dailyFineRate = dailyFineRate;
    }

    public boolean isNluSearchEnabled() {
        return nluSearchEnabled;
    }

    public void setNluSearchEnabled(boolean nluSearchEnabled) {
        this.nluSearchEnabled = nluSearchEnabled;
    }

    public boolean isSemanticSearchEnabled() {
        return semanticSearchEnabled;
    }

    public void setSemanticSearchEnabled(boolean semanticSearchEnabled) {
        this.semanticSearchEnabled = semanticSearchEnabled;
    }

    public boolean isAiRecommendationsEnabled() {
        return aiRecommendationsEnabled;
    }

    public void setAiRecommendationsEnabled(boolean aiRecommendationsEnabled) {
        this.aiRecommendationsEnabled = aiRecommendationsEnabled;
    }
}
