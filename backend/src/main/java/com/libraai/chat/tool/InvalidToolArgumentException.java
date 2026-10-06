package com.libraai.chat.tool;

public class InvalidToolArgumentException extends RuntimeException {
    private final String toolName;
    private final String argumentName;

    public InvalidToolArgumentException(String toolName, String argumentName, String message) {
        super(String.format("Invalid argument for tool '%s': '%s' - %s", toolName, argumentName, message));
        this.toolName = toolName;
        this.argumentName = argumentName;
    }

    public String getToolName() {
        return toolName;
    }

    public String getArgumentName() {
        return argumentName;
    }
}
