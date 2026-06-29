package com.gocrm.core.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
        company.setOwnerId(admin.getId());

        Company savedCompany = companyRepository.save(company);
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

    @GetMapping("/owned")
    public ResponseEntity<?> getOwnedCompanies(Authentication authentication) {
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail).orElseThrow();

        List<Company> ownedCompanies = companyRepository.findByOwnerId(currentUser.getId());

        List<Map<String, Object>> response = ownedCompanies.stream().map(c -> Map.<String, Object>of(
            "id", (Object) c.getId(),
            "name", c.getCompanyName(),
            "companyCode", c.getCompanyCode()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id, Authentication authentication) {
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail).orElseThrow();

        Company company = companyRepository.findById(id).orElse(null);

        if (company == null) {
            return ResponseEntity.notFound().build();
        }
        if (!company.getOwnerId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. You do not own this workspace."));
        }

        return ResponseEntity.ok(Map.of(
            "id", company.getId(),
            "name", company.getCompanyName(),
            "companyCode", company.getCompanyCode()
        ));
    }
    
}