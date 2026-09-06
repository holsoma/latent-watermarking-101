from __future__ import annotations

import torch

from .model import HiddenConfig, HiddenModel
from .noise import Identity


def load_model(path: str, device: torch.device, channel=None) -> HiddenModel:
    checkpoint = torch.load(path, map_location=device, weights_only=False)
    config = HiddenConfig(**checkpoint["config"])
    model = HiddenModel(config, channel=channel or Identity()).to(device)
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()
    return model
