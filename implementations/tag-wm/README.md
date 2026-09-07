# TAG-WM implementation lab

This lab separates ownership payload recovery from tamper localisation. The default run is a deterministic local adapter; localisation metrics require masks or edited-image pairs.

Official implementation: https://github.com/THU-BPM/MarkDiffusion

```bash
cd /c/amos/research/latent-watermarking-101/implementations/tag-wm
python -m venv .venv && source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m paper_lab.train --config configs/demo.toml
python -m paper_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
python -m paper_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
```

No embedder or detector is trained. The local adapter reports a continuous Fourier score, named attacks and a manifest with `steps: 0`; it does not establish the paper's Stable Diffusion, scheduler, inversion or false-positive results.
