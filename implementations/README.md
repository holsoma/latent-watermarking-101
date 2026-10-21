# CPU teaching laboratories

These 24 exercises teach supporting operations. Their classification is conservative: none is presented as a paper reproduction. Each lab README states which paper-specific operations are absent or replaced by a proxy.

Use Python 3.11 or 3.12 with CPU PyTorch, NumPy and Pillow. Run commands from the repository root. Install a lab with `python -m pip install -e implementations/<slug>` inside an activated environment. The shared runner sets an isolated source path, disables CUDA and selects the real package, command and image filename for that lab.

```text
python implementations/shared/run_lab.py <slug> create
python implementations/shared/run_lab.py <slug> detect
python implementations/shared/run_lab.py <slug> evaluate
python implementations/shared/run_lab.py <slug> controls
python implementations/shared/verify_all_labs.py
```

The bounded configuration is `configs/smoke.toml`. Generated files and exact command stdout/stderr live under each lab's ignored `outputs/handbook` directory. The versioned audit is `docs/lab-verification.json`. Passing means commands and assertions completed. It does not mean successful watermark recovery. The report preserves recovery errors.

Evaluation reads saved images and applies actual JPEG, blur and crop operations. Known keys, observed scores and extracted bits remain distinct. Tests cover applicable corruption and wrong-key controls, PRC repetition coding, T2S central preservation, and ROBIN's frozen marked state and renderer. Single fixtures cannot calibrate false-positive rates or validate robustness.

`shared/check_structure.py` checks file and manifest structure only. `shared/verify_semantics.py` checks executable behaviour in a separate process for each package. Optional model-download entry points have not been verified by this CPU audit and are not advertised as working paper reproductions.
