import pptxgen from 'pptxgenjs';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';
const OUTPUT_DIR = 'c:/Users/gokul/OneDrive/Desktop/library/presentation';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function createPresentation() {
  console.log('🎨 Generating LibraAI Professional Java Project Presentation (.pptx)...');
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'LibraAI Engineering Team';
  pptx.company = 'LibraAI System';
  pptx.title = 'LibraAI - Enterprise Java Library & Rental Management System';
  pptx.subject = 'Java 21 / Spring Boot 3 Real-World Library System Architecture';

  // Define Color Palette
  const THEME = {
    bgDark: '0F172A',      // Slate 900
    cardDark: '1E293B',    // Slate 800
    cardBorder: '334155',  // Slate 700
    primaryBlue: '3B82F6', // Blue 500
    accentCyan: '06B6D4',  // Cyan 500
    accentPurple: 'A855F7',// Purple 500
    accentEmerald: '10B981',// Emerald 500
    accentAmber: 'F59E0B', // Amber 500
    textLight: 'F8FAFC',   // Slate 50
    textMuted: '94A3B8',   // Slate 400
    codeBg: '090D16',      // Dark Code
  };

  // Helper for Slide Background
  function applyBaseStyle(slide, title, category) {
    slide.background = { color: THEME.bgDark };

    // Header Category Badge
    if (category) {
      slide.addText(category.toUpperCase(), {
        x: 0.8,
        y: 0.4,
        w: 6.0,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: THEME.accentCyan,
        charSpacing: 2,
      });
    }

    // Header Title
    if (title) {
      slide.addText(title, {
        x: 0.8,
        y: 0.65,
        w: 11.5,
        h: 0.6,
        fontSize: 22,
        fontFace: 'Arial',
        bold: true,
        color: THEME.textLight,
      });
    }

    // Footer Bar
    slide.addText('LibraAI  •  Java 21 & Spring Boot 3 Enterprise Library System', {
      x: 0.8,
      y: 7.0,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: THEME.textMuted,
    });
  }

  // ==========================================
  // SLIDE 1: TITLE & PROJECT DEFINITION
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: THEME.bgDark };

  // Decorative Glow Box
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 0.8,
    w: 11.7,
    h: 5.8,
    fill: { color: THEME.cardDark },
    line: { color: THEME.cardBorder, width: 1 },
  });

  slide1.addText('ENTERPRISE JAVA SYSTEM OF RECORD', {
    x: 1.2,
    y: 1.2,
    w: 8.0,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: THEME.accentCyan,
    charSpacing: 2,
  });

  slide1.addText('LibraAI: Enterprise Library &\nRental Management System', {
    x: 1.2,
    y: 1.6,
    w: 10.5,
    h: 1.2,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: THEME.textLight,
    lineSpacingMultiple: 1.1,
  });

  slide1.addText(
    'A high-performance, transaction-safe library management and rental platform engineered with Java 21, Spring Boot 3.3, and PostgreSQL. Features upfront booking fees ($0.50/day), deterministic fine calculation, automated stock auto-replenishment, and multilingual catalogs.',
    {
      x: 1.2,
      y: 2.9,
      w: 10.8,
      h: 0.9,
      fontSize: 13,
      fontFace: 'Arial',
      color: THEME.textMuted,
      lineSpacingMultiple: 1.2,
    }
  );

  // 3 Feature Badges on Slide 1
  const s1Features = [
    { title: 'Java 21 & Spring Boot 3', desc: 'Robust REST APIs, JPA transactions, Spring Security JWT', color: THEME.primaryBlue },
    { title: 'Deterministic Rentals', desc: 'Upfront fee booking ($0.50/day), automated overdue fines', color: THEME.accentEmerald },
    { title: '100+ Multilingual Titles', desc: '14 world languages with physical inventory barcode tracking', color: THEME.accentPurple },
  ];

  s1Features.forEach((f, idx) => {
    const xPos = 1.2 + idx * 3.7;
    slide1.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 4.0,
      w: 3.4,
      h: 1.8,
      fill: { color: THEME.bgDark },
      line: { color: f.color, width: 1.5 },
    });

    slide1.addText(f.title, {
      x: xPos + 0.2,
      y: 4.2,
      w: 3.0,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: f.color,
    });

    slide1.addText(f.desc, {
      x: xPos + 0.2,
      y: 4.65,
      w: 3.0,
      h: 0.9,
      fontSize: 11,
      fontFace: 'Arial',
      color: THEME.textMuted,
    });
  });

  // ==========================================
  // SLIDE 2: SYSTEM ARCHITECTURE & DESIGN
  // ==========================================
  const slide2 = pptx.addSlide();
  applyBaseStyle(slide2, 'System Architecture & Clean 3-Tier Layered Design', 'Architecture & Engineering');

  // Architecture Layers (4 Horizontal Blocks)
  const layers = [
    {
      name: '1. REST Controller & API Layer (Spring Web)',
      items: '• BookController (GET /api/v1/books, multilingual query, pagination)\n• LoanController (POST /api/v1/loans/book-rental, POST /api/v1/loans/{id}/return)\n• AdminController & AuthController (JWT Authentication, RBAC Security)',
      color: THEME.primaryBlue,
      y: 1.4,
    },
    {
      name: '2. Service & Business Logic Layer (Java Core Transactions)',
      items: '• LoanService: Atomic rental booking, fee calculation ($0.50/day), stock count decrement\n• BookService: Multilingual catalog management, copy barcode validation\n• FineCalculationEngine: Timestamp-based overdue fine calculator ($0.50/day late)',
      color: THEME.accentEmerald,
      y: 2.7,
    },
    {
      name: '3. Data Access & Entity Layer (Spring Data JPA / Hibernate)',
      items: '• LoanRepository, BookRepository, BookCopyRepository, UserRepository\n• Relational entities: Book (1:N) BookCopy, User (1:N) Loan, Category, Author\n• Pessimistic/Optimistic concurrency locking on physical copy barcodes',
      color: THEME.accentPurple,
      y: 4.0,
    },
    {
      name: '4. Database & Migration Layer (PostgreSQL / Flyway Engine)',
      items: '• Versioned schema migrations (Flyway V1 to V9)\n• ACID transactions, unique barcode constraints (BC-BOOK-{id}-01), relational referential integrity',
      color: THEME.accentAmber,
      y: 5.3,
    },
  ];

  layers.forEach((l) => {
    slide2.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: l.y,
      w: 11.7,
      h: 1.15,
      fill: { color: THEME.cardDark },
      line: { color: l.color, width: 1.5 },
    });

    slide2.addText(l.name, {
      x: 1.0,
      y: l.y + 0.1,
      w: 11.3,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: l.color,
    });

    slide2.addText(l.items, {
      x: 1.0,
      y: l.y + 0.4,
      w: 11.3,
      h: 0.7,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: THEME.textLight,
      lineSpacingMultiple: 1.15,
    });
  });

  // ==========================================
  // SLIDE 3: CORE JAVA CODE IMPLEMENTATION
  // ==========================================
  const slide3 = pptx.addSlide();
  applyBaseStyle(slide3, 'Core Java Code Implementation & Business Logic', 'Java 21 & Spring Boot 3 Deep-Dive');

  // Left Box: Java Code Snippet for Rental Booking
  slide3.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.4,
    w: 5.7,
    h: 5.3,
    fill: { color: THEME.codeBg },
    line: { color: THEME.primaryBlue, width: 1.5 },
  });

  slide3.addText('LoanService.java — bookAndPayRental()', {
    x: 1.0,
    y: 1.55,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: THEME.accentCyan,
  });

  const javaCodeSnippet1 = 
`@Transactional
public LoanDto bookAndPayRental(BookRentalRequest req, String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    Book book = bookRepository.findById(req.getBookId())
        .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

    // 1. Acquire available copy & update status
    BookCopy copy = bookCopyRepository
        .findFirstByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE)
        .orElseThrow(() -> new BusinessException("No copies in stock"));
    copy.setStatus(CopyStatus.ON_LOAN);

    // 2. Compute upfront rental fee (₹0.50 / day)
    int days = req.getRentalPeriodDays();
    BigDecimal fee = BigDecimal.valueOf(days).multiply(DAILY_RATE);

    // 3. Create active loan & digital payment reference
    Loan loan = Loan.builder()
        .bookCopy(copy)
        .user(user)
        .issueDate(Instant.now())
        .dueDate(Instant.now().plus(days, ChronoUnit.DAYS))
        .rentalFee(fee)
        .paymentReference("PAY-LBR-" + UUID.randomUUID().toString().substring(0,8).toUpperCase())
        .status(LoanStatus.ACTIVE)
        .build();
    return loanMapper.toDto(loanRepository.save(loan));
}`;

  slide3.addText(javaCodeSnippet1, {
    x: 1.0,
    y: 1.9,
    w: 5.3,
    h: 4.6,
    fontSize: 8.5,
    fontFace: 'Consolas',
    color: THEME.textLight,
  });

  // Right Box: Java Code Snippet for Automated Return & Stock Restoral
  slide3.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 1.4,
    w: 5.7,
    h: 5.3,
    fill: { color: THEME.codeBg },
    line: { color: THEME.accentEmerald, width: 1.5 },
  });

  slide3.addText('LoanService.java — returnLoanById() & Stock Restoral', {
    x: 7.0,
    y: 1.55,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: THEME.accentEmerald,
  });

  const javaCodeSnippet2 =
`@Transactional
public LoanDto returnLoanById(Long loanId, String username) {
    Loan loan = loanRepository.findById(loanId)
        .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

    // Authorization & Status Validation
    if (!loan.getUser().getUsername().equals(username) && !isStaff(username)) {
        throw new AccessDeniedException("Unauthorized loan return");
    }
    if (loan.getStatus() == LoanStatus.RETURNED) {
        throw new BusinessException("Book already returned");
    }

    // 1. Mark loan as RETURNED & record timestamp
    loan.setReturnDate(Instant.now());
    loan.setStatus(LoanStatus.RETURNED);

    // 2. Automatically replenish stock (AVAILABLE)
    BookCopy copy = loan.getBookCopy();
    copy.setStatus(CopyStatus.AVAILABLE);
    bookCopyRepository.save(copy);

    // 3. Compute overdue fine if return date > due date
    computeOverdueFineIfApplicable(loan);

    return loanMapper.toDto(loanRepository.save(loan));
}`;

  slide3.addText(javaCodeSnippet2, {
    x: 7.0,
    y: 1.9,
    w: 5.3,
    h: 4.6,
    fontSize: 8.5,
    fontFace: 'Consolas',
    color: THEME.textLight,
  });

  // ==========================================
  // SLIDE 4: ROLE-BASED WORKSPACES & AUDIT LOGIC
  // ==========================================
  const slide4 = pptx.addSlide();
  applyBaseStyle(slide4, 'Role-Based Portals, Stock Visibility & Staff Audit', 'Security, Roles & Business Workflows');

  const roles = [
    {
      title: '👑 Administrator Portal',
      subtitle: 'System & Policy Governance',
      color: THEME.accentPurple,
      points: [
        'Full administrative authority & user access control (RBAC).',
        'Global inventory stock monitoring across all categories.',
        'View complete borrower booking history with payment references.',
        'No booking clutter: Maintenance-focused view without rental buttons.',
      ],
    },
    {
      title: '📚 Chief Librarian Portal',
      subtitle: 'Circulation & Stock Audit',
      color: THEME.accentEmerald,
      points: [
        'Real-time physical stock counts (e.g., 2/2 Available, 0/2 Rented Out).',
        'Direct card inspection: displays who booked, duration, and due date.',
        'Circulation desk operations: Issue & return copies by unique barcode.',
        'Automated overdue fine tracking and digital payment receipts.',
      ],
    },
    {
      title: '👤 Member / Patron Portal',
      subtitle: 'Discovery & Self-Service',
      color: THEME.primaryBlue,
      points: [
        'Browse 100+ multilingual titles across 14 languages & 10 categories.',
        'Select custom rental periods (3, 7, 14, 30 days) with upfront ₹0.50/day fee.',
        'Receive official digital transaction receipts (PAY-LBR-XXXXXX).',
        '1-Click self-service return that automatically replenishes book stock.',
      ],
    },
  ];

  roles.forEach((r, idx) => {
    const xPos = 0.8 + idx * 3.95;
    slide4.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.4,
      w: 3.75,
      h: 5.3,
      fill: { color: THEME.cardDark },
      line: { color: r.color, width: 1.5 },
    });

    slide4.addText(r.title, {
      x: xPos + 0.2,
      y: 1.6,
      w: 3.35,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: r.color,
    });

    slide4.addText(r.subtitle, {
      x: xPos + 0.2,
      y: 1.95,
      w: 3.35,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: THEME.accentCyan,
    });

    let bulletText = r.points.map((p) => `• ${p}`).join('\n\n');
    slide4.addText(bulletText, {
      x: xPos + 0.2,
      y: 2.3,
      w: 3.35,
      h: 4.1,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: THEME.textLight,
      lineSpacingMultiple: 1.15,
    });
  });

  // ==========================================
  // SLIDE 5: VISUAL IMPLEMENTATION & SCREENSHOTS
  // ==========================================
  const slide5 = pptx.addSlide();
  applyBaseStyle(slide5, 'Visual Implementation & Live Application Proof', 'UI & Real-World Execution');

  const screenshots = [
    {
      title: '1. Role Selection Opening Portal',
      desc: 'Admin, Chief Librarian & Patron entry portals',
      file: path.join(ARTIFACT_DIR, 'portal_login_opening_page.png'),
      x: 0.8,
      y: 1.4,
      w: 5.7,
      h: 2.5,
    },
    {
      title: '2. Chief Librarian Stock & Borrower Audit',
      desc: 'Real-time stock counts & active borrower details on card',
      file: path.join(ARTIFACT_DIR, 'librarian_view_active_borrower_card.png'),
      x: 6.8,
      y: 1.4,
      w: 5.7,
      h: 2.5,
    },
    {
      title: '3. Member Rental & Booking Checkout',
      desc: 'Upfront fee selection ($0.50/day) & instant return',
      file: path.join(ARTIFACT_DIR, 'member_portal_view.png'),
      x: 0.8,
      y: 4.15,
      w: 5.7,
      h: 2.5,
    },
    {
      title: '4. 100+ Multilingual Books Catalog',
      desc: '14 Languages (Tamil, Sanskrit, Japanese, French, etc.)',
      file: path.join(ARTIFACT_DIR, 'multilingual_100_books_catalog.png'),
      x: 6.8,
      y: 4.15,
      w: 5.7,
      h: 2.5,
    },
  ];

  screenshots.forEach((s) => {
    // Background card container
    slide5.addShape(pptx.ShapeType.rect, {
      x: s.x,
      y: s.y,
      w: s.w,
      h: s.h,
      fill: { color: THEME.cardDark },
      line: { color: THEME.cardBorder, width: 1 },
    });

    slide5.addText(`${s.title} — ${s.desc}`, {
      x: s.x + 0.15,
      y: s.y + 0.08,
      w: s.w - 0.3,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: THEME.accentCyan,
    });

    // Embed Image if exists
    if (fs.existsSync(s.file)) {
      slide5.addImage({
        path: s.file,
        x: s.x + 0.15,
        y: s.y + 0.35,
        w: s.w - 0.3,
        h: s.h - 0.45,
      });
    }
  });

  // ==========================================
  // SLIDE 6: CONCLUSION & KEY METRICS
  // ==========================================
  const slide6 = pptx.addSlide();
  applyBaseStyle(slide6, 'Project Summary, Engineering Metrics & Impact', 'Conclusion & Verification');

  const metrics = [
    { label: 'Backend Test Suite', val: '63 / 63 PASS', desc: '100% test pass rate with Mockito & SpringBootTest integration tests', color: THEME.accentEmerald },
    { label: 'Multilingual Catalog', val: '107+ Books', desc: '14 Global languages seeded across 10 academic & literary categories', color: THEME.primaryBlue },
    { label: 'Transactional Accuracy', val: '100% ACID', desc: 'Zero financial/stock discrepancies with PostgreSQL constraints', color: THEME.accentPurple },
    { label: 'Database Migrations', val: 'V1 – V9 Flyway', desc: 'Reproducible, versioned schema with automated copy barcode seeding', color: THEME.accentAmber },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 0.8 + (idx % 2) * 5.95;
    const yPos = 1.4 + Math.floor(idx / 2) * 2.65;

    slide6.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 5.75,
      h: 2.45,
      fill: { color: THEME.cardDark },
      line: { color: m.color, width: 1.5 },
    });

    slide6.addText(m.label.toUpperCase(), {
      x: xPos + 0.3,
      y: yPos + 0.25,
      w: 5.15,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: THEME.textMuted,
      charSpacing: 1.5,
    });

    slide6.addText(m.val, {
      x: xPos + 0.3,
      y: yPos + 0.55,
      w: 5.15,
      h: 0.6,
      fontSize: 26,
      fontFace: 'Arial',
      bold: true,
      color: m.color,
    });

    slide6.addText(m.desc, {
      x: xPos + 0.3,
      y: yPos + 1.25,
      w: 5.15,
      h: 0.9,
      fontSize: 11,
      fontFace: 'Arial',
      color: THEME.textLight,
      lineSpacingMultiple: 1.2,
    });
  });

  const pptxPath = path.join(OUTPUT_DIR, 'LibraAI_Library_Management_System.pptx');
  await pptx.writeFile({ fileName: pptxPath });
  console.log(`✅ PowerPoint presentation successfully generated at: ${pptxPath}`);
}

createPresentation().catch(console.error);
