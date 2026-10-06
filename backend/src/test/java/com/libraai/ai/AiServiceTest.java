package com.libraai.ai;

import com.libraai.ai.dto.*;
import com.libraai.ai.service.AiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class AiServiceTest {

    @Autowired
    private AiService aiService;

    @Test
    void testSemanticSearch() {
        AiSearchResponse response = aiService.searchBooksSemantic(new AiSearchRequest("space travel exploration", 5));

        assertNotNull(response);
        assertFalse(response.getResults().isEmpty(), "Should find space-related books like 2001: A Space Odyssey");
        assertTrue(response.getResults().get(0).getRelevanceScore() > 0);
        assertNotNull(response.getResults().get(0).getMatchReason());
    }

    @Test
    void testCitationGeneratorStyles() {
        // Test APA
        CitationDto apa = aiService.generateCitation(1L, "APA");
        assertNotNull(apa);
        assertEquals("APA", apa.getFormat());
        assertTrue(apa.getCitationText().contains("Stuart Russell"));

        // Test MLA
        CitationDto mla = aiService.generateCitation(1L, "MLA");
        assertEquals("MLA", mla.getFormat());
        assertTrue(mla.getCitationText().contains("Artificial Intelligence"));

        // Test BibTeX
        CitationDto bibtex = aiService.generateCitation(1L, "BIBTEX");
        assertEquals("BIBTEX", bibtex.getFormat());
        assertTrue(bibtex.getCitationText().contains("@book{"));
    }

    @Test
    void testPatronRiskAssessment() {
        PatronRiskDto risk = aiService.assessPatronRisk("member");
        assertNotNull(risk);
        assertEquals("member", risk.getUsername());
        assertNotNull(risk.getRiskLevel());
        assertTrue(risk.getRiskScore() >= 0 && risk.getRiskScore() <= 100);
        assertNotNull(risk.getRecommendation());
    }

    @Test
    void testChatAssistantPolicyResponse() {
        AiChatRequest req = new AiChatRequest("What are the library borrowing policies and overdue fines?", null);
        AiChatResponse res = aiService.chatWithLibraryAssistant(req);

        assertNotNull(res);
        assertTrue(res.getReply().contains("14 calendar days"));
        assertTrue(res.getReply().contains("₹1.00 / day"));
        assertFalse(res.getSuggestedFollowUps().isEmpty());
    }
}
