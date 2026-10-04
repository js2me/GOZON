/**
 * Headless smoke check for SSR + hydration (mobx-view-model integration).
 *
 * Prereq: dev server running (`pnpm dev`, plain HTTP on 6473).
 * Usage:  node scripts/browser-check.mjs
 * Env:    BASE=http://localhost:6473  CHROME_PATH=/usr/bin/google-chrome
 *
 * Checks per page (including F5 reloads):
 * - no page errors / hydration-related console errors
 * - `/business`: SSR ctx label AND live client timer both present
 *   (the historical ctx=null crash: timer mismatch -> hydration fail ->
 *    new useId -> lost pageContexts)
 * - `/`: products rendered (skeleton must not stick)
 */
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE ?? 'http://localhost:6473';
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';

const failures = [];
const check = (label, ok, details = '') => {
  console.log(`${ok ? '  ✓' : '  ✗'} ${label}${details ? ` — ${details}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const visit = async (url, { reloads = 0, settleMs = 3000 } = {}) => {
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, settleMs));
  for (let i = 0; i < reloads; i++) {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, settleMs));
  }

  const bodyText = await page.evaluate(() => document.body.innerText);
  await page.close();

  const hydrationErrors = consoleErrors.filter((e) =>
    /hydrat|mismatch|#418|#423|#425|Cannot read/i.test(e),
  );

  return { pageErrors, consoleErrors, hydrationErrors, bodyText };
};

console.log(`\n== /business (initial + 2x F5) @ ${BASE} ==`);
const business = await visit(`${BASE}/business`, { reloads: 2 });
check('no page errors', business.pageErrors.length === 0, business.pageErrors[0]?.slice(0, 150));
check('no hydration console errors', business.hydrationErrors.length === 0, business.hydrationErrors[0]?.slice(0, 150));
check('SSR ctx label present', business.bodyText.includes('На сервере было'));
check('live client timer present', business.bodyText.includes('А у вас сейчас'));

console.log(`\n== / (initial + 1x F5) @ ${BASE} ==`);
const home = await visit(`${BASE}/`, { reloads: 1, settleMs: 4500 });
check('no page errors', home.pageErrors.length === 0, home.pageErrors[0]?.slice(0, 150));
check('no hydration console errors', home.hydrationErrors.length === 0, home.hydrationErrors[0]?.slice(0, 150));
check('products rendered (no stuck skeleton)', home.bodyText.includes('₽'));

await browser.close();

console.log(failures.length ? `\nFAILED: ${failures.length} check(s)` : '\nOK: all checks passed');
process.exitCode = failures.length ? 1 : 0;
