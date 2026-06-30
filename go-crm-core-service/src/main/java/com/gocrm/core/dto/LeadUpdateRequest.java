package com.gocrm.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LeadUpdateRequest(
    @Pattern(regexp = "^(NEW|DISCOVERY|PROPOSAL_SENT|NEGOTIATION|WON|LOST)$", message = "Invalid pipeline status")
    String pipelineStatus,

    @Min(value = 0, message = "Contract value cannot be negative")
    Double contractValue,

    @Size(max = 2000, message = "Requirements text is too long")
    String requirements
) {}