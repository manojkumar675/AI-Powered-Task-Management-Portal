package com.taskportal.controller;

import com.taskportal.dto.DashboardStats;
import com.taskportal.entity.User;
import com.taskportal.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics for the authenticated user")
    public ResponseEntity<DashboardStats> getStats(@AuthenticationPrincipal User user) {
        DashboardStats stats = dashboardService.getStats(user.getId());
        return ResponseEntity.ok(stats);
    }
}
