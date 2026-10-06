package com.libraai.notification.service;

import com.libraai.loan.entity.Loan;
import com.libraai.notification.dto.NotificationBatchResultDto;
import com.libraai.notification.dto.NotificationDto;

import java.util.List;

public interface NotificationService {

    NotificationDto sendDueSoonReminder(Loan loan);

    NotificationDto sendOverdueAlert(Loan loan);

    NotificationBatchResultDto processDailyDueReminders();

    List<NotificationDto> getNotificationsForUser(Long userId, int limit);

    long getUnreadCount(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);
}
