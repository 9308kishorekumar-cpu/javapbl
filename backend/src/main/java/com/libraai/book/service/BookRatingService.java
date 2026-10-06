package com.libraai.book.service;

import com.libraai.audit.service.AuditService;
import com.libraai.book.dto.BookRatingDto;
import com.libraai.book.dto.BookRatingsSummaryDto;
import com.libraai.book.dto.RateBookRequest;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookRating;
import com.libraai.book.repository.BookRatingRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.common.exception.ResourceNotFoundException;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class BookRatingService {

    private final BookRatingRepository bookRatingRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public BookRatingService(BookRatingRepository bookRatingRepository,
                             BookRepository bookRepository,
                             UserRepository userRepository,
                             AuditService auditService) {
        this.bookRatingRepository = bookRatingRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public BookRatingDto rateBook(Long bookId, RateBookRequest request, String username) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Optional<BookRating> existingOpt = bookRatingRepository.findByBookIdAndUserId(bookId, user.getId());
        BookRating rating;
        boolean isUpdate = existingOpt.isPresent();

        if (isUpdate) {
            rating = existingOpt.get();
            rating.setRating(request.getRating());
            rating.setReview(request.getReview());
        } else {
            rating = new BookRating(user, book, request.getRating(), request.getReview());
        }

        BookRating saved = bookRatingRepository.save(rating);

        auditService.log(
                isUpdate ? "BOOK_RATING_UPDATED" : "BOOK_RATED",
                "BookRating",
                saved.getId(),
                "User " + username + (isUpdate ? " updated rating to " : " rated ") + request.getRating() + " stars for '" + book.getTitle() + "'",
                username,
                null
        );

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public BookRatingsSummaryDto getBookRatingsSummary(Long bookId, Pageable pageable, String currentUsername) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        Double avg = bookRatingRepository.getAverageRatingByBookId(bookId);
        double roundedAvg = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
        long total = bookRatingRepository.countByBookId(bookId);

        Page<BookRating> reviewsPage = bookRatingRepository.findByBookIdOrderByCreatedAtDesc(bookId, pageable);
        Page<BookRatingDto> dtos = reviewsPage.map(this::mapToDto);

        BookRatingDto userRatingDto = null;
        if (currentUsername != null && !currentUsername.isBlank()) {
            Optional<User> userOpt = userRepository.findByUsername(currentUsername);
            if (userOpt.isPresent()) {
                Optional<BookRating> userRatingOpt = bookRatingRepository.findByBookIdAndUserId(bookId, userOpt.get().getId());
                if (userRatingOpt.isPresent()) {
                    userRatingDto = mapToDto(userRatingOpt.get());
                }
            }
        }

        return new BookRatingsSummaryDto(book.getId(), roundedAvg, total, dtos, userRatingDto);
    }

    public BookRatingDto mapToDto(BookRating rating) {
        return new BookRatingDto(
                rating.getId(),
                rating.getBook().getId(),
                rating.getBook().getTitle(),
                rating.getUser().getId(),
                rating.getUser().getUsername(),
                rating.getUser().getFullName(),
                rating.getRating(),
                rating.getReview(),
                rating.getCreatedAt(),
                rating.getUpdatedAt()
        );
    }
}
