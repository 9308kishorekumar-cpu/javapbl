package com.libraai.analytics.dto;

public class BookDemandPredictionDto {
    private Long bookId;
    private String title;
    private String isbn;
    private String categoryName;
    private String language;
    private long totalCopies;
    private long availableCopies;
    private long borrowCount;
    private Double averageRating;
    private double demandScore;
    private int recommendedCopiesToAcquire;
    private String confidenceLevel; // HIGH, MEDIUM, LOW
    private String heuristicRationale;

    public BookDemandPredictionDto() {}

    public BookDemandPredictionDto(Long bookId, String title, String isbn, String categoryName,
                                   String language, long totalCopies, long availableCopies,
                                   long borrowCount, Double averageRating, double demandScore,
                                   int recommendedCopiesToAcquire, String confidenceLevel,
                                   String heuristicRationale) {
        this.bookId = bookId;
        this.title = title;
        this.isbn = isbn;
        this.categoryName = categoryName;
        this.language = language;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.borrowCount = borrowCount;
        this.averageRating = averageRating;
        this.demandScore = demandScore;
        this.recommendedCopiesToAcquire = recommendedCopiesToAcquire;
        this.confidenceLevel = confidenceLevel;
        this.heuristicRationale = heuristicRationale;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
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

    public long getBorrowCount() {
        return borrowCount;
    }

    public void setBorrowCount(long borrowCount) {
        this.borrowCount = borrowCount;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public double getDemandScore() {
        return demandScore;
    }

    public void setDemandScore(double demandScore) {
        this.demandScore = demandScore;
    }

    public int getRecommendedCopiesToAcquire() {
        return recommendedCopiesToAcquire;
    }

    public void setRecommendedCopiesToAcquire(int recommendedCopiesToAcquire) {
        this.recommendedCopiesToAcquire = recommendedCopiesToAcquire;
    }

    public String getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(String confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }

    public String getHeuristicRationale() {
        return heuristicRationale;
    }

    public void setHeuristicRationale(String heuristicRationale) {
        this.heuristicRationale = heuristicRationale;
    }
}
