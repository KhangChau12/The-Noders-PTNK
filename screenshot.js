const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to localhost
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // Wait a bit for animations
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take screenshot
  const screenshotPath = path.join(__dirname, 'homepage-screenshot.png');
  await page.screenshot({
    path: screenshotPath,
    fullPage: false
  });

  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
})();
