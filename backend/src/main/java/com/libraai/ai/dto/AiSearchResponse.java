package com.libraai.ai.dto;

import com.libraai.book.dto.BookDto;
import java.util.List;

public class AiSearchResponse {
    private String originalQuery;
    private String interpretedIntent;
    private List<SemanticSearchResult> results;

    public static class SemanticSearchResult {
        private BookDto book;
        private double relevanceScore;
        private String matchReason;

        public SemanticSearchResult() {}

        public SemanticSearchResult(BookDto book, double relevanceScore, String matchReason) {
            this.book = book;
            this.relevanceScore = relevanceScore;
            this.matchReason = matchReason;
        }

        public BookDto getBook() {
            return book;
        }

        public void setBook(BookDto book) {
            this.book = book;
        }

        public double getRelevanceScore() {
            return relevanceScore;
        }

        public void setRelevanceScore(double relevanceScore) {
            this.relevanceScore = relevanceScore;
        }

        public String getMatchReason() {
            return matchReason;
        }

        public void setMatchReason(String matchReason) {
            this.matchReason = matchReason;
        }
    }

    public AiSearchResponse() {}

    public AiSearchResponse(String originalQuery, String interpretedIntent, List<SemanticSearchResult> results) {
        this.originalQuery = originalQuery;
        this.interpretedIntent = interpretedIntent;
        this.results = results;
    }

    public String getOriginalQuery() {
        return originalQuery;
    }

    public void setOriginalQuery(String originalQuery) {
        this.originalQuery = originalQuery;
    }

    public String getInterpretedIntent() {
        return interpretedIntent;
    }

    public void setInterpretedIntent(String interpretedIntent) {
        this.interpretedIntent = interpretedIntent;
    }

    public List<SemanticSearchResult> getResults() {
        return results;
    }

    public void setResults(List<SemanticSearchResult> results) {
        this.results = results;
    }
}
