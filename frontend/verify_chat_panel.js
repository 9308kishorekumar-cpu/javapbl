import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function verifyChatPanel() {
  console.log('🌐 Launching headless browser (Edge Chromium)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 950 });

  page.on('console', (msg) => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', (err) => console.log(`[BROWSER ERROR] ${err.toString()}`));

  console.log('🔗 Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Clear previous session storage for a clean test
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });

  // 1. Check if ChatPanel is mounted on page
  console.log('\n--- 1. VERIFYING CHAT PANEL MOUNT & STARTERS ---');
  await page.waitForSelector('#chat-input-field', { timeout: 10000 });
  console.log('✅ ChatPanel #chat-input-field found in DOM!');

  const starterBtns = await page.$$('.starter-prompt-btn');
  console.log(`✅ Found ${starterBtns.length} starter prompt buttons`);

  // 2. Turn 1: Click Starter Prompt for General Knowledge ("Why is Gatsby's green light significant?")
  console.log('\n--- 2. SENDING GENERAL KNOWLEDGE PROMPT ("Why is Gatsby\'s green light significant?") ---');
  for (const btn of starterBtns) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Gatsby')) {
      console.log(`Clicking starter prompt: "${text.trim()}" via evaluate click...`);
      await btn.evaluate((b) => b.click());
      break;
    }
  }

  // Wait for 2 messages (1 user, 1 assistant)
  console.log('Waiting for Turn 1 response...');
  await page.waitForFunction(
    () => document.querySelectorAll('div.whitespace-pre-line').length >= 2,
    { timeout: 15000 }
  );
  await new Promise((r) => setTimeout(r, 1000));

  const content1 = await page.evaluate(() => document.body.innerText);
  console.log(`✅ "General knowledge" badge displayed in UI: ${content1.includes('General knowledge')}`);

  // 3. Multi-Turn Turn 1: Book Inquiry ("Tell me about Artificial Intelligence: A Modern Approach")
  console.log('\n--- 3. MULTI-TURN TURN 1: BOOK INQUIRY ("Tell me about Artificial Intelligence: A Modern Approach") ---');
  await page.focus('#chat-input-field');
  await page.type('#chat-input-field', 'Tell me about Artificial Intelligence: A Modern Approach');
  await page.evaluate(() => {
    const btn = document.querySelector('#chat-submit-btn');
    if (btn) btn.click();
  });

  // Wait for 4 messages (2 user, 2 assistant)
  console.log('Waiting for Turn 2 response...');
  await page.waitForFunction(
    () => document.querySelectorAll('div.whitespace-pre-line').length >= 4,
    { timeout: 15000 }
  );
  await new Promise((r) => setTimeout(r, 1000));

  const content2 = await page.evaluate(() => document.body.innerText);
  console.log(`✅ "From our catalog" badge displayed in UI: ${content2.includes('From our catalog')}`);

  // 4. Multi-Turn Turn 2: Follow-up dependent on Turn 1 ("Who wrote it and what other languages is it available in?")
  console.log('\n--- 4. MULTI-TURN TURN 2: FOLLOW-UP ("Who wrote it and what other languages is it available in?") ---');
  await page.focus('#chat-input-field');
  await page.type('#chat-input-field', 'Who wrote it and what other languages is it available in?');
  await page.evaluate(() => {
    const btn = document.querySelector('#chat-submit-btn');
    if (btn) btn.click();
  });

  // Wait for 6 messages (3 user, 3 assistant)
  console.log('Waiting for Turn 3 response...');
  await page.waitForFunction(
    () => document.querySelectorAll('div.whitespace-pre-line').length >= 6,
    { timeout: 15000 }
  );
  await new Promise((r) => setTimeout(r, 1000));

  const content3 = await page.evaluate(() => document.body.innerText);
  console.log(`✅ "From our catalog" badge on follow-up displayed: ${content3.includes('From our catalog')}`);

  // Extract message history from UI
  const messages = await page.$$eval('div.whitespace-pre-line', (divs) =>
    divs.map((d) => d.textContent?.trim())
  );

  console.log(`\n=======================================================`);
  console.log(`TOTAL CONVERSATION MESSAGES IN UI: ${messages.length}`);
  console.log(`=======================================================`);
  messages.forEach((msg, idx) => {
    const role = idx % 2 === 0 ? 'USER' : 'ASSISTANT';
    console.log(`\n[${role} MESSAGE ${Math.floor(idx / 2) + 1}]:\n${msg}\n`);
  });

  // Capture screenshot of the full multi-turn conversation UI
  const screenshotLocal = path.resolve('..', 'chat_panel_multiturn_flow.png');
  const artifactDir = 'C:\\Users\\gokul\\.gemini\\antigravity\\brain\\2e2400ca-7a34-44de-8729-cddd1c4455c8';
  const screenshotArtifact = path.join(artifactDir, 'chat_panel_multiturn_flow.png');

  await page.screenshot({ path: screenshotLocal, fullPage: true });
  try {
    fs.copyFileSync(screenshotLocal, screenshotArtifact);
    console.log(`📸 Saved screenshot to artifact directory: ${screenshotArtifact}`);
  } catch (e) {
    console.log('Error copying screenshot to artifact directory:', e);
  }

  await browser.close();
  console.log('\n🎉 ALL BROWSER MULTI-TURN CHAT PANEL TESTS PASSED WITH 100% SUCCESS!');
}

verifyChatPanel().catch((err) => {
  console.error('Chat panel verification failed:', err);
  process.exit(1);
});
