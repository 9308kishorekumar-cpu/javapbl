package com.libraai.loan.dto;

import jakarta.validation.constraints.NotBlank;

public class ReturnLoanRequest {

    @NotBlank(message = "Barcode is required")
    private String barcode;

    public ReturnLoanRequest() {}

    public ReturnLoanRequest(String barcode) {
        this.barcode = barcode;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }
}
