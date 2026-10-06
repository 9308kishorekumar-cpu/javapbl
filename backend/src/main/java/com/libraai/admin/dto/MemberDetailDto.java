package com.libraai.admin.dto;

import com.libraai.analytics.dto.MemberOverdueRiskDto;
import com.libraai.book.dto.BookRatingDto;
import com.libraai.loan.dto.LoanDto;
import com.libraai.loan.dto.ReservationDto;

import java.util.List;

public class MemberDetailDto {

    private MemberProfileDto profile;
    private MemberOverdueRiskDto overdueRisk;
    private MemberLifetimeStatsDto lifetimeStats;
    private List<LoanDto> activeLoans;
    private List<LoanDto> borrowingHistory;
    private List<BookRatingDto> ratings;
    private List<ReservationDto> reservations;

    public MemberDetailDto() {}

    public MemberDetailDto(MemberProfileDto profile, MemberOverdueRiskDto overdueRisk,
                           MemberLifetimeStatsDto lifetimeStats, List<LoanDto> activeLoans,
                           List<LoanDto> borrowingHistory, List<BookRatingDto> ratings,
                           List<ReservationDto> reservations) {
        this.profile = profile;
        this.overdueRisk = overdueRisk;
        this.lifetimeStats = lifetimeStats;
        this.activeLoans = activeLoans;
        this.borrowingHistory = borrowingHistory;
        this.ratings = ratings;
        this.reservations = reservations;
    }

    public MemberProfileDto getProfile() {
        return profile;
    }

    public void setProfile(MemberProfileDto profile) {
        this.profile = profile;
    }

    public MemberOverdueRiskDto getOverdueRisk() {
        return overdueRisk;
    }

    public void setOverdueRisk(MemberOverdueRiskDto overdueRisk) {
        this.overdueRisk = overdueRisk;
    }

    public MemberLifetimeStatsDto getLifetimeStats() {
        return lifetimeStats;
    }

    public void setLifetimeStats(MemberLifetimeStatsDto lifetimeStats) {
        this.lifetimeStats = lifetimeStats;
    }

    public List<LoanDto> getActiveLoans() {
        return activeLoans;
    }

    public void setActiveLoans(List<LoanDto> activeLoans) {
        this.activeLoans = activeLoans;
    }

    public List<LoanDto> getBorrowingHistory() {
        return borrowingHistory;
    }

    public void setBorrowingHistory(List<LoanDto> borrowingHistory) {
        this.borrowingHistory = borrowingHistory;
    }

    public List<BookRatingDto> getRatings() {
        return ratings;
    }

    public void setRatings(List<BookRatingDto> ratings) {
        this.ratings = ratings;
    }

    public List<ReservationDto> getReservations() {
        return reservations;
    }

    public void setReservations(List<ReservationDto> reservations) {
        this.reservations = reservations;
    }
}
