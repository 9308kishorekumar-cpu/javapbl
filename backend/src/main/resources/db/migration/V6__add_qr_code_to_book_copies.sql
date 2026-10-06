-- V6: Add QR Code Image Column to Book Copies

ALTER TABLE book_copies ADD COLUMN IF NOT EXISTS qr_code_image TEXT;
