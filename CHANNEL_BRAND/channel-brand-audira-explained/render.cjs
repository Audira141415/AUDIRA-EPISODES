// Usage: node render.cjs <html> <png> <width> <height>
const puppeteer = require('puppeteer-core');
const path = require('path');
(async () => {
  const [html, png, w, h] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
  await page.goto(require('url').pathToFileURL(path.resolve(html)).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: png, type: 'png' });
  await browser.close();
})();
