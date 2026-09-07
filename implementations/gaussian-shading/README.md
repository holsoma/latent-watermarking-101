# Gaussian Shading implementation lab

This lab maps payload bits to the signs of groups of initial Gaussian-noise coefficients. The absolute values remain half-normal, so the marked latent keeps the intended Gaussian marginal while inversion decodes signs. The default backend is a reversible CPU adapter. An optional Diffusers loader is provided for a real latent-diffusion run with supplied model weights.

Official implementation: https://github.com/bsmhmmlf/Gaussian-Shading

```bash
cd /c/amos/research/latent-watermarking-101/implementations/gaussian-shading
python -m venv .venv && source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m paper_lab.train --config configs/demo.toml
python -m paper_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
python -m paper_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
```

This is an educational adapter, not a claim of the paper's exact scheduler, inversion, payload partition or attack results. The manifest records the recovered message and bit error rate for every run.
