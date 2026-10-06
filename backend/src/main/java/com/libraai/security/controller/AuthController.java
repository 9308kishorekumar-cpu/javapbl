package com.libraai.security.controller;

import com.libraai.common.dto.ApiResponse;
import com.libraai.security.dto.AuthResponse;
import com.libraai.security.dto.LoginRequest;
import com.libraai.security.dto.RegisterRequest;
import com.libraai.security.dto.UserSummaryDto;
import com.libraai.security.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication, registration, and session info")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Validates credentials and returns JWT Bearer token")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.ok(response, "Login successful");
    }

    @PostMapping("/register")
    @Operation(summary = "Register new library member", description = "Creates a new user account with ROLE_MEMBER and returns JWT token")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.ok(response, "Registration successful");
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves user profile and role details from the JWT session")
    public ApiResponse<UserSummaryDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ApiResponse.fail("No authenticated session found");
        }
        UserSummaryDto user = authService.getCurrentUser(userDetails.getUsername());
        return ApiResponse.ok(user, "User profile retrieved successfully");
    }
}
