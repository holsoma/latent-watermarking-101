# Gaussian Shannon implementation lab

This lab treats inversion as a noisy communication channel, then exposes repeated observations and coded message recovery. The default backend is a deterministic adapter for the communication path.

Official implementation: https://github.com/Rambo-Yi/Gaussian-Shannon

```bash
cd /c/amos/research/latent-watermarking-101/implementations/gaussian-shannon
python -m venv .venv && source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m paper_lab.train --config configs/demo.toml
python -m paper_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
python -m paper_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
```

This is an educational adapter, not a claim of the paper's exact scheduler, inversion, payload partition or attack results. The manifest records the recovered message and bit error rate for every run.
