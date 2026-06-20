package com.gocrm.core.controller;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gocrm.core.entity.Company;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.CompanyRepository;
import com.gocrm.core.repository.UserRepository;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public CompanyController(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createCompany(@RequestBody Map<String, String> request, Authentication authentication) {
        String userEmail = authentication.getName();
        User admin = userRepository.findByEmail(userEmail).orElseThrow();

        Company company = new Company();
        company.setCompanyName(request.get("name"));
        String uniqueCode = "GOCRM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        company.setCompanyCode(uniqueCode);

        Company savedCompany = companyRepository.save(company);

        admin.setCompany(savedCompany);
        userRepository.save(admin);

        return ResponseEntity.ok(Map.of(
            "message", "Workspace created successfully",
            "companyCode", uniqueCode,
            "companyName", savedCompany.getCompanyName()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyCompany(Authentication authentication) {
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail).orElseThrow();

        if (currentUser.getCompany() == null) {
            return ResponseEntity.notFound().build();
        }

        Company company = currentUser.getCompany();
        return ResponseEntity.ok(Map.of(
            "id", company.getId(),
            "name", company.getCompanyName(),
            "companyCode", company.getCompanyCode()
        ));
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinCompany(@RequestBody Map<String, String> request, Authentication authentication) {
        String code = request.get("companyCode");
        Optional<Company> companyOpt = companyRepository.findByCompanyCode(code);

        if (companyOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid company code."));
        }

        String userEmail = authentication.getName();
        User salesRep = userRepository.findByEmail(userEmail).orElseThrow();
        
        salesRep.setCompany(companyOpt.get());
        userRepository.save(salesRep);

        return ResponseEntity.ok(Map.of("message", "Successfully joined the workspace."));
    }
}