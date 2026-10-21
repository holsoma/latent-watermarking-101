# Handbook overhaul delivery

Branch: `handbook-overhaul`, created from the current local `main`. No merge or deployment was performed.

## What changed

Paper URLs now open technical studies. The 24 CPU exercises have separate `/lab` routes. A typed registry supplies the study renderer, search, filters, related links, section links and claim-to-source register. The unlisted research proposal remains accessible and excluded from general search.

There are 33 studies, 63 conceptual questions, 20 oral questions and seven mathematical explanations. The supplied documents' 19 paper entries, 63 conceptual questions, five mathematics topics and 20 oral questions map to 107 coverage records. The two extra mathematical explanations cover Fourier structure and inversion error. Original DOCX files remain outside the site and unchanged.

The interface uses a dark neutral palette, restrained cyan, self-hosted IBM Plex fonts, a chapter sidebar and wide-screen local contents. Equations use KaTeX HTML and MathML. Narrow equations and code scroll within their containers. Search reads the rendered content records. Focus management, a keyboard-operated mobile drawer, disclosure answers and clipboard feedback are included.

## Evidence and checks

- `npm test`: 84 tests pass, followed by the TypeScript and production build checks. Tests render all 33 study routes and check coverage, references, prerequisites, equations, search and filters, section focus, unknown routes, the unlisted proposal, drawer focus trapping and Escape, clipboard success/failure, saved run records and published image hashes.
- All 24 CPU exercises ran in separate Python 3.11 subprocesses: 96 command stages and 373 behavioural assertions. Exact commands, return codes, timestamps, outputs and observations are in `lab-verification.json`. The independent reviewer reran controls for HiDDeN, PRC, ROBIN, T2SMark and SERUM.
- Four galleries were regenerated from saved-image evidence. Each published `run.json` records supplied and effective configuration, observed recovery and image SHA-256 hashes.
- Browser inspection used 390, 768, 1366 and 1920 pixel viewport overrides. Mobile LAW equations remained inside the reading area; the drawer closed with Escape and returned focus. Tablet search/type filters worked. Laptop commands and saved images loaded without page overflow. At 1920 pixels the contents navigation's visible computed layout and link targets were checked. The browser screenshot surface clipped the wide view, so that screenshot alone is not evidence for the far-right column.
- Browser back, forward and reload retained the selected lab section and focus. The production preview served the configured `/latent-watermarking-101/` base path, with a direct LAW equation URL, MathML output and no KaTeX error. Reduced-motion CSS disables animation, transitions and smooth scrolling; automated controls test keyboard and focus behaviour.
- `git diff --check` passes. The dependency audit returned no known vulnerabilities after updating Vite.

Local visual evidence is saved under ignored `outputs/handbook-review/`, including mobile equations, tablet index, laptop lab and the production equation view.

## Review and limits

The content author, frontend author and lab engineer worked under separate ownership. Independent technical, code and student-reading reviews are recorded in `review-content.md`, `review-code.md` and `review-reading.md`. Corrections authored during review were checked by another reviewer. Identified factual, misleading-result and comprehension findings were resolved.

Primary-source verification was sampled and is documented explicitly. It was not a proof audit of every paper. Push It Away remains based on the supplied summary, with manuscript status unverified. The register records other source discrepancies and repository provenance qualifications. No unsupported numerical cross-paper ranking is introduced.

All local labs are conservatively labelled prerequisite exercises. Passing commands does not mean recovery succeeded: the saved HiDDeN example has bit error rate 0.625. These bounded runs do not reproduce papers, calibrate false-positive rates or measure dataset robustness. No GPU run or model download was performed. Old ignored smoke manifests retain their historical stale slugs; new handbook evidence is checked separately.

The production build has a roughly 510 kB main JavaScript chunk and emits Vite's size advisory. KaTeX is loaded separately. This is a performance advisory, not a failed build.

## Registers

- `content-coverage.json`: all required source-to-section mappings.
- `source-register.md`: evidence policy, primary checks and discrepancies; `claimSourceRegister` in `src/handbook.ts` follows rendered claims.
- `lab-audit.md`: per-lab classification, corrections and measured outcomes.
- `lab-verification.json`: full machine-readable execution evidence.
