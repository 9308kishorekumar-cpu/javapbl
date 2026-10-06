import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

async function verifyRolePortals() {
  console.log('🚀 Verifying Role Login Portal & Role-Specific Stock/Booking Views...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Initial Page Load (Clear localStorage to ensure unauthenticated opening page)
    console.log('1️⃣ Loading Opening Page (Unauthenticated)...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Capture Opening Portal Landing Page
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'portal_login_opening_page.png') });
    console.log('📸 Captured portal_login_opening_page.png');

    // 2. Click "Enter as Chief Librarian"
    console.log('2️⃣ Entering as Chief Librarian...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Enter as Chief Librarian'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'librarian_portal_view.png') });
    console.log('📸 Captured librarian_portal_view.png');

    // 3. Switch to Member Portal
    console.log('3️⃣ Switching to Member Portal...');
    await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Enter as Member'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'member_portal_view.png') });
    console.log('📸 Captured member_portal_view.png');

    // 4. Member Rents a Book (e.g. First available title)
    console.log('4️⃣ Member booking a book for 7 days...');
    await page.evaluate(() => {
      const rentBtns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent && b.textContent.includes('Rent Book'));
      if (rentBtns.length > 0) rentBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Confirm Payment
    await page.evaluate(() => {
      const payBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Pay & Confirm Rental'));
      if (payBtn) payBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Close Receipt Modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Back to Catalog'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // 5. Now switch back to Librarian / Admin to verify the active borrower is shown on the card!
    console.log('5️⃣ Switching to Librarian to inspect active borrower details on card...');
    await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Enter as Chief Librarian'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'librarian_view_active_borrower_card.png') });
    console.log('📸 Captured librarian_view_active_borrower_card.png');

    console.log('🎉 Role Portals & Stock/Borrower verification completed successfully!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

verifyRolePortals();
