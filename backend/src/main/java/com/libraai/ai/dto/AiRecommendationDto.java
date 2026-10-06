package com.libraai.ai.dto;

import com.libraai.book.dto.BookDto;
import java.util.List;

public class AiRecommendationDto {
    private String rationale;
    private List<BookDto> recommendedBooks;

    public AiRecommendationDto() {}

    public AiRecommendationDto(String rationale, List<BookDto> recommendedBooks) {
        this.rationale = rationale;
        this.recommendedBooks = recommendedBooks;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }

    public List<BookDto> getRecommendedBooks() {
        return recommendedBooks;
    }

    public void setRecommendedBooks(List<BookDto> recommendedBooks) {
        this.recommendedBooks = recommendedBooks;
    }
}
