# HiDDeN implementation lab

This is a readable PyTorch reimplementation of the HiDDeN encoder, channel, decoder and adversarial training loop. It is intended for inspection and controlled experiments, not as a claim of exact reproduction.

The implementation is based on the paper and cross-checked against the public repositories by [Jiren Zhu](https://github.com/jirenz/HiDDeN) and [Ando Khachatryan](https://github.com/ando-khachatryan/HiDDeN). The authors' repository is Lua/Torch7 and is marked work in progress. The PyTorch repository is easier to run but states that it did not fully reproduce the paper.

## Start in Git Bash

Use Python 3.11 or 3.12. From the repository root:

```bash
cd /c/amos/research/latent-watermarking-101/implementations/hidden
PYTHON311='/c/Users/amosl/AppData/Local/Programs/Python/Python311/python.exe'
"$PYTHON311" -m venv .venv
source .venv/Scripts/activate
python -m pip install wheel
python -m pip install --no-build-isolation -e '.[dev]'
export PYTHONPATH=src
```

Example installation output:

```text
Successfully built hidden-lab
Successfully installed hidden-lab-0.1.0
```

Keep the virtual environment active and run the following commands from `implementations/hidden`.

## Learning demo: tiny-set overfit

Run this first. It reuses one deterministic cover and one eight-bit message for 300 identity-channel steps. The purpose is to answer one narrow question: can this encoder-decoder learn the communication path at all?

```bash
python -m hidden_lab.train --config configs/demo.toml
```

Expected output shape:

```text
{
  "checkpoint": "outputs\\demo\\checkpoint.pt",
  "manifest": "outputs\\demo\\manifest.json",
  "device": "cpu",
  "steps": 300
}
```

This is an overfit demonstration, not a paper result. It does not test generalisation or robustness. It should be followed by the extraction command below, where the expected recovered message is `10110010`.

## Smoke run (optional plumbing check)

The smoke configuration creates synthetic cover images, cycles through all distortion modules for twelve steps, and writes a checkpoint and JSON manifest under `outputs/smoke`.

```bash
python -m hidden_lab.train --config configs/smoke.toml
```

Verified output from this workspace:

```text
{
  "checkpoint": "outputs\\smoke\\checkpoint.pt",
  "manifest": "outputs\\smoke\\manifest.json",
  "device": "cuda",
  "steps": 12
}
```

This result proves that the end-to-end path executes. It does not prove that the network has learned the message channel.

For a run using real cover images, pass a directory. The loader searches recursively for JPG, PNG and WebP files and samples a new message for each batch:

```bash
python -m hidden_lab.train \
  --config configs/smoke.toml \
  --data-dir /c/path/to/covers
```

## Embed and recover a message from the learning demo

The learning demo writes `cover.png`, so it can be used without preparing another image:

```bash
python -m hidden_lab.embed \
  --checkpoint outputs/demo/checkpoint.pt \
  --image outputs/demo/cover.png \
  --message 10110010 \
  --output outputs/demo/encoded.png

python -m hidden_lab.extract \
  --checkpoint outputs/demo/checkpoint.pt \
  --image outputs/demo/encoded.png
```

Verified output from the twelve-step checkpoint:

```text
encoded image written to outputs/demo/encoded.png
10110010
```

The recovered message should match `10110010` for the fixed demo. If it does not, inspect the manifest and loss history before adding distortions.

### Try another payload

Changing only `--message` in the embed command does not retrain the checkpoint. The bundled checkpoint learned `10110010`, so use a separate output directory when testing another payload:

```bash
python -m hidden_lab.train \
  --config configs/demo.toml \
  --demo-message 01010101 \
  --output-dir outputs/demo-custom

python -m hidden_lab.embed \
  --checkpoint outputs/demo-custom/checkpoint.pt \
  --image outputs/demo-custom/cover.png \
  --message 01010101 \
  --output outputs/demo-custom/encoded.png

python -m hidden_lab.extract \
  --checkpoint outputs/demo-custom/checkpoint.pt \
  --image outputs/demo-custom/encoded.png
```

Expected extracted output:

```text
01010101
```

## Evaluate attack channels

```bash
python -m hidden_lab.evaluate \
  --checkpoint outputs/demo/checkpoint.pt \
  --image outputs/demo/cover.png \
  --attacks identity,jpeg,crop,blur
```

Verified output:

```json
{
  "message": "10101010",
  "results": [
    { "attack": "identity", "bit_error_rate": 0.625, "exact_message": false },
    { "attack": "jpeg", "bit_error_rate": 0.625, "exact_message": false },
    { "attack": "crop", "bit_error_rate": 0.625, "exact_message": false },
    { "attack": "blur", "bit_error_rate": 0.625, "exact_message": false }
  ]
}
```

Identity is the clean baseline. The other attacks may still fail because the tiny demo trains only the identity channel. Robustness is a separate experiment.

## Methodology

The lab follows five stages.

1. Define the information path. A cover and message enter the encoder; a distortion changes the encoded image; a blind decoder recovers the message.
2. Triangulate sources. Use the paper for the research claim, the authors' Torch7 code for original intent, and the community PyTorch port for a readable implementation comparison.
3. Build the smallest falsifiable path. First overfit one fixed cover and message, then run the twelve-step synthetic smoke test to exercise every distortion module before downloading COCO or running long training jobs.
4. Separate mechanical validation from empirical validation. Tensor shapes, gradients and checkpoints show that code executes. They do not establish robustness or fidelity.
5. Let failure define the next experiment. First obtain clean recovery on a tiny fixed dataset, then add one distortion at a time, then compare differentiable proxies with real image operations.

## Implementation decisions

| Decision | Reason | Consequence |
| --- | --- | --- |
| Use modern PyTorch | Torch7 is difficult to install in a current Windows workflow. | Deviations from the authors' code must be recorded. |
| Keep Python separate from React | GitHub Pages cannot execute model training. | The site explains and displays results while the command line performs experiments. |
| Begin with synthetic covers | Code defects should be found before acquiring a dataset. | Smoke metrics are not paper-comparable. |
| Treat differentiable JPEG as a proxy | Straight-through quantisation permits training gradients. | Real JPEG must be evaluated separately at explicit quality settings. |

## Reproduction ladder

1. Mechanical smoke test: execute all modules and save inspectable artefacts.
2. Tiny-set overfit: reach zero clean bit error on a few fixed covers.
3. Single-channel training: measure each distortion independently against identity-only training.
4. Real-operation validation: quantify the gap between differentiable proxies and real codecs.
5. Paper-matched reproduction: match dataset, image size, payload, schedule, attacks, metrics and baselines.

The smoke result is only stage one. Do not compare it with the paper until stage five is complete.

## Tests

```bash
python -m pytest -q
```

Expected output after installing the development extras:

```text
2 passed
```
