const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = process.env.DEMO_URL || 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');
const WAIT = (ms) => new Promise((r) => setTimeout(r, ms));

const LABS = [
  { slug: 'xss-reflected', label: 'Reflected XSS' },
  { slug: 'xss-stored', label: 'Stored XSS' },
  { slug: 'sqli', label: 'SQL Injection' },
  { slug: 'csrf', label: 'CSRF' },
  { slug: 'broken-auth', label: 'Broken Auth' },
  { slug: 'idor', label: 'IDOR' }
];

async function shot(page, name, label) {
  const outputPath = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`✓ ${label}`);
}

async function goLab(page, slug) {
  await page.goto(`${BASE}/lab/${slug}`, { waitUntil: 'networkidle2' });
  await WAIT(700);
}

async function captureLabDiffShots(page, slug, label, indexStart) {
  await goLab(page, slug);

  // vulnerable diff state
  await page.waitForSelector('[data-mode="vulnerable"]');
  await shot(page, `${String(indexStart).padStart(2, '0')}-${slug}-vuln-diff`, `${label} vulnerable diff`);

  // patched diff state
  await page.click('[data-mode="patched"]');
  await WAIT(500);
  await shot(page, `${String(indexStart + 1).padStart(2, '0')}-${slug}-patched-diff`, `${label} patched diff`);
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1600, height: 1000 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  page.on('dialog', async (dialog) => {
    try {
      await dialog.dismiss();
    } catch {
      // ignore
    }
  });

  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await WAIT(700);
  await shot(page, '01-home-overview', 'Home overview');

  let counter = 2;
  for (const lab of LABS) {
    await captureLabDiffShots(page, lab.slug, lab.label, counter);
    counter += 2;
  }

  console.log(`\n${fs.readdirSync(OUT).filter((f) => f.endsWith('.png')).length} screenshots saved to docs/screenshots/`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
