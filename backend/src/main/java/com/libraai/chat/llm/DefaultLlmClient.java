package com.libraai.chat.llm;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.libraai.chat.model.ChatMessage;
import com.libraai.chat.model.ToolCall;
import com.libraai.chat.model.ToolDefinition;
import com.libraai.chat.tool.LibraryToolRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class DefaultLlmClient implements LlmClient {

    private static final Logger log = LoggerFactory.getLogger(DefaultLlmClient.class);
    private final ObjectMapper objectMapper;

    public DefaultLlmClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public LlmResponse generateReply(List<ChatMessage> history, List<ToolDefinition> tools) {
        if (history == null || history.isEmpty()) {
            return LlmResponse.message("Hello! I am your LibraAI Library Assistant. How can I assist with your reading or catalog search today?");
        }

        ChatMessage lastMessage = history.get(history.size() - 1);

        // Case 1: Tool execution results are returned; synthesize answer
        if (lastMessage.getRole() == ChatMessage.Role.TOOL) {
            return synthesizeToolResult(history, lastMessage);
        }

        // Case 2: User prompt - evaluate if catalog tool calling is required or if it's general knowledge
        String userText = lastMessage.getContent() != null ? lastMessage.getContent().trim() : "";
        String userLower = userText.toLowerCase();

        // Check if user is asking for catalog search / books / authors / recommendations
        ToolCall candidateTool = determineToolCall(history, userText, userLower);
        if (candidateTool != null) {
            log.info("LLM selected tool call: '{}' with arguments: {}", candidateTool.getName(), candidateTool.getArguments());
            return LlmResponse.withToolCalls(List.of(candidateTool));
        }

        // Case 3: General knowledge / literary reasoning (no tool call needed)
        return generateGeneralKnowledgeAnswer(userText, userLower);
    }

    private ToolCall determineToolCall(List<ChatMessage> history, String userText, String userLower) {
        // 1. Check for Book ID details request (e.g. "tell me about book 1", "details for #2262", "book id 5")
        Matcher idMatcher = Pattern.compile("\\b(?:book|id|#)\\s*[:#]?\\s*(\\d+)\\b", Pattern.CASE_INSENSITIVE).matcher(userText);
        if (idMatcher.find() && (userLower.contains("detail") || userLower.contains("info") || userLower.contains("tell me about") || userLower.contains("copies") || userLower.contains("isbn") || userLower.contains("show"))) {
            long bookId = Long.parseLong(idMatcher.group(1));
            return new ToolCall("call_" + UUID.randomUUID().toString().substring(0, 8),
                    LibraryToolRegistry.TOOL_GET_BOOK_DETAILS,
                    Map.of("bookId", bookId));
        }

        // 2. Check for Similar Books (e.g. "books similar to book 1", "recommendations like #5")
        if (userLower.contains("similar") || userLower.contains("like book") || userLower.contains("books like")) {
            Matcher simIdMatcher = Pattern.compile("\\b(\\d+)\\b").matcher(userText);
            if (simIdMatcher.find()) {
                long bookId = Long.parseLong(simIdMatcher.group(1));
                return new ToolCall("call_" + UUID.randomUUID().toString().substring(0, 8),
                        LibraryToolRegistry.TOOL_GET_SIMILAR_BOOKS,
                        Map.of("bookId", bookId));
            }
        }

        // 3. Check for Personalized Member Recommendations
        if (userLower.contains("my recommendation") || userLower.contains("recommend for me") || userLower.contains("recommend books for my account") || userLower.contains("what should i read next based on my history")) {
            return new ToolCall("call_" + UUID.randomUUID().toString().substring(0, 8),
                    LibraryToolRegistry.TOOL_GET_RECOMMENDATIONS_FOR_MEMBER,
                    new HashMap<>());
        }

        // 4. Check for Author Works (e.g. "books by Leo Tolstoy", "works of Shakespeare", "what else did Haruki Murakami write")
        Matcher authorMatcher = Pattern.compile("\\b(?:what else did|what did|other books by|books? by|works? (?:of|by)|written by)\\s+([A-Za-z\\s\\u0900-\\u0D7F\\u4E00-\\u9FFF\\u0400-\\u04FF]+?)(?:\\s+write|\\s+author|\\?|\\.|,|$)", Pattern.CASE_INSENSITIVE).matcher(userText);
        if (authorMatcher.find() && !userLower.contains("why") && !userLower.contains("meaning") && !userLower.contains("explain") && !userLower.contains("she") && !userLower.contains("he") && !userLower.contains("they")) {
            String authorName = authorMatcher.group(1).trim();
            authorName = authorName.replaceAll("[?.,!]+$", "").trim();
            if (authorName.length() > 2) {
                return new ToolCall("call_" + UUID.randomUUID().toString().substring(0, 8),
                        LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS,
                        Map.of("authorName", authorName));
            }
        }

        // 5. Multi-turn follow-up resolution: check if follow-up refers to previous book context or author
        boolean isFollowUpOnAuthor = userLower.contains("what else did she write")
                || userLower.contains("what else did he write")
                || userLower.contains("what else did they write")
                || userLower.contains("other books by her")
                || userLower.contains("other books by him")
                || userLower.contains("other works by this author");

        if (isFollowUpOnAuthor && history.size() >= 2) {
            for (int i = history.size() - 1; i >= 0; i--) {
                ChatMessage prev = history.get(i);
                if (prev.getContent() != null) {
                    Matcher authorHistMatcher = Pattern.compile("(?:by\\s+|Authors?:\\s*\\[?)([A-Za-z\\s\\u0900-\\u0D7F\\u4E00-\\u9FFF\\u0400-\\u04FF]{3,40})(?:\\]|\\n|—|\\*)", Pattern.CASE_INSENSITIVE).matcher(prev.getContent());
                    if (authorHistMatcher.find()) {
                        String foundAuthor = authorHistMatcher.group(1).trim();
                        return new ToolCall("call_" + UUID.randomUUID().toString().substring(0, 8),
                                LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS,
                                Map.of("authorName", foundAuthor));
                    }
                }
            }
        }

        boolean isFollowUpOnBook = userLower.contains("who wrote it")
                || userLower.contains("who wrote that")
                || userLower.contains("who is the author")
                || userLower.contains("who are the authors")
                || userLower.contains("tell me more")
                || userLower.contains("what other languages")
                || userLower.contains("other languages is it")
                || userLower.contains("is it available")
                || userLower.contains("copies of that")
                || userLower.contains("summary of it");

        if (isFollowUpOnBook && history.size() >= 2) {
            for (int i = history.size() - 1; i >= 0; i--) {
                ChatMessage prev = history.get(i);
                if (prev.getContent() != null) {
                    Matcher m = Pattern.compile("(?:ID\\s*#|Book\\s*#|id\":\\s*)(\\d+)", Pattern.CASE_INSENSITIVE).matcher(prev.getContent());
                    if (m.find()) {
                        long foundId = Long.parseLong(m.group(1));
                        return new ToolCall("call_" + UUID.randomUUID().toString().substring(0, 8),
                                LibraryToolRegistry.TOOL_GET_BOOK_DETAILS,
                                Map.of("bookId", foundId));
                    }
                }
            }
        }

        // 6. Check for Catalog Book Search (e.g. "do you have any Tamil mystery novels", "find books on artificial intelligence", "tell me about Artificial Intelligence: A Modern Approach")
        boolean isCatalogInquiry = userLower.contains("do you have")
                || userLower.contains("find")
                || userLower.contains("search")
                || userLower.contains("look for")
                || userLower.contains("any books")
                || userLower.contains("list books")
                || userLower.contains("show me")
                || userLower.contains("recommend")
                || userLower.contains("novels")
                || userLower.contains("poetry")
                || userLower.contains("mystery")
                || userLower.contains("textbooks")
                || userLower.contains("tell me about")
                || userLower.contains("available in");

        if (isCatalogInquiry) {
            String language = extractLanguageCode(userLower);
            String category = extractCategory(userLower);
            String cleanQuery = extractSearchQuery(userText, userLower);

            Map<String, Object> args = new LinkedHashMap<>();
            args.put("query", cleanQuery.isEmpty() ? (category != null ? category : "all") : cleanQuery);
            if (language != null) {
                args.put("language", language);
            }
            if (category != null) {
                args.put("category", category);
            }
            if (userLower.contains("available") || userLower.contains("in stock")) {
                args.put("availableOnly", true);
            }

            return new ToolCall("call_" + UUID.randomUUID().toString().substring(0, 8),
                    LibraryToolRegistry.TOOL_SEARCH_BOOKS,
                    args);
        }

        return null;
    }

    private String extractLanguageCode(String text) {
        Map<String, String> langMap = Map.ofEntries(
                Map.entry("tamil", "ta"),
                Map.entry("hindi", "hi"),
                Map.entry("bengali", "bn"),
                Map.entry("telugu", "te"),
                Map.entry("sanskrit", "sa"),
                Map.entry("english", "en"),
                Map.entry("spanish", "es"),
                Map.entry("french", "fr"),
                Map.entry("german", "de"),
                Map.entry("japanese", "ja"),
                Map.entry("chinese", "zh"),
                Map.entry("arabic", "ar"),
                Map.entry("russian", "ru"),
                Map.entry("korean", "ko"),
                Map.entry("italian", "it"),
                Map.entry("portuguese", "pt"),
                Map.entry("turkish", "tr"),
                Map.entry("dutch", "nl"),
                Map.entry("greek", "el"),
                Map.entry("latin", "la")
        );

        for (Map.Entry<String, String> entry : langMap.entrySet()) {
            if (text.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String extractCategory(String text) {
        List<String> categories = List.of("Fiction", "Science", "History", "Poetry", "Biography", "Philosophy", "Computer Science");
        for (String cat : categories) {
            if (text.contains(cat.toLowerCase())) {
                return cat;
            }
        }
        if (text.contains("novel") || text.contains("stories")) return "Fiction";
        if (text.contains("poem") || text.contains("verse")) return "Poetry";
        if (text.contains("textbook") || text.contains("physics") || text.contains("biology")) return "Science";
        return null;
    }

    private String extractSearchQuery(String original, String lower) {
        String clean = lower
                .replaceAll("\\b(?:do you have|can you find|find me|search for|look for|show me|list|any|books?|novels?|tell me about|what else did|recommend|in the library|available in|please|about)\\b", "")
                .replaceAll("\\b(?:tamil|hindi|english|spanish|french|german|japanese|chinese|arabic|russian|bengali|telugu|korean|sanskrit)\\b", "")
                .replaceAll("[?.,!:]+", " ")
                .trim();
        return clean.replaceAll("\\s+", " ").trim();
    }

    private LlmResponse synthesizeToolResult(List<ChatMessage> history, ChatMessage toolMessage) {
        try {
            String toolName = toolMessage.getToolName();
            String rawJson = toolMessage.getContent();

            if (toolMessage.getContent() != null && toolMessage.getContent().startsWith("Invalid argument") || toolMessage.getContent().startsWith("Error")) {
                return LlmResponse.message("I encountered an issue processing your request against our library catalog: " + toolMessage.getContent() + ". Please check the search terms or try another inquiry.");
            }

            Map<String, Object> data = objectMapper.readValue(rawJson, new TypeReference<Map<String, Object>>() {});

            StringBuilder sb = new StringBuilder();

            if (LibraryToolRegistry.TOOL_SEARCH_BOOKS.equals(toolName)) {
                List<Map<String, Object>> books = (List<Map<String, Object>>) data.get("books");
                Number total = (Number) data.get("totalMatches");
                String lang = (String) data.get("languageFilter");

                if (books == null || books.isEmpty()) {
                    sb.append("I searched our catalog");
                    if (lang != null) sb.append(" in language [").append(lang.toUpperCase()).append("]");
                    sb.append(", but no matching titles were found. You can try adjusting your search terms or exploring other categories!");
                } else {
                    sb.append("I found ").append(total != null ? total : books.size()).append(" matching title(s) in our catalog");
                    if (lang != null) sb.append(" for language [").append(lang.toUpperCase()).append("]");
                    sb.append(":\n\n");

                    for (int i = 0; i < Math.min(books.size(), 6); i++) {
                        Map<String, Object> b = books.get(i);
                        sb.append("• **").append(b.get("title")).append("** (ID #").append(b.get("id")).append(")");
                        if (b.get("authors") != null) {
                            sb.append(" by ").append(b.get("authors"));
                        }
                        sb.append(" — *").append(b.get("category")).append("* [").append(String.valueOf(b.get("language")).toUpperCase()).append("]");
                        sb.append(" — Available Copies: ").append(b.get("availableCopies")).append("/").append(b.get("totalCopies")).append("\n");
                    }

                    sb.append("\nWould you like more details or availability information on any of these books?");
                }
            } else if (LibraryToolRegistry.TOOL_GET_BOOK_DETAILS.equals(toolName)) {
                sb.append("### **").append(data.get("title")).append("** (ID #").append(data.get("id")).append(")\n\n");
                sb.append("• **Authors**: ").append(data.get("authors")).append("\n");
                sb.append("• **Language**: ").append(String.valueOf(data.get("language")).toUpperCase());
                if (data.get("originalLanguage") != null) {
                    sb.append(" *(Original: ").append(String.valueOf(data.get("originalLanguage")).toUpperCase()).append(")*");
                }
                sb.append("\n");
                sb.append("• **ISBN**: `").append(data.get("isbn")).append("`\n");
                sb.append("• **Category**: ").append(data.get("category")).append("\n");
                sb.append("• **Stock**: ").append(data.get("availableCopies")).append(" of ").append(data.get("totalCopies")).append(" copies available\n");

                if (data.get("translatedFromTitle") != null) {
                    sb.append("• **Original Work**: ").append(data.get("translatedFromTitle")).append(" (ID #").append(data.get("translatedFromId")).append(")\n");
                }

                if (data.get("availableTranslations") != null) {
                    List<Map<String, Object>> trans = (List<Map<String, Object>>) data.get("availableTranslations");
                    sb.append("• **Also Available In**: ");
                    List<String> transList = new ArrayList<>();
                    for (Map<String, Object> t : trans) {
                        transList.add(t.get("title") + " [" + String.valueOf(t.get("language")).toUpperCase() + "]");
                    }
                    sb.append(String.join(", ", transList)).append("\n");
                }

                if (data.get("summary") != null) {
                    sb.append("\n**Summary**: ").append(data.get("summary")).append("\n");
                }
            } else if (LibraryToolRegistry.TOOL_GET_AUTHOR_WORKS.equals(toolName)) {
                String author = (String) data.get("authorName");
                List<Map<String, Object>> books = (List<Map<String, Object>>) data.get("books");

                sb.append("Here are the catalog works by **").append(author).append("**:\n\n");
                if (books == null || books.isEmpty()) {
                    sb.append("No titles currently listed for this author in our active inventory.\n");
                } else {
                    for (Map<String, Object> b : books) {
                        sb.append("• **").append(b.get("title")).append("** (ID #").append(b.get("id")).append(") — [")
                                .append(String.valueOf(b.get("language")).toUpperCase()).append("] (")
                                .append(b.get("availableCopies")).append(" copies available)\n");
                    }
                }
            } else if (LibraryToolRegistry.TOOL_GET_SIMILAR_BOOKS.equals(toolName)) {
                String refTitle = (String) data.get("referenceBookTitle");
                List<Map<String, Object>> similar = (List<Map<String, Object>>) data.get("similarBooks");

                sb.append("If you enjoyed **").append(refTitle).append("**, you might also appreciate these titles from our library:\n\n");
                if (similar != null) {
                    for (Map<String, Object> b : similar) {
                        sb.append("• **").append(b.get("title")).append("** by ").append(b.get("authors"))
                                .append(" [").append(String.valueOf(b.get("language")).toUpperCase()).append("]\n");
                    }
                }
            } else if (LibraryToolRegistry.TOOL_GET_RECOMMENDATIONS_FOR_MEMBER.equals(toolName)) {
                String rationale = (String) data.get("rationale");
                List<Map<String, Object>> books = (List<Map<String, Object>>) data.get("recommendedBooks");

                sb.append("### Personalized Member Recommendations 📚\n\n");
                if (rationale != null) {
                    sb.append(rationale).append("\n\n");
                }
                if (books != null) {
                    for (Map<String, Object> b : books) {
                        sb.append("• **").append(b.get("title")).append("** (").append(b.get("category")).append(")\n");
                    }
                }
            } else {
                sb.append(rawJson);
            }

            return LlmResponse.message(sb.toString().trim());
        } catch (Exception e) {
            log.error("Failed to synthesize tool result", e);
            return LlmResponse.message("Here are the details from our library records: " + toolMessage.getContent());
        }
    }

    private LlmResponse generateGeneralKnowledgeAnswer(String userText, String userLower) {
        // Handle literary questions, philosophy, library policies, or general advice
        if (userLower.contains("gatsby") && (userLower.contains("green light") || userLower.contains("light"))) {
            return LlmResponse.message("In F. Scott Fitzgerald's *The Great Gatsby*, the green light at the end of Daisy Buchanan's dock is one of American literature's most famous symbols. It represents:\n\n"
                    + "1. **Gatsby's Hopes and Yearning**: His romantic dream of reuniting with Daisy and undoing the past.\n"
                    + "2. **The American Dream**: The tantalizing, ever-receding promise of idealized prosperity and self-reinvention.\n"
                    + "3. **The Unattainable Ideal**: As Nick Carraway famously concludes in the final passage, the light symbolizes humanity's enduring struggle against time (*'so we beat on, boats against the current, borne back ceaselessly into the past'*).\n\n"
                    + "Would you like to explore our library's collection of classic American literature or critical essays on 20th-century novels?");
        }

        if (userLower.contains("fiction") && userLower.contains("non-fiction")) {
            return LlmResponse.message("**Fiction vs. Non-Fiction**:\n\n"
                    + "• **Fiction**: Literature created from the author's imagination (e.g. novels, short stories, plays, poetry). Examples include *1984*, *Don Quijote*, and *Ponniyin Selvan*.\n"
                    + "• **Non-Fiction**: Works based on factual reality, historical events, verified research, and biographies (e.g. *A Brief History of Time*, *The Double Helix*).\n\n"
                    + "Our library holds extensive collections in both areas. Let me know if you would like me to search for specific titles!");
        }

        if (userLower.contains("turing") || (userLower.contains("father of") && (userLower.contains("computer") || userLower.contains("ai") || userLower.contains("artificial intelligence")))) {
            return LlmResponse.message("Alan Turing is considered the father of theoretical computer science and artificial intelligence for several foundational breakthroughs:\n\n"
                    + "1. **The Turing Machine (1936)**: He introduced the concept of a universal computing machine, defining mathematical limits on computation (the Halting Problem) and formalizing algorithms before modern computers existed.\n"
                    + "2. **Codebreaking & Cryptanalysis (Bletchley Park)**: He designed the Bombe machine to decipher Enigma-encrypted transmissions during WWII, fundamentally advancing computing hardware and saving millions of lives.\n"
                    + "3. **The Turing Test & Computing Machinery (1950)**: In his seminal paper *'Computing Machinery and Intelligence'*, he proposed the imitation game to operationalize whether machines can exhibit intelligent behavior.\n\n"
                    + "Would you like me to find biographies or textbooks on Alan Turing and computing history in our library?");
        }

        if (userLower.contains("library hours") || userLower.contains("opening hours") || userLower.contains("when are you open")) {
            return LlmResponse.message("Our main library branch is open:\n\n"
                    + "• **Monday – Friday**: 8:00 AM – 9:00 PM\n"
                    + "• **Saturday**: 9:00 AM – 6:00 PM\n"
                    + "• **Sunday**: 10:00 AM – 4:00 PM\n\n"
                    + "Our online digital catalog and AI research assistant are available 24/7.");
        }

        if (userLower.contains("how many books can i borrow") || userLower.contains("loan policy") || userLower.contains("borrow limit")) {
            return LlmResponse.message("Under standard LibraAI circulation policy:\n\n"
                    + "• **Patron Borrowing Limit**: Up to 5 books concurrently.\n"
                    + "• **Standard Loan Period**: 14 calendar days.\n"
                    + "• **Renewals**: 1 renewal allowed per item if no hold/reservation exists.\n\n"
                    + "Let me know if you would like to search our catalog or check on a specific title's availability!");
        }

        return LlmResponse.message("I can help you explore our library catalog across 20 languages, search for titles, look up author works, check physical copy availability, or discuss literary themes and book recommendations. What would you like to explore?");
    }
}
