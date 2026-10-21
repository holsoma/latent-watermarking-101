# Glossary expansion

Prepared on 21 October 2026 for an applied AI student who knows Python, probability, linear algebra and neural networks.

## Coverage and reading behaviour

The new typed register, `src/glossary.ts`, contains 98 terms across six topics:

| Topic | Terms | Main coverage |
|---|---:|---|
| Diffusion and inversion | 17 | Codec and VAE, latent states, noising and denoising, DDIM, conditioning, seeds, sampling and KL divergence |
| Watermark construction | 18 | Insertion points, payload and keys, detector and extractor, detection and decoding, attribution and binding, Fourier structure and Gaussian geometry |
| Detection and statistics | 19 | Scores, operating points, nulls, error rates, p-values, ROC, calibration, held-out data, multiple tests, covariance, marginals and independence |
| Coding and security | 17 | Bit and message recovery, redundancy and rates, repetition and PRC, soft decoding, cryptographic properties, signatures, hashing and channel models |
| Attacks and robustness | 13 | Attacker access, removal, forgery, transplant, regeneration, geometric changes, actual JPEG, budgets, robustness and security |
| Evaluation and practice | 14 | Quality measures, payload capacity, training boundaries, LoRA, demonstration classification, reproduction and saved-image measurements |

Each term supplies a definition, a reason the distinction affects experiments, related-term references and links to relevant handbook studies or worked mathematics. Numerical examples state simplifying assumptions. The page keeps definitions visible in a definition list; optional worked examples use native disclosure controls.

The page has alias-aware text search, topic selection, result counts, a clear-filter action, alphabet jumps and a designed empty state. Each term has a stable `#/glossary?section=<id>` URL. Following a related term reveals it if active filters had excluded it. Related links use term names rather than internal identifiers.

The reference renders 24 terms per page. Search and alphabet jumps cover every matching term, and deep links open the target's page. Bottom pagination returns to the top controls so the new group starts in view. Top pagination retains its control focus, and filtering retains input focus.

The `aliases` field includes alternative spellings, abbreviations and related search vocabulary. The UI labels these items **Related search terms**. This avoids teaching non-equivalent concepts as synonyms, such as chi and chi-squared distributions, PSNR and MSE, ROC and AUC, or false discovery rate and precision. Their definitions state the actual relationships.

## Source basis

The existing handbook entries, revision mathematics and `docs/source-register.md` supplied the organising context. Definitions are new educational explanations. Internal study links lead to the paper-specific assumptions and source references, rather than presenting the glossary as a substitute for a full method description.

Primary records checked during this expansion:

- [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114): probabilistic encoding and reparameterisation. The glossary distinguishes a distribution, its mean and a random draw.
- [Classifier-Free Diffusion Guidance](https://arxiv.org/abs/2207.12598): combination of conditional and unconditional estimates. The glossary requires the guidance convention to be stated.
- [Denoising Diffusion Implicit Models](https://arxiv.org/abs/2010.02502): sampling family and deterministic limit. The glossary does not turn deterministic sampling into a claim of exact image inversion.
- [Pseudorandom Error-Correcting Codes](https://arxiv.org/abs/2402.09370) and [An Undetectable Watermark for Generative Image Models](https://arxiv.org/abs/2410.07369): computational pseudorandomness, permitted adversarial access and the use of PRCs in image generation. The local repetition-and-XOR teaching exercise is explicitly excluded from the primary cryptographic guarantee.
- [Gaussian Shading](https://arxiv.org/abs/2404.04956): initial-noise mapping and inversion context. The glossary distinguishes distributional preservation from a paired-image identity claim and requires the construction's randomisation assumptions.
- [The Unreasonable Effectiveness of Deep Features as a Perceptual Metric](https://arxiv.org/abs/1801.03924): learned feature-based perceptual distance and the limits of simple pixel metrics.
- [GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium](https://arxiv.org/abs/1706.08500): FID as a comparison of image-feature distributions, not a paired-image measure.
- [Image Quality Assessment: From Error Visibility to Structural Similarity](https://eceweb.uwaterloo.ca/~z70wang/publications/ssim.html): structural similarity as a complementary image-quality framework.

No cross-paper numerical ranking, new robustness claim or publication status is introduced. The glossary retains the handbook's supplied-summary qualification for Push It Away. Generic arithmetic examples are editorial calculations, not results from a paper or local lab.

## Checks

`tests/glossary.test.tsx` checks coverage, unique stable identifiers, substantive explanations, punctuation, related-term integrity, every linked study and mathematical section, common factual distinctions, alias search, topic filtering, empty-state recovery, stable permalinks, optional examples and filtered-target navigation. The coordinator runs it with the complete website suite and production build.

Independent review identified the non-equivalent search vocabulary issue described above. The display label was corrected before delivery; subsequent independent findings and final acceptance are recorded by the coordinator's reviewer separately.
