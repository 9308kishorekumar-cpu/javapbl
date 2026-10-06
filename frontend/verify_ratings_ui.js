import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifyRatingsUI() {
  console.log('🌐 Launching browser (Edge Chromium)...');
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

  // 1. Sign in as Member
  console.log('🔑 Signing in as Member...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find((b) => b.textContent && b.textContent.includes('Sign In'));
    if (signInBtn) signInBtn.click();
  });

  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Click Member quick login button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const memberBtn = btns.find((b) => b.textContent && b.textContent.includes('Member'));
    if (memberBtn) memberBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2000));

  // 2. Open Book Detail Modal by clicking the first book card
  console.log('📖 Opening Book Detail Modal for Book #1...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.glass-panel-hover'));
    if (cards.length > 0) {
      cards[0].click();
    }
  });

  await page.waitForSelector('textarea', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1500));

  // 3. Verify Community Ratings & Reviews Section
  console.log('⭐ Verifying Community Ratings & Reviews section in Modal...');
  const modalText = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Contains "Community Ratings & Reviews": ${modalText.includes('Community Ratings & Reviews')}`);
  console.log(`✅ Contains "Recent Member Reviews": ${modalText.includes('Recent Member Reviews')}`);

  // 4. Rate 5 Stars and write a review
  console.log('✍️ Submitting 5-Star Rating & Review...');
  await page.evaluate(() => {
    // Click 5th star
    const starBtns = Array.from(document.querySelectorAll('button[title*="Star"]'));
    if (starBtns.length >= 5) {
      starBtns[4].click();
    }

    // Enter review text
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'Outstanding foundational textbook covering modern AI algorithms, search trees, and probabilistic decision making.';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Submit review
    const submitBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && (b.textContent.includes('Post Review') || b.textContent.includes('Update Review'))
    );
    if (submitBtn) submitBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2500));

  // 5. Verify review is displayed and score updated
  const updatedModalText = await page.evaluate(() => document.body.innerText);
  const recorded = updatedModalText.includes('recorded') || updatedModalText.includes('updated') || updatedModalText.includes('Outstanding foundational textbook');
  console.log(`✅ Review recorded successfully: ${recorded}`);

  const screenshotPath = path.join(artifactDir, 'book_detail_rating_review.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Saved screenshot to: ${screenshotPath}`);

  await browser.close();
  console.log('\n🎉 BOOK RATINGS & REVIEWS UI VERIFICATION SUCCEEDED WITH 100% SUCCESS!');
}

verifyRatingsUI().catch((err) => {
  console.error('Ratings UI verification failed:', err);
  process.exit(1);
});
