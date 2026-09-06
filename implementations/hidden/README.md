# HiDDeN implementation lab

This is a readable PyTorch reimplementation of the HiDDeN encoder, channel, decoder and adversarial training loop. It is intended for inspection and controlled experiments, not as a claim of exact reproduction.

The implementation is based on the paper and cross-checked against the public repositories by [Jiren Zhu](https://github.com/jirenz/HiDDeN) and [Ando Khachatryan](https://github.com/ando-khachatryan/HiDDeN). The authors' repository is Lua/Torch7 and is marked work in progress. The PyTorch repository is easier to run but states that it did not fully reproduce the paper.

## Setup

Use Python 3.11 or 3.12. The project deliberately keeps the environment separate from the React site.

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
```

## Smoke run

The smoke configuration creates deterministic synthetic cover images, trains for a few steps, and writes a checkpoint and JSON manifest under `outputs/smoke`.

```powershell
python -m hidden_lab.train --config configs/smoke.toml
```

For a real run, pass a directory containing cover images. The loader searches recursively and samples a fresh binary message for each batch:

```powershell
python -m hidden_lab.train --config configs/smoke.toml --data-dir C:\path\to\covers
```

Embed and recover a message:

```powershell
python -m hidden_lab.embed --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/cover.png --message 10110110 --output outputs/smoke/encoded.png
python -m hidden_lab.extract --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/encoded.png
```

Evaluate the same checkpoint through named channels:

```powershell
python -m hidden_lab.evaluate --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/cover.png --attacks identity,jpeg,crop,blur
```

The smoke result is a pipeline check. It is not comparable with the paper's results until the data, image size, payload, attack distribution, training schedule and evaluation protocol are matched.
