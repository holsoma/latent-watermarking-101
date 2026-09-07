# Implementation roadmap

This roadmap tracks the runnable-lab programme. Every paper gets its own branch copied from `_template`; the shared contract stays on `main`.

## Complete

- `hidden` — HiDDeN
- `rosteals` — RoSteALS
- `stable-signature` — Stable Signature
- `zodiac` — ZoDiac
- `tree-rings` — Tree-Rings
- `gaussian-shading` — Gaussian Shading
- `seal` — SEAL
- `lawa` — LaWa
- `aqualora` — AquaLoRA

The last five are Level B mechanism adapters. They expose the paper's trainable or frozen boundary and include an optional path to the official model stack. Their local manifests explicitly mark `local_adapter: true`.

## Fidelity backlog

All 24 paper slugs now have contract-compliant local adapters and site entries. The items below are the next method-specific fidelity passes. They must not be described as paper reproductions until their named mechanism, official model and evaluation protocol are implemented.

### Initial-noise and inversion

1. `ringid` — extend Tree-Rings with multi-key identification and open-set rejection.
2. `sfwmark` — implement Hermitian-symmetric, centre-aware Fourier placement.
3. `t2smark` — split Gaussian sampling between robust tails and diversity-preserving central regions.
4. `gaussian-shading-plus-plus` — add seed transport, soft decoding and public-key verification.
5. `prc-watermark` — add pseudorandom coding and the stated computational-undetectability experiment.
6. `gaussian-shannon` — add error-correcting codes, repeated observations and word-error metrics.
7. `robin` — optimise conditioning around a marked intermediate diffusion state.

### Learned and model-integrated

8. `latent-watermark` — implement progressive latent injection and detector training.
9. `gaussmarker` — implement dual-domain marking and the Gaussian Noise Restorer.
10. `serum` — train an image-space detector for initial-noise marks without inversion.
11. `wouaf` — implement fingerprint-conditioned weight modulation and open-set attribution.
12. `sleepermark` — test retention after simulated downstream fine-tuning and targeted unlearning.
13. `object-watermark` — learn control-token embeddings and evaluate object-level crops.

### Integrity and attacks

14. `tag-wm` — separate ownership payload recovery from tamper localisation.
15. `semantic-forgery` — implement cross-model black-box forgery and removal attacks against completed detectors.

## Required gate for every queued paper

- README names the primary paper, official code, training boundary and local deviation.
- `demo.toml` and `smoke.toml` run through separate generation, detection and evaluation commands.
- Tests cover tensor shapes, deterministic behaviour and one cheap end-to-end path.
- `manifest.json` records the run kind, device, seed, steps, payload result, bit error rate and artefacts.
- Evaluation names attacks individually and reports fidelity, exact recovery where relevant, and negative-image false positives.
- `python implementations/shared/check_structure.py` and `npm test` pass before the pull request.
