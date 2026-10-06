package com.libraai.analytics.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsDto {
    private long totalBooks;
    private long totalCopies;
    private long availableCopies;
    private long activeLoans;
    private long overdueLoans;
    private long totalMembers;
    private BigDecimal totalFinesCollected;
    private BigDecimal outstandingFines;
    private List<TopBookDto> topBorrowedBooks;
    private List<CategoryStatDto> categoryDistribution;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalBooks, long totalCopies, long availableCopies, long activeLoans,
                             long overdueLoans, long totalMembers, BigDecimal totalFinesCollected,
                             BigDecimal outstandingFines, List<TopBookDto> topBorrowedBooks,
                             List<CategoryStatDto> categoryDistribution) {
        this.totalBooks = totalBooks;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.activeLoans = activeLoans;
        this.overdueLoans = overdueLoans;
        this.totalMembers = totalMembers;
        this.totalFinesCollected = totalFinesCollected;
        this.outstandingFines = outstandingFines;
        this.topBorrowedBooks = topBorrowedBooks;
        this.categoryDistribution = categoryDistribution;
    }

    public long getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(long totalBooks) {
        this.totalBooks = totalBooks;
    }

    public long getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(long totalCopies) {
        this.totalCopies = totalCopies;
    }

    public long getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(long availableCopies) {
        this.availableCopies = availableCopies;
    }

    public long getActiveLoans() {
        return activeLoans;
    }

    public void setActiveLoans(long activeLoans) {
        this.activeLoans = activeLoans;
    }

    public long getOverdueLoans() {
        return overdueLoans;
    }

    public void setOverdueLoans(long overdueLoans) {
        this.overdueLoans = overdueLoans;
    }

    public long getTotalMembers() {
        return totalMembers;
    }

    public void setTotalMembers(long totalMembers) {
        this.totalMembers = totalMembers;
    }

    public BigDecimal getTotalFinesCollected() {
        return totalFinesCollected;
    }

    public void setTotalFinesCollected(BigDecimal totalFinesCollected) {
        this.totalFinesCollected = totalFinesCollected;
    }

    public BigDecimal getOutstandingFines() {
        return outstandingFines;
    }

    public void setOutstandingFines(BigDecimal outstandingFines) {
        this.outstandingFines = outstandingFines;
    }

    public List<TopBookDto> getTopBorrowedBooks() {
        return topBorrowedBooks;
    }

    public void setTopBorrowedBooks(List<TopBookDto> topBorrowedBooks) {
        this.topBorrowedBooks = topBorrowedBooks;
    }

    public List<CategoryStatDto> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(List<CategoryStatDto> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }
}
