import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';

// The complete handbook remains the content authority. This derived file keeps
// navigation and the home page from downloading every study and lab on entry.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { handbookEntries } = await server.ssrLoadModule('/src/handbook.ts');
  const fields = ['slug', 'shortTitle', 'title', 'kind', 'year', 'summary', 'insertion', 'training', 'labSlug'];
  const catalog = handbookEntries.map(entry => Object.fromEntries(fields.filter(field => entry[field] !== undefined).map(field => [field, entry[field]])));
  const source = `// Generated from handbookEntries by scripts/generate-paper-catalog.mjs. Do not edit.\nimport type { HandbookEntry } from './handbookTypes';\n\nexport type PaperCatalogEntry = Pick<HandbookEntry, ${fields.map(field => `'${field}'`).join(' | ')}>;\nexport const paperCatalog: PaperCatalogEntry[] = ${JSON.stringify(catalog, null, 2)};\n`;
  await writeFile(resolve('src/paperCatalog.generated.ts'), source, 'utf8');
  console.log(`Generated navigation metadata for ${catalog.length} paper studies.`);
} finally {
  await server.close();
}
