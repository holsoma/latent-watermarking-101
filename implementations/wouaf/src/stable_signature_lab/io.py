from pathlib import Path

import numpy as np
from PIL import Image
import torch


def load_image(path: str | Path, size: int) -> torch.Tensor:
    image = Image.open(path).convert("RGB").resize((size, size), Image.Resampling.LANCZOS)
    array = np.asarray(image).astype("float32") / 127.5 - 1.0
    return torch.from_numpy(array).permute(2, 0, 1).unsqueeze(0)


def save_image(tensor: torch.Tensor, path: str | Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    array = tensor.detach().cpu().clamp(-1, 1).squeeze(0).permute(1, 2, 0).numpy()
    Image.fromarray(((array + 1.0) * 127.5).round().astype("uint8")).save(path)
