#!/usr/bin/env node
// Supplemental wide-screen and tablet frames, plus keyboard typing on a phone viewport.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = new URL(process.argv[2] || 'http://127.0.0.1:4401/latent-watermarking-101/');
const out = path.resolve(process.argv[3] || 'outputs/design-qa/pass-2/responsive');
await fs.mkdir(out, { recursive: true });
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ headless: true, channel: 'chrome' }); }
const report = { generatedAt: new Date().toISOString(), base: base.href, frames: [], errors: [], checks: {} };
const errors = page => {
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
};
const open = async (page, hash) => {
  await page.goto(new URL(hash, base).href, { waitUntil: 'load', timeout: 30000 });
  await page.locator('main h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
};
const capture = async (page, name) => {
  const metrics = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1, h1: document.querySelector('main h1')?.textContent, localContentsVisible: !!document.querySelector('.local-contents') && getComputedStyle(document.querySelector('.local-contents')).display !== 'none', compactStudyContentsVisible: !!document.querySelector('.study-section-navigation') && getComputedStyle(document.querySelector('.study-section-navigation')).display !== 'none' && document.querySelector('.study-section-navigation').getBoundingClientRect().height > 0, localContentsInvalidTargets: [...document.querySelectorAll('.local-contents a')].map(link => new URLSearchParams(link.hash.split('?')[1]).get('section')).filter(id => !id || !document.getElementById(id)), mathErrors: document.querySelectorAll('.katex-error').length, mathCount: document.querySelectorAll('.katex').length }));
  await page.screenshot({ path: path.join(out, `${name}.png`), animations: 'disabled' });
  report.frames.push({ file: `${name}.png`, ...metrics });
};
const bottomPagination = async (page, suffix) => {
  const measure = () => page.evaluate(() => {
    const active = document.activeElement;
    const visibleAnchor = active.matches('.glossary-entry') ? active.querySelector('dt') : active;
    const bounds = visibleAnchor.getBoundingClientRect();
    const first = document.querySelector('.glossary-entry');
    const firstBounds = first.querySelector('dt').getBoundingClientRect();
    const topPagination = document.querySelector('nav[aria-label="Glossary pages"]').getBoundingClientRect();
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    const style = getComputedStyle(active);
    return { status: document.querySelector('.result-count').textContent, activeTarget: active.id || active.textContent.trim().slice(0, 60), activeFocusVisible: bounds.top >= headerBottom && bounds.bottom <= innerHeight && bounds.left >= 0 && bounds.right <= innerWidth, focusVisible: active.matches(':focus-visible'), outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`, activeBounds: { top: bounds.top, bottom: bounds.bottom }, firstTermId: first.id, firstTermBounds: { top: firstBounds.top, bottom: firstBounds.bottom }, firstNewTermVisible: firstBounds.top >= headerBottom && firstBounds.bottom <= innerHeight, topPaginationBounds: { top: topPagination.top, bottom: topPagination.bottom }, firstTermFollowsTopPagination: firstBounds.top >= topPagination.bottom && firstBounds.top - topPagination.bottom < 160, scrollY, viewportHeight: innerHeight };
  });
  await open(page, '#/glossary?section=white-box');
  await page.locator('#white-box').waitFor();
  const end = page.getByRole('navigation', { name: 'Glossary pages, end of terms', exact: true });
  const previous = end.getByRole('button', { name: 'Previous terms', exact: true });
  await previous.scrollIntoViewIfNeeded();
  await previous.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const previousResult = await measure();
  await capture(page, `glossary-bottom-previous-${suffix}`);
  report.checks[`bottomPrevious${suffix}`] = { expectedPage: /Showing\s+73\s+to\s+96/.test(previousResult.status), ...previousResult };
  await open(page, '#/glossary');
  await page.reload({ waitUntil: 'load' });
  await page.locator('.glossary-entry').first().waitFor();
  const next = end.getByRole('button', { name: 'Next terms', exact: true });
  await next.scrollIntoViewIfNeeded();
  await next.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const nextResult = await measure();
  await capture(page, `glossary-bottom-next-${suffix}`);
  report.checks[`bottomNext${suffix}`] = { expectedPage: /Showing\s+25\s+to\s+48/.test(nextResult.status), ...nextResult };
};
try {
  for (const width of [768, 1024, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1920 ? 1080 : 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    errors(page);
    for (const [name, hash] of [['home', '#/'], ['study', '#/papers/law'], ['glossary', '#/glossary']]) {
      await open(page, hash);
      await capture(page, `${name}-${width}`);
      if (name === 'study') {
        await open(page, '#/papers/law?section=equation');
        await page.locator('.equation-block .katex').first().waitFor();
        await capture(page, `${name}-equation-${width}`);
      }
    }
    if (width === 1920) {
      await open(page, '#/papers/law?section=mechanism');
      await page.waitForFunction(() => document.activeElement?.id === 'mechanism', null, { timeout: 5000 });
      const directSectionFocus = await page.locator('#mechanism').evaluate(section => section === document.activeElement);
      const localContentsCount = await page.locator('.local-contents a').count();
      await page.locator('.local-contents a[href="#/papers/law?section=equation"]').click();
      await page.waitForFunction(() => document.activeElement?.id === 'equation', null, { timeout: 5000 });
      const localContentsFocus = await page.locator('#equation').evaluate(section => section === document.activeElement);
      await page.reload({ waitUntil: 'load' });
      await page.locator('.handbook-study h1').waitFor();
      await page.waitForFunction(() => document.activeElement?.id === 'equation', null, { timeout: 5000 });
      const refreshedSectionFocus = await page.locator('#equation').evaluate(section => section === document.activeElement);
      await open(page, '#/glossary');
      await page.goBack();
      await page.locator('.handbook-study h1').waitFor();
      await page.waitForFunction(() => location.hash.endsWith('section=equation') && document.activeElement?.id === 'equation', null, { timeout: 5000 });
      const backRestoresSection = await page.locator('#equation').evaluate(section => section === document.activeElement);
      await page.goForward();
      await page.locator('.glossary-page h1').waitFor();
      const forwardRestoresGlossary = await page.evaluate(() => location.hash === '#/glossary');
      report.checks.sectionNavigation = { directSectionFocus, localContentsCount, localContentsFocus, refreshedSectionFocus, backRestoresSection, forwardRestoresGlossary };
    }
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    errors(page);
    await open(page, '#/');
    await page.locator('.sample-reveal').click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await capture(page, 'home-revealed-1366');
    await page.locator('.bit-controls button').first().click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await capture(page, 'home-edited-1366');
    await open(page, '#/papers/law?section=equation');
    await page.locator('.local-variance-figure').waitFor();
    await page.locator('.local-variance-figure').evaluate(figure => figure.closest('.worked-example').scrollIntoView({ block: 'start' }));
    await capture(page, 'study-worked-1366');
    report.checks.localVarianceFigure = await page.locator('.local-variance-figure').evaluate(figure => {
      const bars = [...figure.querySelectorAll('.variance-bar')].map(bar => Number(bar.getAttribute('width')));
      const radii = [...figure.querySelectorAll('.variance-orbit')].map(circle => Number(circle.getAttribute('r')));
      const labels = [...figure.querySelectorAll('svg')].map(svg => svg.getAttribute('aria-label'));
      return { barRatio: bars[1] / bars[0], radiusRatio: radii[1] / radii[0], labels, statesApproximation: figure.querySelector('figcaption').textContent.includes('local angular approximation') };
    });
    await bottomPagination(page, '1366');
    await open(page, '#/');
    const transitionStart = Date.now();
    await page.locator('.home-hero .text-action[href="#/papers"]').click();
    report.transitions = [];
    for (const [index, targetMs] of [0, 120, 340].entries()) {
      const remaining = targetMs - (Date.now() - transitionStart);
      if (remaining > 0) await page.waitForTimeout(remaining);
      const filename = `transition-${String(index + 1).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(out, filename), animations: 'allow' });
      report.transitions.push({ file: filename, elapsedMs: Date.now() - transitionStart, ...await page.locator('main .article-header').evaluate(header => ({ heading: header.querySelector('h1')?.textContent, transform: getComputedStyle(header).transform, opacity: getComputedStyle(header).opacity })) });
    }
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    errors(page);
    await open(page, '#/glossary');
    const search = page.getByRole('searchbox', { name: 'Search terms', exact: true });
    const before = await page.locator('.glossary-entry').count();
    await search.click();
    await search.pressSequentially('inversion', { delay: 70 });
    report.checks.glossaryPhoneTyping = { value: await search.inputValue(), retainedFocus: await search.evaluate(element => element === document.activeElement), before, after: await page.locator('.glossary-entry').count() };
    await capture(page, 'glossary-search-390');
    await open(page, '#/papers');
    const paperSearch = page.getByRole('searchbox', { name: 'Search studies', exact: true });
    const paperBefore = await page.locator('.study-row').count();
    await paperSearch.click();
    await paperSearch.pressSequentially('LAW', { delay: 70 });
    report.checks.paperPhoneTyping = { value: await paperSearch.inputValue(), retainedFocus: await paperSearch.evaluate(element => element === document.activeElement), before: paperBefore, after: await page.locator('.study-row').count(), findsLaw: await page.locator('.study-row[href="#/papers/law"]').count() === 1 };
    await capture(page, 'papers-search-390');
    await open(page, '#/papers/law?section=equation');
    await page.locator('.local-variance-figure').waitFor();
    await page.locator('.local-variance-figure').evaluate(figure => figure.closest('.worked-example').scrollIntoView({ block: 'start' }));
    await capture(page, 'study-worked-390');
    await bottomPagination(page, '390');
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    errors(page);
    await open(page, '#/');
    await page.locator('.home-hero .text-action[href="#/papers"]').click();
    await page.getByRole('heading', { name: 'Paper studies', exact: true }).waitFor();
    await page.waitForTimeout(350);
    report.checks.reducedMotionNavigation = await page.locator('main .article-header').evaluate(header => ({ mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches, transform: getComputedStyle(header).transform, opacity: getComputedStyle(header).opacity, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }));
    await capture(page, 'reduced-navigation-1366');
    await context.close();
  }
} finally { await browser.close(); }
const glossary = report.checks.glossaryPhoneTyping;
const papers = report.checks.paperPhoneTyping;
const variance = report.checks.localVarianceFigure;
const navigation = report.checks.sectionNavigation;
const reduced = report.checks.reducedMotionNavigation;
report.passed = report.errors.length === 0 && report.frames.every(frame => !frame.overflow && frame.mathErrors === 0 && frame.localContentsInvalidTargets.length === 0) && glossary.value === 'inversion' && glossary.retainedFocus && glossary.after > 0 && glossary.after < glossary.before && papers.value === 'LAW' && papers.retainedFocus && papers.after > 0 && papers.after < papers.before && papers.findsLaw && variance.barRatio === .25 && variance.radiusRatio === 2 && variance.statesApproximation && navigation.localContentsCount > 0 && Object.values(navigation).every(value => value !== false) && ['1366', '390'].every(suffix => ['Previous', 'Next'].every(direction => { const result = report.checks[`bottom${direction}${suffix}`]; return result.expectedPage && result.activeFocusVisible && result.firstNewTermVisible && result.firstTermFollowsTopPagination && result.focusVisible; })) && reduced.mediaMatches && reduced.transform === 'none' && reduced.opacity === '1' && reduced.scrollBehavior === 'auto';
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.passed ? 0 : 1;
