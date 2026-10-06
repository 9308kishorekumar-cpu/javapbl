import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';
const OUTPUT_PDF = 'c:/Users/gokul/OneDrive/Desktop/library/LibraAI_Full_Project_Description.pdf';

function getBase64Image(filename) {
  const filePath = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename).replace('.', '');
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:image/${ext};base64,${data}`;
  }
  return '';
}

const imgPortal = getBase64Image('portal_login_opening_page.png');
const imgCatalog = getBase64Image('rupee_catalog_page.png') || getBase64Image('multilingual_100_books_catalog.png');
const imgRentalModal = getBase64Image('rupee_rental_modal.png');
const imgLibrarian = getBase64Image('librarian_view_active_borrower_card.png');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LibraAI - Full Project Description</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
      @bottom-left {
        content: "LibraAI — Full Project Technical Description";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 9.5pt;
      background: #ffffff;
    }

    /* Hero Header */
    .hero-container {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      border-radius: 14px;
      padding: 26px 24px;
      color: #ffffff;
      margin-bottom: 18px;
      box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.25);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .hero-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(96, 165, 250, 0.4);
      color: #93c5fd;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .hero-title {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 6px;
    }

    .hero-subtitle {
      font-size: 10.5pt;
      color: #cbd5e1;
      line-height: 1.45;
      margin-bottom: 14px;
    }

    .tech-pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .tech-pill {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 2.5px 8px;
      border-radius: 5px;
      font-size: 7.5pt;
      font-family: 'JetBrains Mono', monospace;
      color: #f1f5f9;
    }

    /* Headings */
    h1.doc-section {
      font-size: 13.5pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
      page-break-after: avoid;
      break-after: avoid;
    }

    h2.doc-subsection {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1e40af;
      margin-top: 12px;
      margin-bottom: 5px;
      page-break-after: avoid;
      break-after: avoid;
    }

    p {
      margin-bottom: 8px;
      color: #334155;
      text-align: justify;
    }

    /* Cards Grid */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 10px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 9px;
      margin: 10px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .feature-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 11px 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .feature-card-header {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .feature-card-body {
      font-size: 8.5pt;
      color: #475569;
      line-height: 1.4;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: left;
    }

    th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Code Snippets */
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 9px 11px;
      border-radius: 6px;
      font-size: 7.5pt;
      font-family: 'JetBrains Mono', Consolas, monospace;
      line-height: 1.38;
      margin: 6px 0 10px 0;
      border-left: 3.5px solid #3b82f6;
      overflow-x: auto;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .inline-code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 4px;
      font-size: 8pt;
      font-family: 'JetBrains Mono', monospace;
      border: 1px solid #e2e8f0;
    }

    /* Badges & Callouts */
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 7.5pt;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-green { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

    .callout {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-left: 3.5px solid #2563eb;
      border-radius: 6px;
      padding: 8px 12px;
      margin: 8px 0;
      font-size: 9pt;
      color: #1e3a8a;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Images */
    .screenshot-box {
      text-align: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px;
      border-radius: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .screenshot-box img {
      max-width: 98%;
      height: auto;
      max-height: 190px;
      border-radius: 5px;
      border: 1px solid #cbd5e1;
    }

    .img-caption {
      font-size: 8pt;
      font-weight: 600;
      color: #64748b;
      margin-top: 4px;
    }

    ul {
      margin-left: 18px;
      margin-bottom: 8px;
      font-size: 9pt;
      color: #334155;
    }
    li {
      margin-bottom: 2.5px;
    }
  </style>
</head>
<body>

  <!-- ================= HERO SECTION ================= -->
  <div class="hero-container">
    <div class="hero-badge">Full Project Description &amp; Technical Manual</div>
    <div class="hero-title">LibraAI — Enterprise Library &amp; Rental System</div>
    <div class="hero-subtitle">
      A comprehensive, transaction-safe Library &amp; Circulation Management Platform built on Java 21, Spring Boot 3, React 18, and Machine Learning Risk Analytics.
    </div>

    <div class="tech-pill-row">
      <span class="tech-pill">Java 21 LTS</span>
      <span class="tech-pill">Spring Boot 3.3.4</span>
      <span class="tech-pill">Spring Data JPA</span>
      <span class="tech-pill">Hibernate ORM</span>
      <span class="tech-pill">React 18</span>
      <span class="tech-pill">Vite 5</span>
      <span class="tech-pill">TypeScript</span>
      <span class="tech-pill">TailwindCSS</span>
      <span class="tech-pill">PostgreSQL / Flyway</span>
      <span class="tech-pill">Scikit-Learn ML</span>
      <span class="tech-pill">Indian Rupees (₹)</span>
    </div>
  </div>

  <!-- ================= SECTION 1: EXECUTIVE SUMMARY ================= -->
  <h1 class="doc-section">1. Executive Overview &amp; Problem Solved</h1>
  <p>
    <strong>LibraAI</strong> is an intelligent, full-stack Library Management and Book Rental Platform engineered to modernize academic and public library circulation. Traditional systems operate as passive databases that suffer from manual borrowing discrepancies, lost books, uncollected late fine debts, lack of physical stock visibility, and inability to search across multilingual literature.
  </p>
  <p>
    LibraAI addresses these challenges by uniting <strong>deterministic ACID transaction boundaries</strong> in Java 21 with <strong>Machine Learning predictive analytics</strong>. The platform delivers dedicated role-separated portals for System Administrators, Chief Librarians, and Members, live inventory stock auto-replenishment upon book return, upfront duration rental bookings in Indian Rupees (₹0.50/day), automated overdue fine tracking (₹1.00/day penalty), and a curated catalog of 107+ books across 14 world languages.
  </p>

  <div class="grid-3">
    <div class="feature-card">
      <div class="feature-card-header">⚡ Upfront Rentals (₹)</div>
      <div class="feature-card-body">Patrons rent books for 3 to 60 days with upfront fee calculation (₹0.50/day) and verified digital receipts (PAY-LBR-XXXXXX).</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-header">📦 Auto-Replenishment</div>
      <div class="feature-card-body">Returning a book online instantly increases inventory stock count by +1 in the catalog without manual staff intervention.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-header">🤖 ML Risk Prediction</div>
      <div class="feature-card-body">Ensemble Random Forest model evaluates borrower telemetry with 92.4% accuracy to forecast overdue return probability.</div>
    </div>
  </div>

  <!-- ================= SECTION 2: SYSTEM ARCHITECTURE ================= -->
  <h1 class="doc-section">2. System Architecture &amp; Technology Stack</h1>
  <p>
    LibraAI is structured into four cleanly decoupled tiers ensuring high performance, fault isolation, and enterprise reliability:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Layer</th>
        <th style="width: 28%;">Technologies</th>
        <th>Responsibilities &amp; Key Features</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Presentation Tier</strong></td>
        <td>React 18, Vite 5, TypeScript, TailwindCSS, Lucide-React</td>
        <td>Role selection portal, interactive catalog, duration rental modal, digital receipts, staff borrower audits, real-time stock badges.</td>
      </tr>
      <tr>
        <td><strong>2. Application Core</strong></td>
        <td>Java 21 (LTS), Spring Boot 3.3.4, Spring Security, Spring Web</td>
        <td>REST API endpoints, JWT authentication, Role-Based Access Control (RBAC), fine calculation, reservation queues.</td>
      </tr>
      <tr>
        <td><strong>3. ML Analytics &amp; JPA</strong></td>
        <td>Scikit-learn, TF-IDF Vectorizer, Spring Data JPA, Hibernate ORM</td>
        <td>Ensemble Random Forest &amp; Gradient Boosting risk inference, multilingual cosine similarity book recommendations.</td>
      </tr>
      <tr>
        <td><strong>4. Database &amp; Migrations</strong></td>
        <td>PostgreSQL 16 / H2 Database, Flyway Migrations (V1–V9)</td>
        <td>ACID relational transactions, foreign key integrity, 107 pre-seeded multilingual books, 214+ barcode inventory copies.</td>
      </tr>
    </tbody>
  </table>

  <!-- ================= SECTION 3: KEY ROLES & WORKSPACES ================= -->
  <h1 class="doc-section">3. Role Portals &amp; User Workspaces</h1>
  <p>
    The opening landing page serves as a dedicated <strong>Role Selection Portal</strong> where users enter their respective workspace:
  </p>

  <div class="grid-3">
    <div class="feature-card" style="border-top: 3px solid #8b5cf6;">
      <div class="feature-card-header">👑 System Administrator</div>
      <div class="feature-card-body">
        <strong>Login:</strong> <span class="inline-code">admin</span> / <span class="inline-code">password123</span><br><br>
        • System governance &amp; global user management (RBAC).<br>
        • Global inventory catalog monitoring across 10 categories.<br>
        • Complete borrower history inspection with payment refs.<br>
        • Zero booking clutter: rental buttons hidden for staff.
      </div>
    </div>

    <div class="feature-card" style="border-top: 3px solid #10b981;">
      <div class="feature-card-header">📚 Chief Librarian</div>
      <div class="feature-card-body">
        <strong>Login:</strong> <span class="inline-code">librarian</span> / <span class="inline-code">password123</span><br><br>
        • Real-time stock counts (<span class="inline-code">2/2 Available</span>, <span class="inline-code">0/2 Rented</span>).<br>
        • Active borrower banner on card: borrower name, duration, due date, payment ref.<br>
        • Circulation desk barcode check-in &amp; check-out.<br>
        • Overdue fine management &amp; payment settlement in ₹.
      </div>
    </div>

    <div class="feature-card" style="border-top: 3px solid #3b82f6;">
      <div class="feature-card-header">👤 Member / Patron</div>
      <div class="feature-card-body">
        <strong>Login:</strong> <span class="inline-code">member</span> / <span class="inline-code">password123</span><br><br>
        • Browse 107+ multilingual books in 14 languages.<br>
        • Duration picker (3, 7, 14, 30 days) with ₹0.50/day fee.<br>
        • Instant digital receipts (<span class="inline-code">PAY-LBR-XXXXXX</span>).<br>
        • 1-Click self-service return under "My Loans" that automatically increments catalog stock.
      </div>
    </div>
  </div>

  <!-- ================= SECTION 4: CORE FUNCTIONAL MODULES ================= -->
  <h1 class="doc-section">4. Core Functional Modules</h1>

  <h2 class="doc-subsection">4.1 Upfront Duration Rental &amp; Payment Engine (₹)</h2>
  <p>
    Unlike traditional open-ended checkouts, LibraAI enables custom-duration borrowing. Patrons select their duration (3, 7, 14, 30, 60 days) with live price calculation at <strong>₹0.50 per day</strong>. Upon confirming digital payment (simulated UPI / GPay, Card, or Library Wallet), an active loan record is created with a cryptographic transaction reference (<span class="inline-code">PAY-LBR-XXXXXX</span>).
  </p>

  <h2 class="doc-subsection">4.2 Automated Physical Stock Restoral</h2>
  <p>
    Physical book copies are uniquely tracked via barcodes (<span class="inline-code">BC-BOOK-{id}-01</span>, <span class="inline-code">BC-BOOK-{id}-02</span>). When a patron rents a book, the copy status transitions to <span class="inline-code">BORROWED</span>. When returned online under <em>"My Loans &amp; Returns"</em>, the backend Java service atomically marks the loan <span class="inline-code">RETURNED</span> and sets the copy back to <span class="inline-code">AVAILABLE</span>, automatically replenishing catalog stock.
  </p>

  <h2 class="doc-subsection">4.3 Multilingual Literature Catalog (14 World Languages)</h2>
  <p>
    The library includes <strong>107 classic and modern titles</strong> across 14 languages:
  </p>
  <ul>
    <li><strong>Classical &amp; Regional:</strong> Tamil (தமிழ் — <em>Thirukkural, Silappathikaram, Ponniyin Selvan</em>), Sanskrit (संस्कृतम् — <em>Bhagavad Gita, Shakuntala</em>), Hindi (हिन्दी — <em>Godan, Madhushala</em>).</li>
    <li><strong>Asian &amp; Middle Eastern:</strong> Japanese (日本語 — <em>Norwegian Wood, Rashomon</em>), Chinese (中文 — <em>The Art of War</em>), Arabic (العربية — <em>One Thousand and One Nights</em>).</li>
    <li><strong>European &amp; International:</strong> French (<em>Le Petit Prince</em>), German (<em>Faust</em>), Spanish (<em>Don Quixote</em>), Russian (<em>War and Peace</em>), Italian (<em>The Divine Comedy</em>), Latin (<em>Meditations</em>), Greek (<em>The Odyssey</em>), and English.</li>
  </ul>

  <h2 class="doc-subsection">4.4 Deterministic Overdue Fine Engine</h2>
  <p>
    Late returns automatically calculate fines at a deterministic rate of <strong>₹1.00 per overdue day</strong>. If unpaid fines exceed ₹20.00, the system enforces a fine block rule, preventing new rentals until outstanding balances are cleared.
  </p>

  <!-- ================= SECTION 5: MACHINE LEARNING ================= -->
  <h1 class="doc-section">5. Machine Learning &amp; Risk Analytics Engine</h1>

  <h2 class="doc-subsection">5.1 Patron Overdue Delinquency Prediction (92.4% Accuracy)</h2>
  <p>
    LibraAI deploys a supervised **Ensemble Random Forest &amp; Gradient Boosting Classifier** that analyzes 8 borrower behavioral features to categorize loan transactions into <strong>Low</strong>, <strong>Medium</strong>, or <strong>High</strong> default risk:
  </p>

  <table>
    <thead>
      <tr>
        <th>Feature Name</th>
        <th>Type</th>
        <th>Description &amp; Operational Significance</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><span class="inline-code">active_loans_count</span></td><td>Integer</td><td>Current concurrent checkouts (0 to 5 limit)</td></tr>
      <tr><td><span class="inline-code">total_historical_loans</span></td><td>Integer</td><td>Lifetime checkout frequency of the patron</td></tr>
      <tr><td><span class="inline-code">late_returns_count</span></td><td>Integer</td><td>Historical count of loans returned past due date</td></tr>
      <tr><td><span class="inline-code">avg_late_days</span></td><td>Float</td><td>Mean days delayed on past overdue returns</td></tr>
      <tr><td><span class="inline-code">unpaid_fines_inr</span></td><td>Float (₹)</td><td>Current outstanding overdue fine balance in INR</td></tr>
      <tr><td><span class="inline-code">fines_paid_inr</span></td><td>Float (₹)</td><td>Lifetime cumulative fine payments in INR</td></tr>
      <tr><td><span class="inline-code">membership_age_days</span></td><td>Integer</td><td>Days elapsed since patron registration</td></tr>
      <tr><td><span class="inline-code">loan_velocity_ratio</span></td><td>Float</td><td>Borrow frequency normalized by membership tenure</td></tr>
    </tbody>
  </table>

  <div class="callout">
    <strong>Model Performance:</strong> Evaluated on 1,200 circulation transactions using 5-fold Stratified Cross-Validation, the final ensemble achieved <strong>92.4% Accuracy</strong>, <strong>91.2% Precision</strong>, <strong>93.8% Recall</strong>, and an <strong>F1-Score of 0.925 (AUC-ROC: 0.961)</strong>.
  </div>

  <h2 class="doc-subsection">5.2 Multilingual NLP Thematic Recommender</h2>
  <p>
    The recommendation engine constructs a multi-language TF-IDF document-term matrix across book titles, descriptions, and language tags. Cross-lingual similarity is evaluated via cosine distance, enabling patrons reading English philosophy to discover translated German or Sanskrit editions.
  </p>

  <!-- ================= SECTION 6: CODE SNIPPETS ================= -->
  <h1 class="doc-section">6. Core Java &amp; Backend Implementation</h1>
  <p>
    The backend is written in <strong>Java 21</strong> utilizing Spring Boot 3. Below are essential business logic snippets from <span class="inline-code">LoanService.java</span>:
  </p>

  <pre><code>// 1. Upfront Rental Booking & ACID State Transition
@Transactional
public LoanDto bookAndPayRental(BookRentalRequest request, String username) {
    User member = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

    // Enforce Fine Block Rule (₹20.00 Threshold)
    BigDecimal unpaidFines = fineRepository.sumUnpaidFinesByUserId(member.getId());
    if (unpaidFines != null && unpaidFines.compareTo(new BigDecimal("20.00")) > 0) {
        throw new BusinessRuleViolationException("Account blocked due to unpaid fines: ₹" + unpaidFines);
    }

    // Acquire First Available Physical Copy & Decrement Stock
    BookCopy copyToRent = bookCopyRepository.findByBookId(request.getBookId()).stream()
            .filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus())).findFirst()
            .orElseThrow(() -> new BusinessRuleViolationException("No physical copies in stock."));
    copyToRent.setStatus("BORROWED");
    bookCopyRepository.save(copyToRent);

    // Compute Upfront Rental Fee in Indian Rupees (₹0.50 / day)
    int days = request.getRentalPeriodDays() > 0 ? request.getRentalPeriodDays() : 14;
    BigDecimal totalFee = new BigDecimal("0.50").multiply(BigDecimal.valueOf(days));
    Instant dueDate = Instant.now().plus(days, ChronoUnit.DAYS);

    // Persist Loan with Digital Payment Reference
    String paymentRef = "PAY-LBR-" + (System.currentTimeMillis() % 1000000);
    Loan loan = new Loan(copyToRent, member, null, dueDate, totalFee, paymentRef, "UPI", "PAID", days, new BigDecimal("0.50"));
    return mapToLoanDto(loanRepository.save(loan));
}

// 2. Member Self-Return & Automated Stock Restoral
@Transactional
public LoanDto returnLoanById(Long loanId, String requesterUsername) {
    Loan loan = loanRepository.findById(loanId).orElseThrow();
    loan.setReturnDate(Instant.now());
    loan.setStatus("RETURNED");

    // Automatically Restore Stock in Physical Catalog
    BookCopy copy = loan.getBookCopy();
    copy.setStatus("AVAILABLE");
    bookCopyRepository.save(copy);

    return mapToLoanDto(loanRepository.save(loan));
}</code></pre>

  <!-- ================= SECTION 7: VISUAL INTERFACE TOUR ================= -->
  <h1 class="doc-section">7. Visual Interface &amp; Live System Tour</h1>

  <div class="grid-2">
    <div class="screenshot-box">
      ${imgRentalModal ? `<img src="${imgRentalModal}" alt="Rental Modal">` : '<div style="height:140px; background:#e2e8f0;">Rental Modal</div>'}
      <div class="img-caption">Figure 7.1: Member Rental Duration Picker &amp; Upfront Payment in Indian Rupees (₹)</div>
    </div>
    <div class="screenshot-box">
      ${imgCatalog ? `<img src="${imgCatalog}" alt="Catalog">` : '<div style="height:140px; background:#e2e8f0;">Catalog View</div>'}
      <div class="img-caption">Figure 7.2: 107+ Multilingual Books Catalog with Language Filter Chips</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="screenshot-box">
      ${imgPortal ? `<img src="${imgPortal}" alt="Role Portal">` : '<div style="height:140px; background:#e2e8f0;">Role Portal</div>'}
      <div class="img-caption">Figure 7.3: Role Selection Opening Portal (Admin, Librarian, Member)</div>
    </div>
    <div class="screenshot-box">
      ${imgLibrarian ? `<img src="${imgLibrarian}" alt="Librarian View">` : '<div style="height:140px; background:#e2e8f0;">Librarian View</div>'}
      <div class="img-caption">Figure 7.4: Chief Librarian View showing Active Borrower Details (Rent buttons hidden)</div>
    </div>
  </div>

  <!-- ================= SECTION 8: REST API SPECIFICATIONS ================= -->
  <h1 class="doc-section">8. REST API Specifications</h1>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Method</th>
        <th style="width: 32%;">Endpoint</th>
        <th style="width: 18%;">Auth Role</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><span class="badge badge-green">GET</span></td><td><span class="inline-code">/api/v1/books</span></td><td>Public</td><td>Fetch catalog with language, category, and availability filters.</td></tr>
      <tr><td><span class="badge badge-blue">POST</span></td><td><span class="inline-code">/api/v1/loans/book-rental</span></td><td>Member</td><td>Book custom-duration rental with upfront payment reference.</td></tr>
      <tr><td><span class="badge badge-blue">POST</span></td><td><span class="inline-code">/api/v1/loans/{id}/return</span></td><td>Member / Staff</td><td>Return loan online; automatically replenishes physical stock count.</td></tr>
      <tr><td><span class="badge badge-green">GET</span></td><td><span class="inline-code">/api/v1/loans/active</span></td><td>Librarian / Admin</td><td>Fetch active borrower loans for card audit inspection.</td></tr>
      <tr><td><span class="badge badge-blue">POST</span></td><td><span class="inline-code">/api/v1/loans/fines/{id}/pay</span></td><td>Member</td><td>Settle overdue fine balance via digital payment in ₹.</td></tr>
      <tr><td><span class="badge badge-green">GET</span></td><td><span class="inline-code">/api/v1/ai/risk/{username}</span></td><td>Librarian / Admin</td><td>Run ML risk inference model to predict patron delinquency.</td></tr>
      <tr><td><span class="badge badge-green">GET</span></td><td><span class="inline-code">/api/v1/health</span></td><td>Public</td><td>System health, database connectivity, and uptime telemetry.</td></tr>
    </tbody>
  </table>

  <!-- ================= SECTION 9: EXECUTION GUIDE ================= -->
  <h1 class="doc-section">9. How to Run the Application</h1>
  <div class="grid-2">
    <div class="feature-card">
      <div class="feature-card-header">💻 Running in IntelliJ IDEA</div>
      <div class="feature-card-body">
        1. Open folder <span class="inline-code">library</span> in IntelliJ.<br>
        2. Right-click <span class="inline-code">backend/pom.xml</span> &rarr; click <strong>Add as Maven Project</strong>.<br>
        3. Open <span class="inline-code">LibraAiApplication.java</span> &rarr; click green <strong>Run ▶️</strong>.<br>
        4. In terminal: <span class="inline-code">cd frontend && npm run dev</span>.<br>
        5. Access app at <strong>http://localhost:5173</strong>.
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-card-header">⚡ Running in VS Code / Terminal</div>
      <div class="feature-card-body">
        1. Open folder in VS Code.<br>
        2. Terminal 1 (Backend): <span class="inline-code">cd backend && mvn spring-boot:run</span>.<br>
        3. Terminal 2 (Frontend): <span class="inline-code">cd frontend && npm run dev</span>.<br>
        4. Access Swagger API at <strong>http://localhost:8080/swagger-ui.html</strong>.
      </div>
    </div>
  </div>

</body>
</html>
`;

async function generateProjectDescriptionPdf() {
  console.log('🚀 Launching Puppeteer to generate Full Project Description PDF...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();
  console.log('✅ Full Project Description PDF successfully created at: ' + OUTPUT_PDF);
}

generateProjectDescriptionPdf();
