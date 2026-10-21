# serum CPU teaching exercise

Classification: **prerequisite exercise**. Fourier marking and image-space carrier correlation prerequisite. The paper recovery pipeline is not reproduced.

Reference: [serum](https://github.com/Hubizon/SERUM). A reference collection is not an official implementation claim.

Use Python 3.11 or 3.12 with CPU PyTorch, NumPy and Pillow. From the repository root, install this package into an activated environment, then use the portable runner:

```text
python -m pip install -e implementations/serum
python implementations/shared/run_lab.py serum create
python implementations/shared/run_lab.py serum detect
python implementations/shared/run_lab.py serum evaluate
python implementations/shared/run_lab.py serum controls
```

The runner uses `configs/smoke.toml`, disables CUDA and isolates `src/paper_lab` in its own subprocess. No pretrained model is downloaded. Creation saves a checkpoint and PNG images under `outputs/handbook`. Detection reloads the saved image. Evaluation transforms that saved evidence without embedding another message. JPEG is actual compression and decompression; its quality is recorded in each result.

Commands write their exact stdout and stderr to the same output directory. `manifest.json` lists generated artefacts. A command completing successfully does not mean that extraction succeeded. Small training runs often have substantial bit error, including on clean images.

`../../docs/lab-verification.json` records the checked commands, runtime, outputs and assertions. Run `python implementations/shared/verify_all_labs.py serum` from the root to regenerate this lab's report. The controls include applicable unit assertions, codec checks and method-specific checks; they do not estimate false-positive rates.

A known key is detector input. A score is measured evidence. Extracted bits are computed from the received image. These quantities must not be conflated. No claim of paper reproduction, cryptographic security or dataset robustness follows from this exercise.
