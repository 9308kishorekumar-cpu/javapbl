package com.libraai.chat.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libraai.ai.dto.AiRecommendationDto;
import com.libraai.ai.service.AiService;
import com.libraai.book.dto.BookDetailDto;
import com.libraai.book.dto.BookDto;
import com.libraai.book.entity.Author;
import com.libraai.book.entity.Category;
import com.libraai.book.repository.AuthorRepository;
import com.libraai.book.repository.CategoryRepository;
import com.libraai.book.service.BookService;
import com.libraai.chat.model.ToolCall;
import com.libraai.chat.model.ToolResult;
import com.libraai.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LibraryToolExecutor implements ToolExecutor {

    private static final Logger log = LoggerFactory.getLogger(LibraryToolExecutor.class);

    private final BookService bookService;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public LibraryToolExecutor(BookService bookService,
                               AuthorRepository authorRepository,
                               CategoryRepository categoryRepository,
                               AiService aiService,
                               ObjectMapper objectMapper) {
        this.bookService = bookService;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    public ToolResult execute(ToolCall toolCall, String authenticatedUsername) {
        String name = toolCall.getName();
        String id = toolCall.getId() != null ? toolCall.getId() : UUID.randomUUID().toString();
        Map<String, Object> args = toolCall.getArguments() != null ? toolCall.getArguments() : Map.of();

        log.info("Executing library tool '{}' with arguments: {}", name, args);

        try {
            switch (name) {
                case LibraryToolRegistry.TOOL_SEARCH_BOOKS:
                    return executeSearchBooks(id, args);
                case LibraryToolRegistry.TOOL_GET_BOOK_DETAILS:
                    return executeGetBookDetails(id, args);
                case LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS:
                    return executeGetAuthorWorks(id, args);
                case LibraryToolRegistry.TOOL_GET_SIMILAR_BOOKS:
                    return executeGetSimilarBooks(id, args);
                case LibraryToolRegistry.TOOL_GET_RECOMMENDATIONS_FOR_MEMBER:
                    return executeGetRecommendations(id, args, authenticatedUsername);
                default:
                    return ToolResult.error(id, name, "Unrecognized tool: " + name);
            }
        } catch (ResourceNotFoundException e) {
            log.warn("Resource not found executing tool {}: {}", name, e.getMessage());
            return ToolResult.error(id, name, e.getMessage());
        } catch (Exception e) {
            log.error("Error executing tool {}: {}", name, e.getMessage(), e);
            return ToolResult.error(id, name, "Execution failed: " + e.getMessage());
        }
    }

    private ToolResult executeSearchBooks(String toolCallId, Map<String, Object> args) throws Exception {
        String query = (String) args.get("query");
        String language = args.containsKey("language") && args.get("language") != null ? args.get("language").toString().trim() : null;
        String categoryName = args.containsKey("category") && args.get("category") != null ? args.get("category").toString().trim() : null;
        boolean availableOnly = args.containsKey("availableOnly") && Boolean.parseBoolean(args.get("availableOnly").toString());

        Long categoryId = null;
        if (categoryName != null && !categoryName.isEmpty()) {
            Optional<Category> catOpt = categoryRepository.findByNameIgnoreCase(categoryName);
            if (catOpt.isPresent()) {
                categoryId = catOpt.get().getId();
            }
        }

        Page<BookDto> results = bookService.searchBooks(query, categoryId, language, 0, 15, "title", "asc");
        if (results.isEmpty() && query != null && query.contains(" ")) {
            String[] tokens = query.split("\\s+");
            if (tokens.length >= 2) {
                String subQuery = tokens[0] + " " + tokens[1];
                results = bookService.searchBooks(subQuery, categoryId, language, 0, 15, "title", "asc");
            }
        }

        List<Map<String, Object>> booksList = results.getContent().stream()
                .filter(b -> !availableOnly || b.getAvailableCopies() > 0)
                .map(b -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", b.getId());
                    item.put("title", b.getTitle());
                    item.put("authors", b.getAuthors());
                    item.put("language", b.getLanguage());
                    item.put("category", b.getCategoryName());
                    item.put("publicationYear", b.getPublicationYear());
                    item.put("availableCopies", b.getAvailableCopies());
                    item.put("totalCopies", b.getTotalCopies());
                    item.put("isTranslation", b.getTranslatedFromId() != null);
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> responseMap = new LinkedHashMap<>();
        responseMap.put("totalMatches", results.getTotalElements());
        responseMap.put("returnedCount", booksList.size());
        responseMap.put("queryUsed", query);
        responseMap.put("languageFilter", language);
        responseMap.put("books", booksList);

        return ToolResult.success(toolCallId, LibraryToolRegistry.TOOL_SEARCH_BOOKS, objectMapper.writeValueAsString(responseMap));
    }

    private ToolResult executeGetBookDetails(String toolCallId, Map<String, Object> args) throws Exception {
        long bookId = ((Number) args.get("bookId")).longValue();
        BookDetailDto book = bookService.getBookById(bookId);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("id", book.getId());
        details.put("title", book.getTitle());
        details.put("isbn", book.getIsbn());
        details.put("authors", book.getAuthors().stream().map(a -> a.getName()).collect(Collectors.toList()));
        details.put("language", book.getLanguage());
        details.put("originalLanguage", book.getOriginalLanguage());
        details.put("translatedFromId", book.getTranslatedFromId());
        details.put("translatedFromTitle", book.getTranslatedFromTitle());
        details.put("category", book.getCategory() != null ? book.getCategory().getName() : null);
        details.put("publicationYear", book.getPublicationYear());
        details.put("summary", book.getSummary());
        details.put("totalCopies", book.getTotalCopies());
        details.put("availableCopies", book.getAvailableCopies());

        if (book.getTranslations() != null && !book.getTranslations().isEmpty()) {
            details.put("availableTranslations", book.getTranslations().stream()
                    .map(t -> Map.of("id", t.getId(), "title", t.getTitle(), "language", t.getLanguage()))
                    .collect(Collectors.toList()));
        }

        return ToolResult.success(toolCallId, LibraryToolRegistry.TOOL_GET_BOOK_DETAILS, objectMapper.writeValueAsString(details));
    }

    private ToolResult executeGetAuthorWorks(String toolCallId, Map<String, Object> args) throws Exception {
        String authorName = null;
        if (args.containsKey("authorId") && args.get("authorId") != null) {
            long authorId = ((Number) args.get("authorId")).longValue();
            Optional<Author> authorOpt = authorRepository.findById(authorId);
            if (authorOpt.isPresent()) {
                authorName = authorOpt.get().getName();
            }
        }

        if (authorName == null && args.containsKey("authorName") && args.get("authorName") != null) {
            authorName = args.get("authorName").toString().trim();
        }

        if (authorName == null || authorName.isEmpty()) {
            return ToolResult.error(toolCallId, LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS, "Author not found");
        }

        Page<BookDto> results = bookService.searchBooks(authorName, null, null, 0, 15, "title", "asc");

        Map<String, Object> responseMap = new LinkedHashMap<>();
        responseMap.put("authorName", authorName);
        responseMap.put("booksFound", results.getTotalElements());
        responseMap.put("books", results.getContent().stream()
                .map(b -> Map.of(
                        "id", b.getId(),
                        "title", b.getTitle(),
                        "language", b.getLanguage(),
                        "category", b.getCategoryName() != null ? b.getCategoryName() : "General",
                        "availableCopies", b.getAvailableCopies()
                ))
                .collect(Collectors.toList()));

        return ToolResult.success(toolCallId, LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS, objectMapper.writeValueAsString(responseMap));
    }

    private ToolResult executeGetSimilarBooks(String toolCallId, Map<String, Object> args) throws Exception {
        long bookId = ((Number) args.get("bookId")).longValue();
        BookDetailDto book = bookService.getBookById(bookId);

        Long categoryId = book.getCategory() != null ? book.getCategory().getId() : null;
        Page<BookDto> similarPage = bookService.searchBooks(
                null,
                categoryId,
                null,
                0,
                8,
                "title",
                "asc"
        );

        List<Map<String, Object>> similarBooks = similarPage.getContent().stream()
                .filter(b -> !b.getId().equals(bookId))
                .map(b -> Map.of(
                        "id", b.getId(),
                        "title", b.getTitle(),
                        "authors", b.getAuthors(),
                        "language", b.getLanguage(),
                        "category", b.getCategoryName() != null ? b.getCategoryName() : "General"
                ))
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> responseMap = new LinkedHashMap<>();
        responseMap.put("referenceBookId", bookId);
        responseMap.put("referenceBookTitle", book.getTitle());
        responseMap.put("similarBooks", similarBooks);

        return ToolResult.success(toolCallId, LibraryToolRegistry.TOOL_GET_SIMILAR_BOOKS, objectMapper.writeValueAsString(responseMap));
    }

    private ToolResult executeGetRecommendations(String toolCallId, Map<String, Object> args, String authenticatedUsername) throws Exception {
        String username = authenticatedUsername;
        if (username == null && args.containsKey("username") && args.get("username") != null) {
            username = args.get("username").toString().trim();
        }

        if (username == null || username.isBlank()) {
            return ToolResult.error(toolCallId, LibraryToolRegistry.TOOL_GET_RECOMMENDATIONS_FOR_MEMBER,
                    "Member is not authenticated. Recommendations require an active library patron session.");
        }

        AiRecommendationDto recommendations = aiService.getRecommendations(username);

        Map<String, Object> responseMap = new LinkedHashMap<>();
        responseMap.put("memberUsername", username);
        responseMap.put("rationale", recommendations.getRationale());
        responseMap.put("recommendedBooks", recommendations.getRecommendedBooks().stream()
                .map(b -> Map.of(
                        "id", b.getId(),
                        "title", b.getTitle(),
                        "authors", b.getAuthors() != null ? b.getAuthors() : List.of(),
                        "category", b.getCategoryName() != null ? b.getCategoryName() : "General"
                ))
                .collect(Collectors.toList()));

        return ToolResult.success(toolCallId, LibraryToolRegistry.TOOL_GET_RECOMMENDATIONS_FOR_MEMBER, objectMapper.writeValueAsString(responseMap));
    }
}
