package com.libraai.chat.tool;

import com.libraai.chat.model.ToolCall;
import com.libraai.chat.model.ToolResult;

public interface ToolExecutor {
    ToolResult execute(ToolCall toolCall, String authenticatedUsername);
}
