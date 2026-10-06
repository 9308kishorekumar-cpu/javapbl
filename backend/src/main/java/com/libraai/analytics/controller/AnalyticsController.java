package com.libraai.analytics.controller;

import com.libraai.analytics.dto.AuditLogDto;
import com.libraai.analytics.dto.BookDemandPredictionDto;
import com.libraai.analytics.dto.DashboardStatsDto;
import com.libraai.analytics.dto.MemberOverdueRiskDto;
import com.libraai.analytics.service.AnalyticsService;
import com.libraai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics & System Telemetry", description = "Endpoints for library usage reports, predictive demand, overdue risk heuristics, and audit trails")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Get Dashboard KPI Metrics", description = "Aggregates inventory counts, active circulations, overdue rate, fine revenues, and category breakdown")
    public ApiResponse<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = analyticsService.getDashboardStats();
        return ApiResponse.ok(stats, "Dashboard metrics retrieved successfully");
    }

    @GetMapping("/predictions")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Get Popularity & Demand Predictions", description = "Heuristic trailing-demand ranking with recommended copy acquisitions for collection planning")
    public ApiResponse<List<BookDemandPredictionDto>> getPopularityPredictions(
            @RequestParam(defaultValue = "10") int limit) {
        List<BookDemandPredictionDto> predictions = analyticsService.getPopularityPredictions(limit);
        return ApiResponse.ok(predictions, "Popularity and demand predictions retrieved successfully");
    }

    @GetMapping("/overdue-risk")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Get Member Overdue Risk Profiles", description = "Heuristic risk evaluation (LOW/MEDIUM/HIGH) based on late return frequency, delay duration, and fine balances")
    public ApiResponse<List<MemberOverdueRiskDto>> getOverdueRisks() {
        List<MemberOverdueRiskDto> riskProfiles = analyticsService.getAllMemberOverdueRisks();
        return ApiResponse.ok(riskProfiles, "Member overdue risk profiles retrieved successfully");
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Get System Audit Log Stream", description = "Returns recent administrative, security, and circulation events")
    public ApiResponse<List<AuditLogDto>> getAuditLogs() {
        List<AuditLogDto> logs = analyticsService.getRecentAuditLogs();
        return ApiResponse.ok(logs, "Audit logs retrieved successfully");
    }
}
