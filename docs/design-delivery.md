# Design and glossary overhaul

21 October 2026. Branch: `handbook-overhaul`.

## Delivered changes

The visual direction is a signal inside apparently random noise. The home page combines a typographic opening with a computed, editable sign example. Eight selected coordinates encode eight bits; the displayed readout comes from those coordinate values. The example states its teaching boundary. Explicit insertion locations are also shown as a conceptual trace on method pages.

The chapter rail is shorter, with paper studies grouped by type. Threats and gaps has been removed from navigation. Existing study URLs and historical research URLs remain handled. The paper comparison table changes into labelled rows on phones. Studies provide an On this page disclosure below the wide-screen contents breakpoint. Long equations have visible horizontal-scroll guidance and a named keyboard focus target; short equations add neither. Reading typography, source links, focus states, controls, footer and missing-page state use the same visual system.

The glossary now contains 98 terms in six topics, replacing the former short list. It includes definitions, reasons each distinction matters, worked examples, 294 related-term references and 183 links to studies or mathematics. Search covers terms, abbreviations and related search words; topic filters, alphabet jumps and term permalinks are available. Each page renders 24 terms, and direct links select and focus their destination across pages. Related search words are explicitly distinguished from synonyms.

## Verification

The integrated `npm test` run passes 117 tests across seven files and the production build. Tests retain the original source coverage and study-route checks and add computed-sign behaviour, literal heading word separation, removed navigation, glossary integrity, pagination, filtering, focus retention, repeated-destination navigation, local contents after lazy route changes, compact study section links and conditional equation access. An independent content reviewer verified the important statistical and security distinctions, link targets and worked arithmetic. Independent review also exposed repeated-hash navigation, stale browser-test selectors and bottom-pagination reading position. Bottom pagination now moves to the top controls and exposes the new term group's beginning. Section links explicitly restore focus and scroll when their destination is already the current URL.

Production-browser evidence is recorded in `docs/design-qa.md`. Each full pass covers home, paper index, LAW study, glossary and missing chapter at desktop and phone sizes and under reduced motion. Separate critics inspect screenshots and measurements without reading the implementation or design intent. Earlier reports are saved as `design-critic-pass*.md`; the final review is `docs/design-critic-final.md`.

The first pass used an uncompressed Vite preview. Later checks use the same built files through a local Brotli/gzip server. These conditions are recorded separately. The initial JavaScript entry decreased from 646.29 kB to 272.90 kB (85.05 kB gzip). Navigation metadata is generated from the canonical handbook; complete studies, revision material, labs, the glossary, equation engine and subsequent-navigation motion code load separately. Font preloads are limited to two reading/display weights. Off-screen glossary entries defer rendering while remaining searchable and available to direct links. The noise field batches its unchanged coordinates into SVG paths while retaining all 256 computed values and the eight editable sign coordinates.

The final browser pass, saved as pass 8, records the following cold-context results at 390 px, with fourfold CPU slowdown, 150 ms latency and a 1.6 Mbit/s download limit. Each route has zero CLS and a 60 or 61 fps short scroll sample. The main audit has zero failures or warnings, runtime errors, axe violations, horizontal overflow or targets below 24 px. These are simulated conditions on this machine. Interrupted pass 7 remains separate and is not counted as a completed check.

| Route | Phone LCP |
|---|---:|
| Home | 1448 ms |
| Paper index | 1864 ms |
| LAW study | 1936 ms |
| Glossary | 1552 ms |
| Missing chapter | 1304 ms |

The final independent critic opened all 95 screenshots and rated Design 7.5, Usability 7.5, Creativity 7.0 and Content 8.0, giving **7.45/10 weighted overall**. No demonstrated functional blocker remained. Responsive design and metadata received 8.0; server semantics and indexing received 6.0 because of the retained hash router. The rubric's target of 8 in every category is not met, and no award claim is made. The most useful further changes are less space devoted to phone reference controls, more varied reference compositions and independently indexable chapter documents. These recommendations are retained in the critic's report rather than relabelled as completed work.

## Running and reviewing

```powershell
npm test
npm run preview:production
```

Open `http://127.0.0.1:4401/latent-watermarking-101/`. From another terminal, `npm run qa:design` records repeatable browser evidence under ignored `outputs/design-qa/latest/`.

There are no invented projects, credentials or stock-image placeholders to replace. The design assumes the existing applied AI audience and a deliberately still reading experience. No merge, push or deployment is included. The existing GitHub Pages workflow remains the publication path when changes are merged to main.

## Limits

Headless timings use simulated phone/network conditions on this machine. They are not measurements from a physical phone or a public deployment. Hash routes still share one HTTP document, so study content requires JavaScript and a missing hash is an application state rather than its own HTTP 404. Better server-rendered indexing requires a separate routing/rendering change. The initial JavaScript entry is below 300 kB uncompressed; study content and supporting modules load at their routes.

The design does not change the source policy or the CPU experiments' interpretation. Their results remain prerequisite exercises with explicitly recorded recovery failures and no new paper-reproduction claims.
