#!/usr/bin/env node
// Byte accounting after the cold timing run. No timing score is inferred here.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';

const base = new URL(process.argv[2] || 'http://127.0.0.1:4401/latent-watermarking-101/');
const out = path.resolve(process.argv[3] || 'outputs/design-qa/pass-8');
const assetDirectory = path.resolve('dist/assets');
const files = (await fs.readdir(assetDirectory)).filter(file => file.endsWith('.js')).sort();
const measure = (url, encoding) => new Promise((resolve, reject) => {
  const request = http.get(url, { headers: { 'Accept-Encoding': encoding } }, response => {
    let bodyBytes = 0;
    response.on('data', data => { bodyBytes += data.length; });
    response.on('end', () => resolve({ status: response.statusCode, encoding: response.headers['content-encoding'] || 'identity', contentType: response.headers['content-type'], bodyBytes }));
  });
  request.setTimeout(10000, () => request.destroy(new Error(`Timed out: ${url}`)));
  request.on('error', reject);
});
const report = { generatedAt: new Date().toISOString(), base: base.href, notes: ['Response body counts use raw HTTP reads, so gzip and Brotli lengths are not transparently decompressed.', 'All-build JavaScript totals include lazy chunks that a single page does not load.', 'Cold page resource totals are the JavaScript, CSS and font entries saved by qa-handbook. They exclude the navigation HTML and any resource outside that filter; these are not whole-page totals.', 'Resource transferSize is the browser performance entry value, including its reported response overhead. This script does not infer timing from byte totals.'], assets: [], coldPages: [] };
for (const file of files) {
  const url = new URL(`assets/${file}`, base).href;
  const identity = await measure(url, 'identity');
  const gzip = await measure(url, 'gzip');
  const brotli = await measure(url, 'br');
  report.assets.push({ file, url, identity, gzip, brotli });
}
const sum = (assets, encoding) => assets.reduce((total, asset) => total + asset[encoding].bodyBytes, 0);
report.allBuildJavaScript = { fileCount: report.assets.length, decodedBytes: sum(report.assets, 'identity'), gzipBodyBytes: sum(report.assets, 'gzip'), brotliBodyBytes: sum(report.assets, 'brotli') };
for (const name of ['home', 'papers', 'study', 'glossary', '404']) {
  const saved = JSON.parse(await fs.readFile(path.join(out, name, 'report.json'), 'utf8'));
  const resources = saved.mobile.resources;
  const javaScript = resources.filter(resource => /\.js(?:$|\?)/.test(resource.url));
  const matched = javaScript.map(resource => report.assets.find(asset => asset.url === resource.url));
  report.coldPages.push({ page: name, measuredAt: 'original qa-handbook cold phone snapshot', recordedResourceCount: resources.length, recordedResourceBodyBytes: resources.reduce((total, resource) => total + resource.encodedBytes, 0), recordedResourceTransferBytes: resources.reduce((total, resource) => total + resource.transferBytes, 0), javaScriptCount: javaScript.length, javaScriptDecodedBytes: javaScript.reduce((total, resource) => total + resource.decodedBytes, 0), javaScriptRecordedBodyBytes: javaScript.reduce((total, resource) => total + resource.encodedBytes, 0), javaScriptRecordedTransferBytes: javaScript.reduce((total, resource) => total + resource.transferBytes, 0), sameFilesGzipBodyBytes: matched.every(Boolean) ? sum(matched, 'gzip') : null, files: javaScript.map(resource => resource.url.split('/').at(-1)) });
}
report.passed = report.assets.every(asset => [asset.identity, asset.gzip, asset.brotli].every(response => response.status === 200 && /javascript/.test(response.contentType)) && asset.identity.encoding === 'identity' && asset.gzip.encoding === 'gzip' && asset.brotli.encoding === 'br') && report.coldPages.every(page => page.sameFilesGzipBodyBytes !== null);
await fs.writeFile(path.join(out, 'transfer.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passed: report.passed, allBuildJavaScript: report.allBuildJavaScript, coldPages: report.coldPages }, null, 2));
process.exitCode = report.passed ? 0 : 1;
