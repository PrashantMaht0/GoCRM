package com.gocrm.core.entity;

public class BotFieldResponse {
    private Long templateId;
    private String fieldKey;
    private String fieldLabel;
    private String expectedType;
    private String currentValue; 

    // Constructors
    public BotFieldResponse() {}

    public BotFieldResponse(Long templateId, String fieldKey, String fieldLabel, String expectedType, String currentValue) {
        this.templateId = templateId;
        this.fieldKey = fieldKey;
        this.fieldLabel = fieldLabel;
        this.expectedType = expectedType;
        this.currentValue = currentValue;
    }

    // Getters and Setters
    public Long getTemplateId() { return templateId; }
    public void setTemplateId(Long templateId) { this.templateId = templateId; }

    public String getFieldKey() { return fieldKey; }
    public void setFieldKey(String fieldKey) { this.fieldKey = fieldKey; }

    public String getFieldLabel() { return fieldLabel; }
    public void setFieldLabel(String fieldLabel) { this.fieldLabel = fieldLabel; }

    public String getExpectedType() { return expectedType; }
    public void setExpectedType(String expectedType) { this.expectedType = expectedType; }

    public String getCurrentValue() { return currentValue; }
    public void setCurrentValue(String currentValue) { this.currentValue = currentValue; }
}