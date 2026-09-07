# Black-Box Forgery implementation lab

This lab attacks a black-box watermark detector by optimising an unrelated image generator. It is an attack study, not a watermark embedder, and the local adapter is only a plumbing demonstration.

Official implementation: https://openaccess.thecvf.com/content/CVPR2025/html/Muller_Black-Box_Forgery_Attacks_on_Semantic_Watermarks_for_Diffusion_Models_CVPR_2025_paper.html

```bash
cd /c/amos/research/latent-watermarking-101/implementations/semantic-forgery
python -m venv .venv && source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m paper_lab.train --config configs/demo.toml
python -m paper_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
python -m paper_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png
```

No embedder or detector is trained. The local adapter reports a continuous Fourier score, named attacks and a manifest with `steps: 0`; it does not establish the paper's Stable Diffusion, scheduler, inversion or false-positive results.
