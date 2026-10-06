package com.libraai.chat.tool;

import com.libraai.chat.model.ToolCall;
import com.libraai.chat.model.ToolDefinition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ToolValidator {

    private static final Logger log = LoggerFactory.getLogger(ToolValidator.class);
    private final LibraryToolRegistry registry;

    public ToolValidator(LibraryToolRegistry registry) {
        this.registry = registry;
    }

    public void validate(ToolCall toolCall) {
        if (toolCall == null) {
            log.warn("ToolCall validation failed: null tool call");
            throw new InvalidToolArgumentException("unknown", "toolCall", "Tool call cannot be null");
        }

        String name = toolCall.getName();
        if (name == null || name.isBlank()) {
            log.warn("ToolCall validation failed: blank tool name");
            throw new InvalidToolArgumentException("unknown", "name", "Tool name cannot be empty");
        }

        ToolDefinition definition = registry.getToolDefinition(name)
                .orElseThrow(() -> {
                    log.warn("Rejected unregistered tool call: '{}'", name);
                    return new InvalidToolArgumentException(name, "name", "Tool '" + name + "' is not a registered library tool");
                });

        Map<String, Object> args = toolCall.getArguments();
        if (args == null) {
            args = Map.of();
        }

        switch (definition.getName()) {
            case LibraryToolRegistry.TOOL_SEARCH_BOOKS:
                validateSearchBooks(args);
                break;
            case LibraryToolRegistry.TOOL_GET_BOOK_DETAILS:
                validateGetBookDetails(args);
                break;
            case LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS:
                validateGetAuthorWorks(args);
                break;
            case LibraryToolRegistry.TOOL_GET_SIMILAR_BOOKS:
                validateGetSimilarBooks(args);
                break;
            case LibraryToolRegistry.TOOL_GET_RECOMMENDATIONS_FOR_MEMBER:
                validateGetRecommendationsForMember(args);
                break;
            default:
                log.warn("Unrecognized tool execution request: '{}'", name);
                throw new InvalidToolArgumentException(name, "name", "Unrecognized tool: " + name);
        }
    }

    private void validateSearchBooks(Map<String, Object> args) {
        if (!args.containsKey("query") || args.get("query") == null) {
            log.warn("Validation failed for searchBooks: missing required 'query' argument. Received: {}", args);
            throw new InvalidToolArgumentException(LibraryToolRegistry.TOOL_SEARCH_BOOKS, "query", "Missing required argument 'query'");
        }
        Object queryObj = args.get("query");
        if (!(queryObj instanceof String) || ((String) queryObj).trim().isEmpty()) {
            log.warn("Validation failed for searchBooks: 'query' must be a non-empty string. Received: {}", queryObj);
            throw new InvalidToolArgumentException(LibraryToolRegistry.TOOL_SEARCH_BOOKS, "query", "Query must be a non-empty string");
        }

        if (args.containsKey("language") && args.get("language") != null) {
            Object lang = args.get("language");
            if (!(lang instanceof String)) {
                log.warn("Validation failed for searchBooks: 'language' must be a string. Received: {}", lang);
                throw new InvalidToolArgumentException(LibraryToolRegistry.TOOL_SEARCH_BOOKS, "language", "Language must be a string");
            }
        }

        if (args.containsKey("category") && args.get("category") != null) {
            Object cat = args.get("category");
            if (!(cat instanceof String)) {
                log.warn("Validation failed for searchBooks: 'category' must be a string. Received: {}", cat);
                throw new InvalidToolArgumentException(LibraryToolRegistry.TOOL_SEARCH_BOOKS, "category", "Category must be a string");
            }
        }

        if (args.containsKey("availableOnly") && args.get("availableOnly") != null) {
            Object avail = args.get("availableOnly");
            if (!(avail instanceof Boolean) && !(avail instanceof String && ("true".equalsIgnoreCase((String) avail) || "false".equalsIgnoreCase((String) avail)))) {
                log.warn("Validation failed for searchBooks: 'availableOnly' must be a boolean. Received: {}", avail);
                throw new InvalidToolArgumentException(LibraryToolRegistry.TOOL_SEARCH_BOOKS, "availableOnly", "availableOnly must be a boolean");
            }
        }
    }

    private void validateGetBookDetails(Map<String, Object> args) {
        validatePositiveLong(LibraryToolRegistry.TOOL_GET_BOOK_DETAILS, args, "bookId", true);
    }

    private void validateGetAuthorWorks(Map<String, Object> args) {
        boolean hasId = args.containsKey("authorId") && args.get("authorId") != null;
        boolean hasName = args.containsKey("authorName") && args.get("authorName") != null && !args.get("authorName").toString().isBlank();

        if (!hasId && !hasName) {
            log.warn("Validation failed for getAuthorWorks: requires either 'authorId' or 'authorName'. Received: {}", args);
            throw new InvalidToolArgumentException(LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS, "authorId/authorName", "Must provide either authorId or authorName");
        }

        if (hasId) {
            validatePositiveLong(LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS, args, "authorId", false);
        }
    }

    private void validateGetSimilarBooks(Map<String, Object> args) {
        validatePositiveLong(LibraryToolRegistry.TOOL_GET_SIMILAR_BOOKS, args, "bookId", true);
    }

    private void validateGetRecommendationsForMember(Map<String, Object> args) {
        if (args.containsKey("memberId") && args.get("memberId") != null) {
            validatePositiveLong(LibraryToolRegistry.TOOL_GET_RECOMMENDATIONS_FOR_MEMBER, args, "memberId", false);
        }
    }

    private void validatePositiveLong(String toolName, Map<String, Object> args, String paramName, boolean required) {
        if (!args.containsKey(paramName) || args.get(paramName) == null) {
            if (required) {
                log.warn("Validation failed for {}: missing required parameter '{}'", toolName, paramName);
                throw new InvalidToolArgumentException(toolName, paramName, "Missing required parameter '" + paramName + "'");
            }
            return;
        }

        Object val = args.get(paramName);
        long parsed;
        try {
            if (val instanceof Number) {
                parsed = ((Number) val).longValue();
            } else if (val instanceof String) {
                parsed = Long.parseLong(((String) val).trim());
            } else {
                throw new NumberFormatException("Not a number");
            }
        } catch (Exception e) {
            log.warn("Validation failed for {}: parameter '{}' must be a valid integer ID. Received: {}", toolName, paramName, val);
            throw new InvalidToolArgumentException(toolName, paramName, "Must be a valid integer ID: " + val);
        }

        if (parsed <= 0) {
            log.warn("Validation failed for {}: parameter '{}' must be a positive integer > 0. Received: {}", toolName, paramName, parsed);
            throw new InvalidToolArgumentException(toolName, paramName, "Must be a positive integer greater than zero: " + parsed);
        }
    }
}
