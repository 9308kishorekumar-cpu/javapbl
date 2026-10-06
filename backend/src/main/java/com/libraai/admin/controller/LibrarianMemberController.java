package com.libraai.admin.controller;

import com.libraai.admin.dto.MemberDetailDto;
import com.libraai.admin.service.LibrarianMemberService;
import com.libraai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/librarian")
@Tag(name = "Librarian Member Intelligence", description = "Consolidated endpoints for librarian-facing patron dossiers and circulation telemetry")
public class LibrarianMemberController {

    private final LibrarianMemberService librarianMemberService;

    public LibrarianMemberController(LibrarianMemberService librarianMemberService) {
        this.librarianMemberService = librarianMemberService;
    }

    @GetMapping("/members/{id}/detail")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Get Consolidated Member Dossier",
            description = "Single-call endpoint delivering member profile, overdue risk heuristics, lifetime stats, active loans, filterable borrowing history, ratings, and reservations")
    public ApiResponse<MemberDetailDto> getMemberDetail(
            @PathVariable Long id,
            @Parameter(description = "Optional filter: history issue date >= from (ISO-8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @Parameter(description = "Optional filter: history issue date <= to (ISO-8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @Parameter(description = "Optional filter: loan status (ACTIVE, RETURNED, OVERDUE, LOST)")
            @RequestParam(required = false) String status) {

        MemberDetailDto detail = librarianMemberService.getMemberDetail(id, from, to, status);
        return ApiResponse.ok(detail, "Member dossier retrieved successfully");
    }
}
