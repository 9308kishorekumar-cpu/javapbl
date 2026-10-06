-- V5: Add Book Ratings and Reviews Table

CREATE TABLE IF NOT EXISTS book_ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_book_ratings_user_book UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_book_ratings_book_id ON book_ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_user_id ON book_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_book_rating ON book_ratings(book_id, rating);
