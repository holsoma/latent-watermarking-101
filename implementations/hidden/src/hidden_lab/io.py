from __future__ import annotations

from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torch import Tensor


def message_tensor(value: str, device: torch.device) -> Tensor:
    if not value or any(bit not in "01" for bit in value):
        raise ValueError("Message must be a non-empty string containing only 0 and 1")
    return torch.tensor([[float(bit) for bit in value]], dtype=torch.float32, device=device)


def load_image(path: str | Path, size: int, device: torch.device) -> Tensor:
    image = Image.open(path).convert("RGB").resize((size, size))
    values = torch.from_numpy(np.asarray(image).copy()).float().permute(2, 0, 1) / 127.5 - 1
    return values.unsqueeze(0).to(device)


def save_image(tensor: Tensor, path: str | Path) -> None:
    values = tensor.detach().cpu().clamp(-1, 1).squeeze(0).permute(1, 2, 0)
    image = ((values + 1) * 127.5).byte().numpy()
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(image).save(destination)
