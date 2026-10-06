package com.libraai.notification.controller;

import com.libraai.common.dto.ApiResponse;
import com.libraai.common.exception.ResourceNotFoundException;
import com.libraai.notification.dto.NotificationBatchResultDto;
import com.libraai.notification.dto.NotificationDto;
import com.libraai.notification.service.NotificationService;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notification Subsystem", description = "Endpoints for due-date reminders, overdue alerts, and in-app notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Get User Notifications", description = "Returns latest in-app notifications for the authenticated user")
    public ApiResponse<List<NotificationDto>> getUserNotifications(
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ApiResponse.ok(Collections.emptyList(), "Unauthenticated");
        }
        User user = getUser(userDetails.getUsername());
        List<NotificationDto> notifications = notificationService.getNotificationsForUser(user.getId(), limit);
        return ApiResponse.ok(notifications, "Notifications retrieved successfully");
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get Unread Notification Count", description = "Returns count of unread due-soon and overdue alerts for badge counter")
    public ApiResponse<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ApiResponse.ok(Map.of("unreadCount", 0L), "Unauthenticated");
        }
        User user = getUser(userDetails.getUsername());
        long count = notificationService.getUnreadCount(user.getId());
        return ApiResponse.ok(Map.of("unreadCount", count), "Unread count retrieved");
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark Notification As Read", description = "Marks a specific notification as read")
    public ApiResponse<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            User user = getUser(userDetails.getUsername());
            notificationService.markAsRead(id, user.getId());
        }
        return ApiResponse.ok(null, "Notification marked as read");
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark All Notifications As Read", description = "Clears unread status for all notifications belonging to the user")
    public ApiResponse<Void> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            User user = getUser(userDetails.getUsername());
            notificationService.markAllAsRead(user.getId());
        }
        return ApiResponse.ok(null, "All notifications marked as read");
    }

    @PostMapping("/trigger-job")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN', 'MEMBER')")
    @Operation(summary = "Manually Trigger Due Reminders Job", description = "Dev & test endpoint to immediately run the daily due-date reminder scan")
    public ApiResponse<NotificationBatchResultDto> triggerDailyRemindersJob() {
        NotificationBatchResultDto result = notificationService.processDailyDueReminders();
        return ApiResponse.ok(result, result.getStatusMessage());
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
}
