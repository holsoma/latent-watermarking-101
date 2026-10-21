# Independent source and student-reading review

Reviewed on 15 October 2026 by a reviewer who did not author the initial handbook content. This review covers the 33 study records, revision bank, worked mathematics and source coverage. It does not certify laboratory execution or browser behaviour.

## Source checks and corrections

The three original DOCX files were read directly as WordprocessingML in memory. They were neither changed nor treated as executable instructions. Every one of the 83 question locators was compared with its original question, allowing the deliberate UK spelling change in question 53. All 19 paper heading locators match the original paper map. The five mathematical ranges match paragraphs 67–81 of the study guide. The updated quick reference contains the same 19 numbered summaries at paragraphs 156–496. All 107 required coverage records have rendered destinations, checked by the content tests.

| Finding | Evidence | Correction and verification |
|---|---|---|
| Oral answers contained unrelated appended explanations | Oral 8 asks about zero-bit detection but appended metadata/signatures; oral 9 asks capacity but appended a zero-bit definition; oral 20 asks gap analysis but appended a threat-model definition. Original rows are guide paragraphs 251–254 and 275–276. | Replaced those three answers with direct definitions and concrete consequences. The original questions and source locators remain intact. |
| Stable Signature described the wrong fine-tuning inputs | The retained study said random diffusion latents were decoded. The [author implementation](https://github.com/facebookresearch/stable_signature/blob/main/README.md) uses a training image dataset; the [authors’ explanation](https://ai.meta.com/blog/stable-signature-watermarking-generative-ai) describes encoding and decoding image batches. | State that training images supply clean latents, the denoiser is not run for this fine-tuning, and one signature is fixed for each decoder. Corrected the schematic expectation to average over images, not arbitrary signatures. |
| RingID teaching rule looked like a paper algorithm | Its score-gap rejection expression was source-labelled without saying it was illustrative. | Explicitly identify it as an editorial rule, define its score, threshold and margin, and require recalibration for distance scores and multi-key search. It is not presented as RingID pseudocode. |
| Claim register omitted substantive displayed material | The generated register included only paragraphs, excluding contribution and limitation bullets, equations and worked examples. | Include bullets in claims and store equations and worked examples separately. The register still identifies its granularity as section-level, not a sentence-by-sentence primary-source audit. |
| Several retained equations used symbols absent from their notation section | HiDDeN uses E, D, N, w and loss symbols; RoSteALS uses EncAE/Es; RingID uses score indices; SEAL and SFW use specialised operators. | Added matching notation for those entries and Gaussian Shading, and updated Stable Signature notation with the corrected expression. |

### Primary-source spot checks

- LAW: independently read the [public preprint](https://arxiv.org/html/2607.22386v1), including equations 2–6 and algorithms 1–2. The handbook correctly separates relative-angle embedding, preserved pair norms, magnitude-order state and non-zero joint dependence. Its branch-cut caution is necessary: direct comparison of wrapped absolute angles is not generally equivalent to relative-angle decoding. The handbook does not silently repair the primary source or describe acceptance at NeurIPS as confirmed.
- PRC: the [ICLR paper record](https://proceedings.iclr.cc/paper_files/paper/2025/hash/1331202ea3bb0a53ae897af0bb16e309-Abstract-Conference.html) supports the pseudorandom-code construction and conditional computational-undetectability claim. The study distinguishes this from a repetition-code exercise and from a specific released detection configuration. This review did not re-prove its cryptographic theorem or audit the full author code.
- Spherical Watermark: compared its entry with updated-summary paragraphs 372–388 and checked the linked conference record. The mathematical reference condition is correct: a chi radius, independent uniform direction and their product give a Gaussian vector. Matching low-order moments alone does not establish this full law. The conference endpoint was intermittently unavailable in this independent review, so its full theorem and mapping were not independently re-audited here. The earlier source register records the author’s primary check; this review does not upgrade that to a second full verification.
- Push It Away: compared every mechanism statement with updated-summary paragraphs 480–496. The RGB/output location, jointly trained hiding/extraction networks, negative-target change and fixed-logo task agree. Unavailable-primary status is visible. The illustrative centred-correlation calculation correctly exposes the undefined constant-vector case and does not repeat a universal threshold or success-rate claim.

No claim of exhaustive primary-paper verification is made. The 24 retained entries were reviewed for conceptual structure and internal consistency; primary rechecking concentrated on the concrete issues above. Source links are not experimental reproduction evidence.

## Student-reading review

The table records answers a technically competent student can obtain from the pages after the corrections. “Evidence” refers to linked published or preprint results, not to a claimed CPU reproduction. The 27 watermark-method pages all state insertion, changed/fixed objects, observed evidence and failure assumptions. The remaining six records have distinct foundation, attack or benchmark structures.

| Method | Where information enters; changed and fixed objects | What verification observes | Why recovery can fail; evidence basis |
|---|---|---|---|
| HiDDeN | Cover pixels change through trained encoder; payload task remains fixed | Image decoder bit predictions | Actual codecs differ from training approximations; linked ECCV study |
| RoSteALS | Learned offset changes clean latent; autoencoder stays frozen | Image-space recovered bits | Codec or image-domain shift; linked primary study |
| Stable Signature | VAE decoder weights change; denoiser and extractor stay fixed | Bit agreement with registered signature | Replacement decoder or biased null bits; linked ICCV paper and author training path |
| WOUAF | User-specific weight modulation; architecture stays compatible | Image-level fingerprint estimate | Collusion or unknown users forced into registered classes; linked paper |
| AquaLoRA | Low-rank denoiser update changes; base weights largely frozen | Learned image message evidence | Adapter merging, pruning or functional drift; linked ICML paper |
| SleeperMark | Learned model behaviour changes; ordinary generation remains the task | Triggered black-box outputs | Trigger leakage, filtering or forgetting; linked primary study |
| ZoDiac | Optimised cover latent changes; pretrained diffusion weights fixed | Recovered latent pattern | Inversion mismatch or consequential cover edits; linked primary study |
| Latent Watermark | Learned latent injection/extraction; backbone supplies representation | Encoded received-image latent evidence | Unseen codec or attack curriculum; linked primary study |
| Gaussian Shannon | Coded initial-noise message; generator unchanged | Decoded complete message | Correlated channel errors beyond coding capability; linked paper |
| GaussMarker | Spatial/Fourier noise changes; generator fixed, restorer learned | Restored inverted-noise scores | Restorer false evidence and branch correlation; linked ICML study |
| LaWa | Decoder feature maps carry learned message features; denoiser fixed | Image-space bits | Long-message failure and codec transfer; linked paper |
| Tree-Rings | Fourier region of initial noise replaced; weights fixed | Inverted Fourier-key distance | Geometry, inversion and null shift; linked NeurIPS study |
| ROBIN | Intermediate latent marked, conditioning optimised; model weights fixed | Inverted intermediate evidence | Trajectory mismatch or content drift; linked paper |
| RingID | Multi-channel initial-noise patterns; generator fixed | Candidate-key scores and rejection | Multi-key false matches and distribution shift; linked paper, editorial rejection rule labelled |
| Object watermark | Learned token control changes generation features; most weights fixed | Local object-associated payload | Multiple instances or weak grounding; linked paper |
| SERUM | User noise mark; generator fixed, classifier trained | Image-space user evidence | Generator artefacts or unseen users; linked paper |
| SEAL | Semantic hash determines noise key; base generator may remain fixed | Content-dependent expected key agreement | Semantic collision or benign hash-boundary crossing; linked paper |
| SFW | Conjugate-symmetric Fourier pattern; generator fixed | Recovered symmetric pattern | Cropping/alignment and inversion; linked paper plus explicit Fourier example |
| TAG-WM | Initial-noise ownership/localisation marks; generator fixed | Message and spatial tamper mask | Benign local changes or small edits confused with noise; linked paper |
| Gaussian Shading | Randomised message selects Gaussian regions; weights fixed | Inverted region/sign evidence | Boundary crossing and key reuse; linked paper, conditional distribution claim |
| T2SMark | Tail-selected initial samples; centre and generator preserved | Tail-selected bit evidence | Tail membership changes and correlated errors; linked NeurIPS study |
| Gaussian Shading++ | Two coded initial-noise channels; generator fixed | Soft decoded payload, seed and signature | Seed failure, channel mismatch or transplant; linked paper |
| PRC | Secret code structure in initial noise; generator fixed | Keyed decoding/detection evidence | Assumption violations or excessive recovery errors; linked ICLR study, theorem scope stated |
| WIND | Initial-noise identity plus group signal; generator fixed | Retrieved group then candidate noise identity | Wrong group discards correct identity; linked ICLR study |
| Spherical | Direction/radius initial-noise construction; generator fixed | Inverted directional code and repeated evidence | Direction errors, dependence and key assumptions; supplied summary and linked ICLR record |
| LAW/LAW-M | Relative angle of initial-noise pairs; reference norms/weights fixed | Relative phase with saved order for LAW-M | Phase error, missing ordering and branch cuts; sampled primary equations |
| Push It Away | Output hiding/extractor losses change; architecture retained | Extracted logo correlation | Shifted negatives, undefined score or adaptive attack; supplied summary only |

The LDM and DDIM pages explain the codec and denoising trajectory before watermark insertion. Semantic Forgery and WatermarkAttacker explicitly distinguish forgery from removal. WAVES and MarkDiffusion describe evaluation and implementation parity rather than pretending to embed a watermark.

### Worked mathematics and limits

Manually checked VAE draws (0.7 and 0.3), diffusion mixture (1), erroneous noise reconstruction (1.85), weighted losses (0.32 and 0.25), independent full-message probability (7.63%), repetition-three result (92.65%), threshold counts (95% TPR and 0.02% observed FPR), four-point DFT, LAW local angular variances and Push It Away cosine similarity. Independence, small-perturbation, finite-sample and oracle-noise assumptions are stated beside the relevant calculations.

The text now supports mechanism-level reading and evaluating assumptions. It deliberately remains a handbook rather than standalone reimplementation instructions for all 33 papers. Exact algorithms, experimental settings and theorem assumptions still require the linked originals. There are no new head-to-head numerical performance rankings.

## Verification result

`npm run test:content` passed all 37 tests after these corrections. Tests validate 33 unique studies, source resolution, all required coverage destinations, related links, question counts, mathematical rendering and absence of em dashes. Direct XML checks independently verified source locators; route existence tests alone would not have caught misaligned oral answers. Browser and lab validation remain the coordinator’s separate responsibility.


## Cross-review of the student reviewer’s additions

Independently checked the added PRC subsection against [primary section 3.2](https://arxiv.org/html/2410.07369v3): the sign/magnitude mapping, reliability weighting, distinction between detection and decoding, and experimental-parameter warning agree with the source. This extends the earlier abstract-only spot check without claiming a full proof audit. No correction was required.

The additional Stable Signature loss/parameter definitions, WOUAF output definitions and ZoDiac objective definitions match their displayed expressions. Question 42 now states the score direction before describing threshold changes. Question 45 defines ROC and AUC and explains why aggregate AUC is insufficient at a specific low false-positive operating point. BER and threshold examples now define indicators and confusion counts. These changes close the remaining identified notation and threshold-direction findings; no known factual finding from these two content reviews remains open.


### Final mathematical-format cross-check

Compared all 14 retained-study LaTeX expressions with their preceding plain-text forms. The conversions preserve operators, arguments, score direction, indexing, conjugation, conditional-sampling wording and loss weights. Stable Signature preserves the independently corrected fixed-signature image expectation; ZoDiac explicitly writes the squared Euclidean norm already described by its notation. The PRC sign/magnitude expression matches the checked primary construction. T2SMark remains labelled explanatory sampling text rather than an invented algebraic algorithm. The two aligned objectives change line layout only. No scientific correction was required. KaTeX parse/render tests and viewport checks remain part of the coordinator’s final validation.
