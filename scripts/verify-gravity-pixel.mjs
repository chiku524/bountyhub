import { chromium } from '@playwright/test';

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-blink-features=AutomationControlled'],
});
const context = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
});
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});
const page = await context.newPage();
const events = [];
page.on('response', (res) => {
  const url = res.url();
  if (url.includes('trygravity') || url.includes('gr-pix') || url.includes('gr-events') || url.includes('gr-session')) {
    events.push({ url, status: res.status(), method: res.request().method() });
  }
});

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 });

let probe = null;
for (let i = 0; i < 40; i++) {
  probe = await page.evaluate(() => ({
    gravityPixel: typeof window.gravityPixel === 'object' && window.gravityPixel !== null,
    gravityFn: typeof window.gravity === 'function',
    queueLen: Array.isArray(window.gravity?.q) ? window.gravity.q.length : null,
    scriptCount: [...document.scripts].filter((s) => (s.src || '').includes('gr-pix.js')).length,
    webdriver: navigator.webdriver,
  }));
  if (probe.gravityPixel) break;
  await page.waitForTimeout(500);
}
await page.waitForTimeout(2500);

const track = events.filter((e) => /gr-events|gr-session/.test(e.url || ''));
const pix = events.filter((e) => (e.url || '').includes('gr-pix.js'));
console.log(JSON.stringify({ probe, pix, track, all: events }, null, 2));
await browser.close();
const ok = probe?.gravityPixel && pix.some((e) => e.status === 200);
process.exit(ok ? 0 : 2);
