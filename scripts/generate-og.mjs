#!/usr/bin/env node
// Native typographic artwork derived from the handbook's sign-field example.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const font = await fs.readFile(path.resolve('node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2'));
let state = 2749;
const uniform = () => { state = (1664525 * state + 1013904223) >>> 0; return (state + 1) / 4294967297; };
const keyPositions = [20, 42, 67, 94, 137, 175, 208, 236];
const bits = '10110010';
const field = Array.from({ length: 256 }, (_, index) => {
  const value = Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform());
  const x = 802 + (index % 16) * 19;
  const y = 175 + Math.floor(index / 16) * 19;
  const selected = keyPositions.indexOf(index);
  if (selected >= 0) return `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="2" fill="#9be2e3"/><text x="${x}" y="${y + 3.4}" text-anchor="middle" font-size="9" fill="#101213">${bits[selected]}</text>`;
  return `<circle cx="${x}" cy="${y}" r="${Math.min(3.5, .8 + Math.abs(value) * 1.2).toFixed(2)}" opacity="${(.28 + Math.min(Math.abs(value) / 3, .65)).toFixed(2)}" fill="${value >= 0 ? '#e4eceb' : '#657376'}"/>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<title>Latent Watermarking 101</title><desc>A technical handbook on the mathematics, mechanisms and evidence of latent watermarking.</desc>
<defs><style>@font-face{font-family:Plex;src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');font-weight:600}text{font-family:Plex,Arial,sans-serif;font-weight:600}</style></defs>
<rect width="1200" height="630" fill="#101213"/>
<g stroke="#9be2e3" stroke-width="3" stroke-linecap="round"><path d="M50 49v10m7-17v24m7-29v34m7-26v18m7-12v6"/></g>
<text x="98" y="62" font-size="20" fill="#f0f2ed">Latent Watermarking <tspan fill="#9be2e3">101</tspan></text>
<text x="48" y="196" font-size="76" letter-spacing="-3" fill="#f0f2ed">A signal</text>
<text x="48" y="281" font-size="76" letter-spacing="-3" fill="#f0f2ed">inside the</text>
<text x="48" y="366" font-size="76" letter-spacing="-3" fill="#9be2e3">noise.</text>
<text x="52" y="438" font-size="22" fill="#b5c0bf">Mathematics. Mechanisms. Evidence.</text>
<rect x="758" y="124" width="374" height="391" rx="5" fill="#161c1e" stroke="#343b3d"/>
<text x="784" y="152" font-size="12" fill="#b5c0bf">INITIAL LATENT</text>
${field}
<path d="M48 555H1152" stroke="#343b3d"/>
<text x="48" y="591" font-size="16" fill="#b5c0bf">A research handbook for applied AI</text>
<text x="1152" y="591" font-size="16" text-anchor="end" fill="#9be2e3">33 paper studies</text>
</svg>`;
await fs.mkdir('public', { recursive: true });
await fs.writeFile('public/og.svg', svg);
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ headless: true, channel: 'chrome' }); }
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<html><head><style>html,body{margin:0;padding:0;width:1200px;height:630px;overflow:hidden}</style></head><body>${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'public/og.png', animations: 'disabled' });
} finally { await browser.close(); }
console.log('Wrote public/og.svg and public/og.png at 1200 × 630 px.');
