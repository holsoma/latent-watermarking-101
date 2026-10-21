# Independent design code review

Reviewed on 21 October 2026 by an agent who did not author the design changes. Scope: the changes to `App.tsx`, the new home page, glossary rendering, page motion, metadata, insertion diagram, responsive styles and production preview/QA scripts. This is a functional review, not a visual score or a review of the unchanged Python labs.

## Findings

### DCR1: repeated glossary destination can remain filtered out

Status: resolved and independently verified.

Affected code: `src/GlossaryPage.tsx`, the `hashchange` listener and related-term links.

Reproduction:

1. Open `#/glossary?section=conditioning`.
2. Search for `CFG`. The Conditioning record is filtered out while Classifier-free guidance remains.
3. Activate its related Conditioning link. Its destination is the URL already in the address bar.

Assigning the same hash does not emit `hashchange`. The original filter-reset listener therefore did not run, and the requested definition remained absent. The correction handles each term-link activation directly through `revealTerm`, clears filters when the destination is absent, and schedules focus and scroll through a post-render `pendingTerm` effect. The new regression starts from the same hash as the destination, filters out Conditioning, activates its related link and checks that the restored definition receives focus. Reinspection and an independent targeted test run confirm the correction.

### DCR2: production glossary checks used the former markup

Status: resolved. Corrected selectors were independently reinspected, and the final production audit completes with zero failures and warnings.

The initial `glossaryControls` routine searched for a heading named Bit error rate, although the final glossary uses a definition-list term. It also tried to click `.glossary-empty button`, although Clear filters is outside that empty-state element. The first check always failed and the second would time out. The QA author changed these to `#bit-error-rate dt` and the named Clear filters button. Reinspection confirms the corrected selectors and sequential typing/focus checks. This was a test-harness defect, not evidence that glossary search failed.

### DCR3, P2: bottom glossary pagination skipped the new reading position

Status: resolved by code reinspection and review of the rebuilt browser position evidence.

Affected code: `src/GlossaryPage.tsx`, `changePage` and the page-change focus effect.

The original pagination retained the bottom navigation button and focused it with `preventScroll`. Browser evidence in `outputs/design-qa/pass-5-pagination-before-correction/report.json` confirmed both consequences at 1366 and 390 pixels. After bottom Next, the first new term was at approximately minus 10,417 and minus 10,799 pixels, while the bottom Next button remained visible. A reader continuing from the end would therefore miss the start of the new page. After bottom Previous from the two-term final page, the focused button moved to approximately 10,862 and 11,461 pixels below the viewport. The related four screenshots record the two cases at both widths.

The author corrected bottom-origin changes to select the corresponding enabled control in the top navigation and, after the page renders, scroll that top navigation into view with `block: 'start'`. Boundary pages select the enabled opposite direction. Top-origin changes retain their top control without a forced scroll. Query, category and explicit term-link handling clear the pending pagination destination, preserving the earlier search-focus and deep-link behaviour.

Independent reinspection confirms that the destination now comes from `topPagination.current`, that scrolling occurs after the page state commits, and that it is applied only to bottom-origin pagination. Three new tests check bottom Next, bottom Previous from the final page, and unchanged top-origin behaviour. The coordinator reports 17 passing focused glossary tests. No additional test or build process was started by this reviewer.

The rebuilt record `outputs/design-qa/pass-6/responsive/report.json` was then read independently. Its four checks, `bottomNext1366`, `bottomPrevious1366`, `bottomNext390` and `bottomPrevious390`, all report the expected page, visible focused top control, visible first new term and correct order below top pagination. The controls are approximately 116 pixels from the viewport top; the first new term is approximately 208 pixels on desktop and 204 pixels on the phone. The report's overall `passed` flag is true. This closes both the skipped-reading-position and off-screen-focus failures.

### DCR4, P2: compact study contents cannot revisit the selected section

Status: resolved by independent code inspection and final rebuilt browser evidence.

Affected code: the new `study-section-navigation` links in `src/HandbookPages.tsx` and the hash-route focus handling.

The reproduction was to open `#/papers/law?section=equation`, scroll back to the top, open On this page and activate Angular separation and local stability. That link had the same hash already in the address bar. The browser therefore emitted no `hashchange`, the path-dependent readiness hook did not rerun, and the native fragment was a route plus query rather than the equation element's ID. Nothing returned the reader to the equation.

The correction adds `revisitSection` in `src/sectionNavigation.ts` and uses it for compact contents, fixed contents and section-heading permalinks. It acts only on an unmodified primary activation whose raw internal href equals the current hash and whose parsed section target exists. It then prevents the otherwise ineffective default fragment action, focuses the section and scrolls it into view. Changed hashes and modified clicks retain their ordinary behaviour. Native keyboard link activation produces the same primary click path.

Independent reinspection accepts this logic. The new route regression starts with the exact destination hash, moves focus to the heading, and clicks the same-href link in both contents layouts without injecting a hash event. It requires section focus and exactly one scroll call. This directly addresses the reported defect. The final `outputs/design-qa/pass-8/corrections/report.json` was then read independently: repeated-hash activation preserves the URL and focuses a visible target at 390, 768 and 1920 pixels, covering both compact and fixed contents. The target begins at approximately 182 pixels below the viewport top in all three cases. This closes DCR4.

## Other code checks

- Focus during glossary filtering is not moved by a query-dependent effect. The initial glossary effect runs only on mount. Hash navigation restores a filtered destination, and explicit link activation now also handles the unchanged-hash case.
- The drawer's focus-boundary query includes disclosure summaries and excludes links inside closed disclosures. Escape restores focus to Contents, and closing restores the body's previous overflow value.
- The glossary's mount effect supplies heading or section focus after its lazy chunk resolves. Its term records have stable IDs. Study routes and the two historical research routes remain handled by the router. There are no remaining visible links to the removed Threats and gaps tab in `src`.
- The sign example derives recovered bits from selected numerical coordinate signs. Its message changes only selected signs, retains magnitudes and leaves the other 248 coordinates fixed. It states that diffusion and attacks are absent. No false robustness claim is introduced.
- The insertion diagram renders only for explicit supported locations. Unmapped insertion descriptions keep their prose rather than being assigned a guessed stage.
- Page motion is scoped through a GSAP context, reverted on route changes and skipped when reduced motion is requested. It does not depend on glossary search state and does not install a separate scroll handler.
- Production font preload URLs are transformed by Vite to fingerprinted assets under `/latent-watermarking-101/`; the built HTML contains no production request for `/node_modules/`.
- The preview server restricts methods to GET and HEAD, enforces the configured base, rejects invalid separators and nulls, and checks resolved real paths against the build root, including symlinks and directory indexes. It sends MIME types, representation-specific ETags, text compression, revalidation for HTML and immutable caching for fingerprinted assets. Unknown HTTP files retain 404 rather than receiving the application shell. No blocking server defect was found by code inspection. The QA author separately records compressed response, traversal, HEAD and ETag checks.
- Hash routes continue to share one canonical HTTP document. The metadata and QA documentation state that limitation; this review does not claim server-rendered study text or independent HTTP status codes for hash routes.

The independent run `npx vitest run tests/design.test.tsx tests/glossary.test.tsx` passed all 13 tests across both files. It covers computed sign recovery, filtering without focus theft, the repeated glossary destination, removal of the visible tab, complete definition records, linked destinations and optional examples. There are no unresolved functional findings from this review. The coordinator's final integrated test and production QA results remain the delivery evidence for the entire site.

## Final performance change

Reinspected the later deferred-motion and glossary rendering changes without starting another test process while production performance measurements were running. The initial route exits before importing GSAP, so its HTML content is fully visible from the first frame. On subsequent route changes, cleanup marks a pending import as cancelled and reverts any completed context. A stale import callback therefore cannot animate the next page after its own route has been left. The effect checks reduced motion before requesting the animation module and does not change opacity or hide text. Search and term filters are not animation dependencies.

Glossary `content-visibility:auto` retains the definition records in the document. The intrinsic size is an estimate for off-screen layout. Focus within a term explicitly restores `content-visibility:visible`; both linked-term effects focus before calling `scrollIntoView`, which requests the destination's actual layout. No blocking functional regression was found by this final code inspection. Final browser measurements must still verify the long reference page's actual end position and focused term layout, since estimated off-screen heights are not evidence of the final rendered page length.

## Deferred route architecture

Independently inspected the final route split, without starting test or browser processes during the coordinator's performance measurements. No new blocking finding was identified.

- `App.tsx` retains the existing chapter routes, both historical research routes, the mathematics alias, all study slugs and the supported lab routes. Lazy study rendering is selected only after matching the catalogue slug. A lab route also requires the matched entry's optional `labSlug`, so the nine studies without local exercises receive the missing-chapter page rather than a fictitious lab. `NewLabRoute` retains the earlier category/year ordering and runnable-versus-planned choice for the existing exercises.
- `useRouteReadiness` schedules focus after the lazy article mounts, reads the current section from the URL, checks that the current route still matches its own path, and cancels its animation frame during cleanup. Its route-ready event is deferred until the frame callback. The parent's effect installs the contents listener during the commit's effect phase, before that callback, and rebuilds contents from the current main element. A stale lazy route cannot dispatch a contents refresh or focus a section after its path has been left. Section-only navigation remains handled by `useHashRoute`; the readiness hook depends on the route path rather than search input state.
- `paperCatalog.generated.ts` is derived by loading the canonical `handbookEntries` and selecting explicit lightweight fields. `predev`, `prebuild` and `pretest` regenerate it. The catalogue contract test compares its complete projected records with the canonical entries and requires exactly 24 optional lab destinations. It is a generated navigation projection, not a manually maintained second search catalogue: handbook search continues to use the complete rendered records. Home and metadata code consume that projection without importing full study or lab data into the entry module.
- The LAW figure is a computed rendering of the existing worked calculation. With sigma 0.1 and pair norms 1 and 2, it displays variances 0.01 and 0.0025, and the second bar has one quarter of the first bar's width. Accessible SVG labels state the values and units; the caption retains the small-perturbation assumption. The optional `angular-variance` field selects that figure without changing the accompanying equation, method claim or evidence.

The coordinator reports 100 passing tests across six files and a successful production build for this architecture. This final section records code inspection, not an independent rerun of those checks; the earlier 13-test independent run remains separately identified above.

## Pagination and final first-paint changes

Independently inspected the subsequent 24-term glossary pagination, stale contents handling and batched SVG rendering. No test, build or browser process was started during production QA. No blocking code defect was found. This section supersedes the earlier description of all glossary records being rendered at once: the complete content remains in the canonical glossary data, while at most 24 definitions are mounted on a page.

- Filtering is memoised, page bounds are clamped to the filtered result count, and the rendered slice uses the same sorted results as the displayed range. Search and topic changes reset the page and pending term without moving focus from the input. The alphabetical links are derived from the complete filtered result set, so letters beyond the visible page remain reachable.
- The initial page is calculated from a valid URL term before rendering. `revealTerm` chooses the destination's page using the current results, clears filters only when they exclude that term, and schedules focus after the new slice mounts. The hash listener supports external section changes; explicit link handlers retain support for the unchanged-hash case. Invalid term IDs do not trigger page changes.
- Pagination selects enabled controls at page boundaries and does not force heading focus. The original bottom-navigation context was later shown to break the reading position and visible focus; DCR3 records the browser evidence and the independently reinspected correction to top navigation.
- `App.tsx` clears local contents on path changes and waits for route readiness on lazy paths. `useRouteReadiness` still guards its deferred callback against a different current path and cancels it on cleanup. The parent listener reads the mounted main content. This prevents an old article's contents being retained while a new lazy article loads, without coupling readiness to search or pagination state.
- The SVG background batches the 248 unselected positions into paths with matching sign colours, radii and rounded display opacity. Each path contains two arcs per circular coordinate, and selected positions remain separate interactive-example geometry. The numerical `embedSigns` and `recoverSigns` functions are unchanged. The displayed recovery is still derived from coordinate signs; the JSON values used for QA do not replace that computation. The production QA now checks the batched paths and selected geometry against those values.

The coordinator reports 107 passing tests and a successful production build after these changes. This is a separate, read-only acceptance of the implementation logic; the final browser QA remains the evidence for viewport behaviour and measured performance.

## Final acceptance

All four recorded findings are resolved. The final browser audit in `outputs/design-qa/pass-8/audit.txt` records zero failures, zero warnings and the stated JavaScript application-shell limitation. The final responsive record confirms section focus, refresh, back/forward navigation, valid wide-screen contents links, phone search focus, correct bottom-pagination reading position, the computed variance ratios and reduced-motion navigation. The correction record verifies the further reading and navigation changes described below. The coordinator's final integration reports 117 passing tests across seven files, including 17 glossary tests, followed by a successful production build. These final integrated results replace the earlier test totals for delivery. This reviewer inspected the implementation and final records; the review does not claim a separate rerun of the complete suite or physical-phone performance measurement.

## Post-critic reading corrections

Independently inspected the final word spacing, tablet bit controls and overflow-equation accessibility changes. No blocking logic or accessibility defect was found. No test, build or browser process was started while pass 7 was measuring production behaviour.

- The home heading now contains actual spaces before its responsive line breaks. Hiding those breaks retains `A signal inside the noise.` in the DOM text rather than relying on an accessible label to conceal joined visible words. The new regression asserts that text independently of the label.
- The tablet example reserves at least 221 pixels for its control column. Eight 25-pixel buttons plus seven 3-pixel gaps require exactly 221 pixels. Disabling wrapping in that tablet rule therefore keeps the complete eight-bit message together while the other column can shrink. The page's existing phone layout remains separately specified.
- `MathFormula.tsx` memoises KaTeX's HTML and MathML by expression and retains `trust: false`. It adds a named, keyboard-focusable region and linked visible arrow-key instructions only when the equation actually overflows. Short formulae add no unnecessary tab stop. The equation's native overflow container remains the keyboard scroll target, and the scoped max-content KaTeX display allows both ends to contribute to its scrollable width.
- Overflow is measured at mount, after fonts become ready, on later font completion and through container/content resize observation. The fallback window resize listener is used only when `ResizeObserver` is unavailable. Cleanup disconnects the observer, removes event listeners and deactivates the pending font-promise callback, preventing measurements from updating an unmounted formula.
- Four focused tests inspect the short/long equation semantics, described keyboard target, resize removal, font readiness/loading and fallback cleanup. The coordinator reported all 115 tests across seven files and the production build passing after those corrections. This reviewer inspected those tests and implementation. The final production correction record now verifies actual horizontal panning, complete end visibility, tablet wrapping and rendered word spacing.

The later compact study navigation derives its labels and targets directly from the rendered sections, followed by the actual self-check, sources and optional related section. Native details/summary semantics provide a keyboard-operated disclosure at widths where fixed contents are absent. Scoped two-column links become one column on phones, with 44-pixel minimum targets. The header GitHub link's 28-pixel inline-flex minimum clears the specified 24-pixel target requirement. These structural and target changes were reinspected without running processes; DCR4 records the repeated-destination correction and its independent acceptance. No unresolved implementation finding remains from this code review.

The final correction and responsive records were read independently after the build. `corrections/report.json` reports the literal and rendered heading as `A signal inside the noise.` at 390, 768, 1024, 1366 and 1920 pixels. All eight bit controls occupy one row within the card at every measured width, with no document overflow. Real ArrowRight input moves the LAW equation's scroll position and reaches its right limit of 267 pixels on the phone and 211 pixels on the tablet; both equation ends become visible, the named region retains visible focus and instructions, and HTML plus MathML remain present. A fitting equation has no hint, region role or tab stop. Compact contents has nine valid destinations and responds to keyboard activation at both narrow widths. The report has no runtime errors and its overall `passed` flag is true.

The final `responsive/report.json` also reports `passed: true`, including all four corrected bottom-pagination cases. `transfer.json` reports successful identity, gzip and Brotli reads for all eight JavaScript assets, with JavaScript MIME types. Its cold-home record loads one JavaScript file, with 79,851 recorded compressed body bytes; the complete build's eight chunks are separately counted and are not presented as one page's transfer. These transfer records support the stated loading structure, not a physical-device performance claim. All requested post-critic verification is now closed.
