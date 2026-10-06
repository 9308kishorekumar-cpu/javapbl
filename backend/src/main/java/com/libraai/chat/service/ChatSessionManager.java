package com.libraai.chat.service;

import com.libraai.chat.model.ChatMessage;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatSessionManager {

    private static final int MAX_HISTORY_TURNS = 15;
    private static final Duration SESSION_TTL = Duration.ofHours(24);

    public static class SessionData {
        private final String sessionId;
        private final String username;
        private final List<ChatMessage> history = Collections.synchronizedList(new ArrayList<>());
        private volatile Instant lastAccessedAt = Instant.now();

        public SessionData(String sessionId, String username) {
            this.sessionId = sessionId;
            this.username = username;
        }

        public String getSessionId() {
            return sessionId;
        }

        public String getUsername() {
            return username;
        }

        public List<ChatMessage> getHistory() {
            return history;
        }

        public Instant getLastAccessedAt() {
            return lastAccessedAt;
        }

        public void touch() {
            this.lastAccessedAt = Instant.now();
        }

        public void appendMessage(ChatMessage message) {
            history.add(message);
            trimHistory();
            touch();
        }

        private void trimHistory() {
            while (history.size() > MAX_HISTORY_TURNS * 2) { // 15 user + 15 assistant/tool turns
                history.remove(0);
            }
        }
    }

    private final Map<String, SessionData> sessions = new ConcurrentHashMap<>();

    public SessionData getOrCreateSession(String sessionId, String username) {
        String key = (sessionId != null && !sessionId.isBlank()) ? sessionId : UUID.randomUUID().toString();
        cleanExpiredSessions();

        return sessions.computeIfAbsent(key, id -> {
            SessionData s = new SessionData(id, username);
            // System prompt
            s.getHistory().add(ChatMessage.system(
                    "You are LibraAI's Intelligent Library Assistant. You help patrons discover books, research literature, "
                            + "and check catalog inventory across 20 languages. Never guess or fabricate library holdings—always call the provided tools "
                            + "to verify real catalog data before answering inquiries about library books."
            ));
            return s;
        });
    }

    public List<ChatMessage> getHistory(String sessionId) {
        SessionData s = sessions.get(sessionId);
        return s != null ? new ArrayList<>(s.getHistory()) : List.of();
    }

    public void clearSession(String sessionId) {
        if (sessionId != null) {
            sessions.remove(sessionId);
        }
    }

    private void cleanExpiredSessions() {
        Instant threshold = Instant.now().minus(SESSION_TTL);
        sessions.entrySet().removeIf(e -> e.getValue().getLastAccessedAt().isBefore(threshold));
    }
}
