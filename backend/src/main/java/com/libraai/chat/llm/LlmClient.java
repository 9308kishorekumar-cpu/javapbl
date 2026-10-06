package com.libraai.chat.llm;

import com.libraai.chat.model.ChatMessage;
import com.libraai.chat.model.ToolDefinition;

import java.util.List;

public interface LlmClient {
    LlmResponse generateReply(List<ChatMessage> history, List<ToolDefinition> tools);
}
