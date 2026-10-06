package com.libraai.ai.dto;

import jakarta.validation.constraints.NotBlank;

public class AiSearchRequest {

    @NotBlank(message = "Search query is required")
    private String query;

    private Integer limit = 10;

    public AiSearchRequest() {}

    public AiSearchRequest(String query, Integer limit) {
        this.query = query;
        this.limit = limit != null ? limit : 10;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }
}
