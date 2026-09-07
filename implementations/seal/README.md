# SEAL implementation lab

This lab follows SEAL's database-free path: a coarse semantic representation derives the expected key, the key is written into initial-noise Fourier coefficients, and verification recomputes the key from the received image. The default run is a deterministic reversible adapter for CPU tests. The module also exposes an optional Diffusers loader for an actual Stable Diffusion pipeline when model weights and the `diffusers` package are available.

Official implementation: https://github.com/Kasraarabi/SEAL

```bash
cd /c/amos/research/latent-watermarking-101/implementations/seal
python -m venv .venv && source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m paper_lab.train --config configs/demo.toml
python -m paper_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
python -m paper_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
```

No embedder or detector is trained. The local adapter reports a continuous Fourier score, named attacks and a manifest with `steps: 0`; it does not establish the paper's Stable Diffusion, scheduler, inversion or false-positive results.

For an official-stack generation, install `pip install -e .[official]` and run `python -m paper_lab.official --model-id <diffusers-model> --prompt "a mountain lake" --semantic-key 2122122333`.
