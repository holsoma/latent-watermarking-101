# Latent Watermarking 101

A research handbook for applied AI students studying image watermarking, latent diffusion, detection and experimental claims.

[Published guide](https://holsoma.github.io/latent-watermarking-101/) · [Repository](https://github.com/holsoma/latent-watermarking-101)

## Reading the handbook

The handbook assumes Python, basic linear algebra, probability and neural networks. Foundations explain diffusion, inversion, frequency structure and evaluation. Paper studies connect the problem, embedding and recovery procedures, mathematical assumptions, evidence and limitations.

- **Paper studies:** 33 entries, searchable by their complete content and filterable by paper type, insertion location and training requirement.
- **Worked revision:** 63 conceptual questions, 20 oral questions and mathematical examples, with expandable answers and section links.
- **Implementation exercises:** 24 existing local Python exercises, separate from the technical studies. Each states its implemented boundary and CPU verification scope.

Paper URLs remain `#/papers/<slug>`. Local exercises use `#/papers/<slug>/lab`. Section links use `?section=<id>` inside the hash route. The unlisted research proposal retains its existing URL and is excluded from the handbook index.

## Source policy

Three supplied documents determine the required literature and teaching coverage: the paper map, updated quick reference and study guide. Their original DOCX files remain outside the repository. Reviewed explanations, source locators and coverage records are stored with the site.

Primary papers and author repositories support precise technical claims. Supplied summaries are identified as summaries. Preprints are not presented as accepted publications without evidence. A local exercise is not a reproduction of a paper's experimental results.

The coverage register is `docs/content-coverage.json`. Source and review records are under `docs/`. Quantitative claims must include their experimental conditions; robustness is not equivalent to unforgeability, bit accuracy is not exact-message recovery, and a frozen generator does not imply that every component is training-free.

## Run the website

Use a supported Node.js release meeting Vite's requirements (Node 22.12 or newer is recommended).

```bash
npm ci
npm run dev
```

The site uses React, TypeScript and Vite, with self-hosted IBM Plex fonts and KaTeX equations. It remains a static GitHub Pages site under `/latent-watermarking-101/`.

```bash
npm test
npm run test:content
npm run test:ui
```

`npm test` runs content and interface tests, then the production build. The tests check source coverage, study rendering, citations, filters, hash navigation, section focus, mobile drawer controls and clipboard feedback.

## Run a CPU exercise

Use Python 3.11 or 3.12 with the selected lab's declared dependencies. Start from the repository root:

```bash
python implementations/shared/run_lab.py tree-rings create
python implementations/shared/run_lab.py tree-rings detect
python implementations/shared/run_lab.py tree-rings evaluate
python implementations/shared/run_lab.py tree-rings controls
```

Replace `tree-rings` with the desired lab slug. The shared runner selects the correct module and image filename, runs each lab in a separate process and stores results under that lab's ignored `outputs/handbook/` directory. This avoids collisions between labs that reuse Python package names.

The bounded configuration checks execution and specific behaviour. Recovery may fail after a short run. Passing a command does not establish a published robustness result or a calibrated false-positive rate. The per-lab measured verification record is `docs/lab-verification.json`.

No diffusion-model download, GPU run or paper-scale dataset is required by the handbook checks. Consult the primary implementation for a full reproduction.

## Contributing

Explain what changes, what remains fixed, what verification observes and what the evidence establishes. Define notation before use, include worked reasoning, and cite the exact supporting source. Use UK English and clear prose. Run the appropriate website and lab tests when changing their behaviour.

The Pages workflow deploys from `main`. The handbook overhaul branch is for review and does not deploy automatically.

## Design and glossary

The visual system and design decisions are in `DESIGN.md`. The glossary is maintained in `src/glossary.ts`: 98 terms across six topics, with examples, related terms and study links. It renders 24 terms per page while search, topic filters, alphabet jumps and deep links cover the whole reference. The Threats and gaps navigation item has been removed; historical research URLs remain available directly.

For a compressed local production preview, run `npm run build` followed by `npm run preview:production`. Run `npm run qa:design` in a second terminal for repeatable production-browser checks. The browser checks need Chrome, Edge or Playwright Chromium. Reports are written to ignored `outputs/design-qa/`. Read `docs/design-qa.md` for measurement conditions and the hash router’s search-engine limits.

Navigation metadata in `src/paperCatalog.generated.ts` is generated from the canonical `handbookEntries` before development, tests and builds. Edit the handbook records rather than that generated file. Full-text search continues to use the complete study records.
