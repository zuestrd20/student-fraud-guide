import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const outputDir = process.env.OUTPUT_DIR || path.join(os.tmpdir(), 'student-fraud-guide-qa');
fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.TEST_URL || 'http://127.0.0.1:8126/';
const lessons = JSON.parse(fs.readFileSync(new URL('../data/lessons.json', import.meta.url)));

async function route(name, query = '') {
  await page.goto(`${base}#${name}${query}`);
  await page.waitForFunction(name => document.querySelector(`nav a[data-page="${name}"]`)?.getAttribute('aria-current') === 'page', name);
}
async function count(selector, expected) {
  await page.waitForFunction(({ selector, expected }) => document.querySelectorAll(selector).length === expected, { selector, expected });
}
async function question(index) {
  await page.waitForFunction(text => document.querySelector('.quiz-card h2')?.textContent === text && !document.querySelector('.completion'), lessons.quizzes[index].question);
}
async function selectedYear(year) {
  await page.waitForFunction(year => document.querySelector('.bar-row.selected > span')?.textContent === year, String(year));
}

try {
  await route('home');
  await page.locator('.hero').waitFor();
  assert.equal(await page.locator('h1').count(), 1);
  await page.screenshot({ path: path.join(outputDir, 'fraud-desktop.png'), fullPage: true });

  await route('data');
  await page.selectOption('#year', '2024');
  await selectedYear(2024);
  await page.selectOption('#metric', 'victims');
  await page.waitForFunction(() => document.querySelector('.chart-box h2')?.textContent.includes('被害人'));
  assert.match(await page.locator('.chart-box h2').first().innerText(), /被害人/);
  await count('.bar-row', 10);
  await count('.bar-row.break', 2);
  await page.click('#reset-data');
  await selectedYear(2025);
  assert.equal(await page.locator('#year').inputValue(), '2025');
  assert.equal(await page.locator('#metric').inputValue(), 'cases');

  await route('methods');
  await page.locator('#search').fill('不存在的字串');
  await page.locator('#empty-reset').waitFor();
  await count('.method-card', 0);
  await page.click('#empty-reset');
  await count('.method-card', 14);
  await page.selectOption('#category', 'gaming');
  await count('.method-card', 2);
  assert.equal(await page.locator('#category').inputValue(), 'gaming');
  await page.locator('summary').first().click();
  await count('details[open]', 1);
  await page.click('#reset-methods');
  await count('.method-card', 14);

  await route('quiz');
  for (let index = 0; index < lessons.quizzes.length; index++) {
    await question(index);
    await page.locator(`[data-answer="${lessons.quizzes[index].answerIndex}"]`).click();
    await page.locator('.feedback').waitFor();
    await page.click('#next');
  }
  await page.locator('.completion').waitFor();
  assert.equal((await page.locator('.score').innerText()).trim(), '10 / 10');
  await page.click('#restart');
  await question(0);
  await count('.feedback', 0);
  await page.locator('[data-answer="0"]').click();
  await page.locator('.feedback').waitFor();
  await page.click('#next');
  await question(1);
  await page.goBack();
  await question(0);
  await page.locator('.feedback').waitFor();
  await route('quiz', '?q=9');
  await question(9);
  await page.locator('[data-answer="0"]').click();
  await page.locator('.feedback').waitFor();
  await page.click('#next');
  await question(1); // The first unanswered question, not a premature results screen.
  await count('.completion', 0);

  await route('sources');
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('下載含口徑與來源的 JSON').click();
  assert.equal((await downloadPromise).suggestedFilename(), 'taiwan-fraud-2016-2025.json');

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const name of ['home', 'data', 'methods', 'quiz', 'help', 'sources']) {
      await route(name);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflows at ${width}`);
    }
    await route('home');
    if (width === 390) await page.screenshot({ path: path.join(outputDir, 'fraud-mobile.png'), fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await route('home');
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '200% root text overflow');
  assert.deepEqual(errors, []);
  console.log('PASS: desktop, 390px/320px viewport, enlarged root text, filters/reset, quizzes/results/back/deep link and JSON download; no browser errors.');
} finally {
  await browser.close();
}
