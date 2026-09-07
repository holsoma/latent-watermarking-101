# WOUAF implementation lab

This compact lab follows WOUAF's attribution boundary: condition weight modulation on a user fingerprint and decode the fingerprint from outputs. The local adapter uses rank-limited updates rather than a full diffusion U-Net.

## Git Bash

```bash
cd /c/amos/research/latent-watermarking-101/implementations/wouaf
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m stable_signature_lab.train --config configs/demo.toml
python -m stable_signature_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/marked_decoder.png
python -m stable_signature_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/marked_decoder.png --attacks identity,blur,crop,jpeg
```

The official [AquaLoRA repository](https://github.com/Georgefwt/AquaLoRA) merges watermark LoRA updates into a customised Stable Diffusion U-Net. Use that repository for paper-faithful runs. This local lab is for understanding the fixed-key, rank-limited optimisation boundary.

`outputs/demo/manifest.json` records the key, recovered bits, training loss history and clean bit error rate. Compare `base_decoder.png`, `marked_decoder.png` and `residual_amplified.png` before making any quality claim.
