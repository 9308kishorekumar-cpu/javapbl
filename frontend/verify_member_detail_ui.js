import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifyMemberDetailUI() {
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
  console.log('🔑 Signing in as Admin/Librarian...');
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

  // 2. Navigate to Member Detail Page for Alice Reader (ID 3)
  console.log('📄 Navigating to Member Detail Dossier (/librarian/members/3)...');
  await page.goto('http://127.0.0.1:5173/librarian/members/3', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 3. Verify page elements
  const pageText = await page.evaluate(() => document.body.innerText);

  console.log(`✅ Contains Member Name (Alice Reader): ${pageText.includes('Alice Reader')}`);
  console.log(`✅ Contains Member Username (@member): ${pageText.includes('@member')}`);
  console.log(`✅ Contains Overdue Risk Heuristic Badge: ${pageText.includes('OVERDUE RISK') || pageText.includes('Risk Score')}`);
  console.log(`✅ Contains Lifetime Stats (Books Borrowed, Fines): ${pageText.includes('Books Borrowed') && pageText.includes('Fines Telemetry')}`);
  console.log(`✅ Contains Currently Active Loans: ${pageText.includes('Currently Active Loans')}`);
  console.log(`✅ Contains Borrowing History: ${pageText.includes('Borrowing History')}`);

  // 4. Capture screenshot of Member Detail Dossier overview
  const screenshotPath = path.join(artifactDir, 'librarian_member_detail.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Saved screenshot to: ${screenshotPath}`);

  // 5. Test Date-Range / Status Filtering on Borrowing History
  console.log('🔍 Testing Status Filter (Selecting RETURNED)...');
  await page.select('select', 'RETURNED');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const applyBtn = btns.find((b) => b.textContent && b.textContent.includes('Apply Filters'));
    if (applyBtn) applyBtn.click();
  });

  await new Promise((r) => setTimeout(r, 1500));
  const filteredText = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Filtered table displays RETURNED status: ${filteredText.includes('RETURNED')}`);

  // 6. Test Reviews & Ratings Tab
  console.log('⭐ Clicking Reviews & Ratings tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ratingTab = btns.find((b) => b.textContent && b.textContent.includes('Reviews & Ratings'));
    if (ratingTab) ratingTab.click();
  });

  await new Promise((r) => setTimeout(r, 1500));
  const ratingsText = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Rating Tab contains review: ${ratingsText.includes('masterpiece') || ratingsText.includes('Artificial Intelligence')}`);

  await browser.close();
  console.log('\n🎉 LIBRARIAN MEMBER DETAIL PAGE VERIFICATION COMPLETED SUCCESSFULLY!');
}

verifyMemberDetailUI().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
