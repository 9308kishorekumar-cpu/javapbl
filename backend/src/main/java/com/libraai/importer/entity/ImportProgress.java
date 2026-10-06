package com.libraai.importer.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "import_progress", uniqueConstraints = {
        @UniqueConstraint(name = "uq_import_lang_subject", columnNames = {"language", "subject"})
})
public class ImportProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "language", length = 10, nullable = false)
    private String language;

    @Column(name = "subject", length = 50, nullable = false)
    private String subject;

    @Column(name = "last_page", nullable = false)
    private int lastPage = 1;

    @Column(name = "imported_count", nullable = false)
    private int importedCount = 0;

    @Column(name = "skipped_count", nullable = false)
    private int skippedCount = 0;

    @Column(name = "status", length = 30, nullable = false)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, FAILED

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public ImportProgress() {}

    public ImportProgress(String language, String subject) {
        this.language = language;
        this.subject = subject;
        this.lastPage = 1;
        this.importedCount = 0;
        this.skippedCount = 0;
        this.status = "PENDING";
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getLastPage() {
        return lastPage;
    }

    public void setLastPage(int lastPage) {
        this.lastPage = lastPage;
    }

    public int getImportedCount() {
        return importedCount;
    }

    public void setImportedCount(int importedCount) {
        this.importedCount = importedCount;
    }

    public int getSkippedCount() {
        return skippedCount;
    }

    public void setSkippedCount(int skippedCount) {
        this.skippedCount = skippedCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
