package com.libraai.loan.dto;

import java.math.BigDecimal;

public class MemberLoanStatsDto {
    private Long userId;
    private String username;
    private long totalLoans;
    private long activeLoans;
    private long returnedLoans;
    private long overdueLoans;
    private double averageLateDays;
    private BigDecimal totalFinesAccrued;

    public MemberLoanStatsDto() {}

    public MemberLoanStatsDto(Long userId, String username, long totalLoans, long activeLoans,
                              long returnedLoans, long overdueLoans, double averageLateDays,
                              BigDecimal totalFinesAccrued) {
        this.userId = userId;
        this.username = username;
        this.totalLoans = totalLoans;
        this.activeLoans = activeLoans;
        this.returnedLoans = returnedLoans;
        this.overdueLoans = overdueLoans;
        this.averageLateDays = averageLateDays;
        this.totalFinesAccrued = totalFinesAccrued != null ? totalFinesAccrued : BigDecimal.ZERO;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public double getAverageLateDays() {
        return averageLateDays;
    }

    public void setAverageLateDays(double averageLateDays) {
        this.averageLateDays = averageLateDays;
    }

    public BigDecimal getTotalFinesAccrued() {
        return totalFinesAccrued;
    }

    public void setTotalFinesAccrued(BigDecimal totalFinesAccrued) {
        this.totalFinesAccrued = totalFinesAccrued;
    }
}
