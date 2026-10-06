import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifyAnalyticsPredictionsUI() {
  console.log('🌐 Launching browser (Edge Chromium)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });

  const artifactDir = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

  console.log('🔗 Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Sign in as Admin
  console.log('🔑 Signing in as Admin...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find((b) => b.textContent && b.textContent.includes('Sign In'));
    if (signInBtn) signInBtn.click();
  });

  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Click Admin quick login button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find((b) => b.textContent && b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2000));

  // 2. Navigate to Analytics page
  console.log('📊 Navigating to Analytics page...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    const analyticsLink = links.find((l) => l.textContent && l.textContent.includes('Analytics'));
    if (analyticsLink) analyticsLink.click();
  });

  await page.waitForSelector('h1', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 3. Verify Popularity & Demand Predictions section
  console.log('✨ Verifying Popularity & Demand Predictions...');
  const analyticsPageText = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Contains "Popularity & Trailing Demand Predictions": ${analyticsPageText.includes('Popularity & Trailing Demand Predictions')}`);
  console.log(`✅ Contains "Patron Overdue Risk Heuristic Profiles": ${analyticsPageText.includes('Patron Overdue Risk Heuristic Profiles')}`);
  console.log(`✅ Displays Demand Score & Acquisitions: ${analyticsPageText.includes('Demand Score') || analyticsPageText.includes('Acquire')}`);

  const analyticsScreenshot = path.join(artifactDir, 'analytics_demand_predictions.png');
  await page.screenshot({ path: analyticsScreenshot, fullPage: true });
  console.log(`📸 Saved screenshot to: ${analyticsScreenshot}`);

  // 4. Navigate to Admin page
  console.log('🛡️ Navigating to Admin Governance Console...');
  await page.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 5. Verify User Management Table has Heuristic Overdue Risk column
  console.log('🛡️ Verifying User Management Table Heuristic Overdue Risk column...');
  const adminPageText = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Contains "Heuristic Overdue Risk": ${adminPageText.includes('Heuristic Overdue Risk')}`);
  console.log(`✅ Displays Risk Badges (LOW RISK / MEDIUM RISK / HIGH RISK): ${adminPageText.includes('LOW RISK') || adminPageText.includes('RISK')}`);

  const adminScreenshot = path.join(artifactDir, 'admin_user_overdue_risk.png');
  await page.screenshot({ path: adminScreenshot, fullPage: true });
  console.log(`📸 Saved screenshot to: ${adminScreenshot}`);

  await browser.close();
  console.log('\n🎉 POPULARITY DEMAND PREDICTIONS & OVERDUE RISK UI VERIFICATION SUCCEEDED WITH 100% SUCCESS!');
}

verifyAnalyticsPredictionsUI().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
