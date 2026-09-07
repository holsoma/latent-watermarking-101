# RingID implementation lab

This lab extends the Tree-Rings adapter with a registered key bank and top-one/open-set identification. The default run is a deterministic local adapter; use the official repository for paper-scale Stable Diffusion experiments.

Official implementation: https://github.com/showlab/RingID

```bash
cd /c/amos/research/latent-watermarking-101/implementations/ringid
python -m venv .venv && source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m paper_lab.train --config configs/demo.toml
python -m paper_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
python -m paper_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
```

No embedder or detector is trained. The local adapter reports a continuous Fourier score, named attacks and a manifest with `steps: 0`; it does not establish the paper's Stable Diffusion, scheduler, inversion or false-positive results.
