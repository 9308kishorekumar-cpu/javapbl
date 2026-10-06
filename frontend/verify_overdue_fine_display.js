import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

async function runOverdueTest() {
  console.log('🚀 Running Overdue Auto-Fine Browser Verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 1100 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Visit Portal & Sign in as Member
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      const signInBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Sign In'));
      if (signInBtn) signInBtn.click();
    });

    await new Promise((r) => setTimeout(r, 1000));
    await page.evaluate(() => {
      const memberBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Member'));
      if (memberBtn) memberBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2000));

    // 2. Trigger Dev Overdue Scan to make sure notifications & overdue loans are active
    console.log('⏰ Triggering Due-Date & Overdue Scan...');
    await page.evaluate(async () => {
      const token = localStorage.getItem('libraai_token');
      await fetch('/api/v1/notifications/trigger-scan', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    });

    // 3. Visit Member Dashboard
    console.log('📸 Capturing Overdue Member Dashboard...');
    await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'rental_member_dashboard_overdue_fine.png') });
    console.log('📸 Captured rental_member_dashboard_overdue_fine.png');

    console.log('🎉 Overdue fine visual test completed!');
  } catch (err) {
    console.error('❌ Error during overdue test:', err);
  } finally {
    await browser.close();
  }
}

runOverdueTest();
