/**
 * End-to-end smoke test for the Webduct app. Drives a headless browser through
 * the full happy path: login → browse catalog → add to cart → submit order →
 * confirmation. Requires the API (:3000) and web (:4200) dev servers running
 * and the database seeded.
 *
 *   node tests/e2e/smoke.mjs
 *
 * Exit code 0 = pass. Chromium path/exe can be overridden via CHROMIUM_EXE.
 */
import { chromium } from 'playwright-core';

const EXE = process.env.CHROMIUM_EXE || undefined; // uses system Chromium if set
const BASE = process.env.WEB_BASE || 'http://127.0.0.1:4200';

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--no-sandbox', '--use-gl=swiftshader'],
});
const page = await browser.newPage();
const log = (...a) => console.log(...a);
const checks = [];
const expect = (name, cond) => {
  checks.push(cond);
  log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
};

try {
  // Auth guard redirects to login.
  await page.goto(`${BASE}/#!/main/order`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  expect('unauthenticated redirect to login', page.url().includes('/login'));

  // Login.
  await page.fill('input[formcontrolname="email"]', 'admin@webduct.test');
  await page.fill('input[formcontrolname="password"]', 'password123');
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(1200);
  expect('login reaches order page', page.url().includes('/main/order'));

  // Catalog lists products.
  await page.goto(`${BASE}/#/main/catalog`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  expect('catalog lists products', (await page.locator('tr[mat-row]').count()) >= 1);

  // Add to cart.
  await page.locator('button[aria-label="Add to cart"]').first().click();
  await page.waitForTimeout(800);

  // Cart shows the item.
  await page.goto(`${BASE}/#/main/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  expect('cart has a line item', (await page.locator('tr[mat-row]').count()) >= 1);

  // Submit order.
  await page.goto(`${BASE}/#/main/order`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.fill('input[formcontrolname="poNumber"]', 'PO-E2E');
  await page.click('button:has-text("Submit order")');
  await page.waitForTimeout(2200);
  const done = await page.textContent('body');
  expect('order confirmation shows an order number', /WD-\d{5}/.test(done));

  const pass = checks.every(Boolean);
  log(`\n${pass ? 'ALL PASSED' : 'FAILURES PRESENT'}`);
  process.exit(pass ? 0 : 1);
} catch (e) {
  console.error('ERROR', e.message);
  process.exit(2);
} finally {
  await browser.close();
}
