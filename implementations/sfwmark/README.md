# SFWMark implementation lab

This lab isolates SFWMark's centre-aware Fourier placement and Hermitian-symmetry constraint. The default run is a deterministic local adapter; use the official repository or paper settings for benchmark results.

Official implementation: https://github.com/THU-BPM/MarkDiffusion

```bash
cd /c/amos/research/latent-watermarking-101/implementations/sfwmark
python -m venv .venv && source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m paper_lab.train --config configs/demo.toml
python -m paper_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
python -m paper_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
```

No embedder or detector is trained. The local adapter reports a continuous Fourier score, named attacks and a manifest with `steps: 0`; it does not establish the paper's Stable Diffusion, scheduler, inversion or false-positive results.
