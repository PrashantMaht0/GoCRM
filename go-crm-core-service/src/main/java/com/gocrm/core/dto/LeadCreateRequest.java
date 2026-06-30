package com.gocrm.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LeadCreateRequest(
    @NotBlank(message = "Customer name cannot be empty")
    @Size(max = 100, message = "Name is too long")
    String customerName,

    @NotBlank(message = "WhatsApp ID is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Must be a valid international phone number")
    String whatsappId
) {}