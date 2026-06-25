package com.gocrm.core.controller;

import com.gocrm.core.entity.*;
import com.gocrm.core.repository.CompanyBotTemplateRepository;
import com.gocrm.core.repository.CompanyBotValueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/bot-settings")
public class BotSettingsController {

    private final CompanyBotTemplateRepository templateRepository;
    private final CompanyBotValueRepository valueRepository;

    public BotSettingsController(CompanyBotTemplateRepository templateRepository, CompanyBotValueRepository valueRepository) {
        this.templateRepository = templateRepository;
        this.valueRepository = valueRepository;
    }

    // 1. GET Endpoint: Fetches templates + existing values for the React form
    @GetMapping("/{companyId}")
    public ResponseEntity<List<BotFieldResponse>> getBotSettings(@PathVariable Long companyId) {
        List<CompanyBotTemplate> templates = templateRepository.findByCompanyId(companyId);
        List<BotFieldResponse> responseList = new ArrayList<>();

        for (CompanyBotTemplate template : templates) {
            // Check if the user has already saved a value for this template
            Optional<CompanyBotValue> existingValue = valueRepository.findByCompanyIdAndTemplateId(companyId, template.getId());
            
            String currentValue = existingValue.map(CompanyBotValue::getFieldValue).orElse("");

            responseList.add(new BotFieldResponse(
                    template.getId(),
                    template.getFieldKey(),
                    template.getFieldLabel(),
                    template.getExpectedType(),
                    currentValue
            ));
        }

        return ResponseEntity.ok(responseList);
    }

    // 2. POST Endpoint: Saves the dynamic array of answers from React
    @PostMapping
    public ResponseEntity<String> saveBotSettings(@RequestBody BotSettingsSaveRequest request) {
        Long companyId = request.getCompanyId();

        for (BotSettingsSaveRequest.BotFieldValue field : request.getFields()) {
            CompanyBotTemplate template = templateRepository.findById(field.getTemplateId())
                    .orElseThrow(() -> new RuntimeException("Template ID " + field.getTemplateId() + " not found"));

            // Look for an existing row to update, or create a new one
            Optional<CompanyBotValue> existingValue = valueRepository.findByCompanyIdAndTemplateId(companyId, template.getId());

            CompanyBotValue botValue;
            if (existingValue.isPresent()) {
                botValue = existingValue.get(); // Update existing
            } else {
                botValue = new CompanyBotValue(); // Create new
                botValue.setCompanyId(companyId);
                botValue.setTemplate(template);
            }

            botValue.setFieldValue(field.getValue());
            valueRepository.save(botValue);
        }

        return ResponseEntity.ok("Bot settings saved successfully");
    }
}