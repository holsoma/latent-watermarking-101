# Latent Watermark implementation lab

This is a compact PyTorch lab for progressive latent watermark injection and detector training. It freezes a small image autoencoder and exposes the auxiliary-training boundary.

## Git Bash

```bash
cd /c/amos/research/latent-watermarking-101/implementations/latent-watermark
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m rosteals_lab.train --config configs/demo.toml
python -m rosteals_lab.embed --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/cover.png --message 0101010101010101 --output outputs/demo/encoded-custom.png
python -m rosteals_lab.extract --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded-custom.png
python -m rosteals_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded-custom.png --message 0101010101010101 --attacks identity,blur,crop,jpeg
```

The local run uses 16 bits. The official LaWa repository uses its own multi-scale modules, dataset and autoencoder configuration. To inspect that path, follow the setup instructions in the [official repository](https://github.com/vbdi/LaWa) before comparing results.

The useful evidence is in `outputs/demo/manifest.json`: it records the seed, steps, payload, recovered payload and bit error rate. `cover.png`, `autoencoded.png`, `encoded.png` and `residual_amplified.png` show where the latent offset changes the image.
