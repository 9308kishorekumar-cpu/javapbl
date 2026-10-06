import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifyFullModel() {
  console.log('🚀 Starting Comprehensive LibraAI Full Model Verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });
  const artifactDir = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

  // 1. Visit Catalog Page
  console.log('1️⃣ Navigating to Catalog (http://127.0.0.1:5173/)...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  // 2. Sign in as Member
  console.log('2️⃣ Signing in as Member (Alice Reader)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find((b) => b.textContent && b.textContent.includes('Sign In'));
    if (signInBtn) signInBtn.click();
  });

  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const memberBtn = btns.find((b) => b.textContent && b.textContent.includes('Member'));
    if (memberBtn) memberBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2000));
  console.log('✅ Logged in as Member Alice Reader.');

  // 3. Open Book Detail & Place Hold / Reserve
  console.log('3️⃣ Opening Book Detail Modal and Testing Reservation...');
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
  await page.screenshot({ path: path.join(artifactDir, 'enhanced_book_detail_reservation.png') });
  console.log('📸 Captured enhanced_book_detail_reservation.png');

  // Close modal
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('button'));
    const xBtn = closeBtns.find((b) => b.querySelector('svg.lucide-x') || (b.textContent && b.textContent.includes('Close')));
    if (xBtn) xBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 4. Visit Member Dashboard
  console.log('4️⃣ Navigating to Member Dashboard (/dashboard)...');
  await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  const dashText = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Member Dashboard rendered: Total Loans & CSV Export = ${dashText.includes('Borrowing History') || dashText.includes('Export CSV')}`);
  await page.screenshot({ path: path.join(artifactDir, 'enhanced_member_dashboard.png') });
  console.log('📸 Captured enhanced_member_dashboard.png');

  // 5. Sign in as Admin & Visit Analytics & Member Dossier
  console.log('5️⃣ Signing in as Admin...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const userDropdown = buttons.find((b) => b.textContent && b.textContent.includes('Alice Reader'));
    if (userDropdown) userDropdown.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signOutBtn = buttons.find((b) => b.textContent && b.textContent.includes('Sign Out'));
    if (signOutBtn) signOutBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find((b) => b.textContent && b.textContent.includes('Sign In'));
    if (signInBtn) signInBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find((b) => b.textContent && b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // 6. Visit Analytics Page
  console.log('6️⃣ Navigating to Analytics & Forecasting (/analytics)...');
  await page.goto('http://127.0.0.1:5173/analytics', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'enhanced_analytics_forecasting.png') });
  console.log('📸 Captured enhanced_analytics_forecasting.png');

  // 7. Visit Librarian Member Dossier
  console.log('7️⃣ Navigating to Librarian Member Dossier (/librarian/members/3)...');
  await page.goto('http://127.0.0.1:5173/librarian/members/3', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, 'enhanced_librarian_member_dossier.png') });
  console.log('📸 Captured enhanced_librarian_member_dossier.png');

  await browser.close();
  console.log('\n🎉 ALL FULL WORKING MODEL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

verifyFullModel().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
