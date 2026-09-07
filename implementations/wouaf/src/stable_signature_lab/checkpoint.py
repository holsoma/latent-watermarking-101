from pathlib import Path

import torch

from .model import SignatureModel, StableSignatureConfig


def load_checkpoint(path: str | Path, device="cpu"):
    payload = torch.load(path, map_location=device, weights_only=False)
    config = StableSignatureConfig(**payload["config"])
    model = SignatureModel(config).to(device)
    model.decoder.load_state_dict(payload["decoder"])
    model.eval()
    return model, payload
