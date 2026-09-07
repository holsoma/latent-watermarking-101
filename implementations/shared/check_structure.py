"""Check that every paper lab follows the shared repository contract."""

from __future__ import annotations

import ast
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {"_template", "shared"}
REQUIRED_ROOT = ("README.md", "pyproject.toml")
LEVEL_B_LABS = {"tree-rings", "gaussian-shading", "seal", "lawa", "aqualora"}


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


def check_manifest(path: Path, *, strict_output_slug: bool = False) -> list[str]:
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
    relative = path.relative_to(ROOT)
    lab_name = relative.parts[0]
    if strict_output_slug and data.get("paper_slug") != lab_name:
        errors.append(f"{path}: paper_slug must match lab directory {lab_name!r}")
    status = data.get("status")
    if status not in {"completed", "failed"}:
        errors.append(f"{path}: status must be completed or failed")
    steps = data.get("steps")
    if not isinstance(steps, int) or isinstance(steps, bool) or steps < 0:
        errors.append(f"{path}: steps must be a non-negative integer")
    bit_error_rate = data.get("bit_error_rate")
    if bit_error_rate is not None and (
        not isinstance(bit_error_rate, (int, float))
        or isinstance(bit_error_rate, bool)
        or not 0 <= bit_error_rate <= 1
    ):
        errors.append(f"{path}: bit_error_rate must be null or between 0 and 1")
    fidelity = data.get("implementation_fidelity")
    verification = data.get("verification_status")
    if fidelity is not None and fidelity not in {"mechanism-adapter", "official-stack"}:
        errors.append(f"{path}: invalid implementation_fidelity")
    if verification is not None and verification not in {"not-run", "passed", "failed"}:
        errors.append(f"{path}: invalid verification_status")
    if data.get("local_adapter") is False:
        if fidelity != "official-stack":
            errors.append(f"{path}: non-local runs must declare implementation_fidelity official-stack")
        if verification != "passed":
            errors.append(f"{path}: non-local runs must pass verification")
    if verification == "passed" and data.get("recovered") is None and data.get("score") is None:
        errors.append(f"{path}: passed verification requires recovered payload or score evidence")
    if lab_name in LEVEL_B_LABS and status == "completed" and data.get("local_adapter") is True:
        if fidelity is not None and fidelity != "mechanism-adapter":
            errors.append(f"{path}: local Level B runs must be mechanism adapters")
    artifacts = data.get("artifacts", [])
    if not isinstance(artifacts, list) or any(not isinstance(item, str) for item in artifacts):
        errors.append(f"{path}: artifacts must be a list of paths")
        artifacts = []
    for artifact in artifacts:
        if not (path.parent / artifact).exists():
            errors.append(f"{path}: missing recorded artefact {artifact}")
    return errors


def check_source_manifest_slugs(name: str) -> list[str]:
    """Check literal paper_slug values in manifest-producing Python code."""
    errors: list[str] = []
    for path in (ROOT / name / "src").rglob("*.py"):
        try:
            tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        except SyntaxError as error:
            errors.append(f"{path}: invalid Python ({error})")
            continue
        for node in ast.walk(tree):
            if not isinstance(node, ast.Dict):
                continue
            pairs = {
                key.value: value.value
                for key, value in zip(node.keys, node.values)
                if isinstance(key, ast.Constant)
                and isinstance(key.value, str)
                and isinstance(value, ast.Constant)
                and isinstance(value.value, str)
            }
            if "paper_slug" in pairs and pairs["paper_slug"] != name:
                errors.append(
                    f"{path}:{node.lineno}: paper_slug {pairs['paper_slug']!r} must match lab directory {name!r}"
                )
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
    strict_output_slugs = "--strict-output-slugs" in sys.argv[1:]
    errors = [
        error
        for lab in labs
        for error in (
            *check_lab(lab),
            *(check_source_manifest_slugs(lab) if lab in LEVEL_B_LABS else []),
        )
    ]
    for manifest in ROOT.glob("*/outputs/*/manifest.json"):
        errors.extend(check_manifest(manifest, strict_output_slug=strict_output_slugs))
    if errors:
        print("LAB CONTRACT FAILED")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print(f"LAB CONTRACT OK: {len(labs)} labs match the shared structure")
    return 0


if __name__ == "__main__":
    sys.exit(main())
