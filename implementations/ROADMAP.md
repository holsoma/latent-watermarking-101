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

The last five are Level B mechanism adapters. Tree-Rings and Gaussian Shading also expose `official.py` entry points that pass paper-shaped latents into a real Diffusers pipeline when model weights are supplied. Their local manifests explicitly mark `local_adapter: true`; official-stack runs mark it false.

## Fidelity backlog

All 24 paper slugs now have contract-compliant local adapters and site entries. The items below are the next method-specific fidelity passes. They must not be described as paper reproductions until their named mechanism, official model and evaluation protocol are implemented.

### Initial-noise and inversion

1. `ringid` — adapter complete; extend Tree-Rings with a full multi-key benchmark and open-set rejection.
2. `sfwmark` — adapter complete; match Hermitian-symmetric, centre-aware Fourier placement.
3. `t2smark` — adapter complete; match the paper's tail and central sampling schedule.
4. `gaussian-shading-plus-plus` — adapter complete; add paper-faithful seed transport and public-key verification.
5. `prc-watermark` — adapter complete; add the stated computational-undetectability experiment.
6. `gaussian-shannon` — adapter complete; add the paper's error-correcting code and channel calibration.
7. `robin` — adapter complete; connect conditioning optimisation to a marked intermediate diffusion state.

### Learned and model-integrated

8. `latent-watermark` — adapter complete; match progressive latent injection and detector training.
9. `gaussmarker` — adapter complete; train the Gaussian Noise Restorer and calibrate score fusion.
10. `serum` — adapter complete; train and calibrate the image-space detector without inversion.
11. `wouaf` — adapter complete; match fingerprint-conditioned weight modulation and open-set attribution.
12. `sleepermark` — adapter complete; run simulated downstream fine-tuning and targeted unlearning.
13. `object-watermark` — adapter complete; learn control-token embeddings and evaluate object-level crops.

### Integrity and attacks

14. `tag-wm` — adapter complete; separate ownership payload recovery from tamper localisation.
15. `semantic-forgery` — adapter complete; implement cross-model black-box forgery and removal attacks against completed detectors.

## Required gate for every queued paper

- README names the primary paper, official code, training boundary and local deviation.
- `demo.toml` and `smoke.toml` run through separate generation, detection and evaluation commands.
- Tests cover tensor shapes, deterministic behaviour and one cheap end-to-end path.
- `manifest.json` records the run kind, device, seed, steps, payload result, bit error rate and artefacts.
- Evaluation names attacks individually and reports fidelity, exact recovery where relevant, and negative-image false positives.
- `python implementations/shared/check_structure.py` and `npm test` pass before the pull request.
