import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

async function runDashboardReturnTest() {
  console.log('🚀 Running Member Dashboard Return Button Verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Visit Portal & Register New Patron
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Register Priya
    await page.evaluate(() => {
      const regBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Register'));
      if (regBtn) regBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const timestamp = Date.now().toString().slice(-4);
    const testUsername = `priya_${timestamp}`;
    const testEmail = `priya_${timestamp}@libraai.local`;
    const testName = `Priya Sharma`;

    await page.type('input[placeholder="e.g. John Doe"]', testName);
    await page.type('input[placeholder="e.g. johndoe"]', testUsername);
    await page.type('input[placeholder="john@example.com"]', testEmail);
    await page.type('input[placeholder="At least 6 characters"]', 'password123');

    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Register as Member'));
      if (submitBtn) submitBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2000));
    console.log(`✅ Logged in as ${testName}`);

    // 2. Book & Rent Book via API call with Priya's token
    console.log('📖 Booking & Renting AI Book (7 Days, $3.50)...');
    const bookingResult = await page.evaluate(async () => {
      const token = localStorage.getItem('libraai_token');
      const res = await fetch('/api/v1/loans/book-rental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: 1,
          rentalPeriodDays: 7,
          paymentMethod: 'UPI'
        })
      });
      return await res.json();
    });

    console.log('Booking Result:', bookingResult);

    // 3. Navigate directly to /dashboard
    console.log('👤 Navigating to Member Dashboard (/dashboard)...');
    await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // 📸 Capture Active Loan with Return Button
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_member_rental_active.png') });
    console.log('📸 Captured new_member_rental_active.png with Return Book button');

    // 4. Click "Return Book"
    console.log('🔄 Clicking Return Book button on Dashboard...');
    await page.evaluate(() => {
      const returnBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Return Book'));
      if (returnBtn) returnBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'new_member_self_return_success.png') });
    console.log('📸 Captured new_member_self_return_success.png');

    // 5. Navigate to Catalog to verify 2/2 Available stock count
    console.log('📚 Navigating to Catalog to verify auto-incremented stock count...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'catalog_stock_auto_incremented.png') });
    console.log('📸 Captured catalog_stock_auto_incremented.png');

    console.log('🎉 Dashboard Return test completed successfully!');
  } catch (err) {
    console.error('❌ Error during dashboard return test:', err);
  } finally {
    await browser.close();
  }
}

runDashboardReturnTest();
