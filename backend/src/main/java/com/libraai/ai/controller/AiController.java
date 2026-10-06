package com.libraai.ai.controller;

import com.libraai.ai.dto.*;
import com.libraai.ai.service.AiService;
import com.libraai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Augmentation Engine", description = "Endpoints for natural language hybrid search, personalized recommendations, citations, risk analysis, and assistant chat")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/search")
    @Operation(summary = "Semantic Natural Language Search", description = "Executes hybrid vector/concept search across book summaries, titles, and topics")
    public ApiResponse<AiSearchResponse> searchBooks(@Valid @RequestBody AiSearchRequest request) {
        AiSearchResponse response = aiService.searchBooksSemantic(request);
        return ApiResponse.ok(response, "Semantic search results computed");
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get Personalized AI Book Recommendations", description = "Curates reading suggestions based on patron borrow history and category affinity")
    public ApiResponse<AiRecommendationDto> getRecommendations(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        AiRecommendationDto recommendations = aiService.getRecommendations(username);
        return ApiResponse.ok(recommendations, "AI recommendations generated");
    }

    @GetMapping("/citations/{bookId}")
    @Operation(summary = "Generate Academic Citation", description = "Formats citations in APA, MLA, Chicago, Harvard, or BibTeX format")
    public ApiResponse<CitationDto> generateCitation(@PathVariable Long bookId,
                                                     @RequestParam(defaultValue = "APA") String format) {
        CitationDto citation = aiService.generateCitation(bookId, format);
        return ApiResponse.ok(citation, "Citation formatted in " + citation.getFormat() + " style");
    }

    @GetMapping("/patrons/{username}/risk")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Assess Patron Overdue Risk", description = "Circulation desk risk analysis for patron borrowing patterns and overdue probability")
    public ApiResponse<PatronRiskDto> assessPatronRisk(@PathVariable String username) {
        PatronRiskDto risk = aiService.assessPatronRisk(username);
        return ApiResponse.ok(risk, "Patron risk assessment computed");
    }

    @PostMapping("/chat")
    @Operation(summary = "AI Library Assistant Conversation", description = "Conversational assistant for catalog queries, policy explanations, and recommendations")
    public ApiResponse<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiService.chatWithLibraryAssistant(request);
        return ApiResponse.ok(response, "Assistant reply generated");
    }
}
