# Stable Signature implementation lab

This compact lab follows the Stable Signature training boundary: register a fixed binary key, freeze an image extractor, and fine-tune a decoder while penalising visual change. The local extractor and decoder are small deterministic adapters so the loop can run on CPU.

## Git Bash

```bash
cd /c/amos/research/latent-watermarking-101/implementations/stable-signature
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m stable_signature_lab.train --config configs/demo.toml
python -m stable_signature_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/marked_decoder.png
python -m stable_signature_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/marked_decoder.png --attacks identity,blur,crop,jpeg
```

The official [Facebook Research repository](https://github.com/facebookresearch/stable_signature) fine-tunes a Stable Diffusion VAE decoder against a pretrained robust extractor and provides extractor checkpoints and evaluation scripts. Use that repository for paper-faithful runs. This local lab is for understanding the fixed-key, decoder-only optimisation boundary.

`outputs/demo/manifest.json` records the key, recovered bits, training loss history and clean bit error rate. Compare `base_decoder.png`, `marked_decoder.png` and `residual_amplified.png` before making any quality claim.
