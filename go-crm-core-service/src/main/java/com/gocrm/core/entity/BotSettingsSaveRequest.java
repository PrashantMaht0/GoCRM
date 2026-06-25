package com.gocrm.core.entity;

import java.util.List;

public class BotSettingsSaveRequest {
    private Long companyId;
    private List<BotFieldValue> fields;

    // Getters and Setters
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public List<BotFieldValue> getFields() { return fields; }
    public void setFields(List<BotFieldValue> fields) { this.fields = fields; }

    // Inner class representing a single answered field
    public static class BotFieldValue {
        private Long templateId;
        private String value;

        public Long getTemplateId() { return templateId; }
        public void setTemplateId(Long templateId) { this.templateId = templateId; }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }
}