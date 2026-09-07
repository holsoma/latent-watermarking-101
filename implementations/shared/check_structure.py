"""Check that every paper lab follows the shared repository contract."""

from __future__ import annotations

import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {"_template", "shared"}
REQUIRED_ROOT = ("README.md", "pyproject.toml")


def check_lab(name: str) -> list[str]:
    errors: list[str] = []
    lab = ROOT / name
    for relative in REQUIRED_ROOT:
        if not (lab / relative).is_file():
            errors.append(f"{name}: missing {relative}")
    for relative in ("configs/demo.toml", "configs/smoke.toml", "tests"):
        if not (lab / relative).exists():
            errors.append(f"{name}: missing {relative}")
    source = lab / "src"
    packages = list(source.glob("*_lab")) if source.exists() else []
    if len(packages) != 1:
        errors.append(f"{name}: expected one src/*_lab package")
        return errors
    package = packages[0]
    if not (package / "model.py").is_file():
        errors.append(f"{name}: missing {package.relative_to(lab)}/model.py")
    if not (package / "io.py").is_file():
        errors.append(f"{name}: missing {package.relative_to(lab)}/io.py")
    if not any((package / candidate).is_file() for candidate in ("train.py", "optimise.py")):
        errors.append(f"{name}: missing train.py or optimise.py")
    if not any((package / candidate).is_file() for candidate in ("detect.py", "extract.py")):
        errors.append(f"{name}: missing detect.py or extract.py")
    if not (package / "evaluate.py").is_file():
        errors.append(f"{name}: missing evaluate.py")
    return errors


def check_manifest(path: Path) -> list[str]:
    if not path.is_file():
        return []
    errors: list[str] = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        return [f"{path}: invalid JSON ({error})"]
    for field in ("schema_version", "paper_slug", "run_kind", "status", "device", "steps", "bit_error_rate", "artifacts"):
        if field not in data:
            errors.append(f"{path}: missing manifest field {field}")
    if data.get("schema_version") != "1.0":
        errors.append(f"{path}: schema_version must be 1.0")
    for artifact in data.get("artifacts", []):
        if not (path.parent / artifact).exists():
            errors.append(f"{path}: missing recorded artefact {artifact}")
    return errors


def lab_names() -> list[str]:
    """Return every concrete lab directory in implementations/."""
    return sorted(
        path.name
        for path in ROOT.iterdir()
        if path.is_dir() and path.name not in EXCLUDED_DIRS and not path.name.startswith(".")
    )


def main() -> int:
    labs = lab_names()
    errors = [error for lab in labs for error in check_lab(lab)]
    for manifest in ROOT.glob("*/outputs/*/manifest.json"):
        errors.extend(check_manifest(manifest))
    if errors:
        print("LAB CONTRACT FAILED")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print(f"LAB CONTRACT OK: {len(labs)} labs match the shared structure")
    return 0


if __name__ == "__main__":
    sys.exit(main())
