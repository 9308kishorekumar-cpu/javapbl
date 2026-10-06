package com.libraai.notification.service;

import com.libraai.book.entity.Author;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.notification.dto.NotificationBatchResultDto;
import com.libraai.notification.dto.NotificationDto;
import com.libraai.notification.entity.Notification;
import com.libraai.notification.repository.NotificationRepository;
import com.libraai.security.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmailNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM dd, yyyy").withZone(ZoneId.systemDefault());

    private final NotificationRepository notificationRepository;
    private final LoanRepository loanRepository;

    public EmailNotificationService(NotificationRepository notificationRepository, LoanRepository loanRepository) {
        this.notificationRepository = notificationRepository;
        this.loanRepository = loanRepository;
    }

    @Override
    public NotificationDto sendDueSoonReminder(Loan loan) {
        User user = loan.getUser();
        BookCopy copy = loan.getBookCopy();
        Book book = copy != null ? copy.getBook() : null;

        String bookTitle = book != null ? book.getTitle() : "Borrowed Book";
        String author = getAuthorString(book);
        String barcode = copy != null ? copy.getBarcode() : "N/A";
        String dueDateStr = loan.getDueDate() != null ? DATE_FORMATTER.format(loan.getDueDate()) : "Tomorrow";

        String title = "Due Soon: \"" + bookTitle + "\" is due on " + dueDateStr;
        String message = String.format(
                "Dear %s, your borrowed loan of \"%s\" by %s (Copy: %s) is due on %s. " +
                "Please return or renew your book on the LibraAI Portal before the due date to avoid late fines.",
                user.getFullName() != null ? user.getFullName() : user.getUsername(),
                bookTitle,
                author,
                barcode,
                dueDateStr
        );

        // 1. Dispatch through dev-mode / placeholder email sender
        dispatchDevEmail(user.getEmail(), user.getFullName(), "LibraAI Courtesy Reminder: Book Due Tomorrow", title, message);

        // 2. Persist in-app Notification record
        Notification notification = new Notification(user, loan, "DUE_SOON", title, message, "EMAIL_AND_IN_APP");
        notification = notificationRepository.save(notification);

        log.info("📧 Due-soon reminder created [ID: {}] for member: @{} (book: {})",
                notification.getId(), user.getUsername(), bookTitle);

        return mapToDto(notification);
    }

    @Override
    public NotificationDto sendOverdueAlert(Loan loan) {
        User user = loan.getUser();
        BookCopy copy = loan.getBookCopy();
        Book book = copy != null ? copy.getBook() : null;

        String bookTitle = book != null ? book.getTitle() : "Borrowed Book";
        String author = getAuthorString(book);
        String barcode = copy != null ? copy.getBarcode() : "N/A";
        String dueDateStr = loan.getDueDate() != null ? DATE_FORMATTER.format(loan.getDueDate()) : "Past Due";

        long daysOverdue = 1;
        if (loan.getDueDate() != null && Instant.now().isAfter(loan.getDueDate())) {
            daysOverdue = Math.max(1, Duration.between(loan.getDueDate(), Instant.now()).toDays());
        }

        String title = "Overdue Alert: \"" + bookTitle + "\" is " + daysOverdue + " day(s) overdue!";
        String message = String.format(
                "URGENT: Dear %s, the loan for \"%s\" by %s (Copy: %s) was due on %s and is now %d day(s) overdue. " +
                "Daily late fines (₹1.00/day) may apply. Please return the book to the circulation desk immediately or contact staff.",
                user.getFullName() != null ? user.getFullName() : user.getUsername(),
                bookTitle,
                author,
                barcode,
                dueDateStr,
                daysOverdue
        );

        // 1. Dispatch through dev-mode / placeholder email sender
        dispatchDevEmail(user.getEmail(), user.getFullName(), "LibraAI URGENT Alert: Book Overdue", title, message);

        // 2. Persist in-app Notification record
        Notification notification = new Notification(user, loan, "OVERDUE", title, message, "EMAIL_AND_IN_APP");
        notification = notificationRepository.save(notification);

        log.warn("⚠️ Overdue alert created [ID: {}] for member: @{} (book: {}, days overdue: {})",
                notification.getId(), user.getUsername(), bookTitle, daysOverdue);

        return mapToDto(notification);
    }

    @Override
    public NotificationBatchResultDto processDailyDueReminders() {
        Instant now = Instant.now();
        Instant tomorrowWindowEnd = now.plus(48, ChronoUnit.HOURS);
        Instant deduplicationCutoff = now.minus(20, ChronoUnit.HOURS);

        log.info("⏰ Starting scheduled due-date reminder and overdue scan...");

        // 1. Scan active loans due soon (between now and +48 hours)
        List<Loan> dueSoonLoans = loanRepository.findActiveLoansDueBetween(now, tomorrowWindowEnd);
        int dueSoonCount = 0;

        for (Loan loan : dueSoonLoans) {
            boolean alreadyNotified = notificationRepository.existsByLoanIdAndTypeAndSentAtAfter(
                    loan.getId(), "DUE_SOON", deduplicationCutoff);
            if (!alreadyNotified) {
                sendDueSoonReminder(loan);
                dueSoonCount++;
            }
        }

        // 2. Scan active overdue loans (due before now)
        List<Loan> overdueLoans = loanRepository.findActiveOverdueLoans(now);
        int overdueCount = 0;

        for (Loan loan : overdueLoans) {
            boolean alreadyNotified = notificationRepository.existsByLoanIdAndTypeAndSentAtAfter(
                    loan.getId(), "OVERDUE", deduplicationCutoff);
            if (!alreadyNotified) {
                sendOverdueAlert(loan);
                overdueCount++;
            }
        }

        int totalProcessed = dueSoonCount + overdueCount;
        String statusMsg = String.format("Processed due-date reminders: %d due soon reminders, %d overdue alerts sent.",
                dueSoonCount, overdueCount);

        log.info("✅ Finished scheduled notification batch: {}", statusMsg);
        return new NotificationBatchResultDto(dueSoonCount, overdueCount, totalProcessed, statusMsg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(Long userId, int limit) {
        PageRequest pageRequest = PageRequest.of(0, Math.min(Math.max(limit, 1), 50));
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId, pageRequest)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser() != null && n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    /**
     * Dev-mode / placeholder email dispatcher.
     * Logs structured email payload so demos work cleanly without external SMTP infrastructure.
     */
    private void dispatchDevEmail(String recipientEmail, String recipientName, String subject, String header, String body) {
        String emailBanner = String.format(
                "\n================================================================================\n" +
                "📬 [EMAIL DISPATCH - DEV SENDER]\n" +
                "To: %s <%s>\n" +
                "Subject: %s\n" +
                "Timestamp: %s\n" +
                "--------------------------------------------------------------------------------\n" +
                "Header: %s\n\n" +
                "%s\n" +
                "================================================================================",
                recipientName != null ? recipientName : "Patron",
                recipientEmail != null ? recipientEmail : "unknown@library.local",
                subject,
                DATE_FORMATTER.format(Instant.now()),
                header,
                body
        );
        log.info(emailBanner);
    }

    private String getAuthorString(Book book) {
        if (book == null || book.getAuthors() == null || book.getAuthors().isEmpty()) {
            return "Unknown Author";
        }
        return book.getAuthors().stream()
                .map(Author::getName)
                .collect(Collectors.joining(", "));
    }

    private NotificationDto mapToDto(Notification n) {
        Loan loan = n.getLoan();
        BookCopy copy = loan != null ? loan.getBookCopy() : null;
        Book book = copy != null ? copy.getBook() : null;

        return new NotificationDto(
                n.getId(),
                n.getUser() != null ? n.getUser().getId() : null,
                n.getUser() != null ? n.getUser().getUsername() : null,
                loan != null ? loan.getId() : null,
                book != null ? book.getTitle() : null,
                getAuthorString(book),
                copy != null ? copy.getBarcode() : null,
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.getChannel(),
                n.isRead(),
                n.getSentAt(),
                n.getCreatedAt()
        );
    }
}
