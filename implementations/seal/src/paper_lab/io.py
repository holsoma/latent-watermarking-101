from pathlib import Path
import numpy as np
import torch
from PIL import Image

def save_image(tensor: torch.Tensor, path: Path):
    tensor=tensor.detach().cpu().clamp(-1,1)
    if tensor.ndim==4: tensor=tensor[0]
    array=((tensor.permute(1,2,0)+1)*127.5).byte().numpy(); Image.fromarray(array).save(path)

def load_image(path: Path):
    array=np.asarray(Image.open(path).convert("RGB")); return torch.from_numpy(array.copy()).float().permute(2,0,1).div(127.5).sub(1).unsqueeze(0)


def jpeg_roundtrip(image, quality=75):
    """Actual RGB JPEG encode/decode; evaluation only, not differentiable."""
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
