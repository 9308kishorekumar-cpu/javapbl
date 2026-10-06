package com.libraai.book.dto;

public class AddBookCopyRequest {
    private String barcode;
    private String conditionNote = "GOOD";

    public AddBookCopyRequest() {}

    public AddBookCopyRequest(String barcode, String conditionNote) {
        this.barcode = barcode;
        this.conditionNote = conditionNote != null ? conditionNote : "GOOD";
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getConditionNote() {
        return conditionNote;
    }

    public void setConditionNote(String conditionNote) {
        this.conditionNote = conditionNote;
    }
}
