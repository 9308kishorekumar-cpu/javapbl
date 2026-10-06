package com.libraai.chat.model;

import java.util.Map;

public class ToolDefinition {
    private String name;
    private String description;
    private Map<String, Object> parametersSchema;

    public ToolDefinition() {}

    public ToolDefinition(String name, String description, Map<String, Object> parametersSchema) {
        this.name = name;
        this.description = description;
        this.parametersSchema = parametersSchema;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Map<String, Object> getParametersSchema() {
        return parametersSchema;
    }

    public void setParametersSchema(Map<String, Object> parametersSchema) {
        this.parametersSchema = parametersSchema;
    }
}
