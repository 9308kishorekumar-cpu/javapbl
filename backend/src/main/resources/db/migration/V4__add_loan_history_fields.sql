-- Migration V4: Add borrowing history fields to loans table
ALTER TABLE loans ADD COLUMN fine_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE loans ADD COLUMN late_days INT DEFAULT 0;

-- Indices for fast history, date-range, and status queries
CREATE INDEX idx_loans_user_issue_date ON loans(user_id, issue_date);
CREATE INDEX idx_loans_user_status ON loans(user_id, status);
