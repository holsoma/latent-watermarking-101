#!/usr/bin/env node
// Targeted verification after the outside critic's typography and equation findings.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = new URL(process.argv[2] || 'http://127.0.0.1:4401/latent-watermarking-101/');
const out = path.resolve(process.argv[3] || 'outputs/design-qa/final-corrections');
await fs.mkdir(out, { recursive: true });
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ headless: true, channel: 'chrome' }); }
const report = { generatedAt: new Date().toISOString(), base: base.href, home: [], equations: [], studyNavigation: [], sameHashNavigation: [], errors: [], files: [] };
const watch = page => {
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
};
const waitReady = async page => {
  await page.locator('main h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
};
const save = async (page, filename) => {
  await page.screenshot({ path: path.join(out, filename), animations: 'disabled' });
  report.files.push(filename);
};
const resources = page => page.evaluate(() => performance.getEntriesByType('resource').filter(entry => /\.(js|css)(?:$|\?)/.test(entry.name)).map(entry => ({ url: entry.name, encodedBytes: entry.encodedBodySize, decodedBytes: entry.decodedBodySize })));

try {
  for (const width of [390, 768, 1024, 1366, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : width === 1920 ? 1080 : 900 }, isMobile: width === 390, hasTouch: width === 390 });
    const page = await context.newPage();
    watch(page);
    await page.goto(new URL('#/', base).href, { waitUntil: 'load' });
    await waitReady(page);
    const state = await page.evaluate(() => {
      const heading = document.querySelector('main h1');
      const normalise = text => text.replace(/\s+/g, ' ').trim();
      const buttons = [...document.querySelectorAll('.bit-controls button')].map(button => { const bounds = button.getBoundingClientRect(); return { label: button.textContent, top: bounds.top, left: bounds.left, right: bounds.right, height: bounds.height, width: bounds.width }; });
      const card = document.querySelector('.signal-sample').getBoundingClientRect();
      const tops = buttons.map(button => button.top);
      return { width: innerWidth, literalHeading: normalise(heading.textContent), renderedHeading: normalise(heading.innerText), allEightButtonsOneRow: buttons.length === 8 && Math.max(...tops) - Math.min(...tops) <= 1, buttonsWithinCard: buttons.every(button => button.left >= card.left && button.right <= card.right), buttons, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    report.home.push({ ...state, resources: await resources(page) });
    await save(page, `home-${width}.png`);
    if (width === 768) {
      await page.locator('.signal-sample').screenshot({ path: path.join(out, 'home-sample-768.png'), animations: 'disabled' });
      report.files.push('home-sample-768.png');
    }
    await context.close();
  }
  for (const width of [390, 768]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, isMobile: width === 390, hasTouch: width === 390 });
    const page = await context.newPage();
    watch(page);
    await page.goto(new URL('#/papers/law?section=equation', base).href, { waitUntil: 'load' });
    await waitReady(page);
    const region = page.getByRole('region', { name: 'Scrollable equation', exact: true }).first();
    await region.waitFor();
    await page.locator('.equation-scroll-hint').first().waitFor({ state: 'visible' });
    await region.scrollIntoViewIfNeeded();
    await region.focus();
    const read = () => region.evaluate(element => {
      const style = getComputedStyle(element);
      const describedBy = element.getAttribute('aria-describedby');
      const hint = describedBy ? document.getElementById(describedBy) : null;
      const bounds = element.getBoundingClientRect();
      const mathBounds = element.querySelector('.katex-html')?.getBoundingClientRect();
      return { scrollLeft: element.scrollLeft, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, maxScroll: element.scrollWidth - element.clientWidth, role: element.getAttribute('role'), label: element.getAttribute('aria-label'), tabIndex: element.tabIndex, describedBy, hint: hint?.textContent, hintVisible: !!hint && hint.getBoundingClientRect().height > 0 && getComputedStyle(hint).visibility !== 'hidden', focused: element === document.activeElement, focusVisible: element.matches(':focus-visible'), outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`, mathHtml: element.querySelectorAll('.katex-html').length, mathMl: element.querySelectorAll('.katex-mathml').length, regionLeft: bounds.left, regionRight: bounds.right, mathLeft: mathBounds?.left, mathRight: mathBounds?.right };
    });
    const before = await read();
    await region.press('ArrowRight');
    await page.waitForTimeout(180);
    const afterArrow = await read();
    await save(page, `law-equation-keyboard-${width}.png`);
    let attempts = 0;
    for (; attempts < 120; attempts += 1) {
      const current = await read();
      if (current.maxScroll - current.scrollLeft <= 2) break;
      await region.press('ArrowRight');
      await page.waitForTimeout(20);
    }
    await page.waitForTimeout(180);
    await region.scrollIntoViewIfNeeded();
    const afterEnd = await read();
    await save(page, `law-equation-right-edge-${width}.png`);
    report.equations.push({ width, before, afterArrow, afterEnd, leftEdgeVisible: before.mathLeft >= before.regionLeft - 1, rightEdgeVisible: afterEnd.mathRight <= afterEnd.regionRight + 1, arrowMoves: afterArrow.scrollLeft > before.scrollLeft, reachesRightEdge: afterEnd.maxScroll - afterEnd.scrollLeft <= 2, arrowPressesToEnd: attempts, resources: await resources(page) });
    const disclosure = page.locator('.study-section-navigation');
    const summary = disclosure.locator('summary');
    await summary.scrollIntoViewIfNeeded();
    if (await disclosure.evaluate(element => element.open)) await summary.press('Enter');
    await summary.focus();
    await summary.press('Enter');
    await disclosure.evaluate(element => element.scrollIntoView({ block: 'start' }));
    const disclosureState = await disclosure.evaluate(element => {
      const summary = element.querySelector('summary');
      const links = [...element.querySelectorAll('nav[aria-label="Study sections"] a')];
      const targets = links.map(link => new URLSearchParams(link.hash.split('?')[1]).get('section'));
      const style = getComputedStyle(summary);
      return { open: element.open, visible: element.getBoundingClientRect().height > 0 && getComputedStyle(element).display !== 'none', summaryFocused: summary === document.activeElement, summaryFocusVisible: summary.matches(':focus-visible'), summaryOutline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`, linkCount: links.length, invalidTargets: targets.filter(id => !id || !document.getElementById(id)) };
    });
    await save(page, `law-local-contents-${width}.png`);
    await disclosure.locator('a[href="#/papers/law?section=mechanism"]').click();
    await page.waitForFunction(() => document.activeElement?.id === 'mechanism', null, { timeout: 5000 });
    const navigationJumpsToSection = await page.locator('#mechanism').evaluate(section => section === document.activeElement && section.getBoundingClientRect().top >= 0 && section.getBoundingClientRect().top < innerHeight);
    report.studyNavigation.push({ width, ...disclosureState, navigationJumpsToSection });
    await disclosure.locator('a[href="#/papers/law?section=equation"]').click();
    await page.waitForFunction(() => document.activeElement?.id === 'equation');
    const sameHashBefore = await page.evaluate(() => { window.scrollTo(0, 0); return location.hash; });
    await summary.scrollIntoViewIfNeeded();
    if (!(await disclosure.evaluate(element => element.open))) await summary.press('Enter');
    await disclosure.locator('a[href="#/papers/law?section=equation"]').click();
    await page.waitForFunction(() => document.activeElement?.id === 'equation');
    report.sameHashNavigation.push(await page.locator('#equation').evaluate((section, expectedHash) => ({ width: innerWidth, control: 'compact contents', hashUnchanged: location.hash === expectedHash, targetFocused: section === document.activeElement, targetVisible: section.getBoundingClientRect().top >= 0 && section.getBoundingClientRect().top < innerHeight, targetTop: section.getBoundingClientRect().top }), sameHashBefore));
    await save(page, `law-same-hash-compact-${width}.png`);
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    watch(page);
    await page.goto(new URL('#/papers/law?section=equation', base).href, { waitUntil: 'load' });
    await waitReady(page);
    await page.waitForFunction(() => document.activeElement?.id === 'equation');
    const sameHashBefore = await page.evaluate(() => { window.scrollTo(0, 0); return location.hash; });
    await page.locator('.local-contents a[href="#/papers/law?section=equation"]').click();
    await page.waitForFunction(() => document.activeElement?.id === 'equation');
    report.sameHashNavigation.push(await page.locator('#equation').evaluate((section, expectedHash) => ({ width: innerWidth, control: 'wide contents', hashUnchanged: location.hash === expectedHash, targetFocused: section === document.activeElement, targetVisible: section.getBoundingClientRect().top >= 0 && section.getBoundingClientRect().top < innerHeight, targetTop: section.getBoundingClientRect().top }), sameHashBefore));
    await save(page, 'law-same-hash-wide-1920.png');
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();
    watch(page);
    await page.goto(new URL('#/revision?section=vae-sampling', base).href, { waitUntil: 'load' });
    await waitReady(page);
    await page.locator('.equation-container .katex').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(180);
    report.fittingEquation = await page.locator('.equation-container').first().evaluate(container => { const element = container.querySelector('.equation'); return { clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, hintCount: container.querySelectorAll('.equation-scroll-hint').length, role: element.getAttribute('role'), tabIndexAttribute: element.getAttribute('tabindex'), mathHtml: element.querySelectorAll('.katex-html').length, mathMl: element.querySelectorAll('.katex-mathml').length }; });
    await context.close();
  }
} finally { await browser.close(); }
const fitting = report.fittingEquation;
report.passed = report.errors.length === 0 && report.home.every(state => state.literalHeading === 'A signal inside the noise.' && state.renderedHeading === 'A signal inside the noise.' && state.allEightButtonsOneRow && state.buttonsWithinCard && !state.overflow) && report.equations.every(state => state.arrowMoves && state.reachesRightEdge && state.leftEdgeVisible && state.rightEdgeVisible && state.before.maxScroll > 0 && state.before.tabIndex === 0 && state.before.hintVisible && state.afterArrow.focused && state.afterArrow.focusVisible && !state.afterArrow.outline.startsWith('0px') && state.afterArrow.mathHtml > 0 && state.afterArrow.mathMl > 0) && report.studyNavigation.length === 2 && report.studyNavigation.every(state => state.open && state.visible && state.summaryFocused && state.summaryFocusVisible && !state.summaryOutline.startsWith('0px') && state.linkCount === 9 && state.invalidTargets.length === 0 && state.navigationJumpsToSection) && report.sameHashNavigation.length === 3 && report.sameHashNavigation.every(state => state.hashUnchanged && state.targetFocused && state.targetVisible) && fitting.scrollWidth <= fitting.clientWidth + 1 && fitting.hintCount === 0 && fitting.role === null && fitting.tabIndexAttribute === null && fitting.mathHtml > 0 && fitting.mathMl > 0;
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.passed ? 0 : 1;
