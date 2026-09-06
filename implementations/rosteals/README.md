# RoSteALS implementation lab

This is a compact PyTorch lab for the RoSteALS generation path. It freezes a small image autoencoder, learns a message-to-latent offset, decodes the altered latent, and extracts the message from the image. It is designed for inspection and local experiments, not as a replacement for the official checkpoint.

## Git Bash

```bash
cd /c/amos/research/latent-watermarking-101/implementations/rosteals
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m rosteals_lab.train --config configs/demo.toml
python -m rosteals_lab.embed --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/cover.png --message 0101010101010101 --output outputs/demo/encoded-custom.png
python -m rosteals_lab.extract --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded-custom.png
python -m rosteals_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded-custom.png --message 0101010101010101 --attacks identity,blur,crop,jpeg
```

The local run uses 16 bits. The official repository uses a 100-bit payload with BCH error correction and a VQ-f4 autoencoder. To inspect that path, follow the setup and `download_models.sh` instructions in the [official repository](https://github.com/TuBui/RoSteALS), then run its `inference.py` command with the released checkpoint.

The useful evidence is in `outputs/demo/manifest.json`: it records the seed, steps, payload, recovered payload and bit error rate. `cover.png`, `autoencoded.png`, `encoded.png` and `residual_amplified.png` show where the latent offset changes the image.
