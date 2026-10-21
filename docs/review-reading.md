# Independent student-reading review

Reviewed on 15 October 2026. The reviewer did not author the initial handbook. This is a comprehension review for a reader who knows Python, basic probability, linear algebra and neural networks, not an independent reproduction of the papers. Source verification has its own report.

## Reader tasks

For each watermark study, the review traced where information enters, what changes and stays fixed, what verification observes, why recovery can fail, and the stated evidence. The 24 adapted studies put these answers in `mechanism`, `recovery`, method-specific detail sections, `evidence` and `limitations`. New studies use the equivalent explicit sections. Foundation and benchmark pages were assessed against their explanatory purpose rather than forced into an embedding template.

| Study | Reader can locate the changed object and observed evidence |
|---|---|
| LDM | Codec, latent denoiser and decoder roles; tensor-size calculation is qualified |
| DDIM | Deterministic sampling versus approximate inversion; local error example |
| Latent Watermark | Learned injection and recognition; encoder-dependent latent evidence |
| Gaussian Shannon | Coding and repeated observations; exact-message outcome |
| GaussMarker | Spatial/Fourier patterns and learned restoration; calibration after restoration |
| LaWa | Multiscale decoder features; image-space message recovery |
| Tree-Rings | Initial Fourier coefficients; inverted key-region comparison |
| ROBIN | Intermediate state and conditioning optimisation; compatible reverse trajectory |
| RingID | Patterned initial noise; multi-key identification with rejection |
| Object watermark | Control-token embeddings; object-local payload evidence |
| SERUM | Noise marking plus learned classifier; image-space observation |
| SEAL | Semantic content-dependent key; hash stability and collision assumptions |
| SFWMark | Symmetric Fourier construction; geometry and inversion errors |
| TAG-WM | Copyright and localisation signals; message plus tamper mask |
| Gaussian Shading | Bit-conditioned sampling; inverted coordinate decisions |
| T2SMark | Tail evidence and central randomness; tail-membership uncertainty |
| Gaussian Shading++ | Coded channels and signatures; seed transport and soft recovery |
| PRC | Codeword signs and Gaussian magnitudes; separate detection and decoding, after correction below |
| HiDDeN | Pixel encoder, attack layer and decoder; received pixels |
| RoSteALS | Learned offset with frozen autoencoder; separate image-space decoder |
| Stable Signature | Fine-tuned VAE decoder; fixed extractor and registered signature |
| WOUAF | User-dependent weight modulation; decoded fingerprint |
| AquaLoRA | Low-rank denoiser updates; message-bound extraction |
| SleeperMark | Model training and verification queries; fine-tuning persistence limits |
| ZoDiac | Optimised cover-image latent; recovered pattern and cover fidelity |
| Black-Box Forgery | Attacker-controlled image; target detector acceptance, distinct from removal |
| WIND | Group-augmented initial noise; coarse group lookup then identity comparison |
| Spherical Watermark | Direction construction, rotation and radius; inverse mapping and repeated bits |
| LAW / LAW-M | Encoding versus reference pairs; angular recovery and saved ordering |
| WatermarkAttacker | Corruption and reconstruction; detection change at a quality cost |
| WAVES | Matched comparison protocol; quality/detection curves and attack access |
| MarkDiffusion | Shared implementation interface; parity checks and recorded configuration |
| Push It Away | Negative extraction target; score separation, explicitly summary-based |

## Findings and corrections

| Location | Evidence and required correction | Verification |
|---|---|---|
| `src/revision.ts`, question 42 | Lowering a threshold was stated to accept more watermarks without a score-direction assumption. This is misleading for distance detectors. Added similarity direction and the reversed distance rule. | Read alongside Tree-Ring recovery and the threshold example; direction now agrees. |
| `src/revision.ts`, question 45 | ROC and AUC were invoked without explanation and could imply AUC alone resolves rare-false-positive evaluation. Expanded their meanings and the limitation. | Direct answer now defines both and explains fixed-FPR reporting. |
| `src/revision.ts`, detector-threshold and bit-error-rate | Direct section links used indicator notation and confusion-matrix counts without complete local definitions. Added the indicator rule and explicit accepted/rejected meanings of TP, FN, FP and TN. | Equations can be read without opening question 43 first. |
| `src/handbook.ts`, notation map | Stable Signature loss symbols and minimisation variable, WOUAF user outputs and weights, and ZoDiac losses/minimiser were not all defined. Added their meanings. | Re-read each expression against its preceding notation. |
| `src/studies.ts`, PRC | Security discussion did not show the concrete path from a codeword to latent evidence. Added sign/magnitude mapping, inversion evidence, detection/decoding distinction and experimental-parameter warning. | Checked primary section 3.2, especially algorithms and the warning after Theorem 1. Independent source reviewer asked to check this addition. |

The PRC correction uses [the primary manuscript, section 3.2](https://arxiv.org/html/2410.07369v3#S3.SS2). It does not claim that the local repetition/XOR demonstration implements the paper's cryptographic code.

## Coverage and checks

Loaded the rendered registry through Vite and resolved all 107 coverage targets: 19 paper entries, 63 conceptual questions, five supplied mathematics topics and 20 oral questions. Every section-specific target resolves to the corresponding question or mathematical section. The two additional Fourier and inversion examples remain present alongside the five supplied mathematics topics. `npm run test:content` passed 37 tests after the corrections.

Prerequisites give direct access to LDM, DDIM and worked mathematics. The seven calculations define their simplifying assumptions and distinguish algebraic examples from experiments. Existing method sections keep limitations beside mechanism explanations. The handbook is usable without executing a lab.

No remaining comprehension blocker was identified in this pass. This does not certify every scientific claim or every primary paper experiment. The primary source report and lab verification report retain those separate limits. The coordinator should review these review-authored wording fixes rather than treating the reviewer as their sole approver.

## Equation-format completion

All 14 expressions retained from the existing studies now carry explicit LaTeX format in `src/studies.ts`; the registry adapter preserves that format. The two long loss expressions use aligned lines, and the T2SMark explanatory text remains text inside the mathematical display rather than an invented sampling formula. The Fourier conjugation bar is explicitly defined in notation. A registry inspection found 22 study equations and no plain-format equations. The content suite passed all 37 tests, including strict KaTeX parsing of each expression. The independent source reviewer was asked to check rendering equivalence.
