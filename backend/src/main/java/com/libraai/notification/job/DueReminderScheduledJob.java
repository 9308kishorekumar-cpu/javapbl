package com.libraai.notification.job;

import com.libraai.notification.dto.NotificationBatchResultDto;
import com.libraai.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "libraai.notifications.enabled", havingValue = "true", matchIfMissing = true)
public class DueReminderScheduledJob {

    private static final Logger log = LoggerFactory.getLogger(DueReminderScheduledJob.class);

    private final NotificationService notificationService;

    public DueReminderScheduledJob(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Daily scheduled cron job. Default: runs once daily at 8:00 AM.
     */
    @Scheduled(cron = "${libraai.notifications.cron:0 0 8 * * ?}")
    public void executeDailyDueReminders() {
        log.info("⏰ [DueReminderScheduledJob] Triggering automated daily loan reminder scan...");
        try {
            NotificationBatchResultDto result = notificationService.processDailyDueReminders();
            log.info("✅ [DueReminderScheduledJob] Daily scan complete: {} due-soon, {} overdue alerts sent.",
                    result.getDueSoonCount(), result.getOverdueCount());
        } catch (Exception e) {
            log.error("❌ [DueReminderScheduledJob] Failed to execute daily loan reminders job: {}", e.getMessage(), e);
        }
    }
}
