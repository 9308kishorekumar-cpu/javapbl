package com.libraai.importer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.libraai.book.entity.Author;
import com.libraai.book.entity.Book;
import com.libraai.book.entity.BookCopy;
import com.libraai.book.entity.Category;
import com.libraai.book.repository.AuthorRepository;
import com.libraai.book.repository.BookCopyRepository;
import com.libraai.book.repository.BookRepository;
import com.libraai.book.repository.CategoryRepository;
import com.libraai.importer.dto.SeedingReportDto;
import com.libraai.importer.entity.ImportProgress;
import com.libraai.importer.repository.ImportProgressRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class BookImporterService {

    private static final Logger log = LoggerFactory.getLogger(BookImporterService.class);

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final ImportProgressRepository progressRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final Map<String, Integer> currentLanguageStats = new ConcurrentHashMap<>();
    private final Map<String, Integer> currentCategoryStats = new ConcurrentHashMap<>();
    private int totalImportedCount = 0;
    private int totalSkippedCount = 0;
    private Instant jobStartTime;
    private SeedingReportDto lastReport;

    // Language Specification Map: ISO 639-1 -> Open Library 3-letter Code & Name
    public static class LangSpec {
        public final String isoCode;
        public final String olCode;
        public final String englishName;

        public LangSpec(String isoCode, String olCode, String englishName) {
            this.isoCode = isoCode;
            this.olCode = olCode;
            this.englishName = englishName;
        }
    }

    public static final List<LangSpec> SUPPORTED_LANGUAGES = List.of(
            new LangSpec("en", "eng", "English"),
            new LangSpec("hi", "hin", "Hindi"),
            new LangSpec("ta", "tam", "Tamil"),
            new LangSpec("es", "spa", "Spanish"),
            new LangSpec("fr", "fre", "French"),
            new LangSpec("de", "ger", "German"),
            new LangSpec("ja", "jpn", "Japanese"),
            new LangSpec("zh", "chi", "Chinese"),
            new LangSpec("ar", "ara", "Arabic"),
            new LangSpec("ru", "rus", "Russian"),
            new LangSpec("bn", "ben", "Bengali"),
            new LangSpec("te", "tel", "Telugu"),
            new LangSpec("ko", "kor", "Korean"),
            new LangSpec("it", "ita", "Italian"),
            new LangSpec("pt", "por", "Portuguese"),
            new LangSpec("tr", "tur", "Turkish"),
            new LangSpec("nl", "dut", "Dutch"),
            new LangSpec("el", "gre", "Greek"),
            new LangSpec("la", "lat", "Latin"),
            new LangSpec("sa", "san", "Sanskrit")
    );

    public static final List<String> SUBJECTS = List.of(
            "fiction", "science", "history", "poetry", "biography", "philosophy"
    );

    public BookImporterService(BookRepository bookRepository,
                               BookCopyRepository bookCopyRepository,
                               CategoryRepository categoryRepository,
                               AuthorRepository authorRepository,
                               ImportProgressRepository progressRepository,
                               RestTemplateBuilder restTemplateBuilder,
                               ObjectMapper objectMapper) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.categoryRepository = categoryRepository;
        this.authorRepository = authorRepository;
        this.progressRepository = progressRepository;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(20))
                .build();
        this.objectMapper = objectMapper;
    }

    public synchronized SeedingReportDto runImportJob(int targetPerQuery, boolean resume) {
        if (isRunning.get()) {
            return getCurrentStatus();
        }

        isRunning.set(true);
        jobStartTime = Instant.now();
        totalImportedCount = 0;
        totalSkippedCount = 0;
        currentLanguageStats.clear();
        currentCategoryStats.clear();

        log.info("🚀 Starting Multilingual Book Seeding Job across {} languages and {} subjects...",
                SUPPORTED_LANGUAGES.size(), SUBJECTS.size());

        try {
            // 1. Process Online API Ingestion across all languages & subjects
            for (LangSpec lang : SUPPORTED_LANGUAGES) {
                for (String subject : SUBJECTS) {
                    processLanguageSubjectQuery(lang, subject, targetPerQuery, resume);
                }
            }

            // 2. Also ensure curated canonical classic works in authentic native scripts for all 20 languages
            seedCanonicalMultilingualClassics();

            double duration = Duration.between(jobStartTime, Instant.now()).toMillis() / 1000.0;
            lastReport = new SeedingReportDto(
                    totalImportedCount,
                    totalSkippedCount,
                    (int) bookCopyRepository.count(),
                    currentLanguageStats.size(),
                    new HashMap<>(currentLanguageStats),
                    new HashMap<>(currentCategoryStats),
                    duration,
                    "COMPLETED"
            );

            log.info("✨ Seeding Job Finished Successfully! Total Imported: {}, Total Skipped: {}, Languages: {}",
                    totalImportedCount, totalSkippedCount, currentLanguageStats.size());
            logSeedingReport(lastReport);

            return lastReport;
        } catch (Exception e) {
            log.error("❌ Seeding Job Encountered Error: {}", e.getMessage(), e);
            double duration = Duration.between(jobStartTime, Instant.now()).toMillis() / 1000.0;
            lastReport = new SeedingReportDto(
                    totalImportedCount,
                    totalSkippedCount,
                    (int) bookCopyRepository.count(),
                    currentLanguageStats.size(),
                    new HashMap<>(currentLanguageStats),
                    new HashMap<>(currentCategoryStats),
                    duration,
                    "FAILED: " + e.getMessage()
            );
            return lastReport;
        } finally {
            isRunning.set(false);
        }
    }

    private void processLanguageSubjectQuery(LangSpec lang, String subject, int targetPerQuery, boolean resume) {
        ImportProgress progress = progressRepository.findByLanguageAndSubject(lang.isoCode, subject)
                .orElseGet(() -> new ImportProgress(lang.isoCode, subject));

        if (resume && "COMPLETED".equals(progress.getStatus()) && progress.getImportedCount() >= targetPerQuery) {
            log.debug("Skipping already completed query: {}/{}", lang.isoCode, subject);
            return;
        }

        progress.setStatus("IN_PROGRESS");
        saveProgress(progress);

        int page = resume ? progress.getLastPage() : 1;
        int maxPages = Math.max(1, (targetPerQuery + 49) / 50);

        while (page <= maxPages) {
            try {
                String url = String.format(
                        "https://openlibrary.org/search.json?q=language:%s+subject:%s&limit=50&page=%d&fields=title,author_name,first_publish_year,isbn,subject,key,first_sentence",
                        lang.olCode, subject, page
                );

                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "LibraAI-CatalogSeeder/1.0 (contact@libraai.local)");
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode docs = root.path("docs");

                    if (docs.isArray() && docs.size() > 0) {
                        for (JsonNode doc : docs) {
                            boolean imported = importSingleBookRecord(doc, lang.isoCode, subject);
                            if (imported) {
                                progress.setImportedCount(progress.getImportedCount() + 1);
                                totalImportedCount++;
                                currentLanguageStats.merge(lang.isoCode, 1, Integer::sum);
                                currentCategoryStats.merge(capitalize(subject), 1, Integer::sum);
                            } else {
                                progress.setSkippedCount(progress.getSkippedCount() + 1);
                                totalSkippedCount++;
                            }
                        }
                    } else {
                        break; // No more docs
                    }
                }

                progress.setLastPage(page);
                saveProgress(progress);

                // Rate limiting pause
                Thread.sleep(250);
                page++;
            } catch (Exception ex) {
                log.warn("Notice while fetching {}/{}: {}", lang.isoCode, subject, ex.getMessage());
                break;
            }
        }

        progress.setStatus("COMPLETED");
        saveProgress(progress);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean importSingleBookRecord(JsonNode doc, String language, String defaultSubject) {
        String title = doc.path("title").asText("").trim();
        if (title.isBlank()) {
            return false;
        }

        JsonNode authorsNode = doc.path("author_name");
        List<String> authorNames = new ArrayList<>();
        if (authorsNode.isArray()) {
            for (JsonNode a : authorsNode) {
                String name = a.asText("").trim();
                if (!name.isBlank()) authorNames.add(name);
            }
        }
        if (authorNames.isEmpty()) {
            authorNames.add("Various Authors");
        }

        // ISBN resolution & deduplication
        String rawIsbn = null;
        JsonNode isbnNode = doc.path("isbn");
        if (isbnNode.isArray() && isbnNode.size() > 0) {
            rawIsbn = isbnNode.get(0).asText("").trim();
        }

        String cleanIsbn;
        if (rawIsbn != null && !rawIsbn.isBlank()) {
            cleanIsbn = rawIsbn.replaceAll("[^a-zA-Z0-9-]", "");
            if (cleanIsbn.length() < 5) {
                cleanIsbn = "OL-" + doc.path("key").asText(UUID.randomUUID().toString()).replace("/works/", "");
            }
        } else {
            cleanIsbn = "OL-" + doc.path("key").asText(UUID.randomUUID().toString()).replace("/works/", "");
        }

        if (cleanIsbn.length() > 20) {
            cleanIsbn = cleanIsbn.substring(0, 20);
        }

        if (bookRepository.existsByIsbn(cleanIsbn)) {
            return false;
        }

        Integer publishYear = null;
        if (doc.has("first_publish_year") && doc.path("first_publish_year").isInt()) {
            int yr = doc.path("first_publish_year").asInt();
            if (yr > 0 && yr <= 2026) {
                publishYear = yr;
            }
        }

        String summary = null;
        if (doc.has("first_sentence") && doc.path("first_sentence").isArray() && doc.path("first_sentence").size() > 0) {
            summary = doc.path("first_sentence").get(0).asText("").trim();
        }
        if (summary == null || summary.isBlank()) {
            summary = "Classic library edition in " + language.toUpperCase() + " covering " + defaultSubject + ".";
        }

        // Category resolution
        String catName = capitalize(defaultSubject);
        Category category = categoryRepository.findByNameIgnoreCase(catName)
                .orElseGet(() -> categoryRepository.save(new Category(catName, catName + " collection")));

        // Author resolution
        Set<Author> authors = new HashSet<>();
        for (String aname : authorNames) {
            Author author = authorRepository.findByNameIgnoreCase(aname)
                    .orElseGet(() -> authorRepository.save(new Author(aname, null)));
            authors.add(author);
        }

        Book book = new Book(
                title.length() > 255 ? title.substring(0, 255) : title,
                cleanIsbn,
                publishYear != null ? publishYear : 2020,
                summary,
                category,
                language,
                language,
                null
        );
        book.setAuthors(authors);

        Book saved = bookRepository.save(book);

        // Seed 1-2 physical barcode copies
        int copies = (Math.abs(cleanIsbn.hashCode()) % 3) + 1;
        for (int i = 1; i <= copies; i++) {
            String safeBarcode = "BC-" + cleanIsbn.replaceAll("[^a-zA-Z0-9]", "") + "-" + String.format("%03d", i);
            if (safeBarcode.length() > 50) {
                safeBarcode = safeBarcode.substring(0, 50);
            }
            if (!bookCopyRepository.existsByBarcode(safeBarcode)) {
                BookCopy copy = new BookCopy(saved, safeBarcode, "Good condition", "AVAILABLE");
                bookCopyRepository.save(copy);
            }
        }

        return true;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveProgress(ImportProgress progress) {
        progress.setUpdatedAt(Instant.now());
        progressRepository.save(progress);
    }

    /**
     * Seeds essential canonical multilingual classic masterworks in native scripts
     * across all 20 languages to ensure comprehensive catalog coverage.
     */
    @Transactional
    public void seedCanonicalMultilingualClassics() {
        List<CanonicalBookSpec> canonicals = getCanonicalMultilingualDataset();
        for (CanonicalBookSpec spec : canonicals) {
            if (!bookRepository.existsByIsbn(spec.isbn)) {
                Category cat = categoryRepository.findByNameIgnoreCase(spec.category)
                        .orElseGet(() -> categoryRepository.save(new Category(spec.category, spec.category + " collection")));

                Author author = authorRepository.findByNameIgnoreCase(spec.author)
                        .orElseGet(() -> authorRepository.save(new Author(spec.author, null)));

                Book book = new Book(
                        spec.title,
                        spec.isbn,
                        spec.year,
                        spec.summary,
                        cat,
                        spec.language,
                        spec.originalLanguage,
                        null
                );
                book.setAuthors(Set.of(author));
                Book saved = bookRepository.save(book);

                String barcode = "BC-" + spec.isbn.replaceAll("[^a-zA-Z0-9]", "") + "-001";
                if (!bookCopyRepository.existsByBarcode(barcode)) {
                    bookCopyRepository.save(new BookCopy(saved, barcode, "Mint condition", "AVAILABLE"));
                }

                totalImportedCount++;
                currentLanguageStats.merge(spec.language, 1, Integer::sum);
                currentCategoryStats.merge(spec.category, 1, Integer::sum);
            }
        }
    }

    public SeedingReportDto getCurrentStatus() {
        double duration = jobStartTime != null ? Duration.between(jobStartTime, Instant.now()).toMillis() / 1000.0 : 0.0;
        return new SeedingReportDto(
                totalImportedCount,
                totalSkippedCount,
                (int) bookCopyRepository.count(),
                currentLanguageStats.size(),
                new HashMap<>(currentLanguageStats),
                new HashMap<>(currentCategoryStats),
                duration,
                isRunning.get() ? "IN_PROGRESS" : (lastReport != null ? lastReport.getStatus() : "IDLE")
        );
    }

    private void logSeedingReport(SeedingReportDto r) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n=======================================================\n");
        sb.append("         LIBRAAI MULTILINGUAL SEEDING REPORT           \n");
        sb.append("=======================================================\n");
        sb.append(String.format("Total Books Imported:    %d\n", r.getTotalImported()));
        sb.append(String.format("Total Skipped (Dup/Bad): %d\n", r.getTotalSkipped()));
        sb.append(String.format("Total Copies Seeded:     %d\n", r.getTotalCopiesSeeded()));
        sb.append(String.format("Languages Covered:       %d\n", r.getLanguagesCoveredCount()));
        sb.append(String.format("Duration (seconds):      %.2f s\n", r.getDurationSeconds()));
        sb.append("-------------------------------------------------------\n");
        sb.append("PER-LANGUAGE BREAKDOWN:\n");
        r.getLanguageBreakdown().forEach((lang, count) ->
                sb.append(String.format("  • %-5s : %d books\n", lang.toUpperCase(), count))
        );
        sb.append("-------------------------------------------------------\n");
        sb.append("CATEGORY BREAKDOWN:\n");
        r.getCategoryBreakdown().forEach((cat, count) ->
                sb.append(String.format("  • %-15s : %d books\n", cat, count))
        );
        sb.append("=======================================================\n");
        log.info(sb.toString());
    }

    private String capitalize(String str) {
        if (str == null || str.isBlank()) return "General";
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    private static class CanonicalBookSpec {
        String title;
        String author;
        String isbn;
        int year;
        String category;
        String language;
        String originalLanguage;
        String summary;

        CanonicalBookSpec(String title, String author, String isbn, int year, String category,
                          String language, String originalLanguage, String summary) {
            this.title = title;
            this.author = author;
            this.isbn = isbn;
            this.year = year;
            this.category = category;
            this.language = language;
            this.originalLanguage = originalLanguage;
            this.summary = summary;
        }
    }

    private List<CanonicalBookSpec> getCanonicalMultilingualDataset() {
        return List.of(
                // Tamil (ta)
                new CanonicalBookSpec("பொன்னியின் செல்வன் (Ponniyin Selvan)", "கல்கி (Kalki)", "978-8184760011", 1954, "Fiction", "ta", "ta", "Celebrated historical fiction novel revolving around Vandiyathevan and the Chola empire."),
                new CanonicalBookSpec("திருக்குறள் (Thirukkural)", "திருவள்ளுவர் (Thiruvalluvar)", "978-8184760028", 300, "Philosophy", "ta", "ta", "Classic Tamil text of 1,330 couplets on ethics, virtue, wealth, and love."),
                new CanonicalBookSpec("சிலப்பதிகாரம் (Silapathikaram)", "இளங்கோ அடிகள் (Ilango Adigal)", "978-8184760035", 500, "Poetry", "ta", "ta", "One of the Five Great Epics of Tamil literature concerning Kannagi and Kovalan."),
                new CanonicalBookSpec("பாரதியார் கவிதைகள் (Bharathiyar Kavithaigal)", "சுப்பிரமணிய பாரதி (Subramania Bharati)", "978-8184760042", 1920, "Poetry", "ta", "ta", "Patriotic and spiritual verses of national poet Mahakavi Subramania Bharati."),
                new CanonicalBookSpec("சிவகாமியின் சபதம் (Sivagamiyin Sabatham)", "கல்கி (Kalki)", "978-8184760059", 1944, "History", "ta", "ta", "Historical romance novel centering on the Pallava kingdom of Kanchipuram."),

                // Hindi (hi)
                new CanonicalBookSpec("गोदान (Godan)", "मुंशी प्रेमचंद (Munshi Premchand)", "978-8170280019", 1936, "Fiction", "hi", "hi", "Masterpiece of Hindi literature depicting socioeconomic deprivation of rural peasantry."),
                new CanonicalBookSpec("मधुशाला (Madhushala)", "हरिवंश राय बच्चन (Harivansh Rai Bachchan)", "978-8170280026", 1935, "Poetry", "hi", "hi", "Classic 135-quatrain allegorical poem exploring philosophical inquiries."),
                new CanonicalBookSpec("राग दरबारी (Raag Darbari)", "श्रीलाल शुक्ल (Shrilal Shukla)", "978-8170280033", 1968, "Fiction", "hi", "hi", "Satirical novel exposing post-independence political and social decay."),
                new CanonicalBookSpec("कामायनी (Kamayani)", "जयशंकर प्रसाद (Jaishankar Prasad)", "978-8170280040", 1936, "Poetry", "hi", "hi", "Great Hindi epic poem blending allegorical psychology and spiritual metaphysics."),
                new CanonicalBookSpec("गुनाहों का देवता (Gunahon Ka Devta)", "धर्मवीर भारती (Dharamvir Bharati)", "978-8170280057", 1949, "Fiction", "hi", "hi", "Deeply emotional narrative of unexpressed platonic love and moral dilemmas."),

                // Bengali (bn)
                new CanonicalBookSpec("গীতাঞ্জলি (Gitanjali)", "রবীন্দ্রনাথ ঠাকুর (Rabindranath Tagore)", "978-8170280101", 1910, "Poetry", "bn", "bn", "Nobel Prize-winning lyrical collection of deeply devotional poetry."),
                new CanonicalBookSpec("পথের পাঁচালী (Pather Panchali)", "বিভূতিভূষণ বন্দ্যোপাধ্যায় (Bibhutibhushan Bandyopadhyay)", "978-8170280118", 1929, "Fiction", "bn", "bn", "Iconic bildungsroman about young Apu growing up in rural Bengal."),
                new CanonicalBookSpec("দেবদাস (Devdas)", "শরৎচন্দ্র চট্টোপাধ্যায় (Sarat Chandra Chattopadhyay)", "978-8170280125", 1917, "Fiction", "bn", "bn", "Timeless romance novel about tragedy, passion, and fate."),

                // Telugu (te)
                new CanonicalBookSpec("మహాప్రస్థానం (Maha Prasthanam)", "శ్రీశ్రీ (Sri Sri)", "978-8170280200", 1950, "Poetry", "te", "te", "Pioneering revolutionary Telugu anthology of progressive poetry."),
                new CanonicalBookSpec("వేయి పడగలు (Veyi Padagalu)", "విశ్వనాథ సత్యనారాయణ (Viswanatha Satyanarayana)", "978-8170280217", 1934, "Fiction", "te", "te", "Magnum opus novel illustrating South Indian cultural traditions."),
                new CanonicalBookSpec("కన్యాశుల్కము (Kanyasulkam)", "గురజాడ అప్పారావు (Gurajada Apparao)", "978-8170280224", 1892, "Fiction", "te", "te", "Celebrated social satire and literary comedy in modern spoken Telugu."),

                // Sanskrit (sa)
                new CanonicalBookSpec("श्रीमद्भगवद्गीता (Shrimad Bhagavad Gita)", "वेदव्यास (Veda Vyasa)", "978-8170280309", -500, "Philosophy", "sa", "sa", "700-verse sacred dialogue on dharma, duty, yoga, and liberation."),
                new CanonicalBookSpec("अभिज्ञानशाकुन्तलम् (Abhijnanashakuntalam)", "कालिदास (Kalidasa)", "978-8170280316", 400, "Poetry", "sa", "sa", "Renowned romantic Sanskrit drama of King Dushyanta and Shakuntala."),
                new CanonicalBookSpec("पञ्चतन्त्रम् (Panchatantra)", "विष्णुशर्मा (Vishnu Sharma)", "978-8170280323", -300, "Fiction", "sa", "sa", "Interwoven animal fables illustrating moral conduct and governance."),

                // Spanish (es)
                new CanonicalBookSpec("Don Quijote de la Mancha", "Miguel de Cervantes", "978-8420412146", 1605, "Fiction", "es", "es", "Foundational Western novel chronicling the noble knight of La Mancha."),
                new CanonicalBookSpec("Cien años de soledad", "Gabriel García Márquez", "978-0307474728", 1967, "Fiction", "es", "es", "Landmark magical realist saga of the Buendía family in Macondo."),
                new CanonicalBookSpec("Ficciones", "Jorge Luis Borges", "978-8420633121", 1944, "Philosophy", "es", "es", "Brilliant short stories on labyrinths, infinity, and mirrors."),

                // French (fr)
                new CanonicalBookSpec("Les Misérables", "Victor Hugo", "978-2253096337", 1862, "Fiction", "fr", "fr", "Epic social novel of redemption, justice, and the Parisian uprising."),
                new CanonicalBookSpec("Le Petit Prince", "Antoine de Saint-Exupéry", "978-2070612758", 1943, "Philosophy", "fr", "fr", "Poetic tale of a young prince visiting planets in search of wisdom."),
                new CanonicalBookSpec("L'Étranger", "Albert Camus", "978-2070360024", 1942, "Philosophy", "fr", "fr", "Absurdist existential classic examining detachment and human condition."),

                // German (de)
                new CanonicalBookSpec("Faust: Eine Tragödie", "Johann Wolfgang von Goethe", "978-3150000014", 1808, "Poetry", "de", "de", "Great dramatic dialogue on the bargain between Faust and Mephistopheles."),
                new CanonicalBookSpec("Die Verwandlung", "Franz Kafka", "978-3150099001", 1915, "Fiction", "de", "de", "Surreal novella of Gregor Samsa waking as an insect."),
                new CanonicalBookSpec("Kritik der reinen Vernunft", "Immanuel Kant", "978-3518276006", 1781, "Philosophy", "de", "de", "Monumental epistemological critique on human cognition and reality."),

                // Russian (ru)
                new CanonicalBookSpec("Война и мир (War and Peace)", "Лев Толстой (Leo Tolstoy)", "978-5389062566", 1869, "History", "ru", "ru", "Panoramic historical epic detailing Russian society during Napoleonic wars."),
                new CanonicalBookSpec("Преступление и наказание (Crime and Punishment)", "Фёдор Достоевский (Fyodor Dostoevsky)", "978-5389062573", 1866, "Fiction", "ru", "ru", "Psychological drama of Raskolnikov's moral anguish and redemption."),
                new CanonicalBookSpec("Мастер и Маргарита (The Master and Margarita)", "Михаил Булгаков (Mikhail Bulgakov)", "978-5389062580", 1967, "Fiction", "ru", "ru", "Supernatural satirical masterpiece set in Stalinist Moscow."),

                // Japanese (ja)
                new CanonicalBookSpec("源氏物語 (The Tale of Genji)", "紫式部 (Murasaki Shikibu)", "978-4106203015", 1008, "Fiction", "ja", "ja", "World's first novel recounting courtly life in Heian Japan."),
                new CanonicalBookSpec("吾輩は猫である (I Am a Cat)", "夏目漱石 (Natsume Soseki)", "978-4101010014", 1905, "Fiction", "ja", "ja", "Satirical novel narrated from the perspective of an observant cat."),
                new CanonicalBookSpec("羅生門 (Rashomon)", "芥川龍之介 (Ryunosuke Akutagawa)", "978-4101025018", 1915, "Fiction", "ja", "ja", "Celebrated psychological exploration of moral relativity and truth."),

                // Chinese (zh)
                new CanonicalBookSpec("三国演义 (Romance of the Three Kingdoms)", "罗贯中 (Luo Guanzhong)", "978-7020008735", 1365, "History", "zh", "zh", "Epic historical novel detailing the turbulent Three Kingdoms era."),
                new CanonicalBookSpec("红楼梦 (Dream of the Red Chamber)", "曹雪芹 (Cao Xueqin)", "978-7020002207", 1791, "Fiction", "zh", "zh", "Masterpiece exploring the rise and decline of the Jia family."),
                new CanonicalBookSpec("孙子兵法 (The Art of War)", "孙武 (Sun Tzu)", "978-7101073843", -500, "Philosophy", "zh", "zh", "Ancient military treatise on strategy, intelligence, and tactics."),

                // Arabic (ar)
                new CanonicalBookSpec("ألف ليلة وليلة (One Thousand and One Nights)", "Various", "978-9953298016", 1200, "Fiction", "ar", "ar", "Enchanting framing story of Scheherazade and Middle Eastern tales."),
                new CanonicalBookSpec("مقدمة ابن خلدون (Muqaddimah)", "ابن خلدون (Ibn Khaldun)", "978-9953298023", 1377, "History", "ar", "ar", "Foundational treatise on universal history, sociology, and economics."),
                new CanonicalBookSpec("ثلاثية القاهرة (Cairo Trilogy)", "نجيب محفوظ (Naguib Mahfouz)", "978-9953298030", 1956, "Fiction", "ar", "ar", "Nobel laureate's magnum opus chronicling three generations in Cairo."),

                // Korean (ko)
                new CanonicalBookSpec("토지 (Toji / The Land)", "박경리 (Park Kyung-ni)", "978-8941802013", 1969, "History", "ko", "ko", "Monumental 16-volume epic on modern Korean history and family lineage."),
                new CanonicalBookSpec("광장 (The Square)", "최인훈 (Choi In-hun)", "978-8937400018", 1960, "Philosophy", "ko", "ko", "Influential post-war novel exploring ideological conflicts."),
                new CanonicalBookSpec("채식주의자 (The Vegetarian)", "한강 (Han Kang)", "978-8936433598", 2007, "Fiction", "ko", "ko", "International Booker-winning novel on bodily autonomy and rebellion."),

                // Italian (it)
                new CanonicalBookSpec("La Divina Commedia (The Divine Comedy)", "Dante Alighieri", "978-8804680017", 1320, "Poetry", "it", "it", "Supreme epic poem journeying through Inferno, Purgatorio, and Paradiso."),
                new CanonicalBookSpec("Il Principe (The Prince)", "Niccolò Machiavelli", "978-8804680024", 1532, "Philosophy", "it", "it", "Political treatise on statecraft, pragmatism, and power."),
                new CanonicalBookSpec("Il nome della rosa (The Name of the Rose)", "Umberto Eco", "978-8845278655", 1980, "Fiction", "it", "it", "Historical mystery set in an Italian monastery investigating semiotics."),

                // Portuguese (pt)
                new CanonicalBookSpec("Os Lusíadas", "Luís de Camões", "978-9720049506", 1572, "Poetry", "pt", "pt", "Portuguese national epic depicting Vasco da Gama's sea voyage to India."),
                new CanonicalBookSpec("Dom Casmurro", "Machado de Assis", "978-8535914849", 1899, "Fiction", "pt", "pt", "Brilliant unreliable narrator novel on love, jealousy, and memory."),
                new CanonicalBookSpec("Ensaio sobre a Cegueira (Blindness)", "José Saramago", "978-9722110297", 1995, "Fiction", "pt", "pt", "Allegorical novel by Nobel laureate about an epidemic of white blindness."),

                // Turkish (tr)
                new CanonicalBookSpec("Benim Adım Kırmızı (My Name Is Red)", "Orhan Pamuk", "978-9750802720", 1998, "Fiction", "tr", "tr", "Nobel laureate mystery novel centered on Ottoman miniature painters."),
                new CanonicalBookSpec("Kürk Mantolu Madonna", "Sabahattin Ali", "978-9753638029", 1943, "Fiction", "tr", "tr", "Touching psychological romance novel of unfulfilled love."),
                new CanonicalBookSpec("Nutuk (The Speech)", "Mustafa Kemal Atatürk", "978-9751600004", 1927, "History", "tr", "tr", "Historical account of the Turkish War of National Liberation."),

                // Dutch (nl)
                new CanonicalBookSpec("Het Achterhuis (The Diary of a Young Girl)", "Anne Frank", "978-9044616170", 1947, "Biography", "nl", "nl", "Poignant personal diary recorded while hiding during Nazi occupation."),
                new CanonicalBookSpec("Max Havelaar", "Multatuli (Eduard Douwes Dekker)", "978-9025368548", 1860, "History", "nl", "nl", "Scathing satire that exposed colonial abuses in the Dutch East Indies."),
                new CanonicalBookSpec("De ontdekking van de hemel", "Harry Mulisch", "978-9023458609", 1992, "Fiction", "nl", "nl", "Philosophical masterpiece intertwining history, religion, and science."),

                // Greek (el)
                new CanonicalBookSpec("Ιλιάς (The Iliad)", "Όμηρος (Homer)", "978-9600300017", -750, "Poetry", "el", "el", "Ancient Greek epic recounting the wrath of Achilles and Trojan War."),
                new CanonicalBookSpec("Οδύσσεια (The Odyssey)", "Όμηρος (Homer)", "978-9600300024", -725, "Poetry", "el", "el", "Epic voyage of Odysseus returning home to Ithaca after Troy."),
                new CanonicalBookSpec("Πολιτεία (The Republic)", "Πλάτων (Plato)", "978-9600300031", -375, "Philosophy", "el", "el", "Socratic dialogue concerning justice, the ideal city-state, and forms."),

                // Latin (la)
                new CanonicalBookSpec("Aeneis (The Aeneid)", "Publius Vergilius Maro (Virgil)", "978-0198144274", -19, "Poetry", "la", "la", "Latin epic telling the legendary story of Aeneas founding Rome."),
                new CanonicalBookSpec("De Rerum Natura (On the Nature of Things)", "Titus Lucretius Carus", "978-0198144052", -55, "Science", "la", "la", "Poetic exposition of Epicurean atomism and natural philosophy."),
                new CanonicalBookSpec("Meditationes (Meditations)", "Marcus Aurelius", "978-0198144007", 180, "Philosophy", "la", "la", "Stoic personal reflections of the Roman Emperor on duty and reason.")
        );
    }
}
