package com.libraai.notification;

import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.loan.entity.Loan;
import com.libraai.loan.repository.LoanRepository;
import com.libraai.notification.dto.NotificationBatchResultDto;
import com.libraai.notification.dto.NotificationDto;
import com.libraai.notification.service.NotificationService;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Test
    void testSendDueSoonReminder() {
        User user = new User("due_patron_" + System.currentTimeMillis(), "due_patron@example.com", "$2a$10$hash", "Due Patron");
        user = userRepository.save(user);

        Book book = bookRepository.findById(1L).orElseThrow();
        BookCopy copy = bookCopyRepository.findByBookId(book.getId()).get(0);

        Instant tomorrow = Instant.now().plus(1, ChronoUnit.DAYS);
        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBookCopy(copy);
        loan.setDueDate(tomorrow);
        loan.setStatus("ACTIVE");
        loan = loanRepository.save(loan);

        NotificationDto dto = notificationService.sendDueSoonReminder(loan);

        assertNotNull(dto);
        assertEquals("DUE_SOON", dto.getType());
        assertTrue(dto.getTitle().contains("Due Soon"));
        assertTrue(dto.getMessage().contains(book.getTitle()));
        assertFalse(dto.isRead());
        assertEquals(user.getId(), dto.getUserId());
    }

    @Test
    void testSendOverdueAlert() {
        User user = new User("overdue_patron_" + System.currentTimeMillis(), "overdue_patron@example.com", "$2a$10$hash", "Overdue Patron");
        user = userRepository.save(user);

        Book book = bookRepository.findById(1L).orElseThrow();
        BookCopy copy = bookCopyRepository.findByBookId(book.getId()).get(0);

        Instant fiveDaysAgo = Instant.now().minus(5, ChronoUnit.DAYS);
        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBookCopy(copy);
        loan.setDueDate(fiveDaysAgo);
        loan.setStatus("ACTIVE");
        loan = loanRepository.save(loan);

        NotificationDto dto = notificationService.sendOverdueAlert(loan);

        assertNotNull(dto);
        assertEquals("OVERDUE", dto.getType());
        assertTrue(dto.getTitle().contains("Overdue Alert"));
        assertTrue(dto.getMessage().contains("overdue"));
        assertFalse(dto.isRead());
        assertEquals(user.getId(), dto.getUserId());
    }

    @Test
    void testProcessDailyDueReminders_BatchExecutionAndDeduplication() {
        User user = new User("batch_patron_" + System.currentTimeMillis(), "batch_patron@example.com", "$2a$10$hash", "Batch Patron");
        user = userRepository.save(user);

        Book book = bookRepository.findById(1L).orElseThrow();
        List<BookCopy> copies = bookCopyRepository.findByBookId(book.getId());

        // 1. Loan due tomorrow
        Loan dueSoonLoan = new Loan();
        dueSoonLoan.setUser(user);
        dueSoonLoan.setBookCopy(copies.get(0));
        dueSoonLoan.setDueDate(Instant.now().plus(24, ChronoUnit.HOURS));
        dueSoonLoan.setStatus("ACTIVE");
        loanRepository.save(dueSoonLoan);

        // 2. Overdue loan
        Loan overdueLoan = new Loan();
        overdueLoan.setUser(user);
        overdueLoan.setBookCopy(copies.size() > 1 ? copies.get(1) : copies.get(0));
        overdueLoan.setDueDate(Instant.now().minus(3, ChronoUnit.DAYS));
        overdueLoan.setStatus("ACTIVE");
        loanRepository.save(overdueLoan);

        // First run: processes reminders
        NotificationBatchResultDto result = notificationService.processDailyDueReminders();
        assertNotNull(result);
        assertTrue(result.getDueSoonCount() >= 1, "Should send due-soon reminder");
        assertTrue(result.getOverdueCount() >= 1, "Should send overdue alert");

        long unreadCount = notificationService.getUnreadCount(user.getId());
        assertTrue(unreadCount >= 2, "User should receive at least 2 in-app notifications");

        // Second run immediately: deduplication prevents re-notifying within 20h
        NotificationBatchResultDto secondRun = notificationService.processDailyDueReminders();
        assertEquals(0, secondRun.getDueSoonCount(), "Deduplication should prevent sending another due-soon reminder today");
        assertEquals(0, secondRun.getOverdueCount(), "Deduplication should prevent sending another overdue alert today");
    }

    @Test
    void testMarkAsReadAndMarkAllAsRead() {
        User user = new User("read_patron_" + System.currentTimeMillis(), "read_patron@example.com", "$2a$10$hash", "Read Patron");
        user = userRepository.save(user);

        Book book = bookRepository.findById(1L).orElseThrow();
        BookCopy copy = bookCopyRepository.findByBookId(book.getId()).get(0);

        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBookCopy(copy);
        loan.setDueDate(Instant.now().plus(1, ChronoUnit.DAYS));
        loan.setStatus("ACTIVE");
        loan = loanRepository.save(loan);

        NotificationDto n1 = notificationService.sendDueSoonReminder(loan);
        NotificationDto n2 = notificationService.sendOverdueAlert(loan);

        assertEquals(2, notificationService.getUnreadCount(user.getId()));

        // Mark single as read
        notificationService.markAsRead(n1.getId(), user.getId());
        assertEquals(1, notificationService.getUnreadCount(user.getId()));

        // Mark all as read
        notificationService.markAllAsRead(user.getId());
        assertEquals(0, notificationService.getUnreadCount(user.getId()));
    }
}
