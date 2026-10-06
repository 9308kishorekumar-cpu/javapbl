package com.libraai.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public class MemberLifetimeStatsDto {

    private long totalLoans;
    private long activeLoans;
    private long returnedLoans;
    private long overdueLoans;
    private BigDecimal totalFinesAssessed;
    private BigDecimal totalFinesPaid;
    private BigDecimal outstandingFines;
    private double avgReturnDelayDays;
    private List<CategoryCountDto> topCategories;

    public MemberLifetimeStatsDto() {
        this.totalFinesAssessed = BigDecimal.ZERO;
        this.totalFinesPaid = BigDecimal.ZERO;
        this.outstandingFines = BigDecimal.ZERO;
    }

    public MemberLifetimeStatsDto(long totalLoans, long activeLoans, long returnedLoans, long overdueLoans,
                                  BigDecimal totalFinesAssessed, BigDecimal totalFinesPaid,
                                  BigDecimal outstandingFines, double avgReturnDelayDays,
                                  List<CategoryCountDto> topCategories) {
        this.totalLoans = totalLoans;
        this.activeLoans = activeLoans;
        this.returnedLoans = returnedLoans;
        this.overdueLoans = overdueLoans;
        this.totalFinesAssessed = totalFinesAssessed;
        this.totalFinesPaid = totalFinesPaid;
        this.outstandingFines = outstandingFines;
        this.avgReturnDelayDays = avgReturnDelayDays;
        this.topCategories = topCategories;
    }

    public long getTotalLoans() {
        return totalLoans;
    }

    public void setTotalLoans(long totalLoans) {
        this.totalLoans = totalLoans;
    }

    public long getActiveLoans() {
        return activeLoans;
    }

    public void setActiveLoans(long activeLoans) {
        this.activeLoans = activeLoans;
    }

    public long getReturnedLoans() {
        return returnedLoans;
    }

    public void setReturnedLoans(long returnedLoans) {
        this.returnedLoans = returnedLoans;
    }

    public long getOverdueLoans() {
        return overdueLoans;
    }

    public void setOverdueLoans(long overdueLoans) {
        this.overdueLoans = overdueLoans;
    }

    public BigDecimal getTotalFinesAssessed() {
        return totalFinesAssessed;
    }

    public void setTotalFinesAssessed(BigDecimal totalFinesAssessed) {
        this.totalFinesAssessed = totalFinesAssessed;
    }

    public BigDecimal getTotalFinesPaid() {
        return totalFinesPaid;
    }

    public void setTotalFinesPaid(BigDecimal totalFinesPaid) {
        this.totalFinesPaid = totalFinesPaid;
    }

    public BigDecimal getOutstandingFines() {
        return outstandingFines;
    }

    public void setOutstandingFines(BigDecimal outstandingFines) {
        this.outstandingFines = outstandingFines;
    }

    public double getAvgReturnDelayDays() {
        return avgReturnDelayDays;
    }

    public void setAvgReturnDelayDays(double avgReturnDelayDays) {
        this.avgReturnDelayDays = avgReturnDelayDays;
    }

    public List<CategoryCountDto> getTopCategories() {
        return topCategories;
    }

    public void setTopCategories(List<CategoryCountDto> topCategories) {
        this.topCategories = topCategories;
    }
}
