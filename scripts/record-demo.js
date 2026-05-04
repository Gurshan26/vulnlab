const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = process.env.DEMO_URL || 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');
const WAIT = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name, label) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log(`✓ ${label}`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1400, height: 900 } });
  const page = await browser.newPage();

  await page.goto(BASE);
  await WAIT(1500);
  await shot(page, '01-home', 'Home — lab selector');

  await page.goto(`${BASE}/lab/xss-reflected`);
  await WAIT(1500);
  await shot(page, '02-xss-reflected-vuln', 'XSS Reflected — Vulnerable mode');

  await page.type('[data-testid="search-input"]', '<img src=x onerror="alert(\'XSS\')">');
  page.once('dialog', async (dialog) => {
    console.log('Alert fired:', dialog.message());
    await dialog.dismiss();
  });
  await page.click('[data-action="search"]');
  await WAIT(1000);
  await shot(page, '03-xss-attack-fired', 'XSS alert executed — attack successful');

  await page.click('[data-mode="patched"]');
  await WAIT(600);
  await page.click('[data-action="search"]');
  await WAIT(800);
  await shot(page, '04-xss-blocked', 'Same payload blocked in patched mode');

  await page.click('[data-testid="show-diff"]');
  await WAIT(500);
  await shot(page, '05-code-diff', 'Code diff opened');

  await page.goto(`${BASE}/lab/sqli`);
  await WAIT(1200);
  await page.type('[data-field="username"]', "admin' --");
  await page.type('[data-field="password"]', 'anything');
  await page.click('[data-action="login"]');
  await WAIT(900);
  await shot(page, '06-sqli-vuln', 'SQLi works in vulnerable mode');

  await page.click('[data-mode="patched"]');
  await WAIT(500);
  await page.click('[data-action="login"]');
  await WAIT(900);
  await shot(page, '07-sqli-patched', 'SQLi blocked in patched mode');

  await page.goto(`${BASE}/lab/csrf`);
  await WAIT(1000);
  await shot(page, '08-csrf', 'CSRF lab');

  await page.goto(`${BASE}/lab/xss-stored`);
  await WAIT(1000);
  await shot(page, '09-xss-stored', 'Stored XSS lab');

  await page.goto(`${BASE}/lab/broken-auth`);
  await WAIT(1000);
  await shot(page, '10-auth', 'Broken auth lab');

  await page.goto(`${BASE}/lab/idor`);
  await WAIT(1000);
  await shot(page, '11-idor', 'IDOR lab');

  await page.goto(`${BASE}/lab/xss-reflected`);
  await WAIT(700);
  await shot(page, '12-reflected-return', 'Back to reflected XSS');

  await page.goto(`${BASE}/lab/sqli`);
  await WAIT(700);
  await shot(page, '13-sqli-return', 'Back to SQLi');

  await page.goto(BASE);
  await WAIT(700);
  await shot(page, '14-home-end', 'Home end frame');

  console.log(`\n${fs.readdirSync(OUT).length} screenshots saved to docs/screenshots/`);
  console.log('--- VIDEO DEMO SCRIPT ---');
  console.log('0:00 show home and lab list');
  console.log('0:20 reflected XSS works in vulnerable mode');
  console.log('0:45 same payload blocked in patched mode');
  console.log('1:10 show diff innerHTML -> textContent');
  console.log('1:30 SQLi admin\' -- bypass works');
  console.log('1:50 SQLi blocked in patched mode');
  console.log('2:10 quick run through CSRF/Auth/IDOR');
  console.log('2:45 end on tests + build passing');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
