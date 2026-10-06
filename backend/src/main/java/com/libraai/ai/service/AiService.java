package com.libraai.ai.service;

import com.libraai.ai.dto.*;
import com.libraai.book.dto.BookDto;
import com.libraai.book.entity.Author;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookRating;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRatingRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.common.exception.ResourceNotFoundException;
import com.libraai.loan.entity.Fine;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.repository.FineRepository;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRatingRepository bookRatingRepository;
    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;
    private final UserRepository userRepository;

    public AiService(BookRepository bookRepository,
                     BookCopyRepository bookCopyRepository,
                     BookRatingRepository bookRatingRepository,
                     LoanRepository loanRepository,
                     FineRepository fineRepository,
                     UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.bookRatingRepository = bookRatingRepository;
        this.loanRepository = loanRepository;
        this.fineRepository = fineRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AiSearchResponse searchBooksSemantic(AiSearchRequest request) {
        String query = request.getQuery().toLowerCase().trim();
        List<Book> allBooks = bookRepository.findAll();

        List<AiSearchResponse.SemanticSearchResult> scoredResults = new ArrayList<>();

        for (Book book : allBooks) {
            double score = 0.0;
            StringBuilder matchReason = new StringBuilder();

            String title = (book.getTitle() != null ? book.getTitle() : "").toLowerCase();
            String summary = (book.getSummary() != null ? book.getSummary() : "").toLowerCase();
            String category = (book.getCategory() != null ? book.getCategory().getName() : "").toLowerCase();
            String authors = book.getAuthors().stream().map(Author::getName).collect(Collectors.joining(" ")).toLowerCase();

            String[] queryTokens = query.split("\\s+");

            // 1. Direct query matching
            if (title.contains(query)) {
                score += 0.50;
                matchReason.append("Exact title match. ");
            }
            if (summary.contains(query)) {
                score += 0.35;
                matchReason.append("Summary keywords match. ");
            }
            if (category.contains(query)) {
                score += 0.30;
                matchReason.append("Category match. ");
            }
            if (authors.contains(query)) {
                score += 0.40;
                matchReason.append("Author match. ");
            }

            // 2. Token / Semantic Concept matching
            for (String token : queryTokens) {
                if (token.length() < 3) continue;

                if (title.contains(token)) score += 0.15;
                if (summary.contains(token)) score += 0.10;
                if (category.contains(token)) score += 0.12;
                if (authors.contains(token)) score += 0.15;

                // Semantic concept mappings
                if ((token.contains("ai") || token.contains("agent") || token.contains("robot") || token.contains("learn"))
                        && (category.contains("computer") || title.contains("intelligence") || summary.contains("artificial"))) {
                    score += 0.25;
                    matchReason.append("AI/ML concept relevance. ");
                }

                if ((token.contains("space") || token.contains("future") || token.contains("alien") || token.contains("sci-fi"))
                        && (category.contains("fiction") || summary.contains("space") || summary.contains("jupiter"))) {
                    score += 0.25;
                    matchReason.append("Sci-Fi space thematic alignment. ");
                }

                if ((token.contains("code") || token.contains("program") || token.contains("algorithm") || token.contains("software"))
                        && (category.contains("computer") || title.contains("programming") || title.contains("knuth"))) {
                    score += 0.25;
                    matchReason.append("Software engineering & algorithms focus. ");
                }

                if ((token.contains("think") || token.contains("psychology") || token.contains("bias") || token.contains("mind") || token.contains("decision"))
                        && (title.contains("thinking") || summary.contains("decision") || category.contains("philosophy"))) {
                    score += 0.25;
                    matchReason.append("Cognitive science and psychology theme match. ");
                }
            }

            if (score > 0.15) {
                double normalizedScore = Math.min(score, 1.0);
                BookDto dto = mapToBookDto(book);
                String reason = matchReason.length() > 0 ? matchReason.toString().trim() : "Semantic similarity score: " + String.format("%.2f", normalizedScore);
                scoredResults.add(new AiSearchResponse.SemanticSearchResult(dto, normalizedScore, reason));
            }
        }

        scoredResults.sort(Comparator.comparingDouble(AiSearchResponse.SemanticSearchResult::getRelevanceScore).reversed());

        int limit = request.getLimit() != null && request.getLimit() > 0 ? request.getLimit() : 10;
        List<AiSearchResponse.SemanticSearchResult> trimmed = scoredResults.stream().limit(limit).collect(Collectors.toList());

        String interpretedIntent = "Natural language search for concepts related to: '" + request.getQuery() + "'";

        return new AiSearchResponse(request.getQuery(), interpretedIntent, trimmed);
    }

    @Transactional(readOnly = true)
    public AiRecommendationDto getRecommendations(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        List<Book> allBooks = bookRepository.findAll();

        if (user == null) {
            // Default top recommendations weighted by average ratings
            List<BookDto> defaults = allBooks.stream()
                    .sorted((b1, b2) -> {
                        Double r1 = bookRatingRepository.getAverageRatingByBookId(b1.getId());
                        Double r2 = bookRatingRepository.getAverageRatingByBookId(b2.getId());
                        return Double.compare(r2 != null ? r2 : 0.0, r1 != null ? r1 : 0.0);
                    })
                    .limit(3)
                    .map(this::mapToBookDto)
                    .collect(Collectors.toList());
            return new AiRecommendationDto("Popular highly-rated titles recommended across all catalog categories", defaults);
        }

        List<Loan> userLoans = loanRepository.findByUserIdOrderByIssueDateDesc(user.getId());

        if (userLoans.isEmpty()) {
            List<BookDto> defaults = allBooks.stream()
                    .sorted((b1, b2) -> {
                        Double r1 = bookRatingRepository.getAverageRatingByBookId(b1.getId());
                        Double r2 = bookRatingRepository.getAverageRatingByBookId(b2.getId());
                        return Double.compare(r2 != null ? r2 : 0.0, r1 != null ? r1 : 0.0);
                    })
                    .limit(4)
                    .map(this::mapToBookDto)
                    .collect(Collectors.toList());
            return new AiRecommendationDto("Welcome to LibraAI! Here are featured, highly-rated books to start your reading journey", defaults);
        }

        // 1. Extract categories patron has borrowed
        Map<String, Long> categoryPreferences = userLoans.stream()
                .filter(l -> l.getBookCopy() != null && l.getBookCopy().getBook() != null && l.getBookCopy().getBook().getCategory() != null)
                .collect(Collectors.groupingBy(l -> l.getBookCopy().getBook().getCategory().getName(), Collectors.counting()));

        Set<Long> borrowedBookIds = userLoans.stream()
                .filter(l -> l.getBookCopy() != null && l.getBookCopy().getBook() != null)
                .map(l -> l.getBookCopy().getBook().getId())
                .collect(Collectors.toSet());

        Set<String> userTopCategories = categoryPreferences.keySet();

        // 2. Identify "similar members" (patrons who borrowed or highly rated books in the same categories)
        List<Loan> allLoans = loanRepository.findAll();
        Set<Long> similarMemberIds = allLoans.stream()
                .filter(l -> !l.getUser().getId().equals(user.getId()))
                .filter(l -> l.getBookCopy() != null && l.getBookCopy().getBook() != null && l.getBookCopy().getBook().getCategory() != null)
                .filter(l -> userTopCategories.contains(l.getBookCopy().getBook().getCategory().getName()))
                .map(l -> l.getUser().getId())
                .collect(Collectors.toSet());

        // Pre-fetch high ratings from similar members
        List<BookRating> similarMemberHighRatings = similarMemberIds.isEmpty()
                ? List.of()
                : bookRatingRepository.findHighRatingsByUserIds(similarMemberIds, 4);

        Map<Long, Long> similarMemberRatingCountPerBook = similarMemberHighRatings.stream()
                .collect(Collectors.groupingBy(r -> r.getBook().getId(), Collectors.counting()));

        // 3. Score candidate books using Content Affinity + Average Rating + Similar Members' High Ratings
        Map<Long, Double> bookScores = new HashMap<>();
        for (Book b : allBooks) {
            if (borrowedBookIds.contains(b.getId())) continue;

            String catName = b.getCategory() != null ? b.getCategory().getName() : "General";
            long categoryCount = categoryPreferences.getOrDefault(catName, 0L);

            // A) Content category affinity weight (3.0 per previous loan in category)
            double categoryAffinityScore = categoryCount * 3.0;

            // B) Global average rating score (0.0 to 2.0 boost)
            Double avgRating = bookRatingRepository.getAverageRatingByBookId(b.getId());
            double ratingScore = (avgRating != null && avgRating > 0) ? (avgRating / 5.0) * 2.0 : 0.0;

            // C) Similar members' high ratings boost (+1.5 per 4-5 star rating from peer with matching tastes)
            long peerHighRatings = similarMemberRatingCountPerBook.getOrDefault(b.getId(), 0L);
            double peerBoost = peerHighRatings * 1.5;

            double totalScore = categoryAffinityScore + ratingScore + peerBoost;
            bookScores.put(b.getId(), totalScore);
        }

        List<BookDto> recommended = allBooks.stream()
                .filter(b -> !borrowedBookIds.contains(b.getId()))
                .sorted((b1, b2) -> Double.compare(
                        bookScores.getOrDefault(b2.getId(), 0.0),
                        bookScores.getOrDefault(b1.getId(), 0.0)
                ))
                .limit(4)
                .map(this::mapToBookDto)
                .collect(Collectors.toList());

        String topCategory = categoryPreferences.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("General");

        String rationale = "Curated based on your affinity for " + topCategory + " and top ratings from members with similar reading preferences:";

        return new AiRecommendationDto(rationale, recommended);
    }

    @Transactional(readOnly = true)
    public CitationDto generateCitation(Long bookId, String format) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        String style = (format != null ? format : "APA").toUpperCase();
        String authors = book.getAuthors().stream().map(Author::getName).collect(Collectors.joining(", "));
        if (authors.isEmpty()) authors = "Unknown Author";

        int year = book.getPublicationYear() != null ? book.getPublicationYear() : 2024;
        String title = book.getTitle();
        String isbn = book.getIsbn();

        String citation;
        switch (style) {
            case "MLA":
                citation = authors + ". " + title + ". LibraAI Academic Press, " + year + ". ISBN: " + isbn + ".";
                break;
            case "CHICAGO":
                citation = authors + ". " + year + ". " + title + ". LibraAI Press. ISBN " + isbn + ".";
                break;
            case "HARVARD":
                citation = authors + " (" + year + ") " + title + ", LibraAI Academic Editions, ISBN: " + isbn + ".";
                break;
            case "BIBTEX":
                String key = (authors.split(" ")[0].toLowerCase()) + year;
                citation = "@book{" + key + ",\n" +
                           "  author = {" + authors + "},\n" +
                           "  title = {" + title + "},\n" +
                           "  year = {" + year + "},\n" +
                           "  isbn = {" + isbn + "},\n" +
                           "  publisher = {LibraAI Press}\n" +
                           "}";
                break;
            case "APA":
            default:
                citation = authors + " (" + year + "). " + title + ". LibraAI Academic Publishing. https://doi.org/10.libraai/" + isbn;
                break;
        }

        return new CitationDto(book.getId(), book.getTitle(), style, citation);
    }

    @Transactional(readOnly = true)
    public PatronRiskDto assessPatronRisk(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        List<Loan> loans = loanRepository.findByUserIdOrderByIssueDateDesc(user.getId());
        List<Fine> fines = fineRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        int totalHistoricalLoans = loans.size();
        Instant now = Instant.now();

        int overdueCount = 0;
        int activeLoans = 0;

        for (Loan l : loans) {
            if ("ACTIVE".equalsIgnoreCase(l.getStatus())) {
                activeLoans++;
                if (now.isAfter(l.getDueDate())) {
                    overdueCount++;
                }
            } else if (l.getReturnDate() != null && l.getReturnDate().isAfter(l.getDueDate())) {
                overdueCount++;
            }
        }

        BigDecimal unpaidFines = fineRepository.sumUnpaidFinesByUserId(user.getId());
        if (unpaidFines == null) unpaidFines = BigDecimal.ZERO;

        int riskScore = 10; // baseline
        List<String> riskFactors = new ArrayList<>();

        if (totalHistoricalLoans > 0) {
            double overdueRatio = (double) overdueCount / totalHistoricalLoans;
            if (overdueRatio > 0.40) {
                riskScore += 45;
                riskFactors.add("Frequent historical return delays (>40% of loans returned late)");
            } else if (overdueRatio > 0.15) {
                riskScore += 20;
                riskFactors.add("Occasional return delays");
            }
        }

        if (activeLoans >= 4) {
            riskScore += 20;
            riskFactors.add("High active checkout volume (" + activeLoans + "/5 active loans)");
        }

        if (unpaidFines.compareTo(BigDecimal.valueOf(10.00)) > 0) {
            riskScore += 30;
            riskFactors.add("Unpaid overdue fine balance exceeding ₹10.00");
        } else if (unpaidFines.compareTo(BigDecimal.ZERO) > 0) {
            riskScore += 10;
            riskFactors.add("Small unpaid fine balance (₹" + unpaidFines + ")");
        }

        riskScore = Math.min(riskScore, 100);

        String riskLevel;
        String recommendation;
        if (riskScore >= 60) {
            riskLevel = "HIGH";
            recommendation = "Librarian review recommended before approving new high-demand title checkouts. Request fine settlement.";
        } else if (riskScore >= 30) {
            riskLevel = "MEDIUM";
            recommendation = "Standard checkouts permitted. Remind patron of upcoming due dates.";
        } else {
            riskLevel = "LOW";
            recommendation = "Patron in excellent standing. Eligible for standard and priority loans.";
        }

        return new PatronRiskDto(
                user.getUsername(),
                user.getFullName(),
                riskLevel,
                riskScore,
                totalHistoricalLoans,
                overdueCount,
                unpaidFines,
                riskFactors,
                recommendation
        );
    }

    @Transactional(readOnly = true)
    public AiChatResponse chatWithLibraryAssistant(AiChatRequest request) {
        String msg = request.getMessage().toLowerCase();
        List<String> followUps = new ArrayList<>();
        List<Long> referencedBookIds = new ArrayList<>();
        String reply;

        if (msg.contains("policy") || msg.contains("loan period") || msg.contains("rules") || msg.contains("fine")) {
            reply = "📚 **LibraAI Borrowing & Circulation Policies**:\n\n" +
                    "• **Loan Period**: 14 calendar days per checkout.\n" +
                    "• **Borrowing Limit**: Up to **5 active books** per patron.\n" +
                    "• **Renewals**: Up to **2 renewals** (+14 days each), provided the title is not overdue or reserved by another patron.\n" +
                    "• **Overdue Fines**: **₹1.00 / day** automatically calculated upon return or live settlement.";
            followUps.add("How do I renew my active loans?");
            followUps.add("How do title reservations work?");
        } else if (msg.contains("recommend") || msg.contains("suggest") || msg.contains("what should i read")) {
            List<Book> books = bookRepository.findAll();
            reply = "✨ **Curated Reading Recommendations**:\n\n";
            for (Book b : books.stream().limit(3).collect(Collectors.toList())) {
                reply += "• **" + b.getTitle() + "** (" + (b.getCategory() != null ? b.getCategory().getName() : "General") + ") — " + (b.getSummary() != null ? b.getSummary() : "Essential reading.") + "\n";
                referencedBookIds.add(b.getId());
            }
            followUps.add("Generate citation for Artificial Intelligence");
            followUps.add("Search for Computer Science books");
        } else if (msg.contains("citation") || msg.contains("cite")) {
            reply = "📝 You can generate instant **APA, MLA, Chicago, Harvard, and BibTeX** citations for any book in our catalog! Use the 'Cite' button on any book card or ask me to cite a specific title.";
            followUps.add("Cite Artificial Intelligence: A Modern Approach");
            followUps.add("What citation formats are supported?");
        } else {
            // General intelligent assistant response
            List<Book> books = bookRepository.findAll();
            Optional<Book> matched = books.stream()
                    .filter(b -> msg.contains(b.getTitle().toLowerCase()) || (b.getCategory() != null && msg.contains(b.getCategory().getName().toLowerCase())))
                    .findFirst();

            if (matched.isPresent()) {
                Book b = matched.get();
                reply = "📖 Found matching catalog resource: **" + b.getTitle() + "**\n\n" +
                        "• **Category**: " + (b.getCategory() != null ? b.getCategory().getName() : "General") + "\n" +
                        "• **ISBN**: " + b.getIsbn() + "\n" +
                        "• **Summary**: " + (b.getSummary() != null ? b.getSummary() : "Available in catalog stacks.");
                referencedBookIds.add(b.getId());
                followUps.add("Is " + b.getTitle() + " currently available?");
                followUps.add("Generate APA citation for this book");
            } else {
                reply = "Hello! I am **LibraAI Assistant**. I can help you search the catalog using natural language, explain borrowing policies, recommend books tailored to your interests, and generate academic citations. How may I assist you today?";
                followUps.add("What books are available in Computer Science?");
                followUps.add("What are the library overdue fine rules?");
                followUps.add("Give me recommendations");
            }
        }

        return new AiChatResponse(reply, followUps, referencedBookIds);
    }

    private BookDto mapToBookDto(Book book) {
        long totalCopies = bookCopyRepository.countByBookId(book.getId());
        long availableCopies = bookCopyRepository.countByBookIdAndStatus(book.getId(), "AVAILABLE");

        List<String> authorNames = book.getAuthors().stream()
                .map(Author::getName)
                .collect(Collectors.toList());

        Long translatedFromId = book.getTranslatedFrom() != null ? book.getTranslatedFrom().getId() : null;
        String translatedFromTitle = book.getTranslatedFrom() != null ? book.getTranslatedFrom().getTitle() : null;

        return new BookDto(
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                book.getPublicationYear(),
                book.getSummary(),
                book.getCategory() != null ? book.getCategory().getId() : null,
                book.getCategory() != null ? book.getCategory().getName() : null,
                authorNames,
                totalCopies,
                availableCopies,
                book.getLanguage(),
                book.getOriginalLanguage(),
                translatedFromId,
                translatedFromTitle
        );
    }
}
