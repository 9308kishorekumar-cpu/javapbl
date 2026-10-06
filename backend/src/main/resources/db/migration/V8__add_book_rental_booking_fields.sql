-- Flyway Migration V8: Add Book Rental Booking & Upfront Payment Fields
-- Supports custom time-period rentals, payment receipts, and automated overdue fine tracking

ALTER TABLE loans ADD COLUMN rental_fee DECIMAL(10,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE loans ADD COLUMN payment_reference VARCHAR(100);
ALTER TABLE loans ADD COLUMN payment_method VARCHAR(50) DEFAULT 'FREE' NOT NULL;
ALTER TABLE loans ADD COLUMN payment_status VARCHAR(30) DEFAULT 'PAID' NOT NULL;
ALTER TABLE loans ADD COLUMN booking_period_days INT DEFAULT 14 NOT NULL;
ALTER TABLE loans ADD COLUMN daily_rental_rate DECIMAL(10,2) DEFAULT 0.50 NOT NULL;

CREATE INDEX idx_loans_payment_status ON loans(payment_status);
CREATE INDEX idx_loans_due_date_status ON loans(due_date, status);
