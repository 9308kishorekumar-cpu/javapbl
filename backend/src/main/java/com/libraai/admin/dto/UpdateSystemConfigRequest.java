package com.libraai.admin.dto;

import java.math.BigDecimal;

public class UpdateSystemConfigRequest {

    private Integer maxBooksPerMember;
    private Integer maxRenewalCount;
    private Integer defaultLoanPeriodDays;
    private BigDecimal dailyFineRate;

    public UpdateSystemConfigRequest() {}

    public UpdateSystemConfigRequest(Integer maxBooksPerMember, Integer maxRenewalCount,
                                     Integer defaultLoanPeriodDays, BigDecimal dailyFineRate) {
        this.maxBooksPerMember = maxBooksPerMember;
        this.maxRenewalCount = maxRenewalCount;
        this.defaultLoanPeriodDays = defaultLoanPeriodDays;
        this.dailyFineRate = dailyFineRate;
    }

    public Integer getMaxBooksPerMember() {
        return maxBooksPerMember;
    }

    public void setMaxBooksPerMember(Integer maxBooksPerMember) {
        this.maxBooksPerMember = maxBooksPerMember;
    }

    public Integer getMaxRenewalCount() {
        return maxRenewalCount;
    }

    public void setMaxRenewalCount(Integer maxRenewalCount) {
        this.maxRenewalCount = maxRenewalCount;
    }

    public Integer getDefaultLoanPeriodDays() {
        return defaultLoanPeriodDays;
    }

    public void setDefaultLoanPeriodDays(Integer defaultLoanPeriodDays) {
        this.defaultLoanPeriodDays = defaultLoanPeriodDays;
    }

    public BigDecimal getDailyFineRate() {
        return dailyFineRate;
    }

    public void setDailyFineRate(BigDecimal dailyFineRate) {
        this.dailyFineRate = dailyFineRate;
    }
}
