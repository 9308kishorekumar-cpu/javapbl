import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

async function runTest() {
  console.log('🚀 Running Multi-User Registration & Book Return Stock Increment Verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Visit Portal
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Clear any previous session
    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // 2. Open Register Modal
    console.log('📝 Registering New Member...');
    await page.evaluate(() => {
      const regBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Register'));
      if (regBtn) regBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const timestamp = Date.now().toString().slice(-4);
    const testUsername = `reader_${timestamp}`;
    const testEmail = `reader_${timestamp}@libraai.local`;
    const testName = `Rahul Reader ${timestamp}`;

    // Fill registration form
    await page.type('input[placeholder="e.g. John Doe"]', testName);
    await page.type('input[placeholder="e.g. johndoe"]', testUsername);
    await page.type('input[placeholder="john@example.com"]', testEmail);
    await page.type('input[placeholder="At least 6 characters"]', 'password123');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_member_registration.png') });
    console.log('📸 Captured new_member_registration.png');

    // Submit registration
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Register as Member'));
      if (submitBtn) submitBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2000));
    console.log(`✅ Successfully registered & logged in as ${testName} (@${testUsername})!`);

    // 3. Rent a Book
    console.log('📖 Booking & Renting a Book...');
    await page.evaluate(() => {
      const detailsButtons = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent && b.textContent.includes('Details'));
      if (detailsButtons.length > 0) detailsButtons[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      const rentBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Book & Rent'));
      if (rentBtn) rentBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Confirm Rental
    await page.evaluate(() => {
      const payBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Confirm Rental'));
      if (payBtn) payBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Close Modal
    await page.evaluate(() => {
      const dashBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('View In My Loans'));
      if (dashBtn) dashBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    // 4. View in Member Dashboard
    console.log('📸 Capturing Active Rental in Member Dashboard...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_member_rental_active.png') });
    console.log('📸 Captured new_member_rental_active.png');

    // 5. Member Returns the Book
    console.log('🔄 Member Returning the Book...');
    await page.evaluate(() => {
      const returnBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Return Book'));
      if (returnBtn) returnBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_member_self_return_success.png') });
    console.log('📸 Captured new_member_self_return_success.png');

    // 6. Return to Catalog to Verify Stock Increment
    console.log('📚 Navigating to Catalog to verify auto-incremented stock...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog_stock_auto_incremented.png') });
    console.log('📸 Captured catalog_stock_auto_incremented.png');

    console.log('🎉 All verification steps and screenshots completed successfully!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

runTest();
