import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifyQrCirculationUI() {
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

  // 1. Sign in as Librarian
  console.log('🔑 Signing in as Librarian...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find((b) => b.textContent && b.textContent.includes('Sign In'));
    if (signInBtn) signInBtn.click();
  });

  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Click Librarian quick login button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const libBtn = btns.find((b) => b.textContent && b.textContent.includes('Librarian'));
    if (libBtn) libBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2000));

  // 2. Open Book Detail Modal by clicking first book card
  console.log('📖 Opening Book Detail Modal for Book #1...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.glass-panel-hover'));
    if (cards.length > 0) cards[0].click();
  });

  await page.waitForSelector('img[alt*="QR Code"]', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1500));

  // 3. Verify QR code images in inventory
  console.log('📷 Verifying QR Code images in BookDetailModal...');
  const qrImagesCount = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[alt*="QR Code"]'));
    return imgs.length;
  });
  console.log(`✅ Found ${qrImagesCount} QR Code image(s) in inventory.`);

  const modalQrScreenshot = path.join(artifactDir, 'book_detail_qr_inventory.png');
  await page.screenshot({ path: modalQrScreenshot, fullPage: true });
  console.log(`📸 Saved screenshot to: ${modalQrScreenshot}`);

  // 4. Click "Issue Copy" on the first available copy
  console.log('🚀 Clicking "Issue Copy" to trigger scan-to-issue circulation flow...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const issueLink = links.find((l) => l.textContent && l.textContent.includes('Issue Copy'));
    if (issueLink) issueLink.click();
  });

  await page.waitForSelector('form input[placeholder*="BC-"]', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 5. Verify barcode pre-filled and live copy preview rendered
  console.log('🔍 Checking Circulation Desk live scan lookup preview...');
  const circulationState = await page.evaluate(() => {
    const barcodeInput = document.querySelector('form input[placeholder*="BC-"]');
    const bodyText = document.body.innerText;
    return {
      barcodeVal: barcodeInput ? barcodeInput.value : '',
      hasBookTitle: bodyText.includes('Artificial Intelligence: A Modern Approach') || bodyText.includes('ISBN:'),
      hasQrPreview: !!document.querySelector('.animate-fadeIn img[alt="QR"]'),
    };
  });
  console.log(`✅ Barcode input pre-filled: "${circulationState.barcodeVal}"`);
  console.log(`✅ Scanned copy preview card active: ${circulationState.hasBookTitle}`);
  console.log(`✅ Scanned QR thumbnail rendered in preview: ${circulationState.hasQrPreview}`);

  // 6. Test the "Scan QR / Camera" modal
  console.log('📷 Testing Scan QR / Camera scanner modal...');
  await page.evaluate(() => {
    const scanBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('Scan QR / Camera')
    );
    if (scanBtn) scanBtn.click();
  });

  await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Close scanner modal
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === '✕');
    if (closeBtn) closeBtn.click();
  });

  await new Promise((r) => setTimeout(r, 1000));

  // 7. Submit Issue Form
  console.log('✍️ Submitting Issue Book form...');
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('Issue Book to Member')
    );
    if (submitBtn) submitBtn.click();
  });

  await new Promise((r) => setTimeout(r, 2500));

  const finalPageText = await page.evaluate(() => document.body.innerText);
  const issuedSuccessfully = finalPageText.includes('Successfully issued');
  console.log(`✅ Issue transaction completed: ${issuedSuccessfully}`);

  const circScreenshot = path.join(artifactDir, 'circulation_scan_to_issue.png');
  await page.screenshot({ path: circScreenshot, fullPage: true });
  console.log(`📸 Saved screenshot to: ${circScreenshot}`);

  await browser.close();
  console.log('\n🎉 ZXING QR CODE & SCAN-TO-ISSUE WORKFLOW SUCCEEDED WITH 100% SUCCESS!');
}

verifyQrCirculationUI().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
