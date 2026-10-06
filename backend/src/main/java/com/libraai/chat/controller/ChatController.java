package com.libraai.chat.controller;

import com.libraai.chat.dto.ChatMessageRequest;
import com.libraai.chat.dto.ChatResponseDto;
import com.libraai.chat.service.ChatService;
import com.libraai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@Tag(name = "Conversational AI Assistant", description = "Endpoints for conversational tool-calling catalog search, book discovery, and literature inquiries")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    @Operation(
            summary = "Send Message to AI Library Assistant",
            description = "Multi-turn conversational assistant with structured tool calling against the library catalog. Never touches DB directly."
    )
    public ApiResponse<ChatResponseDto> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails != null ? userDetails.getUsername() : null;
        ChatResponseDto response = chatService.processUserMessage(request, username);

        String message = response.isGroundedInCatalog()
                ? "Response generated with catalog tool grounding"
                : (response.isDegraded() ? "Degraded mode response" : "General knowledge response generated");

        return ApiResponse.ok(response, message);
    }
}
