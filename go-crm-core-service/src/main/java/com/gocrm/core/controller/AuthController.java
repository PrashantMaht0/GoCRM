package com.gocrm.core.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.gocrm.core.entity.Company;
import com.gocrm.core.entity.Role;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.CompanyRepository;
import com.gocrm.core.repository.UserRepository;
import com.gocrm.core.security.JwtService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, 
                          UserRepository userRepository, CompanyRepository companyRepository, 
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        if (userRepository.existsByEmail(request.get("email"))) {
            return ResponseEntity.badRequest().body("Email already in use.");
        }

        User user = new User();
        user.setEmail(request.get("email"));
        user.setPasswordHash(passwordEncoder.encode(request.get("password")));
        user.setFullName(request.get("fullName"));

        String requestedRole = request.getOrDefault("role", "SALES_REP").toUpperCase();
        
        if ("ADMIN".equals(requestedRole)) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.SALES_REP);
        }

        user.setCompany(null); 

        userRepository.save(user);

        return ResponseEntity.ok(user.getRole().name() + " registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        User user = userRepository.findByEmail(email).orElseThrow();
        Long companyId = user.getCompany() != null ? user.getCompany().getId() : null;

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name(), companyId);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path("/api/v1/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of(
                        "accessToken", accessToken,
                        "user", Map.of(
                                "id", user.getId(),
                                "email", user.getEmail(),
                                "role", user.getRole().name(),
                                "companyId", companyId != null ? companyId : ""
                        )
                ));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String googleToken = request.get("token");
        String requestedRole = request.getOrDefault("role", "SALES_REP").toUpperCase();

        if (googleToken == null || googleToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Google token is required"));
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(googleToken);
        HttpEntity<String> entity = new HttpEntity<>("", headers);

        try {
            ResponseEntity<Map> googleResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> body = googleResponse.getBody();
            if (body == null || !body.containsKey("email")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Google token"));
            }

            String email = (String) body.get("email");
            String fullName = (String) body.get("name");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFullName(fullName);
                newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));

                if ("ADMIN".equals(requestedRole)) {
                    newUser.setRole(Role.ADMIN);
                    Company company = new Company();
                    company.setCompanyName(fullName + "'s Workspace");
                    company.setCompanyCode("GOCRM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    company = companyRepository.save(company);
                    newUser.setCompany(company);
                } else {
                    newUser.setRole(Role.SALES_REP);
                    newUser.setCompany(null); 
                }
                return userRepository.save(newUser);
            });

            Long companyId = user.getCompany() != null ? user.getCompany().getId() : null;
            String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name(), companyId);
            String refreshToken = jwtService.generateRefreshToken(user.getEmail());

            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                    .httpOnly(true)
                    .secure(false) 
                    .sameSite("Strict")
                    .path("/api/v1/auth/refresh")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(Map.of(
                            "accessToken", accessToken,
                            "user", Map.of(
                                    "id", user.getId(),
                                    "email", user.getEmail(),
                                    "role", user.getRole().name(),
                                    "companyId", companyId != null ? companyId : ""
                            )
                    ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Failed to authenticate with Google"));
        }
    }
}