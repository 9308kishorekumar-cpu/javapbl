package com.libraai.analytics.dto;

import java.math.BigDecimal;
import java.util.List;

public class MemberOverdueRiskDto {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private int riskScore; // 0 to 100
    private int lateReturnsCount;
    private double avgLateDays;
    private int activeLoansCount;
    private int totalHistoricalLoans;
    private long membershipAgeDays;
    private BigDecimal unpaidFines;
    private List<String> riskFactors;
    private String heuristicDisclaimer;

    public MemberOverdueRiskDto() {}

    public MemberOverdueRiskDto(Long userId, String username, String fullName, String email,
                                String riskLevel, int riskScore, int lateReturnsCount,
                                double avgLateDays, int activeLoansCount, int totalHistoricalLoans,
                                long membershipAgeDays, BigDecimal unpaidFines,
                                List<String> riskFactors, String heuristicDisclaimer) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.riskLevel = riskLevel;
        this.riskScore = riskScore;
        this.lateReturnsCount = lateReturnsCount;
        this.avgLateDays = avgLateDays;
        this.activeLoansCount = activeLoansCount;
        this.totalHistoricalLoans = totalHistoricalLoans;
        this.membershipAgeDays = membershipAgeDays;
        this.unpaidFines = unpaidFines;
        this.riskFactors = riskFactors;
        this.heuristicDisclaimer = heuristicDisclaimer;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public int getLateReturnsCount() {
        return lateReturnsCount;
    }

    public void setLateReturnsCount(int lateReturnsCount) {
        this.lateReturnsCount = lateReturnsCount;
    }

    public double getAvgLateDays() {
        return avgLateDays;
    }

    public void setAvgLateDays(double avgLateDays) {
        this.avgLateDays = avgLateDays;
    }

    public int getActiveLoansCount() {
        return activeLoansCount;
    }

    public void setActiveLoansCount(int activeLoansCount) {
        this.activeLoansCount = activeLoansCount;
    }

    public int getTotalHistoricalLoans() {
        return totalHistoricalLoans;
    }

    public void setTotalHistoricalLoans(int totalHistoricalLoans) {
        this.totalHistoricalLoans = totalHistoricalLoans;
    }

    public long getMembershipAgeDays() {
        return membershipAgeDays;
    }

    public void setMembershipAgeDays(long membershipAgeDays) {
        this.membershipAgeDays = membershipAgeDays;
    }

    public BigDecimal getUnpaidFines() {
        return unpaidFines;
    }

    public void setUnpaidFines(BigDecimal unpaidFines) {
        this.unpaidFines = unpaidFines;
    }

    public List<String> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(List<String> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public String getHeuristicDisclaimer() {
        return heuristicDisclaimer;
    }

    public void setHeuristicDisclaimer(String heuristicDisclaimer) {
        this.heuristicDisclaimer = heuristicDisclaimer;
    }
}
