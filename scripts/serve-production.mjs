#!/usr/bin/env node
// A local production-like static server. Hash routes share index.html; unknown HTTP paths stay 404.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const root = await fs.realpath(path.resolve(option('dir', 'dist')));
const port = Number(option('port', '4401'));
const host = option('host', '127.0.0.1');
const base = `/${option('base', '/latent-watermarking-101/').split('/').filter(Boolean).join('/')}/`;
const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);
const types = new Map(Object.entries({
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.pdf': 'application/pdf',
}));
const cache = new Map();
const insideRoot = filename => {
  const relative = path.relative(root, filename);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};
const quality = (header, encoding) => {
  const values = String(header || '').split(',').map(value => value.trim().split(';').map(part => part.trim()));
  const value = values.find(([name]) => name === encoding) || values.find(([name]) => name === '*');
  if (!value) return encoding === 'identity' ? 1 : 0;
  const parameter = value.find(part => part.startsWith('q='));
  const number = parameter ? Number(parameter.slice(2)) : 1;
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
};
async function asset(filename) {
  const stat = await fs.stat(filename);
  const previous = cache.get(filename);
  if (previous?.mtimeMs === stat.mtimeMs && previous?.size === stat.size) return previous;
  const plain = await fs.readFile(filename);
  const type = types.get(path.extname(filename).toLowerCase()) || 'application/octet-stream';
  const compressible = /^(text\/|application\/(?:json|xml)|image\/svg\+xml)/.test(type) && plain.length >= 512;
  const [gz, br] = compressible ? await Promise.all([gzipAsync(plain, { level: 6 }), brotliAsync(plain, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })]) : [null, null];
  const value = { mtimeMs: stat.mtimeMs, size: stat.size, type, plain, gzip: gz, br, tag: createHash('sha256').update(plain).digest('hex').slice(0, 24) };
  cache.set(filename, value);
  return value;
}
function plainResponse(response, status, message) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(`${message}\n`);
}
const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); return plainResponse(response, 405, 'Method not allowed'); }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, `http://${host}:${port}`).pathname); }
  catch { return plainResponse(response, 400, 'Invalid path'); }
  if (pathname.includes('\0') || pathname.includes('\\')) return plainResponse(response, 400, 'Invalid path');
  if (pathname === base.slice(0, -1)) { response.writeHead(308, { Location: base }); return response.end(); }
  if (!pathname.startsWith(base)) return plainResponse(response, 404, 'File not found');
  const relative = pathname.slice(base.length) || 'index.html';
  let filename = path.resolve(root, relative);
  if (!insideRoot(filename)) return plainResponse(response, 403, 'Path outside the build directory');
  let status = 200;
  try {
    filename = await fs.realpath(filename);
    if (!insideRoot(filename)) return plainResponse(response, 403, 'Path outside the build directory');
    const stat = await fs.stat(filename);
    if (stat.isDirectory()) filename = await fs.realpath(path.join(filename, 'index.html'));
    if (!insideRoot(filename)) return plainResponse(response, 403, 'Path outside the build directory');
  } catch {
    status = 404;
    filename = path.join(root, '404.html');
    try { filename = await fs.realpath(filename); }
    catch { return plainResponse(response, 404, 'File not found'); }
    if (!insideRoot(filename)) return plainResponse(response, 403, 'Path outside the build directory');
  }
  try {
    const value = await asset(filename);
    const accepted = request.headers['accept-encoding'];
    const encoding = value.br && quality(accepted, 'br') > 0 && quality(accepted, 'br') >= quality(accepted, 'gzip') ? 'br' : value.gzip && quality(accepted, 'gzip') > 0 ? 'gzip' : 'identity';
    const body = encoding === 'identity' ? value.plain : value[encoding];
    const etag = `"${value.tag}-${encoding}"`;
    const fingerprinted = /-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/i.test(path.basename(filename));
    const headers = { 'Content-Type': value.type, 'Content-Length': body.length, 'Cache-Control': status === 404 ? 'no-store' : fingerprinted ? 'public, max-age=31536000, immutable' : 'no-cache', 'X-Content-Type-Options': 'nosniff', ETag: etag, Vary: 'Accept-Encoding' };
    if (encoding !== 'identity') headers['Content-Encoding'] = encoding;
    if (status === 200 && String(request.headers['if-none-match'] || '').split(',').map(tag => tag.trim()).includes(etag)) { delete headers['Content-Length']; response.writeHead(304, headers); return response.end(); }
    response.writeHead(status, headers);
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    console.error(error.message);
    plainResponse(response, 500, 'Could not read the build file');
  }
});
server.listen(port, host, () => console.log(`Serving ${root} at http://${host}:${port}${base} with Brotli/gzip text compression.`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(() => process.exit(0)));
