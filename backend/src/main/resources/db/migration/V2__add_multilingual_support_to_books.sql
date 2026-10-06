-- Flyway V2: Multilingual Support for Books
-- Adds language (ISO 639-1), original_language, and self-referencing translation link

ALTER TABLE books ADD COLUMN language VARCHAR(10) DEFAULT 'en' NOT NULL;
ALTER TABLE books ADD COLUMN original_language VARCHAR(10);
ALTER TABLE books ADD COLUMN translated_from_id BIGINT REFERENCES books(id) ON DELETE SET NULL;

CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_translated_from ON books(translated_from_id);
