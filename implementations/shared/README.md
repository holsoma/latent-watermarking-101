# Shared lab contract

This directory contains repository-level tooling, not a fifth watermarking method.

## Fixed contract

1. `README.md` explains the paper claim, official repository, local deviation and Git Bash commands.
2. `pyproject.toml` makes the lab installable in its own virtual environment.
3. `configs/demo.toml` is the smallest run worth interpreting.
4. `configs/smoke.toml` checks plumbing only.
5. `src/<package>_lab/` keeps the model, I/O, generation, detection and evaluation paths separate.
6. `tests/` checks shapes, statistics and a cheap execution path.
7. `outputs/<run>/manifest.json` records evidence and all generated artefacts.

Use `../_template/` when adding another paper. Run `check_structure.py` before committing. A local adapter may simplify the official model, but its README and manifest must say what was simplified.
