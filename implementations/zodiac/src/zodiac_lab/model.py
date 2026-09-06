from dataclasses import asdict, dataclass

import torch
from torch import nn


@dataclass
class ZodiacConfig:
    image: int = 64
    latent_channels: int = 8
    latent_size: int = 8
    message_length: int = 16

    def to_dict(self):
        return asdict(self)


class FixedDiffusionProxy(nn.Module):
    """Small frozen renderer standing in for SD encode/backward diffusion."""

    def __init__(self, config: ZodiacConfig):
        super().__init__()
        self.net = nn.Sequential(
            nn.ConvTranspose2d(config.latent_channels, 32, 4, 2, 1), nn.SiLU(),
            nn.ConvTranspose2d(32, 16, 4, 2, 1), nn.SiLU(),
            nn.ConvTranspose2d(16, 8, 4, 2, 1), nn.SiLU(),
            nn.Conv2d(8, 3, 3, padding=1), nn.Tanh(),
        )
        for parameter in self.parameters():
            parameter.requires_grad_(False)

    def forward(self, latent):
        return self.net(latent)


class FrequencyDetector(nn.Module):
    def __init__(self, config: ZodiacConfig):
        super().__init__()
        h = w = config.image
        yy, xx = torch.meshgrid(torch.arange(h), torch.arange(w), indexing="ij")
        patterns = []
        for bit in range(config.message_length):
            freq = bit + 2
            pattern = torch.sin(xx * freq * 0.19) * torch.cos(yy * (freq + 1) * 0.11)
            pattern = pattern / pattern.square().mean().sqrt()
            patterns.append(pattern)
        self.register_buffer("patterns", torch.stack(patterns).unsqueeze(1).repeat(1, 3, 1, 1))

    def forward(self, image):
        return torch.einsum("bchw,mchw->bm", image, self.patterns) / image.shape[-1]


def bits_to_tensor(bits: str, device=None):
    if len(bits) == 0 or any(ch not in "01" for ch in bits):
        raise ValueError("message must contain only 0 and 1")
    return torch.tensor([float(ch) for ch in bits], device=device)


def logits_to_bits(logits):
    return "".join("1" if value >= 0 else "0" for value in logits.detach().flatten().tolist())
