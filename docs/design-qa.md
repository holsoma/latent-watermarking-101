# Design verification

The design pass uses the production build and the configured `/latent-watermarking-101/` base path. The automated checks visit the rendered hash routes directly because this site retains its React hash router.

The final eighth pass returns **zero failures and zero warnings**. All five routes have zero console/runtime errors, failed requests, axe violations, document overflow or hidden main text under reduced motion. Target checks pass on desktop, phone and reduced-motion views. Cold phone LCP is 1304 to 1936 ms, CLS is zero, and the short scroll samples measure 60 or 61 fps under the stated simulated conditions. Supplementary reading, pagination, keyboard equation scrolling and same-hash section-navigation checks pass. The 95 screenshots and JSON records are frozen in `outputs/design-qa/pass-8/`.

## Repeatable check

After `npm run build`, start the compressed production preview with `node scripts/serve-production.mjs --port 4401`. In another terminal run:

```powershell
node scripts/qa-handbook.mjs http://127.0.0.1:4401/latent-watermarking-101/ --out outputs/design-qa/pass-8
node scripts/qa-responsive.mjs http://127.0.0.1:4401/latent-watermarking-101/ outputs/design-qa/pass-8/responsive
node scripts/qa-corrections.mjs http://127.0.0.1:4401/latent-watermarking-101/ outputs/design-qa/pass-8/corrections
node scripts/qa-transfer.mjs http://127.0.0.1:4401/latent-watermarking-101/ outputs/design-qa/pass-8
```

The script requires the local `playwright` and `axe-core` development dependencies and a Chromium installation. It tries Playwright's installed Chromium, Google Chrome and Microsoft Edge, in that order. `QA_CHROMIUM_PATH` can select an existing Chromium executable. If none is available, run `npx playwright install chromium`.

The default routes are the home page, paper index, LAW study, glossary and an unknown hash route. Each route is checked at 1366 × 900 px, at 390 × 844 px, and with reduced motion requested. Long pages receive start, middle and end screenshots. Reduced-motion pages receive start and end screenshots. Cold phone contexts use a fourfold CPU slowdown, 150 ms network latency and a 1.6 Mbit/s download rate.

The report records:

- Runtime and console errors, failed requests, document overflow, equation errors and hidden main text under reduced motion.
- LCP, CLS, a short scroll frame-rate sample and the exact measurement conditions.
- WCAG A and AA checks from axe, including the affected selectors for every violation.
- Rendered headings, landmarks, metadata, small controls and links.
- Local build availability and content types for the Open Graph image, favicon, robots and sitemap files.
- The initial keyboard sequence, skip-link focus and mobile drawer focus, trapping, Escape and focus return.
- Clipped rest and hover pairs for representative primary controls. These require visual judgement after the run.
- The home-page sign example through reveal and one-bit editing, checking recovered signs, message changes, fixed magnitudes and all 248 unselected coordinates.
- Glossary abbreviation search, topic selection, an empty result and filter reset.
- Character-by-character search typing and the related-term case where the destination hash is unchanged but the current filters have hidden its target.
- Critical resource timings, transfer encoding and bytes, with at most two font preloads and 100 KiB of preloaded font data.

`summary.json` gives a compact result. Each route has a `report.json` and screenshots. `audit.txt` records failures, warnings and limitations. The script returns a failing exit code for failed checks. Use `--routes home,glossary` for a focused correction check, or `--no-throttle` for an explicitly unthrottled exploratory run. Final performance evidence must use the default throttled run.

## Router and measurement limits

The supplied skill's `shoot.mjs --crawl` and `audit.mjs` fetch HTML and discard hash fragments. They cannot discover this site's studies. Their default missing-page check also requests a path outside the configured GitHub Pages subdirectory. The local script therefore visits explicit hash routes and audits the rendered document.

All hash routes share one HTTP document. An unknown hash displays the designed missing-chapter state but cannot return an HTTP 404 status by itself. Server HTML remains a JavaScript application shell. Passing a rendered accessibility check does not establish server-rendered content or search-engine indexing.

Headless performance is evidence about this machine under the stated simulated conditions. It is not a measurement from physical phone hardware. The short scroll sample is not a complete interaction-latency assessment. Automated hover deltas cannot judge composition or whether a primary interaction has enough visual response. Screenshots and independent visual review complete the check.

## Production server checks

The local production server uses Brotli or gzip for text resources when the client requests it. It retains the configured subdirectory, sends the appropriate file content type, caches fingerprinted assets as immutable, and requires revalidation for the HTML document. It checks resolved real paths against the build directory, including symlinks. Requests outside the configured base never receive the application shell.

The initial server checks returned 200 with Brotli for the HTML document, 308 when the base lacked its final slash, 404 for paths outside the base and missing build files, and 403 for an encoded attempt to leave the build directory. Separate checks read the JavaScript asset through gzip, Brotli and identity responses, verified its JavaScript content type and immutable cache policy, and received 304 when sending its ETag back. Missing files used `no-store`.

## Results

The first complete pass used Vite's uncompressed production preview on port 4400. All five routes had no console/runtime errors, failed requests, document overflow, hidden text under reduced motion or axe violations. The sign example and glossary control checks passed. The drawer opened, trapped focus, closed on Escape and returned focus. Short scroll samples recorded 60 or 61 frames per second.

| Route | Phone LCP, uncompressed | Phone CLS |
|---|---:|---:|
| Home | 3176 ms | 0.0210 |
| Paper index | 2808 ms | 0.0013 |
| LAW study | 3072 ms | 0.0007 |
| Glossary | 4488 ms | 0.0012 |
| Missing chapter | 2152 ms | 0.0004 |

These measurements exposed the 646,291-byte uncompressed JavaScript entry and the glossary's initial rendering cost. They do not describe the transfer size after production text compression. The report remains in `outputs/design-qa/pass-1/`; it is retained as the baseline.

The first keyboard check started after the sign exercise and therefore continued from that control. Its skip-link failure was a test setup error. The corrected check resets sequential keyboard focus to the document start. An independent run confirmed that the first Tab then reaches “Skip to content”.

The second complete pass used the revised build and the compressed server on port 4401. It confirmed the keyboard correction and all glossary control checks. It exposed the remaining small targets, a worked-example hover with no response and a 50 fps glossary phone scroll sample. Those findings led to larger link and summary targets, shared hover feedback, deferred route-animation code and offscreen glossary layout containment.

| Route | Pass 2 phone LCP | Pass 3 phone LCP | Pass 3 phone FPS |
|---|---:|---:|---:|
| Home | 2688 ms | 2668 ms | 61 |
| Paper index | 2644 ms | 3732 ms | 58 |
| LAW study | 2600 ms | 2960 ms | 61 |
| Glossary | 3872 ms | 4016 ms | 60 |
| Missing chapter | 2836 ms | 2572 ms | 58 |

The third complete pass has zero runtime or console errors, failed requests, axe violations, document overflow, small targets below 24 px, hidden main text under reduced motion, or representative primary controls with no hover response. CLS is zero in each phone result. The keyboard sequence begins with the skip link and all seven sampled focus stops are visible. The mobile drawer passes opening, first focus, forward and reverse focus wrapping, Escape and focus return. The sign example preserves all 248 unselected coordinates and all magnitudes when one message bit changes.

The glossary checks cover 98 terms, abbreviation search for BER, 19 detection-and-statistics entries, an empty result and reset. Typing retains focus after each update. Starting at the Conditioning hash, filtering to CFG, then following its related Conditioning link restores the full list and focuses Conditioning even though the hash itself does not change.

The two preloaded reading fonts total 46,772 bytes. On the home-page phone run they completed by 851 ms. The initial JavaScript response uses Brotli: 143,572 transferred body bytes expand to 511,442 bytes, finishing at 1424 ms. Its parse and rendering costs remain relevant after the transfer.

**The third pass did not meet the cold phone LCP target.** Its five timing failures remain in `outputs/design-qa/pass-3/audit.txt`; they have not been relabelled as passing. The record shows run-to-run variation and includes all results rather than choosing only the fastest. These measurements use the stated simulated conditions and do not establish performance on physical phones.

The fourth pass followed a further split of the canonical study, revision and lab data from the initial application bundle. The home entry fell to 271,552 decoded bytes, delivered as a 79,460-byte Brotli body. Search continues to use the full study records once the index loads; the smaller navigation catalogue is generated from those records.

| Route | Pass 4 phone LCP | Pass 4 phone FPS |
|---|---:|---:|
| Home | 2900 ms | 61 |
| Paper index | 2452 ms | 52 |
| LAW study | 3296 ms | 61 |
| Glossary | 3120 ms | 59 |
| Missing chapter | 1800 ms | 61 |

The fourth pass still recorded three LCP failures and one short scroll-sample failure. It retained zero console/runtime errors, failed requests, axe violations, document overflow, small targets, hidden reduced-motion text or unresponsive sampled hover controls. Direct study-section entry, refresh, local-contents navigation and browser back/forward passed.

The supplementary navigation run found a stale local-contents column after moving from LAW to the glossary. The outgoing study's labels were still visible and pointed at glossary IDs that did not exist. Its screenshot and failed supplementary record are preserved in `outputs/design-qa/pass-4-before-correction/`. The repeatable responsive check now verifies every local-contents target against the current document. The outgoing contents are cleared until the newly committed lazy route reports readiness. The sixth-pass navigation record verifies that no invalid targets remain.

The fifth pass included the smaller SVG representation, 24-entry glossary pages and the corrected local-contents readiness signal. It keeps all 256 numerical coordinates. Fourteen SVG paths draw the 248 unchanged background positions, while eight circles retain the selected coordinates and labels. The browser check validates the rendered positions, radii and signs against the computed array, and verifies that one bit edit leaves all other values and background paths unchanged.

| Route | Pass 5 phone LCP | Pass 5 phone FPS | Phone CLS |
|---|---:|---:|---:|
| Home | 1348 ms | 61 | 0 |
| Paper index | 1828 ms | 60 | 0 |
| LAW study | 1872 ms | 60 | 0 |
| Glossary | 1692 ms | 61 | 0 |
| Missing chapter | 1300 ms | 60 | 0 |

The fifth full cold-load pass returned zero failures. Its one hover warning sampled the disabled first-page Previous terms button. The harness now excludes disabled controls from active hover samples. A separate glossary recheck returned zero failures and warnings, with a 1640 ms phone LCP; the original full-pass timing values above remain unchanged.

The paginated glossary checks verify 24 visible entries out of 98, next and previous windows, the two-entry final page, full-dataset filtering, abbreviation search, topic selection, clear filters, alphabet jumps, and a last-page deep link after refresh. The Conditioning and CFG case still clears filters and focuses its target when the hash is unchanged.

A separate sequential-reading task then found a bottom-pagination defect. Next terms retained a visible bottom control but left the first new term more than 10,000 px above the viewport. Previous terms from the short final page focused a bottom control more than 10,000 px below the viewport. Those before-correction measurements and four screenshots are in `outputs/design-qa/pass-5-pagination-before-correction/`. Bottom-origin navigation now moves focus to the corresponding enabled top control and scrolls the top pagination into view. The sixth pass verifies the new first term and active keyboard focus at both 390 and 1366 px.

## Sixth-pass results before independent visual review

| Route | Cold phone LCP | Phone FPS | Phone CLS |
|---|---:|---:|---:|
| Home | 1344 ms | 60 | 0 |
| Paper index | 1872 ms | 61 | 0 |
| LAW study | 1876 ms | 61 | 0 |
| Glossary | 1592 ms | 61 | 0 |
| Missing chapter | 1244 ms | 61 | 0 |

Each page has one rendered h1 and main landmark, the correct language, a route-specific title and description, and no failed equation. The reading fonts stay within the two-preload, 100 KiB budget. The Open Graph PNG, favicon, robots and sitemap files return 200 with their correct content types from the local production build. This verifies build files, not deployment.

The sixth-pass main record contains 54 screenshots. Its audit has zero failures and warnings, plus the documented limitation that the server sends a client-rendered application shell. The supplementary record passes with no invalid local-contents targets, console errors, failed equations or document overflow. Source, screenshots and JSON were frozen before the independent critic received them. At this point the target-size warning was applied only to the phone view. The independent critic subsequently identified the desktop GitHub link as too short, so the final harness applies that check to all three view modes.

## Corrections from independent review

The critic found missing literal spaces around responsive line breaks in the home heading. At 768 px the hidden breaks joined adjacent words. The eighth-pass check asserts both `textContent` and rendered `innerText` against “A signal inside the noise.” at 390, 768, 1024, 1366 and 1920 px. Both match at every width. All eight message buttons now occupy one row and stay inside the example at those widths. The 768 px hero and example have separate screenshots.

The critic also found no visible cue for the horizontally overflowing LAW equation, a 22 px-high desktop GitHub link, and no local study navigation below the wide contents breakpoint. The final equation has a visible scrolling instruction and a named, focusable region only when it overflows. Native ArrowRight moves its scroll position and reaches the complete right edge at 390 and 768 px; the initial left edge is also accessible. The focused region has a visible 2 px outline. A short VAE equation fits without an unnecessary region, Tab stop or scrolling instruction. KaTeX HTML and MathML remain present in both cases. The desktop link now passes the 24 px check. A keyboard-operated “On this page” disclosure exposes all nine valid LAW section links on narrower layouts.

Independent code review identified another navigation case: activating a link whose section hash was already current did not scroll back to the section after the reader returned to the top. The final browser check repeats that action through compact contents at 390 and 768 px, and fixed contents at 1920 px. Each keeps the hash unchanged, moves focus to the equation section and places it in the viewport. Different-section activation, direct entry, refresh and back/forward checks also pass.

The earlier partial pass in `outputs/design-qa/pass-7/` was interrupted when this last navigation correction was pending. It remains an incomplete record and is not presented as final evidence. No earlier screenshots or timings were replaced.

## Final eighth-pass results

| Route | Cold phone LCP | Phone FPS | Phone CLS |
|---|---:|---:|---:|
| Home | 1448 ms | 61 | 0 |
| Paper index | 1864 ms | 60 | 0 |
| LAW study | 1936 ms | 60 | 0 |
| Glossary | 1552 ms | 60 | 0 |
| Missing chapter | 1304 ms | 61 | 0 |

The main audit has zero failures and warnings. Each route passes axe with zero violations, has one h1 and main landmark, and shows no failed equation or hidden main text under reduced motion. Desktop, phone and reduced-motion target checks all pass. The skip link is the first keyboard stop; the sampled stops have visible focus. The drawer passes focus trapping, Escape and focus return. The sign example, glossary filters, 24-entry pagination, full-dataset search and deep-link checks pass. Metadata assets return the expected content types. The application-shell limitation still applies.

The main record contains 54 PNGs; the responsive record contains 26, including three transition frames; the correction record contains 15. Both supplementary JSON reports return `passed: true` with no console/runtime errors. These 95 images, the JSON and byte-accounting record were frozen before the final independent critic received them. The final asset fingerprints include `index-DogyZ_0L.js`, `HandbookPages-iM5iRuaY.js` and `MathFormula-Dzyzgi_h.js`.

### JavaScript and recorded resource sizes

`scripts/qa-transfer.mjs` reads raw identity, gzip and Brotli HTTP bodies from the production server. It also totals the JavaScript, CSS and font performance entries saved by the original cold phone run. It does not infer response timing from those sizes.

| Route | Loaded JS, gzip body | Loaded JS, Brotli body | Recorded JS/CSS/font transfer |
|---|---:|---:|---:|
| Home | 84,241 B | 79,851 B | 150,808 B |
| Paper index | 155,531 B | 147,579 B | 227,152 B |
| LAW study | 232,939 B | 219,201 B | 366,938 B |
| Glossary | 105,686 B | 100,459 B | 196,568 B |
| Missing chapter | 84,241 B | 79,851 B | 150,808 B |

Every sampled page remains below the skill's 300 KB gzipped JavaScript budget. All eight built JavaScript chunks total 927,201 decoded bytes, 287,081 gzip body bytes or 271,825 Brotli body bytes; a single route does not load all eight. Browser transfer totals include its reported response overhead but exclude the navigation HTML and resources outside the recorded filter. They are not whole-page totals. The two preloaded reading fonts remain 46,772 bytes in total. The raw HTTP response counts and per-file details are retained in `outputs/design-qa/pass-8/transfer.json`.

## Responsive and end-state verification

Run the supplementary frames with:

```powershell
node scripts/qa-responsive.mjs http://127.0.0.1:4401/latent-watermarking-101/ outputs/design-qa/pass-8/responsive
```

The final supplementary record contains 26 PNGs: 23 page-state frames and three transition captures. Home, LAW and the glossary were checked at 768, 1024 and 1920 px; LAW's equation was checked at each width. It also shows the full home hero at 1366 px after reveal and a bit edit, phone search results, and the computed LAW example at 390 and 1366 px. All frames have no document overflow or failed equations. The local contents column appears on the 1920 px study; the compact disclosure appears at the smaller study widths. The glossary has no stale study contents. Phone typing retains focus and finds 12 of 98 glossary terms for “inversion”, and nine of 33 studies for “LAW”.

Direct LAW section entry, reload, local-contents navigation, browser back and browser forward all retain the expected route and focus. The LAW figure shows a doubled radius and one-quarter local angular variance, with its small-perturbation assumption stated. Its SVG radii and bar widths match those ratios.

Bottom Next terms from page one opens page two; bottom Previous terms from the short fifth page opens page four. On both paths the active top control sits at y = 116 px with visible cyan focus. The first new term begins at y = 204 px on the phone and y = 208 px on desktop, just below the top pagination. Both directions pass at 390 and 1366 px.

The transition captures record actual heading transforms and opacity at their capture times. Screenshot encoding contributes to their elapsed wall time, so they do not measure the configured animation duration. Reduced-motion navigation records no transform, full opacity and native automatic scrolling. The site is intentionally still at rest; control feedback and the computed sign example provide interaction without continual motion.

Offscreen glossary layout changes the estimated document height. The repeatable frame routine recalculates the bottom and waits up to three times before an end screenshot. The third-pass glossary end frames were separately checked and replaced after this correction. Desktop and reduced motion reached the footer in one attempt; the phone required two. Each mode's `report.json` records the final document height, scroll offset and footer position.

Independent visual scores and their evidence are kept in the separate critic reports. These automated measurements do not assign a design score.
