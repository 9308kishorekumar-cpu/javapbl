import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

async function run() {
  console.log('🚀 Starting Book Rental & Auto-Overdue Fine Verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 1100 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Visit Catalog Page & Sign in as Member
    console.log('1️⃣ Navigating to Catalog (http://127.0.0.1:5173/)...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    console.log('2️⃣ Signing in as Member (Alice Reader)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const signInBtn = buttons.find((b) => b.textContent && b.textContent.includes('Sign In'));
      if (signInBtn) signInBtn.click();
    });

    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const memberBtn = btns.find((b) => b.textContent && b.textContent.includes('Member'));
      if (memberBtn) memberBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2000));
    console.log('✅ Logged in as Member.');

    // 2. Open First Book Detail Modal
    console.log('3️⃣ Opening Book Detail Modal...');
    await page.evaluate(() => {
      const bookTitle = Array.from(document.querySelectorAll('h3, .font-bold')).find(
        (el) => el.textContent && el.textContent.includes('Artificial Intelligence')
      );
      if (bookTitle) {
        bookTitle.click();
      } else {
        const firstCard = document.querySelector('.glass-panel');
        if (firstCard) firstCard.click();
      }
    });

    await new Promise((r) => setTimeout(r, 2000));

    // 3. Click Book & Rent Title button
    console.log('4️⃣ Clicking "Book & Rent Title" button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const rentBtn = btns.find((b) => b.textContent && b.textContent.includes('Book & Rent'));
      if (rentBtn) rentBtn.click();
    });

    await new Promise((r) => setTimeout(r, 1500));

    // 4. Select 7 Days duration and capture checkout modal screenshot
    console.log('5️⃣ Selecting 7-Day Duration ($3.50)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sevenDays = btns.find((b) => b.textContent && b.textContent.includes('7 Days'));
      if (sevenDays) sevenDays.click();
    });

    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'rental_booking_modal_checkout.png') });
    console.log('📸 Captured rental_booking_modal_checkout.png');

    // 5. Complete Digital Payment
    console.log('6️⃣ Completing Upfront Digital Payment...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const payBtn = btns.find((b) => b.textContent && b.textContent.includes('Pay $'));
      if (payBtn) payBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'rental_payment_digital_receipt.png') });
    console.log('📸 Captured rental_payment_digital_receipt.png');

    // 6. Navigate to Member Dashboard
    console.log('7️⃣ Navigating to Member Dashboard (/dashboard)...');
    await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'rental_member_dashboard_active.png') });
    console.log('📸 Captured rental_member_dashboard_active.png');

    // 7. Sign in as Librarian to inspect Patron Bookings & Payment Audit
    console.log('8️⃣ Signing in as Chief Librarian to check Book Bookings & Audit...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Open User Dropdown and Sign Out
    await page.evaluate(() => {
      const userBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && (b.textContent.includes('Alice') || b.textContent.includes('AR') || b.textContent.includes('Sign Out'))
      );
      if (userBtn) userBtn.click();
    });

    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(() => {
      const signOut = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && b.textContent.includes('Sign Out')
      );
      if (signOut) signOut.click();
    });

    await new Promise((r) => setTimeout(r, 1500));

    // Sign in as Librarian
    await page.evaluate(() => {
      const signInBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && b.textContent.includes('Sign In')
      );
      if (signInBtn) signInBtn.click();
    });

    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      const librarianBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && b.textContent.includes('Librarian')
      );
      if (librarianBtn) librarianBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2000));

    // 8. Open Book Detail Modal as Librarian
    console.log('9️⃣ Opening Book Detail Modal as Librarian to view Patron Bookings Audit...');
    await page.evaluate(() => {
      const bookTitle = Array.from(document.querySelectorAll('h3, .font-bold')).find(
        (el) => el.textContent && el.textContent.includes('Artificial Intelligence')
      );
      if (bookTitle) {
        bookTitle.click();
      } else {
        const firstCard = document.querySelector('.glass-panel');
        if (firstCard) firstCard.click();
      }
    });

    await new Promise((r) => setTimeout(r, 2500));

    // Scroll inside modal to Patron Bookings & Payment Audit
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0 > div');
      if (modal) modal.scrollTop = modal.scrollHeight;
    });

    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'librarian_book_patron_bookings_audit.png') });
    console.log('📸 Captured librarian_book_patron_bookings_audit.png');

    console.log('🎉 All verification screenshots generated successfully!');
  } catch (err) {
    console.error('❌ Verification error:', err);
  } finally {
    await browser.close();
  }
}

run();
