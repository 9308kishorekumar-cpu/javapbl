package com.libraai.chat;

import com.libraai.chat.model.ToolCall;
import com.libraai.chat.tool.InvalidToolArgumentException;
import com.libraai.chat.tool.LibraryToolRegistry;
import com.libraai.chat.tool.ToolValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ToolValidatorTest {

    private ToolValidator validator;

    @BeforeEach
    void setUp() {
        LibraryToolRegistry registry = new LibraryToolRegistry();
        validator = new ToolValidator(registry);
    }

    @Test
    @DisplayName("Should accept valid searchBooks tool call")
    void testValidSearchBooks() {
        ToolCall call = new ToolCall("call_1", LibraryToolRegistry.TOOL_SEARCH_BOOKS, Map.of(
                "query", "Tamil novel",
                "language", "ta",
                "category", "Fiction",
                "availableOnly", true
        ));
        assertDoesNotThrow(() -> validator.validate(call));
    }

    @Test
    @DisplayName("Should reject searchBooks when query is missing or blank")
    void testSearchBooksMissingQuery() {
        ToolCall call = new ToolCall("call_1", LibraryToolRegistry.TOOL_SEARCH_BOOKS, Map.of());
        InvalidToolArgumentException ex = assertThrows(InvalidToolArgumentException.class, () -> validator.validate(call));
        assertEquals("query", ex.getArgumentName());
    }

    @Test
    @DisplayName("Should reject getBookDetails when bookId is negative or zero")
    void testGetBookDetailsNegativeId() {
        ToolCall call = new ToolCall("call_1", LibraryToolRegistry.TOOL_GET_BOOK_DETAILS, Map.of("bookId", -10));
        InvalidToolArgumentException ex = assertThrows(InvalidToolArgumentException.class, () -> validator.validate(call));
        assertEquals("bookId", ex.getArgumentName());
    }

    @Test
    @DisplayName("Should reject getBookDetails when bookId is non-numeric string")
    void testGetBookDetailsInvalidType() {
        ToolCall call = new ToolCall("call_1", LibraryToolRegistry.TOOL_GET_BOOK_DETAILS, Map.of("bookId", "not_a_number"));
        InvalidToolArgumentException ex = assertThrows(InvalidToolArgumentException.class, () -> validator.validate(call));
        assertEquals("bookId", ex.getArgumentName());
    }

    @Test
    @DisplayName("Should reject unknown / unregistered tool names")
    void testUnknownToolName() {
        ToolCall call = new ToolCall("call_1", "dropDatabaseTables", Map.of("all", true));
        InvalidToolArgumentException ex = assertThrows(InvalidToolArgumentException.class, () -> validator.validate(call));
        assertEquals("name", ex.getArgumentName());
    }
}
