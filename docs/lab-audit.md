# CPU laboratory audit and verification

All 24 bounded CPU runs completed creation, saved-image detection, attack evaluation and behavioural checks using Python 3.11.0. This confirms execution and the listed assertions. It does not establish reliable recovery, calibration, cryptographic security or paper reproduction. Each lab remains a prerequisite exercise.

## Corrections

- Replaced identity and quantisation-only evaluation branches labelled JPEG with real Pillow JPEG compression and decompression. Results record quality 75 for the replaced branches and 55 for existing codec branches. Invalid quality values are rejected by the shared-shape codec helpers.
- Evaluation now transforms the saved image instead of silently embedding another message. Training observations are retained separately; the final manifest describes the exact saved image and its measured detector output.
- Known Fourier keys are no longer reported as extracted payloads. Scores and recovered bits are separate. Misleading run names, cross-lab manifest slugs and machine-specific commands were corrected.
- PRC embedding and recovery now execute seeded repetition/XOR coding. Tests demonstrate one-chip correction, two-chip failure and wrong-seed decoding. This toy is not a secure pseudorandom code.
- T2S preserves all central samples and uses the same tail-selection rule for recovery. Tests check preservation and corruption. Quantisation can change tail membership.
- ROBIN optimises additive conditioning while keeping the sign-marked sampled state and renderer fixed. Tests check changed conditioning, unchanged state and parameters, and renderer checkpoint reload. This is not text-conditioned diffusion.
- SERUM detection and evaluation now use the same image-space carrier correlation. It remains a Fourier prerequisite, not the paper recovery pipeline.

## Recorded CPU results

Exact commands, stdout, stderr, timestamps and return codes are in [lab-verification.json](lab-verification.json). The following measurements come from reloaded PNG images. A nonzero bit error is retained as a result, not hidden behind a successful exit code.

| Lab | Command checks | Behaviour assertions | Saved-image result |
|---|---:|---:|---|
| aqualora | 4/4 | 14 | BER 0.666667 |
| gaussian-shading | 4/4 | 19 | BER 0 |
| gaussian-shading-plus-plus | 4/4 | 17 | BER 0 |
| gaussian-shannon | 4/4 | 17 | BER 0 |
| gaussmarker | 4/4 | 16 | score 0.29318 |
| hidden | 4/4 | 15 | BER 0.625 |
| latent-watermark | 4/4 | 15 | BER 0.3125 |
| lawa | 4/4 | 16 | BER 0.3125 |
| object-watermark | 4/4 | 15 | BER 0.3125 |
| prc-watermark | 4/4 | 20 | BER 0 |
| ringid | 4/4 | 16 | score 0.29318 |
| robin | 4/4 | 15 | BER 0.375 |
| rosteals | 4/4 | 14 | BER 0.25 |
| seal | 4/4 | 18 | score 0.268211 |
| semantic-forgery | 4/4 | 15 | score 0.29318 |
| serum | 4/4 | 16 | score 0.214002 |
| sfwmark | 4/4 | 16 | score 0.125385 |
| sleepermark | 4/4 | 12 | BER 0.666667 |
| stable-signature | 4/4 | 11 | BER 0.645833 |
| t2smark | 4/4 | 19 | BER 0 |
| tag-wm | 4/4 | 16 | score 0.29318 |
| tree-rings | 4/4 | 19 | score 0.541202 |
| wouaf | 4/4 | 12 | BER 0.666667 |
| zodiac | 4/4 | 10 | BER 0.5 |

## Reading the controls

Every lab runs its existing zero-argument test assertions in its own process. Added checks exercise actual codec changes and saved-image consistency. Payload examples record unmarked and sign-corrupted image decoding. Keyed detectors record wrong-key, unmarked and corrupted-image scores. These are observations, not claims that every negative control is rejected. Small neural training runs can decode similar bits for unrelated images. Opposite-target BER complementarity checks only metric arithmetic, not detector sensitivity.

The four published image examples are under `public/experiments/handbook/`. Each `run.json` includes the exact smoke configuration, timestamp, measured saved-image result and SHA-256 hashes. Checkpoints are not published.

Older ignored `outputs/smoke` and `outputs/contract-smoke` files predate this audit and may have wrong cross-lab slugs. They were not silently rewritten as new evidence. `check_structure.py --strict-output-slugs` can therefore flag those local legacy files. The 24 `outputs/handbook` manifests and the versioned report are the current evidence.

## Re-run

From the repository root, with CPU dependencies installed:

```text
python implementations/shared/verify_all_labs.py
python implementations/shared/publish_lab_evidence.py
```

Use `--controls-only <slug>` to check existing saved artefacts without recreating them. All commands use isolated subprocesses because several labs reuse Python package names. No pretrained model downloads or GPU execution were used.
