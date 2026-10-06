package com.libraai.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libraai.chat.dto.ChatMessageRequest;
import com.libraai.chat.dto.ChatResponseDto;
import com.libraai.chat.llm.LlmClient;
import com.libraai.chat.llm.LlmResponse;
import com.libraai.chat.model.ChatMessage;
import com.libraai.chat.model.ToolCall;
import com.libraai.chat.model.ToolResult;
import com.libraai.chat.service.ChatService;
import com.libraai.chat.service.ChatSessionManager;
import com.libraai.chat.tool.LibraryToolRegistry;
import com.libraai.chat.tool.ToolExecutor;
import com.libraai.chat.tool.ToolValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private LlmClient mockLlmClient;

    @Mock
    private ToolExecutor mockToolExecutor;

    private LibraryToolRegistry toolRegistry;
    private ToolValidator toolValidator;
    private ChatSessionManager sessionManager;
    private ObjectMapper objectMapper;
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        toolRegistry = new LibraryToolRegistry();
        toolValidator = new ToolValidator(toolRegistry);
        sessionManager = new ChatSessionManager();

        chatService = new ChatService(
                mockLlmClient,
                toolRegistry,
                toolValidator,
                mockToolExecutor,
                sessionManager,
                objectMapper
        );
    }

    @Test
    @DisplayName("1. Valid tool call: executes Java service and returns catalog-grounded response")
    void testValidToolCall_CatalogGrounded() {
        // Arrange
        String sessionId = "test-session-1";
        ChatMessageRequest request = new ChatMessageRequest("Do you have any Tamil mystery novels?", sessionId);

        ToolCall toolCall = new ToolCall("call_1", LibraryToolRegistry.TOOL_SEARCH_BOOKS, Map.of(
                "query", "mystery",
                "language", "ta"
        ));

        when(mockLlmClient.generateReply(anyList(), anyList()))
                .thenReturn(LlmResponse.withToolCalls(List.of(toolCall)))
                .thenReturn(LlmResponse.message("I found 1 matching Tamil novel in our library: Ponniyin Selvan (ID #2262)."));

        when(mockToolExecutor.execute(any(ToolCall.class), any()))
                .thenReturn(ToolResult.success(
                        "call_1",
                        LibraryToolRegistry.TOOL_SEARCH_BOOKS,
                        "{\"totalMatches\":1,\"books\":[{\"id\":2262,\"title\":\"Ponniyin Selvan\",\"language\":\"ta\",\"availableCopies\":2}]}"
                ));

        // Act
        ChatResponseDto response = chatService.processUserMessage(request, null);

        // Assert
        assertNotNull(response);
        assertTrue(response.isGroundedInCatalog(), "Should be flagged as catalog-grounded");
        assertFalse(response.isDegraded(), "Should not be degraded");
        assertEquals(1, response.getToolExecutions().size());
        assertEquals("SUCCESS", response.getToolExecutions().get(0).getStatus());
        assertEquals(LibraryToolRegistry.TOOL_SEARCH_BOOKS, response.getToolExecutions().get(0).getToolName());
        assertTrue(response.getReply().contains("Ponniyin Selvan"));
        verify(mockToolExecutor, times(1)).execute(any(ToolCall.class), any());
    }

    @Test
    @DisplayName("2. Out-of-schema tool args: rejected by validator before touching service/repository")
    void testInvalidOutOfSchemaToolCallArgs_RejectedBeforeRepository() {
        // Arrange
        String sessionId = "test-session-invalid-args";
        ChatMessageRequest request = new ChatMessageRequest("Tell me about invalid book", sessionId);

        // Negative bookId violates schema
        ToolCall invalidToolCall = new ToolCall("call_invalid", LibraryToolRegistry.TOOL_GET_BOOK_DETAILS, Map.of(
                "bookId", -99
        ));

        when(mockLlmClient.generateReply(anyList(), anyList()))
                .thenReturn(LlmResponse.withToolCalls(List.of(invalidToolCall)))
                .thenReturn(LlmResponse.message("I could not look up that book because the ID provided was invalid."));

        // Act
        ChatResponseDto response = chatService.processUserMessage(request, null);

        // Assert
        assertNotNull(response);
        assertTrue(response.isGroundedInCatalog());
        assertEquals(1, response.getToolExecutions().size());
        assertEquals("REJECTED", response.getToolExecutions().get(0).getStatus(), "Tool call must be marked REJECTED");
        assertTrue(response.getToolExecutions().get(0).getSummary().contains("positive integer"));

        // Crucial check: toolExecutor was NEVER called because validation rejected it first
        verify(mockToolExecutor, never()).execute(any(ToolCall.class), any());
    }

    @Test
    @DisplayName("3. LLM Timeout: returns degraded mode fallback without crashing or hanging")
    void testLlmTimeout_DegradedFallbackMode() {
        // Arrange
        String sessionId = "test-session-timeout";
        ChatMessageRequest request = new ChatMessageRequest("Search science books", sessionId);

        when(mockLlmClient.generateReply(anyList(), anyList()))
                .thenThrow(new RuntimeException("LLM request timed out after 10000ms", new TimeoutException()));

        // Act
        ChatResponseDto response = chatService.processUserMessage(request, null);

        // Assert
        assertNotNull(response);
        assertTrue(response.isDegraded(), "Should be marked as degraded fallback");
        assertFalse(response.isGroundedInCatalog(), "Not grounded due to timeout");
        assertTrue(response.getReply().contains("degraded mode"));
        assertTrue(response.getReply().contains("catalog"));
    }

    @Test
    @DisplayName("4. LLM Provider Failure: returns clear fallback message without crashing")
    void testLlmProviderFailure_GracefulHandling() {
        // Arrange
        String sessionId = "test-session-provider-fail";
        ChatMessageRequest request = new ChatMessageRequest("Recommend me a book", sessionId);

        when(mockLlmClient.generateReply(anyList(), anyList()))
                .thenThrow(new RuntimeException("LLM 503 Service Unavailable"));

        // Act
        ChatResponseDto response = chatService.processUserMessage(request, null);

        // Assert
        assertNotNull(response);
        assertTrue(response.isDegraded());
        assertNotNull(response.getSuggestedFollowUps());
        assertFalse(response.getSuggestedFollowUps().isEmpty());
    }

    @Test
    @DisplayName("5. Multi-turn conversation: turn 2 resolves context from turn 1's rolling history")
    void testMultiTurnConversation_ContextResolvedCorrectly() {
        // Arrange
        String sessionId = "test-multi-turn-session";

        // Turn 1: User asks for a book
        ChatMessageRequest turn1Request = new ChatMessageRequest("Tell me about Artificial Intelligence: A Modern Approach", sessionId);
        ToolCall turn1Tool = new ToolCall("call_t1", LibraryToolRegistry.TOOL_SEARCH_BOOKS, Map.of("query", "Artificial Intelligence"));

        when(mockLlmClient.generateReply(anyList(), anyList()))
                .thenReturn(LlmResponse.withToolCalls(List.of(turn1Tool)))
                .thenReturn(LlmResponse.message("Book #1 is 'Artificial Intelligence: A Modern Approach' by Stuart Russell and Peter Norvig."));

        when(mockToolExecutor.execute(any(ToolCall.class), any()))
                .thenReturn(ToolResult.success(
                        "call_t1",
                        LibraryToolRegistry.TOOL_SEARCH_BOOKS,
                        "{\"totalMatches\":1,\"books\":[{\"id\":1,\"title\":\"Artificial Intelligence: A Modern Approach\",\"authors\":[\"Stuart Russell\",\"Peter Norvig\"]}]}"
                ));

        ChatResponseDto turn1Response = chatService.processUserMessage(turn1Request, null);
        assertNotNull(turn1Response);
        assertTrue(turn1Response.isGroundedInCatalog());

        // Verify history has both Turn 1 user & assistant turns
        List<ChatMessage> historyAfterTurn1 = sessionManager.getHistory(sessionId);
        assertTrue(historyAfterTurn1.size() >= 3, "History must contain system, user, tool, and assistant messages");

        // Turn 2: Follow-up question referencing turn 1 ("Who wrote it?")
        ChatMessageRequest turn2Request = new ChatMessageRequest("Who are the authors of that book?", sessionId);
        ToolCall turn2Tool = new ToolCall("call_t2", LibraryToolRegistry.TOOL_GET_BOOK_DETAILS, Map.of("bookId", 1L));

        when(mockLlmClient.generateReply(anyList(), anyList()))
                .thenReturn(LlmResponse.withToolCalls(List.of(turn2Tool)))
                .thenReturn(LlmResponse.message("It was written by Stuart Russell and Peter Norvig."));

        when(mockToolExecutor.execute(any(ToolCall.class), any()))
                .thenReturn(ToolResult.success(
                        "call_t2",
                        LibraryToolRegistry.TOOL_GET_BOOK_DETAILS,
                        "{\"id\":1,\"title\":\"Artificial Intelligence: A Modern Approach\",\"authors\":[\"Stuart Russell\",\"Peter Norvig\"]}"
                ));

        ChatResponseDto turn2Response = chatService.processUserMessage(turn2Request, null);
        assertNotNull(turn2Response);
        assertTrue(turn2Response.isGroundedInCatalog());
        assertTrue(turn2Response.getReply().contains("Stuart Russell"));
    }
}
