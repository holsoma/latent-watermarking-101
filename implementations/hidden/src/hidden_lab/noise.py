from __future__ import annotations

import torch
from torch import Tensor, nn
import torch.nn.functional as F


class Channel(nn.Module):
    def forward(self, image: Tensor) -> Tensor:
        raise NotImplementedError


class Identity(Channel):
    def forward(self, image: Tensor) -> Tensor:
        return image


class Dropout(Channel):
    def __init__(self, keep: float = 0.8) -> None:
        super().__init__()
        self.keep = keep

    def forward(self, image: Tensor) -> Tensor:
        return image * (torch.rand_like(image[:, :1]) < self.keep).float()


class Blur(Channel):
    def __init__(self, sigma: float = 1.0) -> None:
        super().__init__()
        radius = 2
        coords = torch.arange(-radius, radius + 1, dtype=torch.float32)
        kernel = torch.exp(-(coords**2) / (2 * sigma**2))
        kernel = kernel / kernel.sum()
        self.register_buffer("kernel", kernel[:, None] * kernel[None, :])

    def forward(self, image: Tensor) -> Tensor:
        channels = image.shape[1]
        kernel = self.kernel.expand(channels, 1, -1, -1)
        return F.conv2d(image, kernel, padding=2, groups=channels)


class Crop(Channel):
    def __init__(self, fraction: float = 0.8) -> None:
        super().__init__()
        self.fraction = fraction

    def forward(self, image: Tensor) -> Tensor:
        height, width = image.shape[-2:]
        crop_h, crop_w = max(1, int(height * self.fraction)), max(1, int(width * self.fraction))
        top = max(0, (height - crop_h) // 2)
        left = max(0, (width - crop_w) // 2)
        cropped = image[..., top:top + crop_h, left:left + crop_w]
        return F.interpolate(cropped, size=(height, width), mode="bilinear", align_corners=False)


class JpegApprox(Channel):
    """A differentiable quantisation proxy, not a real JPEG codec."""

    def __init__(self, step: float = 0.08) -> None:
        super().__init__()
        self.step = step

    def forward(self, image: Tensor) -> Tensor:
        quantised = torch.round(image / self.step) * self.step
        return image + (quantised - image).detach()


def channel_from_name(name: str) -> Channel:
    channels: dict[str, Channel] = {
        "identity": Identity(),
        "dropout": Dropout(),
        "blur": Blur(),
        "crop": Crop(),
        "jpeg": JpegApprox(),
    }
    try:
        return channels[name]
    except KeyError as error:
        raise ValueError(f"Unknown channel {name!r}. Choose from {', '.join(channels)}") from error
