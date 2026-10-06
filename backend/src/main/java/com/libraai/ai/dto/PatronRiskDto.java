package com.libraai.ai.dto;

import java.math.BigDecimal;
import java.util.List;

public class PatronRiskDto {
    private String username;
    private String memberName;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private int riskScore; // 0 - 100
    private int totalHistoricalLoans;
    private int overdueLoansCount;
    private BigDecimal unpaidFines;
    private List<String> riskFactors;
    private String recommendation;

    public PatronRiskDto() {}

    public PatronRiskDto(String username, String memberName, String riskLevel, int riskScore,
                         int totalHistoricalLoans, int overdueLoansCount, BigDecimal unpaidFines,
                         List<String> riskFactors, String recommendation) {
        this.username = username;
        this.memberName = memberName;
        this.riskLevel = riskLevel;
        this.riskScore = riskScore;
        this.totalHistoricalLoans = totalHistoricalLoans;
        this.overdueLoansCount = overdueLoansCount;
        this.unpaidFines = unpaidFines;
        this.riskFactors = riskFactors;
        this.recommendation = recommendation;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
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

    public int getTotalHistoricalLoans() {
        return totalHistoricalLoans;
    }

    public void setTotalHistoricalLoans(int totalHistoricalLoans) {
        this.totalHistoricalLoans = totalHistoricalLoans;
    }

    public int getOverdueLoansCount() {
        return overdueLoansCount;
    }

    public void setOverdueLoansCount(int overdueLoansCount) {
        this.overdueLoansCount = overdueLoansCount;
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

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}
