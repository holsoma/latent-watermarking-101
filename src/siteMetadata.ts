import { paperCatalog } from './paperCatalog.generated';

export const siteUrl = 'https://holsoma.github.io/latent-watermarking-101/';
const descriptions: Record<string, { title: string; description: string }> = {
  '/': { title: 'Latent Watermarking 101', description: 'Understand how images carry hidden information. Read 33 technical studies, work through the mathematics and examine evidence from CPU exercises.' },
  '/papers': { title: 'Paper studies', description: 'Search 33 source-linked studies of diffusion foundations, watermark mechanisms, attacks and benchmarks. Compare insertion locations and training requirements.' },
  '/glossary': { title: 'Glossary', description: 'A technical reference for latent watermarking: diffusion, inversion, detection, coding, evaluation and security, with examples and links to paper studies.' },
  '/revision': { title: 'Worked examples and revision', description: 'Work through latent diffusion, Fourier structure, detector thresholds and message recovery, then test your understanding with conceptual and oral questions.' },
  '/reading': { title: 'How to read a paper', description: 'Trace the inserted information, fixed components, recovery assumptions and experimental evidence when reading a latent watermarking paper.' },
};
export function applyMetadata(route: string) {
  const study = paperCatalog.find(entry => route === `/papers/${entry.slug}`);
  const record = study ? { title: study.shortTitle, description: study.summary } : descriptions[route];
  const title = record ? record.title : route.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') ?? 'Reference';
  document.title = route === '/' ? title : `${title} | Latent Watermarking 101`;
  const description = record?.description ?? 'Technical explanations of image watermarking, latent diffusion, inversion, detection and experimental evidence. Read the mechanism and examine its assumptions.';
  const setMeta = (key: string, value: string, property = false) => {
    let node = document.head.querySelector<HTMLMetaElement>(`meta[${property ? 'property' : 'name'}="${key}"]`);
    if (!node) { node = document.createElement('meta'); node.setAttribute(property ? 'property' : 'name', key); document.head.append(node); }
    node.content = value;
  };
  setMeta('description', description);
  setMeta('og:title', document.title, true);
  setMeta('og:description', description, true);
  setMeta('og:url', siteUrl, true);
  // Hash routes are client navigation states, not independent canonical HTTP documents.
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = siteUrl;
}
