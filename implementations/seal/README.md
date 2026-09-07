# SEAL implementation lab

This lab demonstrates SEAL's database-free boundary: cheap visual statistics are mapped through deterministic SimHash, the resulting key controls an initial-noise Fourier pattern, and verification recomputes the key from the received image. The visual statistics are a local proxy. They are not SEAL's BLIP-2 captioning and sentence-embedding models.

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

To render a proxy-key latent with Diffusers, install `pip install -e .[official]` and run `python -m paper_lab.official --model-id <diffusers-model> --prompt "a mountain lake" --proxy-key 01010101`. This command remains a mechanism adapter and records that semantic derivation and inversion were not run.
