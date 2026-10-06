package com.libraai.security.controller;

import com.libraai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@Tag(name = "RBAC Verification", description = "Endpoints for testing role-based access control rules")
public class AuthTestController {

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin only endpoint")
    public ApiResponse<Map<String, Object>> adminOnly(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(Map.of(
                "authorizedRole", "ROLE_ADMIN",
                "caller", userDetails.getUsername(),
                "authorities", userDetails.getAuthorities()
        ), "Welcome Admin! Authorization verified.");
    }

    @GetMapping("/librarian")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Librarian and Admin endpoint")
    public ApiResponse<Map<String, Object>> librarianAccess(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(Map.of(
                "authorizedRoles", "ROLE_LIBRARIAN, ROLE_ADMIN",
                "caller", userDetails.getUsername(),
                "authorities", userDetails.getAuthorities()
        ), "Welcome Librarian! Authorization verified.");
    }

    @GetMapping("/member")
    @PreAuthorize("hasAnyRole('MEMBER', 'LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Member, Librarian, and Admin endpoint")
    public ApiResponse<Map<String, Object>> memberAccess(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.ok(Map.of(
                "authorizedRoles", "ROLE_MEMBER, ROLE_LIBRARIAN, ROLE_ADMIN",
                "caller", userDetails.getUsername(),
                "authorities", userDetails.getAuthorities()
        ), "Welcome Library Member! Authorization verified.");
    }
}
