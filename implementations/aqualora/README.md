# AquaLoRA implementation lab

This compact lab follows AquaLoRA's white-box boundary: register a fixed binary key, freeze the base decoder and train rank-limited LoRA updates while penalising visual change. The local extractor and decoder are small deterministic adapters so the loop can run on CPU.

## Git Bash

```bash
cd /c/amos/research/latent-watermarking-101/implementations/aqualora
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

For an official-stack generation, install `pip install -e .[official]` and run `python -m stable_signature_lab.official --model-id <base-model> --lora-path <merged-aqualora-lora> --prompt "a mountain lake" --fingerprint user-001`.
