import puppeteer from 'puppeteer-core';
import path from 'path';

async function captureTabs() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInBtn = buttons.find((b) => b.textContent && b.textContent.includes('Sign In'));
    if (signInBtn) signInBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find((b) => b.textContent && b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.goto('http://127.0.0.1:5173/librarian/members/3', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // Click Ratings Tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ratingTab = btns.find((b) => b.textContent && b.textContent.includes('Reviews & Ratings'));
    if (ratingTab) ratingTab.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const artifactDir = 'C:/Users/gokul/.gemini/antigravity/brain/2e2400ca-7a34-44de-8729-cddd1c4455c8';
  await page.screenshot({ path: path.join(artifactDir, 'librarian_member_ratings.png') });
  await browser.close();
}
captureTabs();
