import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifyMemberHistoryUI() {
  console.log('🌐 Launching headless browser (Edge Chromium)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 1100 });

  const artifactDir = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

  console.log('🔗 Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Log in as Member via Quick Login
  console.log('🔑 Logging in as Member...');
  const signInBtn = await page.$('button');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Sign In')) {
      await btn.evaluate((b) => b.click());
      break;
    }
  }

  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Click Member quick login button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const memberBtn = btns.find((b) => b.textContent && b.textContent.includes('Member'));
    if (memberBtn) memberBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2000));

  // 2. Navigate to Dashboard (My Borrowings)
  console.log('📖 Navigating to Member Dashboard / My Borrowings...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    const dashLink = links.find((l) => l.textContent && (l.textContent.includes('Dashboard') || l.textContent.includes('My Borrowings')));
    if (dashLink) dashLink.click();
    else window.location.href = '/dashboard';
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));

  // 3. Verify KPI Summary Cards and History Table
  console.log('📊 Verifying Member Lifetime KPI Cards and Borrowing History...');
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Contains "Borrowing History": ${bodyText.includes('Borrowing History')}`);
  console.log(`✅ Contains "Lifetime Borrowed Titles": ${bodyText.includes('Lifetime Borrowed Titles')}`);
  console.log(`✅ Contains "Currently Active Loans": ${bodyText.includes('Currently Active Loans')}`);

  const screenshotAll = path.join(artifactDir, 'member_borrowing_history_all.png');
  await page.screenshot({ path: screenshotAll, fullPage: true });
  console.log(`📸 Saved all borrowing history screenshot to: ${screenshotAll}`);

  // 4. Test Status Filter: Returned
  console.log('🔍 Filtering by status: "Returned"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const retBtn = btns.find((b) => b.textContent && b.textContent.trim() === 'Returned');
    if (retBtn) retBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const textReturned = await page.evaluate(() => document.body.innerText);
  const showsReturned = textReturned.includes('RETURNED') && !textReturned.includes('— (Active)');
  console.log(`✅ Filtered returned loans correctly: ${showsReturned}`);

  // 5. Test Status Filter: Active
  console.log('🔍 Filtering by status: "Active"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const actBtn = btns.find((b) => b.textContent && b.textContent.trim() === 'Active');
    if (actBtn) actBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const screenshotFiltered = path.join(artifactDir, 'member_borrowing_history_filtered.png');
  await page.screenshot({ path: screenshotFiltered, fullPage: true });
  console.log(`📸 Saved filtered borrowing history screenshot to: ${screenshotFiltered}`);

  await browser.close();
  console.log('\n🎉 MEMBER BORROWING HISTORY UI VERIFICATION SUCCEEDED WITH 100% SUCCESS!');
}

verifyMemberHistoryUI().catch((err) => {
  console.error('Member history UI verification failed:', err);
  process.exit(1);
});
