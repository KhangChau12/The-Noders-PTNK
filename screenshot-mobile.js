const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Mobile viewport (iPhone 12 Pro)
  await page.setViewport({ width: 390, height: 844 });

  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const screenshotPath = path.join(__dirname, 'homepage-mobile-screenshot.png');
  await page.screenshot({
    path: screenshotPath,
    fullPage: false
  });

  console.log(`Mobile screenshot saved to: ${screenshotPath}`);
  await browser.close();
})();
