# <Paper name> implementation lab

Explain the paper's generation path, official repository, local adapter, deviations and Git Bash commands here.

```bash
cd /c/amos/research/latent-watermarking-101/implementations/<paper-slug>
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -e .
export PYTHONPATH=src
python -m <package>_lab.train --config configs/demo.toml
python -m <package>_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded.png
python -m <package>_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded.png
```
