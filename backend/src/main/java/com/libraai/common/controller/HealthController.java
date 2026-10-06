package com.libraai.common.controller;

import com.libraai.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health & Diagnostics", description = "Endpoints for health checks and system telemetry")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final Environment environment;

    @Value("${libraai.features.nlu-search:true}")
    private boolean nluSearchEnabled;

    @Value("${libraai.features.semantic-search:true}")
    private boolean semanticSearchEnabled;

    @Value("${libraai.features.recommendations:true}")
    private boolean recommendationsEnabled;

    @Value("${libraai.features.ocr-intake:true}")
    private boolean ocrIntakeEnabled;

    @Value("${libraai.features.risk-scoring:true}")
    private boolean riskScoringEnabled;

    public HealthController(JdbcTemplate jdbcTemplate, Environment environment) {
        this.jdbcTemplate = jdbcTemplate;
        this.environment = environment;
    }

    @GetMapping
    @Operation(summary = "System Health and Feature Flags Status", description = "Checks database connectivity, JVM status, and enabled feature modules.")
    public ApiResponse<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("app", "LibraAI - Library Management System");
        health.put("timestamp", Instant.now().toString());
        health.put("uptimeMs", ManagementFactory.getRuntimeMXBean().getUptime());
        health.put("activeProfiles", Arrays.asList(environment.getActiveProfiles()));

        // Check database
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            health.put("database", Map.of("status", "UP", "connectivity", result != null && result == 1 ? "HEALTHY" : "UNKNOWN"));
        } catch (Exception ex) {
            health.put("database", Map.of("status", "DOWN", "error", ex.getMessage()));
        }

        // Feature flags
        health.put("features", Map.of(
                "nluSearch", nluSearchEnabled,
                "semanticSearch", semanticSearchEnabled,
                "recommendations", recommendationsEnabled,
                "ocrIntake", ocrIntakeEnabled,
                "riskScoring", riskScoringEnabled
        ));

        return ApiResponse.ok(health, "System is healthy and operational");
    }

    @GetMapping("/ping")
    @Operation(summary = "Simple Ping Endpoint")
    public ApiResponse<String> ping() {
        return ApiResponse.ok("pong", "LibraAI Backend is alive");
    }
}
