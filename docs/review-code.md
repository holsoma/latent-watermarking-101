# Independent CPU lab review

Reviewer: independent code reviewer, not an author of the lab changes.

Scope: the portable runner, all 24 lab definitions, JPEG evaluation paths, PRC embedding and decoding, T2S tail selection, ROBIN optimisation and recorded CPU checks. No model downloads or GPU execution.

## Findings requiring correction

1. **Manifest classification and verification were overstated.** Several training modules emitted `mechanism-adapter` and `verification_status: passed` from pre-save evidence. The handbook classifies these as prerequisite exercises. The runner must distinguish execution, measured pre-save evidence and saved-image verification, and retain the prerequisite classification in each generated manifest.
2. **Embedding could invalidate the training manifest.** For HiDDeN and the RoSteALS package family, the runner overwrote `encoded.png` with a new alternating payload after training. Training message and recovery fields therefore described another image. Preserve these fields as training observations, then record the actual saved-image target and measured recovery separately.
3. **Saved-image controls were incomplete for `paper_lab`.** Latent-space assertions did not establish agreement with the detector operating on the saved PNG. Add independent PNG reload comparisons with detector output, plus unmarked, corrupted and wrong-key or wrong-target observations where applicable.

4. **SERUM evaluation did not use the detector's score function.** The final audit exposed a failing evaluation command. The evaluator now applies `image_score` directly to each received image, matching the detector, and the independent comparison uses that same observed interface.

All four findings were corrected and rechecked. Producer manifests identify prerequisite exercises and label pre-save observations. The runner preserves these observations separately and recomputes public results from the saved PNG. All `paper_lab` families now compare saved-image detector results and record negative controls. No unresolved defect was found in the reviewed bounded workflow.

## Final acceptance results

- Inspected the regenerated `docs/lab-verification.json`: all 24 entries contain four successful commands and measured control observations, totalling 373 assertions in the final records. The previous count of 372 preceded the last control refresh. Each final handbook manifest has prerequisite classification, saved-PNG measurement stage, no claim of calibrated verification and existing listed artefacts.
- Independently checked all four published gallery `run.json` files against their final manifests and command records. Supplied configurations match the smoke files; effective configurations identify the `outputs/handbook` override. Run times, commands, detector observations, bit error rates and step counts match the recorded evidence, and every published image matches its SHA-256 digest. HiDDeN ran 12 steps; RoSteALS, Stable Signature and ZoDiac ran three each.
- Independently reran controls in isolated Python 3.11 processes for HiDDeN (15 assertions), PRC (20), ROBIN (15), T2SMark (19) and SERUM (16). All completed successfully.
- PRC and T2SMark recovered the four-bit saved example `1010`. These are small deterministic examples, not statistical robustness results.
- HiDDeN recovered `01101101` for `10101010`, giving a bit error rate of 0.625. Unmarked and corrupted images gave the same decoded bits. ROBIN's saved-image bit error rate was 0.375. The reports preserve these failures despite successful command execution.
- The optional whole-tree `check_structure.py --strict-output-slugs` fails on 18 pre-existing ignored `smoke` and `contract-smoke` manifests with stale paper slugs. These are not the regenerated handbook artefacts. Their history was left unchanged; acceptance above explicitly concerns `outputs/handbook` and its recorded run report.

## Confirmed implementation properties

- JPEG evaluation uses Pillow compression and decompression, with the quality recorded.
- PRC embedding calls the seeded repetition/XOR encoder and decoding calls its corresponding majority decoder. The construction is explicitly described as a teaching code without cryptographic security.
- T2S selects by absolute magnitude for both insertion and recovery. Sign changes preserve magnitudes and central samples. Rendering and quantisation can still change selection, which is stated as a limitation.
- ROBIN optimises only an additive conditioning parameter. The sign-marked sampled tensor and renderer parameters remain fixed. This is described as a conditioning exercise, not diffusion text conditioning.
- Fourier manifests no longer present a supplied key as a recovered payload.
- Each lab runs in a separate subprocess with CPU-only environment settings, preventing reused package names from contaminating imports.

## Interpretation limits

An opposite-target bit-error check is an arithmetic consistency check, not evidence of reliable detection. Negative controls may decode to the same bits in short training runs. Recorded observations must remain visible and must not be represented as calibrated false-positive rates, robustness or paper reproduction.
