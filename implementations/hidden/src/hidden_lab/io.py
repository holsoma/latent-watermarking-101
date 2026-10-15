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

def jpeg_roundtrip(image, quality=75):
    """Actual RGB JPEG encode/decode; evaluation only, not differentiable."""
    import numpy as np
    from PIL import Image
    from io import BytesIO
    if isinstance(quality, bool) or not isinstance(quality, int) or not 1 <= quality <= 100:
        raise ValueError("JPEG quality must be an integer from 1 to 100")
    output = []
    for sample in image.detach().cpu():
        array = ((sample.clamp(-1, 1).permute(1, 2, 0) + 1) * 127.5).round().byte().numpy()
        stream = BytesIO()
        Image.fromarray(array).save(stream, format="JPEG", quality=quality)
        stream.seek(0)
        decoded = np.array(Image.open(stream).convert("RGB"), copy=True)
        output.append(torch.from_numpy(decoded).permute(2, 0, 1).float() / 127.5 - 1)
    return torch.stack(output).to(image.device)
