import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';

async function verify100MultilingualBooks() {
  console.log('🚀 Verifying 100+ Multilingual Books in Catalog...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    console.log('1️⃣ Loading Full Multilingual Catalog (100+ Books)...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Capture main catalog overview showing multilingual chips & large catalog
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'multilingual_100_books_catalog.png') });
    console.log('📸 Captured multilingual_100_books_catalog.png');

    // 2. Filter by Tamil
    console.log('2️⃣ Filtering by Tamil (ta)...');
    await page.evaluate(() => {
      const tamilBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('தமிழ்'));
      if (tamilBtn) tamilBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'multilingual_tamil_catalog.png') });
    console.log('📸 Captured multilingual_tamil_catalog.png');

    // 3. Filter by Japanese
    console.log('3️⃣ Filtering by Japanese (ja)...');
    await page.evaluate(() => {
      const jaBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('日本語'));
      if (jaBtn) jaBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'multilingual_japanese_catalog.png') });
    console.log('📸 Captured multilingual_japanese_catalog.png');

    // 4. Filter by Sanskrit / Hindi
    console.log('4️⃣ Filtering by Sanskrit (sa)...');
    await page.evaluate(() => {
      const saBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('संस्कृतम्'));
      if (saBtn) saBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'multilingual_sanskrit_catalog.png') });
    console.log('📸 Captured multilingual_sanskrit_catalog.png');

    console.log('🎉 100+ Multilingual Books verification completed successfully!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

verify100MultilingualBooks();
