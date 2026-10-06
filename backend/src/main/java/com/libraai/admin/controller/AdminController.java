package com.libraai.admin.controller;

import com.libraai.admin.dto.*;
import com.libraai.admin.service.AdminService;
import com.libraai.common.dto.ApiResponse;
import com.libraai.importer.dto.SeedingReportDto;
import com.libraai.importer.service.BookImporterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Console & System Config", description = "Endpoints for user management, role assignments, membership status, dynamic system rules, and catalog seed importer")
public class AdminController {

    private final AdminService adminService;
    private final BookImporterService importerService;

    public AdminController(AdminService adminService, BookImporterService importerService) {
        this.adminService = adminService;
        this.importerService = importerService;
    }

    @GetMapping("/users")
    @Operation(summary = "List All System Users", description = "Administrative view of all registered accounts, roles, and membership statuses")
    public ApiResponse<Page<UserManagementDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserManagementDto> users = adminService.getAllUsers(pageable);
        return ApiResponse.ok(users, "Users retrieved successfully");
    }

    @PutMapping("/users/{id}/roles")
    @Operation(summary = "Update User Roles", description = "Assigns or revokes RBAC roles (ADMIN, LIBRARIAN, MEMBER) for an account")
    public ApiResponse<UserManagementDto> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UserManagementDto updated = adminService.updateUserRoles(id, request, userDetails.getUsername());
        return ApiResponse.ok(updated, "User roles updated successfully");
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update Membership Status", description = "Updates status to ACTIVE, SUSPENDED, or INACTIVE")
    public ApiResponse<UserManagementDto> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UserManagementDto updated = adminService.updateUserStatus(id, request, userDetails.getUsername());
        return ApiResponse.ok(updated, "User status updated successfully");
    }

    @GetMapping("/config")
    @Operation(summary = "Get System Configuration", description = "Retrieves active operational rules: loan period, daily fine rate, and borrowing limits")
    public ApiResponse<SystemConfigDto> getSystemConfig() {
        SystemConfigDto config = adminService.getSystemConfig();
        return ApiResponse.ok(config, "System configuration retrieved");
    }

    @PutMapping("/config")
    @Operation(summary = "Update Dynamic System Rules", description = "Modifies loan period, daily fine rate, or maximum borrowing limits dynamically")
    public ApiResponse<SystemConfigDto> updateSystemConfig(
            @Valid @RequestBody UpdateSystemConfigRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        SystemConfigDto updated = adminService.updateSystemConfig(request, userDetails.getUsername());
        return ApiResponse.ok(updated, "System configuration updated successfully");
    }

    @PostMapping("/import-books")
    @Operation(summary = "Trigger Multilingual Catalog Seeder Job", description = "Executes the resumable external API book seeder across 20 languages and multiple subjects")
    public ApiResponse<SeedingReportDto> triggerImportJob(
            @RequestParam(defaultValue = "50") int targetPerQuery,
            @RequestParam(defaultValue = "true") boolean resume) {

        SeedingReportDto report = importerService.runImportJob(targetPerQuery, resume);
        return ApiResponse.ok(report, "Multilingual book import job executed successfully");
    }

    @GetMapping("/import-status")
    @Operation(summary = "Get Catalog Ingestion Status & Report", description = "Returns live progress or latest report of the catalog import job")
    public ApiResponse<SeedingReportDto> getImportStatus() {
        SeedingReportDto report = importerService.getCurrentStatus();
        return ApiResponse.ok(report, "Ingestion status retrieved");
    }
}
