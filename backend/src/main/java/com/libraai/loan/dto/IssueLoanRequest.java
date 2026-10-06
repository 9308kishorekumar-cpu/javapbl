package com.libraai.loan.dto;

import jakarta.validation.constraints.NotBlank;

public class IssueLoanRequest {

    @NotBlank(message = "Barcode is required")
    private String barcode;

    @NotBlank(message = "Member username or email is required")
    private String username;

    private Integer loanPeriodDays = 14;

    public IssueLoanRequest() {}

    public IssueLoanRequest(String barcode, String username, Integer loanPeriodDays) {
        this.barcode = barcode;
        this.username = username;
        this.loanPeriodDays = loanPeriodDays != null ? loanPeriodDays : 14;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getLoanPeriodDays() {
        return loanPeriodDays;
    }

    public void setLoanPeriodDays(Integer loanPeriodDays) {
        this.loanPeriodDays = loanPeriodDays;
    }
}
