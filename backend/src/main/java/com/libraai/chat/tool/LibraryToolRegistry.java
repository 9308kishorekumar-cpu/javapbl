package com.libraai.chat.tool;

import com.libraai.chat.model.ToolDefinition;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class LibraryToolRegistry {

    public static final String TOOL_SEARCH_BOOKS = "searchBooks";
    public static final String TOOL_GET_BOOK_DETAILS = "getBookDetails";
    public static final String TOOL_GET_AUTHOR_WORKS = "getAuthorWorks";
    public static final String TOOL_GET_SIMILAR_BOOKS = "getSimilarBooks";
    public static final String TOOL_GET_RECOMMENDATIONS_FOR_MEMBER = "getRecommendationsForMember";

    private final List<ToolDefinition> toolDefinitions;

    public LibraryToolRegistry() {
        this.toolDefinitions = List.of(
                createSearchBooksTool(),
                createGetBookDetailsTool(),
                createGetAuthorWorksTool(),
                createGetSimilarBooksTool(),
                createGetRecommendationsForMemberTool()
        );
    }

    public List<ToolDefinition> getToolDefinitions() {
        return toolDefinitions;
    }

    public Optional<ToolDefinition> getToolDefinition(String name) {
        return toolDefinitions.stream().filter(t -> t.getName().equalsIgnoreCase(name)).findFirst();
    }

    private ToolDefinition createSearchBooksTool() {
        Map<String, Object> props = new LinkedHashMap<>();
        props.put("query", Map.of("type", "string", "description", "Keywords, topic, title fragment, or genre to search in library catalog"));
        props.put("language", Map.of("type", "string", "description", "Optional ISO 639-1 language code (e.g. 'en', 'ta', 'hi', 'es', 'fr', 'ja', 'ru', 'bn', 'te', 'sa')"));
        props.put("category", Map.of("type", "string", "description", "Optional category/genre name (e.g. 'Computer Science', 'Fiction', 'Poetry', 'Science', 'History', 'Philosophy')"));
        props.put("availableOnly", Map.of("type", "boolean", "description", "If true, only returns books with at least 1 currently available physical copy"));

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", props);
        schema.put("required", List.of("query"));

        return new ToolDefinition(
                TOOL_SEARCH_BOOKS,
                "Search the real library catalog by keywords, language, category, or physical copy availability. Use this whenever the user asks for books in the library.",
                schema
        );
    }

    private ToolDefinition createGetBookDetailsTool() {
        Map<String, Object> props = new LinkedHashMap<>();
        props.put("bookId", Map.of("type", "integer", "description", "Positive integer ID of the book to retrieve detailed metadata and inventory for"));

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", props);
        schema.put("required", List.of("bookId"));

        return new ToolDefinition(
                TOOL_GET_BOOK_DETAILS,
                "Retrieve comprehensive metadata, synopsis, authors, copies availability, and translation links for a specific book ID.",
                schema
        );
    }

    private ToolDefinition createGetAuthorWorksTool() {
        Map<String, Object> props = new LinkedHashMap<>();
        props.put("authorId", Map.of("type", "integer", "description", "Positive integer ID of the author"));
        props.put("authorName", Map.of("type", "string", "description", "Optional name of the author if authorId is unknown"));

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", props);

        return new ToolDefinition(
                TOOL_GET_AUTHOR_WORKS,
                "Retrieve all books in the catalog authored by a specific author by authorId or authorName.",
                schema
        );
    }

    private ToolDefinition createGetSimilarBooksTool() {
        Map<String, Object> props = new LinkedHashMap<>();
        props.put("bookId", Map.of("type", "integer", "description", "Positive integer ID of the reference book"));

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", props);
        schema.put("required", List.of("bookId"));

        return new ToolDefinition(
                TOOL_GET_SIMILAR_BOOKS,
                "Find similar books in the catalog based on category, topics, and authors of the given bookId.",
                schema
        );
    }

    private ToolDefinition createGetRecommendationsForMemberTool() {
        Map<String, Object> props = new LinkedHashMap<>();
        props.put("memberId", Map.of("type", "integer", "description", "Member ID to generate personalized reading recommendations for"));
        props.put("username", Map.of("type", "string", "description", "Optional username of the authenticated member"));

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", props);

        return new ToolDefinition(
                TOOL_GET_RECOMMENDATIONS_FOR_MEMBER,
                "Generate personalized reading recommendations for an authenticated library patron/member based on their loan history and affinity. (Only available when authenticated).",
                schema
        );
    }
}
