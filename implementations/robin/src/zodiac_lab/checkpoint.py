from pathlib import Path

import torch

from .model import ZodiacConfig, FixedDiffusionProxy, FrequencyDetector


def load_checkpoint(path: str | Path, device="cpu"):
    payload = torch.load(path, map_location=device, weights_only=False)
    config = ZodiacConfig(**payload["config"])
    renderer = FixedDiffusionProxy(config).to(device)
    if "renderer" in payload:
        renderer.load_state_dict(payload["renderer"])
    detector = FrequencyDetector(config).to(device)
    renderer.eval(); detector.eval()
    return renderer, detector, payload
