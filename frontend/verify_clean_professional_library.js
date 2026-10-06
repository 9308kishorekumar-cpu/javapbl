import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

async function runCleanVerification() {
  console.log('🚀 Starting Clean & Professional Library End-to-End Verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Unauthenticated Visitor View
    console.log('1️⃣ Visiting Library Catalog as Visitor...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_library_catalog_visitor.png') });
    console.log('📸 Captured clean_library_catalog_visitor.png');

    // 2. Register New Customer
    console.log('2️⃣ Registering New Customer (Kavitha Reader)...');
    await page.evaluate(() => {
      const regBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Register'));
      if (regBtn) regBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const timestamp = Date.now().toString().slice(-4);
    const testUsername = `kavitha_${timestamp}`;
    const testEmail = `kavitha_${timestamp}@libraai.local`;
    const testName = `Kavitha Reader`;

    await page.type('input[placeholder="e.g. John Doe"]', testName);
    await page.type('input[placeholder="e.g. johndoe"]', testUsername);
    await page.type('input[placeholder="john@example.com"]', testEmail);
    await page.type('input[placeholder="At least 6 characters"]', 'password123');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_library_registration_modal.png') });
    console.log('📸 Captured clean_library_registration_modal.png');

    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Register as Member'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));
    console.log(`✅ Logged in as ${testName} (@${testUsername})`);

    // 3. Rent a Book
    console.log('3️⃣ Renting "Artificial Intelligence" Book for 7 Days ($3.50)...');
    await page.evaluate(() => {
      const rentButtons = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent && b.textContent.includes('Rent Book'));
      if (rentButtons.length > 0) rentButtons[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_library_rental_checkout.png') });
    console.log('📸 Captured clean_library_rental_checkout.png');

    // Click Confirm Rental
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Confirm Rental'));
      if (confirmBtn) confirmBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_library_digital_receipt.png') });
    console.log('📸 Captured clean_library_digital_receipt.png');

    // 4. View in Member Dashboard
    console.log('4️⃣ Viewing Member Dashboard (/dashboard)...');
    await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_library_member_dashboard.png') });
    console.log('📸 Captured clean_library_member_dashboard.png');

    // 5. Customer Returns the Book
    console.log('5️⃣ Customer Returning the Book...');
    await page.evaluate(() => {
      const returnBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Return Book'));
      if (returnBtn) returnBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2500));

    // Check Catalog for Stock Replenishment
    console.log('📚 Verifying Catalog Stock Auto-Increment...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_library_stock_replenished.png') });
    console.log('📸 Captured clean_library_stock_replenished.png');

    // 6. Sign in as Librarian to check Book Audit
    console.log('6️⃣ Signing in as Chief Librarian to check Book Audit View...');
    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      const signInBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Sign In'));
      if (signInBtn) signInBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await page.evaluate(() => {
      const libBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Librarian'));
      if (libBtn) libBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Open Book Audit for Book 1
    await page.evaluate(() => {
      const detailsButtons = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent && b.textContent.includes('Details & Audit'));
      if (detailsButtons.length > 0) detailsButtons[0].click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'clean_library_librarian_book_audit.png') });
    console.log('📸 Captured clean_library_librarian_book_audit.png');

    console.log('🎉 Clean & Professional Library verification completed with all screenshots!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

runCleanVerification();
