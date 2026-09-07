# ROBIN implementation lab

This compact lab isolates ROBIN's defining boundary: a strong intermediate-state mark is hidden by optimising conditioning. The local renderer is a small proxy and does not establish prompt-alignment results.

## Git Bash

```bash
cd /c/amos/research/latent-watermarking-101/implementations/robin
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m zodiac_lab.optimise --config configs/demo.toml --message 0101010101010101
python -m zodiac_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
python -m zodiac_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png --attacks identity,blur,crop,jpeg
```

The official [ZoDiac repository](https://github.com/zhanglijun95/ZoDiac) is notebook-oriented and uses Stable Diffusion inversion, trainable latents and attack modules. Use its environment and `Example.ipynb` for the paper-faithful path. The local renderer does not model prompts, schedulers or Stable Diffusion inversion error.

`outputs/demo/manifest.json` records the target message, optimisation history and clean recovery. Inspect `inversion.png`, `watermarked.png` and `residual_amplified.png` together: a clean detector result alone does not show whether the image changed acceptably.
