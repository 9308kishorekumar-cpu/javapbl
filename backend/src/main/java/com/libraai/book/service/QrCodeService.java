package com.libraai.book.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QrCodeService {

    private static final int DEFAULT_WIDTH = 250;
    private static final int DEFAULT_HEIGHT = 250;

    /**
     * Generates a PNG QR Code as a byte array for a given text payload.
     */
    public byte[] generateQrCodeBytes(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code for text: " + text, e);
        }
    }

    public byte[] generateQrCodeBytes(String text) {
        return generateQrCodeBytes(text, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    /**
     * Generates a Base64-encoded Data URI ('data:image/png;base64,...') for direct frontend rendering.
     */
    public String generateQrCodeDataUri(String text, int width, int height) {
        byte[] pngBytes = generateQrCodeBytes(text, width, height);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngBytes);
    }

    public String generateQrCodeDataUri(String text) {
        return generateQrCodeDataUri(text, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }
}
