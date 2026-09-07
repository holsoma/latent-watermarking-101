# Implementation lab structure

Every paper implementation in this directory follows the same outer contract. The method-specific code can differ, but a reader should always know where to find the environment, configuration, generation path, detector, evaluation, tests and recorded run evidence.

```text
implementations/<paper-slug>/
├── README.md                 # paper boundary, Git Bash commands, deviations
├── pyproject.toml            # isolated Python package and console entry points
├── configs/
│   ├── demo.toml             # meaningful local run
│   └── smoke.toml            # fast plumbing check
├── src/<package>_lab/
│   ├── model.py              # paper mechanism and trainable/frozen boundary
│   ├── io.py                 # image and tensor conversion
│   ├── train.py              # training path, or optimise.py for per-image methods
│   ├── detect.py|extract.py  # detector entry point
│   └── evaluate.py           # named attacks and metrics
├── tests/                    # shape, statistic and smoke tests
└── outputs/                  # ignored local artefacts, never source code
```

Each completed run should write a `manifest.json` beside its checkpoint and images. At minimum it records the paper slug, run kind, device, seed, configuration, steps, message/key, recovered message, bit error rate and named output artefacts. The shared contract is described in `shared/manifest.schema.json` and checked with:

```bash
cd /c/amos/research/latent-watermarking-101
python implementations/shared/check_structure.py
```

The current labs use this structure while retaining their different research boundaries: HiDDeN trains an encoder and decoder, RoSteALS trains a latent offset path around a frozen autoencoder, Stable Signature fine-tunes a decoder against a fixed key, ZoDiac optimises one latent per image, Tree-Rings marks Fourier rings in initial noise, Gaussian Shading maps payload bits to a Gaussian latent, SEAL derives its key from coarse image semantics, LaWa combines coarse-to-fine latent modules, and AquaLoRA trains rank-limited weight updates.
