#!/usr/bin/env node
// Production checks for the handbook's explicit hash routes. No development-server assumptions.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const base = new URL(args[0] || 'http://127.0.0.1:4173/latent-watermarking-101/');
base.hash = '';
const out = path.resolve(option('out', 'outputs/design-qa/pass-1'));
const throttle = !args.includes('--no-throttle');
const selected = option('routes', '').split(',').filter(Boolean);
const routes = [
  { name: 'home', hash: '#/' },
  { name: 'papers', hash: '#/papers' },
  { name: 'study', hash: '#/papers/law' },
  { name: 'glossary', hash: '#/glossary' },
  { name: '404', hash: '#/not-a-route' },
].filter(route => !selected.length || selected.includes(route.name));
if (!routes.length) throw new Error('No known routes selected. Use home,papers,study,glossary,404.');
await fs.mkdir(out, { recursive: true });
const require = createRequire(import.meta.url);
const axeSource = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

async function launchBrowser() {
  const failures = [];
  for (const options of [
    process.env.QA_CHROMIUM_PATH ? { executablePath: process.env.QA_CHROMIUM_PATH } : {},
    { channel: 'chrome' },
    { channel: 'msedge' },
  ]) {
    try { return await chromium.launch({ headless: true, ...options }); }
    catch (error) { failures.push(error.message.split('\n')[0]); }
  }
  throw new Error(`No Chromium available. Run npx playwright install chromium. ${failures.join('; ')}`);
}

function observeVitals() {
  window.__qaVitals = { lcpMs: null, lcpElement: null, cls: 0 };
  try {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        window.__qaVitals.lcpMs = Math.round(entry.startTime);
        window.__qaVitals.lcpElement = entry.element?.tagName || entry.url || null;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__qaVitals.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch { /* Older browser support is reflected by null LCP. */ }
}

async function pageMetrics(page) {
  return page.evaluate(() => {
    const visible = element => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return bounds.width > 0 && bounds.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const name = element => (element.getAttribute('aria-label') || element.innerText || element.tagName).trim().replace(/\s+/g, ' ').slice(0, 80);
    const offenders = [...document.querySelectorAll('body *')].filter(element => {
      if (!visible(element)) return false;
      const bounds = element.getBoundingClientRect();
      return bounds.right > innerWidth + 1 || bounds.left < -1;
    }).map(element => ({ tag: element.tagName, class: String(element.className).slice(0, 120), name: name(element) })).slice(0, 12);
    const smallTargets = [...document.querySelectorAll('a,button,input,select,summary')].filter(visible).filter(element => {
      const bounds = element.getBoundingClientRect();
      return bounds.width < 24 || bounds.height < 24;
    }).map(element => ({ name: name(element), width: Math.round(element.getBoundingClientRect().width), height: Math.round(element.getBoundingClientRect().height) }));
    const hiddenText = [...document.querySelectorAll('main h1,main h2,main h3,main p,main a')].filter(element => {
      const style = getComputedStyle(element);
      return element.getBoundingClientRect().height > 0 && !element.closest('[hidden],details:not([open])') && (style.visibility === 'hidden' || Number(style.opacity) < 0.05);
    }).map(name);
    const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).map(element => ({ level: Number(element.tagName[1]), text: name(element) }));
    const description = document.querySelector('meta[name="description"]')?.content || null;
    const resources = performance.getEntriesByType('resource').filter(entry => /\.(js|css|woff2?)(?:$|\?)/.test(entry.name)).map(entry => ({ url: entry.name, initiator: entry.initiatorType, durationMs: Math.round(entry.duration), responseEndMs: Math.round(entry.responseEnd), encodedBytes: entry.encodedBodySize, decodedBytes: entry.decodedBodySize, transferBytes: entry.transferSize, encoding: entry.contentEncoding || null }));
    const preloadedFonts = [...document.querySelectorAll('link[rel="preload"][as="font"]')].map(link => link.href);
    const criticalFonts = resources.filter(resource => preloadedFonts.includes(resource.url));
    return {
      viewport: { width: innerWidth, height: innerHeight },
      height: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth > innerWidth + 1,
      offenders,
      h1: [...document.querySelectorAll('h1')].map(name),
      title: document.title,
      description,
      lang: document.documentElement.lang,
      mainCount: document.querySelectorAll('main').length,
      headings: levels,
      headingSkips: levels.filter((heading, index) => index && heading.level > levels[index - 1].level + 1),
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,
      og: Object.fromEntries(['og:title', 'og:description', 'og:image', 'twitter:card'].map(property => [property, document.querySelector(`meta[property="${property}"],meta[name="${property}"]`)?.content || null])),
      favicon: document.querySelector('link[rel~="icon"]')?.href || null,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(element => { try { return JSON.parse(element.textContent); } catch { return 'INVALID'; } }),
      smallTargets,
      hiddenText,
      mathErrors: document.querySelectorAll('.katex-error').length,
      mathCount: document.querySelectorAll('.katex').length,
      resources,
      fonts: { preloadCount: preloadedFonts.length, criticalBytes: criticalFonts.reduce((total, resource) => total + resource.encodedBytes, 0), files: criticalFonts },
      vitals: { ...window.__qaVitals, cls: Math.round((window.__qaVitals?.cls || 0) * 10000) / 10000 },
    };
  });
}

async function screenshot(page, folder, name) {
  const filename = `${name}.png`;
  await page.screenshot({ path: path.join(folder, filename), fullPage: false, animations: 'disabled' });
  return filename;
}

async function frames(page, folder, prefix, count = 3) {
  const files = [];
  const max = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
  const fractions = max < 200 ? [0] : count === 2 ? [0, 1] : [0, 0.5, 1];
  let endFooterVisible = null;
  for (const [index, fraction] of fractions.entries()) {
    if (fraction === 1) {
      // content-visibility changes estimated document height as entries are laid out.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
        await page.waitForTimeout(300);
        endFooterVisible = await page.locator('footer').evaluate(footer => { const bounds = footer.getBoundingClientRect(); return bounds.top < innerHeight && bounds.bottom <= innerHeight + 2; });
        if (endFooterVisible) break;
      }
    } else {
      await page.evaluate(fraction => window.scrollTo({ top: Math.round(Math.max(0, document.documentElement.scrollHeight - innerHeight) * fraction), behavior: 'instant' }), fraction);
      await page.waitForTimeout(250);
    }
    files.push(await screenshot(page, folder, `${prefix}-${String(index + 1).padStart(2, '0')}-${fraction === 0 ? 'start' : fraction === 1 ? 'end' : 'middle'}`));
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  return { files, endFooterVisible };
}

async function fps(page) {
  return page.evaluate(() => new Promise(resolve => {
    const started = performance.now();
    let last = started;
    let frames = 0;
    let worstFrameMs = 0;
    const next = time => {
      frames += 1;
      worstFrameMs = Math.max(worstFrameMs, time - last);
      last = time;
      window.scrollBy(0, 5);
      if (time - started < 1200) requestAnimationFrame(next);
      else resolve({ fps: Math.round(frames * 1000 / (time - started)), worstFrameMs: Math.round(worstFrameMs), durationMs: Math.round(time - started) });
    };
    requestAnimationFrame(next);
  }));
}

async function axe(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations', 'incomplete'] });
    const violations = result.violations.map(violation => ({ id: violation.id, impact: violation.impact, help: violation.help, nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
    return { serious: violations.filter(violation => ['serious', 'critical'].includes(violation.impact)).length, violations, incomplete: result.incomplete.map(violation => ({ id: violation.id, count: violation.nodes.length })) };
  });
}

async function keyboard(page, folder) {
  // Reset sequential focus to the document start after preceding pointer interactions.
  await page.evaluate(() => { document.body.tabIndex = -1; document.body.focus(); document.body.removeAttribute('tabindex'); window.scrollTo({ top: 0, behavior: 'instant' }); });
  const stops = [];
  for (let index = 0; index < 7; index += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const element = document.activeElement;
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { name: (element.getAttribute('aria-label') || element.innerText || element.tagName).trim().replace(/\s+/g, ' ').slice(0, 80), tag: element.tagName, href: element.getAttribute('href'), visible: bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < innerHeight && style.visibility !== 'hidden', focusVisible: element.matches(':focus-visible'), outline: `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}`, boxShadow: style.boxShadow };
    });
    stops.push(stop);
    if (index === 0) await screenshot(page, folder, 'k-01-skip-focus');
  }
  return { skipLinkFirst: /skip/i.test(stops[0]?.name || ''), stops, invisibleFocus: stops.filter(stop => !stop.visible), noVisibleFocus: stops.filter(stop => !stop.focusVisible || (stop.outline.startsWith('0px') && stop.boxShadow === 'none')) };
}

async function mobileMenu(page, folder) {
  const button = page.locator('[aria-controls="chapter-navigation"]');
  if (!(await button.isVisible())) return { skipped: 'No visible chapter-navigation control at this viewport.' };
  await button.click();
  await page.waitForTimeout(180);
  const dialog = page.locator('#chapter-navigation');
  const opened = await button.getAttribute('aria-expanded') === 'true';
  const focusables = dialog.locator('a,button,input,select,summary').filter({ visible: true });
  const count = await focusables.count();
  const firstFocused = count > 0 && await focusables.first().evaluate(element => element === document.activeElement);
  await page.keyboard.press('Shift+Tab');
  const trappedAtLast = count > 0 && await focusables.last().evaluate(element => element === document.activeElement);
  await page.keyboard.press('Tab');
  const wrappedToFirst = count > 0 && await focusables.first().evaluate(element => element === document.activeElement);
  await screenshot(page, folder, 'm-90-menu-focus');
  await page.keyboard.press('Escape');
  const closedOnEscape = await button.getAttribute('aria-expanded') === 'false';
  const restoredFocus = await button.evaluate(element => element === document.activeElement);
  return { opened, firstFocused, trappedAtLast, wrappedToFirst, closedOnEscape, restoredFocus, focusableCount: count };
}

async function hover(page, folder, routeName) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.mouse.move(1, 1);
  const selectors = routeName === 'home' ? ['main a.button', 'main .text-action', '.sidebar nav a'] : routeName === 'papers' ? ['main .study-index .study-row', 'main button', 'main a'] : ['main button', 'main summary', 'main a'];
  const targets = [];
  for (const selector of selectors) {
    const candidates = await page.locator(selector).all();
    for (const candidate of candidates) {
      if (!await candidate.isVisible()) continue;
      if (await candidate.isDisabled()) continue;
      let bounds = await candidate.boundingBox();
      if (!bounds || bounds.width < 12 || bounds.height < 12) continue;
      if (bounds.y < 80 || bounds.y + bounds.height > 900) {
        await candidate.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        bounds = await candidate.boundingBox();
      }
      if (!bounds || bounds.y < 0 || bounds.y + bounds.height > 900) continue;
      const name = (await candidate.innerText() || await candidate.getAttribute('aria-label') || selector).trim().replace(/\s+/g, ' ').slice(0, 80);
      if (targets.some(target => target.name === name)) continue;
      const read = locator => locator.evaluate(element => {
        const capture = node => {
          const style = getComputedStyle(node);
          const bounds = node.getBoundingClientRect();
          return { transform: style.transform, translate: style.translate, rotate: style.rotate, background: style.backgroundColor, color: style.color, borderColor: style.borderColor, textDecoration: style.textDecorationLine, shadow: style.boxShadow, rect: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height } };
        };
        return { ...capture(element), children: [...element.querySelectorAll('h2,h3,span,strong')].slice(0, 8).map(child => ({ tag: child.tagName, text: child.textContent?.trim().slice(0, 60), ...capture(child) })) };
      });
      await page.mouse.move(1, 1);
      await page.waitForTimeout(220);
      const rest = await read(candidate);
      const index = String(targets.length + 1).padStart(2, '0');
      const clip = { x: Math.max(0, bounds.x - 8), y: Math.max(0, bounds.y - 8), width: Math.min(1366 - Math.max(0, bounds.x - 8), bounds.width + 16), height: Math.min(900 - Math.max(0, bounds.y - 8), bounds.height + 16) };
      await page.screenshot({ path: path.join(folder, `h-${index}-rest.png`), clip, animations: 'disabled' });
      await candidate.hover();
      await page.waitForTimeout(280);
      const hovered = await read(candidate);
      await page.screenshot({ path: path.join(folder, `h-${index}-hover.png`), clip, animations: 'disabled' });
      const differences = (before, after, prefix = '') => {
        const changes = [];
        for (const key of new Set([...Object.keys(before || {}), ...Object.keys(after || {})])) {
          const field = prefix ? `${prefix}.${key}` : key;
          if (before?.[key] && after?.[key] && typeof before[key] === 'object' && typeof after[key] === 'object') changes.push(...differences(before[key], after[key], field));
          else if (JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])) changes.push(field);
        }
        return changes;
      };
      const changed = differences(rest, hovered);
      targets.push({ name, selector, rest, hovered, changed });
      if (targets.length >= (routeName === 'home' ? 3 : 2)) break;
    }
    if (targets.length >= (routeName === 'home' ? 3 : 2)) break;
  }
  return { targets, noHoverChange: targets.filter(target => target.changed.length === 0).map(target => target.name), colorOnly: targets.filter(target => target.changed.length && target.changed.every(key => ['color', 'borderColor', 'textDecoration'].includes(key.split('.').at(-1)))).map(target => target.name) };
}

async function signExample(page, folder) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(160);
  const sample = page.locator('.signal-sample');
  if (!await sample.count()) return { skipped: 'No sign example found.' };
  const read = () => sample.evaluate(figure => {
    const field = figure.querySelector('.sample-field');
    const values = JSON.parse(field?.getAttribute('data-values') || '[]');
    const circles = [...figure.querySelectorAll('.selected circle')];
    const indexFrom = (x, y) => Math.round((y - 11) / 22) * 16 + Math.round((x - 11) / 22);
    const selectedIndices = circles.map(circle => indexFrom(Number(circle.getAttribute('cx')), Number(circle.getAttribute('cy'))));
    const radiusFor = value => Math.min(3.5, .8 + Math.abs(value) * 1.2);
    const selectedGeometryMatches = circles.length === 8 && new Set(selectedIndices).size === 8 && circles.every((circle, position) => {
      const index = selectedIndices[position];
      const value = values[index];
      return Number.isFinite(value) && Number(circle.getAttribute('cx')) === 11 + index % 16 * 22 && Number(circle.getAttribute('cy')) === 11 + Math.floor(index / 16) * 22 && Math.abs(Number(circle.getAttribute('r')) - radiusFor(value)) < 1e-8 && circle.getAttribute('fill') === (value >= 0 ? '#e4eceb' : '#657376') && circle.closest('.selected').querySelector('.coordinate-bit')?.textContent === (value >= 0 ? '1' : '0');
    });
    const paths = [...field.querySelectorAll('path')];
    const backgroundShapes = paths.flatMap(path => [...path.getAttribute('d').matchAll(/M([-\d.e+]+) ([-\d.e+]+)a([-\d.e+]+) ([-\d.e+]+)/g)].map(match => {
      const radius = Number(match[3]);
      const x = Number(match[1]) + radius;
      const y = Number(match[2]);
      const index = indexFrom(x, y);
      const value = values[index];
      return { index, matches: !selectedIndices.includes(index) && Number.isFinite(value) && Math.abs(x - (11 + index % 16 * 22)) < 1e-8 && Math.abs(y - (11 + Math.floor(index / 16) * 22)) < 1e-8 && Math.abs(radius - radiusFor(value)) < 1e-8 && path.getAttribute('fill') === (value >= 0 ? '#e4eceb' : '#657376') };
    }));
    return {
      decoded: figure.querySelector('output')?.textContent,
      selectedBits: [...figure.querySelectorAll('.selected .coordinate-bit')].map(node => node.textContent).join(''),
      selectedSigns: selectedIndices.map(index => values[index] >= 0 ? '1' : '0').join(''),
      messageBits: [...figure.querySelectorAll('.bit-controls button')].map(node => node.textContent).join(''),
      selectedIndices,
      values,
      valueCountValid: values.length === 256 && values.every(value => Number.isFinite(value)),
      selectedGeometryMatches,
      backgroundGeometryMatches: backgroundShapes.length === 248 && new Set(backgroundShapes.map(shape => shape.index)).size === 248 && backgroundShapes.every(shape => shape.matches),
      fixedCoordinates: values.filter((_, index) => !selectedIndices.includes(index)),
      magnitudes: values.map(value => Math.abs(value)),
      backgroundPaths: paths.map(path => ['d', 'fill', 'opacity'].map(attribute => path.getAttribute(attribute))),
      backgroundPathCount: paths.length,
    };
  });
  const before = await read();
  const reveal = sample.locator('.sample-reveal');
  const initiallyHidden = await reveal.getAttribute('aria-pressed') === 'false' && before.decoded === '········';
  await reveal.click();
  const revealed = await read();
  const revealedFromSelectedSigns = revealed.decoded === revealed.selectedBits && revealed.decoded === revealed.selectedSigns && revealed.decoded === revealed.messageBits && /^[01]{8}$/.test(revealed.decoded);
  await screenshot(page, folder, 'd-85-signal-revealed');
  await sample.locator('.bit-controls button').first().click();
  const edited = await read();
  const onlyFirstBitChanged = edited.decoded?.[0] !== revealed.decoded?.[0] && edited.decoded?.slice(1) === revealed.decoded?.slice(1);
  const editedRecoveryMatchesSigns = edited.decoded === edited.selectedBits && edited.decoded === edited.selectedSigns && edited.decoded === edited.messageBits;
  const unselectedCoordinatesFixed = JSON.stringify(edited.fixedCoordinates) === JSON.stringify(before.fixedCoordinates) && edited.fixedCoordinates.length === 248;
  const magnitudesFixed = JSON.stringify(edited.magnitudes) === JSON.stringify(before.magnitudes);
  const backgroundPathsUnchanged = JSON.stringify(edited.backgroundPaths) === JSON.stringify(before.backgroundPaths);
  const changedIndices = edited.values.map((value, index) => value !== before.values[index] ? index : -1).filter(index => index >= 0);
  const onlySelectedCoordinateChanged = changedIndices.length === 1 && changedIndices[0] === before.selectedIndices[0];
  const allValuesVerified = before.valueCountValid && edited.valueCountValid;
  const selectedGeometryVerified = before.selectedGeometryMatches && edited.selectedGeometryMatches;
  const backgroundGeometryVerified = before.backgroundGeometryMatches && edited.backgroundGeometryMatches;
  await screenshot(page, folder, 'd-86-signal-edited');
  await sample.locator('.bit-controls button').first().click();
  await reveal.click();
  return { initiallyHidden, revealedFromSelectedSigns, onlyFirstBitChanged, editedRecoveryMatchesSigns, unselectedCoordinatesFixed, magnitudesFixed, backgroundPathsUnchanged, onlySelectedCoordinateChanged, allValuesVerified, selectedGeometryVerified, backgroundGeometryVerified, initialMessage: before.messageBits, revealedRecovery: revealed.decoded, editedMessage: edited.messageBits, editedRecovery: edited.decoded, selectedCoordinates: 8, fixedCoordinates: edited.fixedCoordinates.length, backgroundPathCount: before.backgroundPathCount };
}

async function glossaryControls(page, folder) {
  const search = page.getByRole('searchbox', { name: 'Search terms' });
  const topic = page.getByRole('combobox', { name: 'Topic', exact: true });
  if (!await search.count() || !await topic.count()) return { skipped: 'Glossary search or topic control not found.' };
  const entries = page.locator('.glossary-entry');
  const initialCount = await entries.count();
  const initialStatus = await page.locator('.result-count').innerText();
  const totalTerms = Number(initialStatus.match(/of\s+(\d+)\s+terms/)?.[1] || 0);
  const initialPageSize = initialCount === 24 && totalTerms === 98;
  const pages = page.getByRole('navigation', { name: 'Glossary pages', exact: true });
  const previous = pages.getByRole('button', { name: 'Previous terms', exact: true });
  const next = pages.getByRole('button', { name: 'Next terms', exact: true });
  const firstPagePreviousDisabled = await previous.isDisabled();
  const firstId = await entries.first().getAttribute('id');
  await next.click();
  const nextPageMovesWindow = await entries.count() === 24 && await entries.first().getAttribute('id') !== firstId && /Showing\s+25\s+to\s+48/.test(await page.locator('.result-count').innerText());
  const secondPagePreviousEnabled = !await previous.isDisabled();
  await previous.click();
  const previousRestoresWindow = await entries.first().getAttribute('id') === firstId && await previous.isDisabled();
  await search.click();
  await search.pressSequentially('BER', { delay: 60 });
  const searchCount = await entries.count();
  const searchRetainsFocus = await search.evaluate(element => element === document.activeElement);
  const searchTypesAllCharacters = await search.inputValue() === 'BER';
  const searchFindsBitErrorRate = await page.locator('#bit-error-rate dt').count() > 0;
  const searchNarrows = searchCount > 0 && searchCount < initialCount;
  await search.fill('');
  await topic.selectOption({ label: 'Detection and statistics' });
  const categoryCount = await entries.count();
  const categories = await entries.locator('.glossary-category').allTextContents();
  const categoryNarrows = categoryCount > 0 && categoryCount < initialCount;
  const categoryMatches = categories.every(category => category === 'Detection and statistics');
  await screenshot(page, folder, 'd-87-glossary-filtered');
  await search.fill('qa-no-term-184750');
  const emptyState = await page.getByRole('heading', { name: 'No matching terms', exact: true }).isVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  const clearRestores = await entries.count() === initialCount && await search.inputValue() === '' && await topic.inputValue() === 'All topics';
  await page.goto(new URL('#/glossary?section=conditioning', page.url()).href, { waitUntil: 'load' });
  await search.waitFor();
  await search.fill('CFG');
  const conditioningHidden = await page.locator('#conditioning').count() === 0;
  const beforeRelatedHash = await page.evaluate(() => location.hash);
  await page.locator('#classifier-free-guidance .glossary-related a[href="#/glossary?section=conditioning"]').click();
  await page.waitForFunction(() => document.activeElement?.id === 'conditioning', null, { timeout: 5000 });
  const relatedRestoresFilters = await search.inputValue() === '' && await topic.inputValue() === 'All topics' && await entries.count() === initialCount;
  const relatedFocusesTarget = await page.locator('#conditioning').evaluate(element => element === document.activeElement);
  const sameHashPreserved = await page.evaluate(() => location.hash) === beforeRelatedHash;
  await page.goto(new URL('#/glossary?section=white-box', page.url()).href, { waitUntil: 'load' });
  await page.locator('#white-box').waitFor();
  await page.waitForFunction(() => document.activeElement?.id === 'white-box', null, { timeout: 5000 });
  const deepLinkShowsLastPage = await entries.count() === 2 && await next.isDisabled();
  await page.reload({ waitUntil: 'load' });
  await page.locator('#white-box').waitFor();
  await page.waitForFunction(() => document.activeElement?.id === 'white-box', null, { timeout: 5000 });
  const deepLinkSurvivesRefresh = await entries.count() === 2 && await page.locator('#white-box').evaluate(term => term === document.activeElement);
  const alphabet = page.getByRole('navigation', { name: 'Jump to letter', exact: true });
  const jumpW = alphabet.getByRole('link', { name: 'Jump to W', exact: true });
  const letterTarget = new URLSearchParams((await jumpW.getAttribute('href')).split('?')[1]).get('section');
  await jumpW.click();
  await page.waitForFunction(id => document.activeElement?.id === id, letterTarget, { timeout: 5000 });
  const alphabetRevealsTarget = await page.locator(`#${letterTarget}`).evaluate(term => term === document.activeElement);
  await page.goto(new URL('#/glossary', page.url()).href, { waitUntil: 'load' });
  await page.reload({ waitUntil: 'load' });
  await page.locator('main h1').waitFor();
  return { initialCount, totalTerms, initialPageSize, firstPagePreviousDisabled, nextPageMovesWindow, secondPagePreviousEnabled, previousRestoresWindow, searchCount, searchRetainsFocus, searchTypesAllCharacters, searchFindsBitErrorRate, searchNarrows, categoryCount, categoryNarrows, categoryMatches, emptyState, clearRestores, conditioningHidden, relatedRestoresFilters, relatedFocusesTarget, sameHashPreserved, deepLinkShowsLastPage, deepLinkSurvivesRefresh, alphabetRevealsTarget };
}

async function inspectRoute(browser, route) {
  const url = new URL(route.hash, base).href;
  const folder = path.join(out, route.name);
  await fs.mkdir(folder, { recursive: true });
  const report = { url, generatedAt: new Date().toISOString(), errors: [], failedRequests: [], files: [] };
  for (const mode of ['desktop', 'mobile', 'reduced']) {
    const context = await browser.newContext({ viewport: mode === 'mobile' ? { width: 390, height: 844 } : { width: 1366, height: 900 }, deviceScaleFactor: 1, isMobile: mode === 'mobile', hasTouch: mode === 'mobile', reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
    await context.addInitScript(observeVitals);
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => report.errors.push({ mode, type: 'pageerror', message: error.message }));
    page.on('console', message => { if (message.type() === 'error') report.errors.push({ mode, type: 'console', message: message.text() }); });
    page.on('requestfailed', request => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') report.failedRequests.push({ mode, url: request.url(), error: request.failure()?.errorText }); });
    page.on('response', response => { if (response.status() >= 400) report.failedRequests.push({ mode, url: response.url(), status: response.status() }); });
    if (mode === 'mobile' && throttle) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    }
    const start = Date.now();
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.locator('main h1').waitFor();
    if (route.name === 'study') await page.locator('.equation-block .katex').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(mode === 'mobile' ? 1000 : 650);
    const metrics = await pageMetrics(page);
    report[mode] = { ...metrics, readyMs: Date.now() - start, throttled: mode === 'mobile' && throttle };
    const captured = await frames(page, folder, mode === 'desktop' ? 'd' : mode === 'mobile' ? 'm' : 'r', mode === 'reduced' ? 2 : 3);
    report.files.push(...captured.files);
    report[mode].endFooterVisible = captured.endFooterVisible;
    if (mode !== 'reduced') report[mode].scrollFps = await fps(page);
    if (mode === 'reduced') report.a11y = await axe(page);
    if (mode === 'desktop' && route.name === 'home') report.signExample = await signExample(page, folder);
    if (mode === 'desktop' && route.name === 'glossary') report.glossaryControls = await glossaryControls(page, folder);
    if (mode === 'desktop' && route.name === 'home') report.keyboard = await keyboard(page, folder);
    if (mode === 'desktop' && ['home', 'papers', 'glossary'].includes(route.name)) report.hover = await hover(page, folder, route.name);
    if (mode === 'mobile' && route.name === 'home') report.menu = await mobileMenu(page, folder);
    await context.close();
  }
  report.files = (await fs.readdir(folder)).filter(filename => filename.endsWith('.png')).sort();
  await fs.writeFile(path.join(folder, 'report.json'), JSON.stringify(report, null, 2));
  return report;
}

const browser = await launchBrowser();
const reports = [];
try {
  for (const route of routes) {
    console.log(`Checking production route ${route.name}: ${route.hash}`);
    reports.push({ name: route.name, ...await inspectRoute(browser, route) });
  }
} finally { await browser.close(); }

const audit = [];
const add = (level, route, message) => audit.push({ level, route, message });
for (const report of reports) {
  for (const mode of ['desktop', 'mobile', 'reduced']) {
    const value = report[mode];
    if (value.overflowX) add('FAIL', report.name, `${mode}: horizontal document overflow`);
    if (value.h1.length !== 1) add('FAIL', report.name, `${mode}: ${value.h1.length} h1 elements`);
    if (value.mainCount !== 1) add('FAIL', report.name, `${mode}: ${value.mainCount} main landmarks`);
    if (!value.lang) add('FAIL', report.name, `${mode}: missing document language`);
    if (value.mathErrors) add('FAIL', report.name, `${mode}: ${value.mathErrors} failed equations`);
    if (report.name === 'study' && value.mathCount === 0) add('FAIL', report.name, `${mode}: the study equation was not rendered`);
    if (value.endFooterVisible === false) add('FAIL', report.name, `${mode}: end screenshot did not reach the footer`);
    if (value.headingSkips.length) add('WARN', report.name, `${mode}: skipped heading levels`);
    if (value.smallTargets.length) add('WARN', report.name, `${mode}: ${value.smallTargets.length} targets below 24 px in one dimension`);
  }
  if (!report.desktop.description) add('FAIL', report.name, 'Missing rendered meta description');
  if (!report.desktop.canonical) add('WARN', report.name, 'Missing canonical link');
  for (const [key, value] of Object.entries(report.desktop.og)) if (!value) add('WARN', report.name, `Missing ${key}`);
  if (report.reduced.hiddenText.length) add('FAIL', report.name, `${report.reduced.hiddenText.length} main text elements hidden with reduced motion`);
  if (report.errors.length || report.failedRequests.length) add('FAIL', report.name, `${report.errors.length} console/runtime errors; ${report.failedRequests.length} failed requests`);
  if (report.a11y.serious) add('FAIL', report.name, `${report.a11y.serious} serious/critical axe violations`);
  if (report.keyboard && (!report.keyboard.skipLinkFirst || report.keyboard.invisibleFocus.length || report.keyboard.noVisibleFocus.length)) add('FAIL', report.name, 'Keyboard focus check failed; see keyboard report');
  if (report.menu && Object.values(report.menu).some(value => value === false)) add('FAIL', report.name, 'Mobile menu focus/Escape check failed');
  if (report.signExample && (report.signExample.skipped || Object.values(report.signExample).some(value => value === false))) add('FAIL', report.name, 'Computed sign example check failed; see signExample report');
  if (report.glossaryControls && (report.glossaryControls.skipped || Object.values(report.glossaryControls).some(value => value === false))) add('FAIL', report.name, 'Glossary search/category/reset check failed; see glossaryControls report');
  if (report.hover?.noHoverChange.length) add('WARN', report.name, `No detected hover change: ${report.hover.noHoverChange.join(', ')}`);
  if (report.hover?.colorOnly.length) add('WARN', report.name, `Text/border-only hover changes: ${report.hover.colorOnly.join(', ')}`);
  if (throttle && (report.mobile.vitals.lcpMs === null || report.mobile.vitals.lcpMs >= 2500)) add('FAIL', report.name, `Throttled mobile LCP ${report.mobile.vitals.lcpMs} ms; target below 2500 ms`);
  if (report.mobile.vitals.cls >= 0.05) add('FAIL', report.name, `Mobile CLS ${report.mobile.vitals.cls}; target below 0.05`);
  if (report.mobile.fonts.preloadCount > 2 || report.mobile.fonts.criticalBytes > 100 * 1024) add('FAIL', report.name, `Critical font budget exceeded: ${report.mobile.fonts.preloadCount} preloads, ${report.mobile.fonts.criticalBytes} bytes`);
  if (report.desktop.scrollFps.fps < 55 || report.mobile.scrollFps.fps < 55) add('FAIL', report.name, `Scroll sample below 55 fps: desktop ${report.desktop.scrollFps.fps}, phone ${report.mobile.scrollFps.fps}`);
}
const summary = reports.map(report => ({ page: report.name, url: report.url, errors: report.errors.length, failedRequests: report.failedRequests.length, overflow: ['desktop', 'mobile', 'reduced'].some(mode => report[mode].overflowX), mobileLcpMs: report.mobile.vitals.lcpMs, mobileCls: report.mobile.vitals.cls, desktopFps: report.desktop.scrollFps.fps, mobileFps: report.mobile.scrollFps.fps, hiddenTextReduced: report.reduced.hiddenText.length, axeSerious: report.a11y.serious, axeViolations: report.a11y.violations.map(violation => `${violation.id}: ${violation.nodes.length}`), smallTargets: report.mobile.smallTargets.length, title: report.desktop.title, screenshotCount: report.files.length, menu: report.menu, keyboard: report.keyboard ? { skipLinkFirst: report.keyboard.skipLinkFirst, invisibleFocus: report.keyboard.invisibleFocus.length, noVisibleFocus: report.keyboard.noVisibleFocus.length } : undefined, hover: report.hover ? { noHoverChange: report.hover.noHoverChange, colorOnly: report.hover.colorOnly } : undefined }));
const raw = await fetch(base);
const rawHtml = await raw.text();
const assetChecks = [];
for (const [name, value] of [
  ['og:image', reports[0]?.desktop.og['og:image']],
  ['favicon', reports[0]?.desktop.favicon],
  ['robots', new URL('robots.txt', base).href],
  ['sitemap', new URL('sitemap.xml', base).href],
]) {
  if (!value) continue;
  const source = new URL(value, base);
  const local = new URL(source.pathname + source.search, base.origin);
  const response = await fetch(local);
  const type = response.headers.get('content-type');
  assetChecks.push({ name, url: local.href, status: response.status, type });
  const expectedType = ['og:image', 'favicon'].includes(name) ? /^image\// : name === 'robots' ? /^text\/plain/ : /^(application|text)\/xml/;
  if (response.status !== 200 || !expectedType.test(type || '')) add('FAIL', 'site', `${name} does not load with the expected content type from the production build`);
}
const transport = { baseStatus: raw.status, contentEncoding: raw.headers.get('content-encoding'), assetChecks, rawHtmlHasH1: /<h1[\s>]/i.test(rawHtml), rawHtmlHasMain: /<main[\s>]/i.test(rawHtml), notes: ['Hash routes have one HTTP document. Their rendered 404 is an application state, not an HTTP 404 response.', 'Vitals are cold-context headless Chromium measurements, 4x CPU slowdown and 1.6 Mbit/s download with 150 ms latency when throttling is enabled.', 'FPS uses a short scripted scroll on this machine. It does not establish performance on physical phone hardware.', 'This script records hover style changes and clipped screenshots. The critic must inspect the pairs; a style delta alone does not establish design quality.', 'Reduced-motion text checks exclude closed details because their answers are intentionally collapsed.', 'Production metadata assets are mapped by pathname onto the local preview origin for these checks. This verifies build files, not public deployment.'] };
if (!transport.rawHtmlHasH1 || !transport.rawHtmlHasMain) add('LIMITATION', 'site', 'The server sends an SPA shell. Study text, headings and landmarks require JavaScript; the rendered audit does not establish server-rendered SEO.');
await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), base: base.href, throttle, transport, pages: summary, audit }, null, 2));
const auditText = [...audit.map(item => `${item.level.padEnd(10)} ${item.route.padEnd(12)} ${item.message}`), '', ...transport.notes, '', `${audit.filter(item => item.level === 'FAIL').length} FAIL; ${audit.filter(item => item.level === 'WARN').length} WARN; ${audit.filter(item => item.level === 'LIMITATION').length} documented limitation.`].join('\n');
await fs.writeFile(path.join(out, 'audit.txt'), `${auditText}\n`);
console.log(JSON.stringify(summary, null, 2));
console.log(auditText);
process.exitCode = audit.some(item => item.level === 'FAIL') ? 1 : 0;
