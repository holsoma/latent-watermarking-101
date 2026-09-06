from __future__ import annotations

from pathlib import Path

import torch

from .model import RoSteALSConfig, RoSteALSModel


def load_model(path: str | Path, device: torch.device) -> RoSteALSModel:
    payload = torch.load(path, map_location=device, weights_only=False)
    model = RoSteALSModel(RoSteALSConfig(**payload["config"])).to(device)
    model.load_state_dict(payload["state_dict"])
    model.eval()
    return model
