package com.libraai.chat.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.libraai.chat.dto.ChatMessageRequest;
import com.libraai.chat.dto.ChatResponseDto;
import com.libraai.chat.dto.ToolExecutionDto;
import com.libraai.chat.llm.LlmClient;
import com.libraai.chat.llm.LlmResponse;
import com.libraai.chat.model.ChatMessage;
import com.libraai.chat.model.ToolCall;
import com.libraai.chat.model.ToolResult;
import com.libraai.chat.tool.InvalidToolArgumentException;
import com.libraai.chat.tool.LibraryToolExecutor;
import com.libraai.chat.tool.LibraryToolRegistry;
import com.libraai.chat.tool.ToolValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final LlmClient llmClient;
    private final LibraryToolRegistry toolRegistry;
    private final ToolValidator toolValidator;
    private final com.libraai.chat.tool.ToolExecutor toolExecutor;
    private final ChatSessionManager sessionManager;
    private final ObjectMapper objectMapper;

    public ChatService(LlmClient llmClient,
                       LibraryToolRegistry toolRegistry,
                       ToolValidator toolValidator,
                       com.libraai.chat.tool.ToolExecutor toolExecutor,
                       ChatSessionManager sessionManager,
                       ObjectMapper objectMapper) {
        this.llmClient = llmClient;
        this.toolRegistry = toolRegistry;
        this.toolValidator = toolValidator;
        this.toolExecutor = toolExecutor;
        this.sessionManager = sessionManager;
        this.objectMapper = objectMapper;
    }

    public ChatResponseDto processUserMessage(ChatMessageRequest request, String authenticatedUsername) {
        String sessionId = request.getSessionId() != null && !request.getSessionId().isBlank()
                ? request.getSessionId()
                : UUID.randomUUID().toString();

        ChatSessionManager.SessionData session = sessionManager.getOrCreateSession(sessionId, authenticatedUsername);

        // 1. Build and append user message
        String userContent = request.getMessage();
        if (request.getBookContext() != null && !request.getBookContext().isBlank()) {
            userContent = "[Context: Currently viewing " + request.getBookContext() + "]\n" + userContent;
        }
        session.appendMessage(ChatMessage.user(userContent));

        List<ToolExecutionDto> toolExecutions = new ArrayList<>();
        List<Long> referencedBookIds = new ArrayList<>();
        boolean groundedInCatalog = false;

        try {
            // 2. Call LLM with history and registered tool surface
            LlmResponse initialResponse = llmClient.generateReply(
                    new ArrayList<>(session.getHistory()),
                    toolRegistry.getToolDefinitions()
            );

            if (initialResponse.isDegradedFallback()) {
                return ChatResponseDto.fallback(initialResponse.getContent(), sessionId);
            }

            // 3. Check if LLM requested tool calling
            if (initialResponse.hasToolCalls()) {
                groundedInCatalog = true;

                for (ToolCall toolCall : initialResponse.getToolCalls()) {
                    String toolName = toolCall.getName();
                    Map<String, Object> args = toolCall.getArguments() != null ? toolCall.getArguments() : Map.of();

                    log.info("Processing requested tool: '{}' with args: {}", toolName, args);

                    // Strict validation against tool schema
                    try {
                        toolValidator.validate(toolCall);

                        // Execution via validated Java service methods
                        ToolResult result = toolExecutor.execute(toolCall, authenticatedUsername);

                        toolExecutions.add(new ToolExecutionDto(
                                toolName,
                                args,
                                result.isError() ? "ERROR" : "SUCCESS",
                                "Executed " + toolName + " against library catalog"
                        ));

                        // Extract referenced book IDs if available
                        extractReferencedBookIds(result.getContent(), referencedBookIds);

                        // Append assistant tool call and tool result to conversation history
                        session.appendMessage(ChatMessage.assistantWithTools(null, List.of(toolCall)));
                        session.appendMessage(ChatMessage.tool(result.getToolCallId(), toolName, result.getContent()));

                    } catch (InvalidToolArgumentException e) {
                        log.warn("Rejected out-of-schema tool call '{}': {}", toolName, e.getMessage());
                        toolExecutions.add(new ToolExecutionDto(
                                toolName,
                                args,
                                "REJECTED",
                                e.getMessage()
                        ));

                        ToolResult errorResult = ToolResult.error(toolCall.getId(), toolName, e.getMessage());
                        session.appendMessage(ChatMessage.assistantWithTools(null, List.of(toolCall)));
                        session.appendMessage(ChatMessage.tool(toolCall.getId(), toolName, errorResult.getContent()));
                    }
                }

                // 4. Synthesize final natural language answer with tool output
                LlmResponse finalResponse = llmClient.generateReply(
                        new ArrayList<>(session.getHistory()),
                        toolRegistry.getToolDefinitions()
                );

                String reply = finalResponse.getContent() != null
                        ? finalResponse.getContent()
                        : "Here are the verified records from our library catalog.";

                session.appendMessage(ChatMessage.assistant(reply));

                ChatResponseDto responseDto = ChatResponseDto.catalogGrounded(reply, sessionId, toolExecutions, referencedBookIds);
                responseDto.setSuggestedFollowUps(generateFollowUps(toolExecutions));
                return responseDto;

            } else {
                // 5. Direct general knowledge / conversational response
                String reply = initialResponse.getContent() != null
                        ? initialResponse.getContent()
                        : "I am happy to assist you with books and research questions.";

                session.appendMessage(ChatMessage.assistant(reply));

                ChatResponseDto responseDto = ChatResponseDto.generalKnowledge(reply, sessionId);
                responseDto.setSuggestedFollowUps(List.of(
                        "Search catalog for books on this topic",
                        "Show related books in other languages",
                        "Check library borrowing policies"
                ));
                return responseDto;
            }

        } catch (Exception e) {
            log.error("Error during LLM chat processing for session {}: {}", sessionId, e.getMessage(), e);
            return ChatResponseDto.fallback(
                    "The AI assistant is temporarily operating in degraded mode. "
                            + "You can search the library catalog directly by typing keywords or author names into the catalog search bar.",
                    sessionId
            );
        }
    }

    private void extractReferencedBookIds(String jsonContent, List<Long> referencedBookIds) {
        if (jsonContent == null || jsonContent.isBlank()) return;
        try {
            Matcher matcher = Pattern.compile("\"id\"\\s*:\\s*(\\d+)").matcher(jsonContent);
            while (matcher.find()) {
                long id = Long.parseLong(matcher.group(1));
                if (!referencedBookIds.contains(id)) {
                    referencedBookIds.add(id);
                }
            }
        } catch (Exception ignored) {}
    }

    private List<String> generateFollowUps(List<ToolExecutionDto> executions) {
        List<String> followUps = new ArrayList<>();
        for (ToolExecutionDto exec : executions) {
            if (LibraryToolRegistry.TOOL_SEARCH_BOOKS.equals(exec.getToolName())) {
                followUps.add("Check availability and physical copy locations");
                followUps.add("Show available translated editions in other languages");
            } else if (LibraryToolRegistry.TOOL_GET_BOOK_DETAILS.equals(exec.getToolName())) {
                followUps.add("Find similar books in this category");
                followUps.add("Generate academic citation for this book");
            }
        }
        if (followUps.isEmpty()) {
            followUps.add("Search another subject in our catalog");
            followUps.add("Recommend books in another language");
        }
        return followUps;
    }
}
