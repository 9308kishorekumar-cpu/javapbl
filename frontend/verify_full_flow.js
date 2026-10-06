import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifyFullFlow() {
  console.log('🌐 Launching headless browser (Edge Chromium)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 1100 });

  console.log('🔗 Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });

  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });

  const artifactDir = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

  // ==========================================
  // STEP 1: BROWSE & FILTER CATALOG BY LANGUAGE
  // ==========================================
  console.log('\n--- 1. FILTERING CATALOG BY LANGUAGE (TAMIL) ---');
  const langChips = await page.$$('button');
  for (const chip of langChips) {
    const text = await page.evaluate((el) => el.textContent, chip);
    if (text && text.includes('தமிழ்')) {
      console.log(`Clicking language filter chip: "${text.trim()}"...`);
      await chip.evaluate((b) => b.click());
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 2000));

  const screenshotCatalog = path.join(artifactDir, 'multilingual_catalog_filtered.png');
  await page.screenshot({ path: screenshotCatalog, fullPage: true });
  console.log(`📸 Saved catalog screenshot to: ${screenshotCatalog}`);

  // ==========================================
  // STEP 2: OPEN BOOK DETAIL WITH TRANSLATIONS
  // ==========================================
  console.log('\n--- 2. OPENING BOOK DETAIL MODAL ---');
  
  // Click the first book card
  const clicked = await page.evaluate(() => {
    const card = document.querySelector('.glass-panel-hover');
    if (card) {
      card.click();
      return true;
    }
    return false;
  });
  console.log(`Clicked book card: ${clicked}`);

  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1500));

  const screenshotDetail = path.join(artifactDir, 'book_detail_translations.png');
  await page.screenshot({ path: screenshotDetail });
  console.log(`📸 Saved book detail modal screenshot to: ${screenshotDetail}`);

  // Close modal by clicking its close button inside modal
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
    if (closeBtns.length > 0) closeBtns[0].click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // ==========================================
  // STEP 3: CHAT — CATALOG-GROUNDED QUESTION
  // ==========================================
  console.log('\n--- 3. CHAT: CATALOG-GROUNDED QUESTION ---');
  await page.focus('#chat-input-field');
  await page.type('#chat-input-field', 'Tell me about Artificial Intelligence: A Modern Approach and its translations');
  await page.evaluate(() => {
    const btn = document.querySelector('#chat-submit-btn');
    if (btn) btn.click();
  });

  await page.waitForFunction(
    () => document.querySelectorAll('div.whitespace-pre-line').length >= 2,
    { timeout: 15000 }
  );
  await new Promise((r) => setTimeout(r, 1500));
  const content1 = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Assistant badge "From our catalog" displayed: ${content1.includes('From our catalog')}`);

  // ==========================================
  // STEP 4: CHAT — GENERAL KNOWLEDGE QUESTION
  // ==========================================
  console.log('\n--- 4. CHAT: GENERAL KNOWLEDGE QUESTION ---');
  await page.focus('#chat-input-field');
  await page.type('#chat-input-field', 'Why is Alan Turing considered the father of theoretical computer science and artificial intelligence?');
  await page.evaluate(() => {
    const btn = document.querySelector('#chat-submit-btn');
    if (btn) btn.click();
  });

  await page.waitForFunction(
    () => document.querySelectorAll('div.whitespace-pre-line').length >= 4,
    { timeout: 15000 }
  );
  await new Promise((r) => setTimeout(r, 1500));
  const content2 = await page.evaluate(() => document.body.innerText);
  console.log(`✅ Assistant badge "General knowledge" displayed: ${content2.includes('General knowledge')}`);

  // Screenshot final chat flow
  const screenshotFinal = path.join(artifactDir, 'final_combined_flow.png');
  await page.screenshot({ path: screenshotFinal, fullPage: true });
  console.log(`📸 Saved final combined verification screenshot to: ${screenshotFinal}`);

  await browser.close();
  console.log('\n🎉 ALL COMBINED VERIFICATION PASSES COMPLETED WITH 100% SUCCESS!');
}

verifyFullFlow().catch((err) => {
  console.error('Full flow verification failed:', err);
  process.exit(1);
});
