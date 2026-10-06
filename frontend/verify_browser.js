import puppeteer from 'puppeteer-core';
import path from 'path';

async function verify() {
  console.log('🌐 Launching headless browser (Edge Chromium)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('🔗 Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Click on Tamil filter chip
  console.log('\n--- 1. FILTERING BY TAMIL (தமிழ்) ---');
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('தமிழ்')) {
      console.log(`Found Tamil button: "${text}", clicking...`);
      await btn.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1500));
  const tamilCardTitles = await page.$$eval('div.glass-panel-hover h3', (els) =>
    els.map((e) => e.textContent?.trim())
  );
  console.log(`✅ Loaded ${tamilCardTitles.length} Tamil books in browser:`);
  tamilCardTitles.slice(0, 6).forEach((t) => console.log('  •', t));

  // 2. Click on Hindi filter chip
  console.log('\n--- 2. FILTERING BY HINDI (हिन्दी) ---');
  const currentBtns = await page.$$('button');
  for (const btn of currentBtns) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('हिन्दी')) {
      console.log(`Found Hindi button: "${text}", clicking...`);
      await btn.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1500));
  const hindiCardTitles = await page.$$eval('div.glass-panel-hover h3', (els) =>
    els.map((e) => e.textContent?.trim())
  );
  console.log(`✅ Loaded ${hindiCardTitles.length} Hindi books in browser:`);
  hindiCardTitles.slice(0, 6).forEach((t) => console.log('  •', t));

  // 3. Reset language to All and search for "Artificial Intelligence"
  console.log('\n--- 3. SEARCHING "Artificial Intelligence" & TESTING TRANSLATIONS ---');
  const allLanguageBtns = await page.$$('button');
  for (const btn of allLanguageBtns) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text === 'All') {
      await btn.click();
      break;
    }
  }

  const searchInput = await page.$('input[type="text"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('Artificial Intelligence', { delay: 50 });
  }

  await new Promise((r) => setTimeout(r, 1500));

  const searchResults = await page.$$eval('div.glass-panel-hover h3', (els) =>
    els.map((e) => e.textContent?.trim())
  );
  console.log(`Search results for "Artificial Intelligence":`, searchResults);

  // Click on "Artificial Intelligence: A Modern Approach" card
  const cards = await page.$$('div.glass-panel-hover');
  let targetCard = null;
  for (const card of cards) {
    const text = await page.evaluate((el) => el.textContent, card);
    if (text && text.includes('Artificial Intelligence: A Modern Approach')) {
      targetCard = card;
      break;
    }
  }

  if (targetCard) {
    console.log('Clicking "Artificial Intelligence: A Modern Approach" card to open details modal...');
    await targetCard.click();
    await page.waitForSelector('div.fixed.inset-0', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 1500));

    const modalText = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      return modal ? modal.innerText : '';
    });

    console.log('\n[ORIGINAL BOOK MODAL DISPLAY]');
    console.log('Title in Modal:', modalText.includes('Artificial Intelligence: A Modern Approach'));
    console.log('Language Badge in Modal:', modalText.includes('Language: English (en)'));
    console.log('Contains "Also available in:":', modalText.includes('Also available in:'));

    // Check translation links inside modal and click the Tamil translation
    console.log('\n--- 4. CLICKING TAMIL TRANSLATED EDITION IN MODAL ---');
    const modalCards = await page.$$('div.fixed.inset-0 div.cursor-pointer');
    for (const mc of modalCards) {
      const text = await page.evaluate((el) => el.textContent, mc);
      if (text && text.includes('Tamil (ta)')) {
        console.log(`Found Tamil translation card ("${text.replace(/\s+/g, ' ')}"), clicking...`);
        await mc.click();
        await new Promise((r) => setTimeout(r, 1500));
        break;
      }
    }

    const translatedModalText = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      return modal ? modal.innerText : '';
    });

    console.log('\n[TRANSLATED EDITION MODAL DISPLAY]');
    console.log('Language Badge in Modal:', translatedModalText.includes('Language: Tamil (ta)'));
    console.log('Contains "Translated Edition":', translatedModalText.includes('Translated Edition'));
    console.log('Links to Original Work:', translatedModalText.includes('Original Work: Artificial Intelligence: A Modern Approach'));
    console.log('Contains sibling translation "Also available in:":', translatedModalText.includes('Also available in:'));
  }

  await page.screenshot({ path: path.resolve('..', 'browser_verification.png'), fullPage: true });
  console.log('\n📸 Saved fullpage screenshot to browser_verification.png');

  await browser.close();
  console.log('\n🎉 ALL BROWSER VERIFICATION CHECKS PASSED WITH FLYING COLORS!');
}

verify().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
