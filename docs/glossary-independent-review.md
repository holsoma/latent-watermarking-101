# Independent glossary review

Reviewed on 21 October 2026 by a reviewer who did not write the glossary. Scope: `src/glossary.ts` and `src/GlossaryPage.tsx`, including factual distinctions, student comprehension and internal destinations. This review does not score visual design or make a paper-reproduction claim.

## Finding and correction

**G1, resolved: related search words were presented as equivalent names.** The original display said “Also used” above the `aliases` field. That field contains useful search associations which are not synonyms. Examples included chi-squared under chi distribution, MSE under PSNR, precision under false discovery rate, and trainable parameters under frozen weights. A reader could therefore learn a false equivalence despite the correct main definitions. The author changed the visible label to “Related search terms”. Reinspection confirms that label and the definitions explicitly distinguish the important relationships. Search expansion can retain these words without claiming equivalence.

No further factual or comprehension defect requiring correction was found in this pass.

## Required distinctions

| Reader task | Evidence in the glossary | Result |
|---|---|---|
| Explain FPR without treating a p-value as the probability a null hypothesis is true | `false-positive-rate` defines acceptance on a specified negative population; `p-value` specifies a null tail probability and rejects the posterior interpretation; `multiple-testing` requires calibration of the whole search | Pass |
| Distinguish bit accuracy, BER and complete-message recovery | The three records state the comparison stage and failure handling. The exact-message example explicitly requires independent equal-probability errors | Pass |
| Explain why normal coordinate histograms do not prove independent Gaussian noise | `marginal-distribution` gives the counterexample Y = X; `covariance` separates uncorrelatedness from independence; `gaussian-prior` requires a joint Gaussian law | Pass |
| Distinguish a cryptographic PRC from the local repetition-and-XOR exercise | `pseudorandom-code`, `repetition-code` and `prerequisite-exercise` name the assumptions and exclude a cryptographic guarantee for the teaching code | Pass |
| Distinguish a detector from an extractor | `detector`, `extractor`, `detection` and `decoding` separate evidence, candidate bits, acceptance and useful-message recovery. An extractor may emit bits on unmarked input | Pass |
| Explain why deterministic DDIM is not exact image inversion | `ddim` limits determinism to fixed initial state and settings; `ddim-inversion` and `inversion-error` describe numerical, encoding and setting errors | Pass |
| Distinguish robustness from security | `robustness` names task, perturbation, quality constraint and operating point; `security` requires an adversary, goal, resources and assumptions | Pass |

The references generally define the concept first, explain why it affects a watermark claim second, then link to related concepts and a study. This order supports a student who already knows Python, elementary probability and linear algebra. The long reference is searchable by several words, can be restricted to six topics, and offers an alphabetical jump list. Definitions remain visible without opening the optional worked examples.

## Reproducible checks

A separate Node check transpiled the glossary TypeScript, collected all related-term IDs and all context destinations, and compared destinations with the repository's study slugs and mathematical section IDs. It found **98 terms, 294 valid related-term links and 183 valid study or mathematical links, with zero unresolved destinations**. All ten optional examples were counted.

Independent arithmetic checks reproduced the displayed examples:

- `0.99 ** 256 = 0.0763149839`, or approximately 7.63% exact-message success under the stated independent-error model.
- `3 * 0.01 ** 2 * 0.99 + 0.01 ** 3 = 0.000298` for majority decoding of a tripled bit.
- `1 - 0.999 ** 1000 = 0.6323045752` for at least one false match in the explicitly independent 1,000-test example.

The test process was also started against `tests/glossary.test.tsx`. It returned seven passes and one timeout: the test which queried every definition's visibility took 51.4 seconds and exceeded its 20-second limit. The author was updating the page and tests during that run. The reviewer reported the failure and recommended scoping repeated definition lookups to each entry, rather than repeatedly traversing the entire 98-entry page. The coordinator must use the corrected final integrated test run for delivery evidence; this pass does not claim a final green test run.

## Primary reference checks

- [DDIM primary paper](https://arxiv.org/abs/2010.02502): supports the DDPM-compatible training objective and deterministic sampling limit; the glossary does not infer exact codec or discrete numerical invertibility from determinism.
- [Pseudorandom Error-Correcting Codes](https://arxiv.org/abs/2402.09370): supports the separation between robust keyed decoding and computationally hidden code structure.
- [Image PRC paper, ICLR 2025](https://proceedings.iclr.cc/paper_files/paper/2025/hash/1331202ea3bb0a53ae897af0bb16e309-Abstract-Conference.html): the linked study is the relevant image-watermark source, distinct from an elementary repetition exercise.
- [ASA statement on p-values](https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf): supports the warning that a p-value is not the probability that the null hypothesis is true.
- [NIST chi-squared definition](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3666.htm): confirms that the sum of squared independent standard normals is chi-squared; its square root is the radius described by the chi record.
- [WAVES primary paper](https://proceedings.mlr.press/v235/an24a.html): supports evaluating detection and identification beside image-quality cost across specified stress tests.

These checks cover the uncertain and consequential distinctions. They do not imply that every external paper URL was fetched or that every linked study was independently re-reviewed in this design pass.

## Coordinator closure

The expensive test lookup was corrected. The final integrated run passes all 117 tests, including all 17 glossary tests. These cover pagination across all 98 terms, cross-page deep links, search focus, the same-destination navigation regression and bottom pagination returning to the beginning of the new group. The initial timeout above is retained as review history, not an outstanding failure.
