# Content source and discrepancy register

Reviewed on 15 October 2026. The three supplied DOCX files determine coverage. They were read as WordprocessingML paragraphs, including table cells and hyperlinks, without executing embedded instructions or modifying the files. The site contains derived explanations, not copies of the DOCX files.

The machine-readable coverage register is `docs/content-coverage.json`. It maps 19 numbered papers, 63 conceptual questions, five mathematics topics and 20 oral questions to rendered routes. Two additional mathematics sections explain Fourier structure and inversion error. `claimSourceRegister` in `src/handbook.ts` is generated directly from every rendered study section and resolves its source IDs to source records. This is the section-level claim register; changing rendered claims changes the register automatically.

## Evidence rules

- Primary-paper links support descriptions of published methods. Mechanism explanations are separated from editorial examples, evaluation suggestions and possible failure scenarios.
- The supplied revision guide supplies the conceptual question bank. Worked arithmetic is explanatory, with simplifying assumptions stated beside the calculation.
- Existing studies retain their detailed discussions, with explicit insertion locations, notation, linked prerequisites and method-specific self-checks. Their local CPU exercises are not paper-scale experimental evidence.
- Linked repositories in retained studies are labelled as linked implementations. They are not all asserted to be official. Newly added author repositories are identified individually.
- No new numerical cross-paper ranking is asserted. A result requires its payload, attack, model, operating point and quality conditions.
- A source being available is not a reproduction result. No full diffusion or GPU experiment was run for this content review.

## Resolved discrepancies and qualifications

| Entry | Evidence and issue | Resolution in the handbook |
|---|---|---|
| LAW / LAW-M | The supplied documents describe a NeurIPS 2026 manuscript. Public arXiv 2607.22386 is available. | Cite the public preprint and retain unverified conference status. LAW is kept distinct from decoder-based LAWA. |
| LAW decoding | Preprint section 3.2.2 prints a comparison of absolute `atan2` phases, while the embedding is defined by a relative angle. Absolute phases wrap at the branch cut. | Add an explicit implementation caution and require circular branch-cut tests. Do not silently present the printed comparison as a universally valid decoding rule. |
| LAW Gaussianity | The work derives sparse off-diagonal covariance and reports limited classifier experiments. | Distinguish marginal properties, dependence and empirical classification from a computational indistinguishability theorem. |
| Spherical Watermark | The conference abstract describes a chi-squared radius and also discusses moment preservation. | State the mathematical reference correctly: R has a chi law; R squared has a chi-squared law. Keep a uniform independent direction as a separate requirement. Do not infer the full joint law from low-order moments. |
| Spherical publication | ICLR 2026 proceedings provide the paper record. | Use confirmed ICLR 2026 metadata. No unverified repository is invented. |
| MarkDiffusion | The supplied map identifies JMLR 2026; the original site only linked arXiv. | Link the JMLR 27(204) record and author toolkit. Omit moving implementation counts. |
| WIND | A distortion-free noise identity and a group-augmented retrieval system are distinct stages. | Explain the separate role of the Fourier group pattern. A positive group match is not the final identity decision. |
| DDIM | A deterministic forward sampler does not imply exact RGB-to-noise recovery. | Separate the DDIM formulation, approximate inversion, codec error and oracle-noise teaching calculations. |
| Push It Away | Only updated summaries are supplied. No matching public primary manuscript was located. | Label all method details as supplied-summary material, preserve manuscript status and omit unverified success rates and universal threshold recommendations. |
| Push It Away score | Mean-centred normalised correlation is undefined for a constant vector. | Define the zero-variance issue explicitly and treat the equation as a teaching definition, not a verified manuscript transcription. |
| PRC | The paper reports payload results, while the supplied map notes that the released path chiefly exposes detection. A repetition-code exercise is not a pseudorandom code. | Remove an unqualified payload-number bullet, distinguish binary detection from message recovery, and explicitly reject cryptographic claims from toy repetition coding. |
| GaussMarker | The method includes spatial and frequency evidence and a trained restorer. | Retain this method description but state that the separate CPU exercise does not establish those paper mechanisms. Learned restoration must be included when calibrating negatives. |
| ROBIN | The primary abstract discusses optimising hiding conditioning and watermark strength. The CPU correction isolates conditioning-based concealment. | The self-check asks whether the fixed marked state is retained when testing that specific concealment mechanism; it does not claim the full paper never optimises watermark strength. |
| SERUM | The old family label could be mistaken for insertion into semantic representations. | Registry explicitly places its user-specific mark in initial noise and distinguishes its image-space learned detector from inversion. |
| Gaussian Shading | Marginal checks are not a replacement for the sampling construction and randomisation assumptions. | Do not claim the method necessarily breaks independence. Explain which finite tests are insufficient and distinguish key/message conditioning. |

## Primary verification references

- LDM: CVPR 2022 paper record, generation and conditioning formulation.
- DDIM: arXiv 2010.02502, deterministic sampling family; inversion qualifications use the supplied guide and explicit algebra.
- WIND: arXiv 2412.04653 and author repository, two-stage identity retrieval.
- Spherical Watermark: ICLR 2026 proceedings, Gaussian direction/radius construction and stated moment scope.
- LAW: arXiv HTML 2607.22386v1, sections 3.2–3.4 and 4.1, angular construction, pair ordering, covariance and experimental settings.
- WatermarkAttacker: NeurIPS 2024 proceedings, regeneration attack scope and author repository.
- WAVES: arXiv 2401.08573, PMLR 235 and author project, evaluation dimensions.
- MarkDiffusion: JMLR 27(204), 2026, framework and author toolkit.
- Existing primary records checked during integration: Latent Watermark (2404.00230), Gaussian Shannon (2603.26167), GaussMarker (PMLR 267/li25ae), ROBIN (2411.03862), SERUM (ICLR 2026 poster 10011005), SEAL (2503.12172), TAG-WM (2506.23484), Gaussian Shading++ (2504.15026), PRC (ICLR 2025 proceedings), SFW (2509.07647), Gaussian Shading (2404.04956), and T2SMark (NeurIPS 2025 proceedings).

The browser returned a 403 for the retained CVPR semantic-forgery page. Its link remains, and the existing study is not described as a newly reproduced experiment. The primary citation in each study is the starting point for checking the exact paper protocol; explanatory comparisons and proposed attacks are not claims that all such attacks were executed by the paper.

## Independent follow-up review

See `docs/review-content.md` for the independent source and student-reading audit. It corrected Stable Signature training inputs, labelled the RingID score-gap rule as editorial, repaired three oral answers, expanded notation and included bullets/equations/worked examples in the section-level claim register. Primary checks in that review were sampled rather than exhaustive.
