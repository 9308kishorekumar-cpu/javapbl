package com.libraai.importer;

import com.libraai.importer.service.BookImporterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class BookImporterRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BookImporterRunner.class);

    private final BookImporterService importerService;

    @Value("${libraai.importer.auto-start:false}")
    private boolean autoStart;

    @Value("${libraai.importer.target-per-query:50}")
    private int targetPerQuery;

    public BookImporterRunner(BookImporterService importerService) {
        this.importerService = importerService;
    }

    @Override
    public void run(String... args) {
        if (autoStart) {
            log.info("🌟 Auto-start enabled for LibraAI Multilingual Book Importer! Commencing seeding...");
            new Thread(() -> importerService.runImportJob(targetPerQuery, true)).start();
        } else {
            log.info("ℹ️ LibraAI Multilingual Book Importer ready. Trigger via POST /api/v1/admin/import-books or set libraai.importer.auto-start=true");
        }
    }
}
