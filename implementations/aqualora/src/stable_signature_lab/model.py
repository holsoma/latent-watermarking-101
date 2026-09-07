from dataclasses import asdict, dataclass

import torch
from torch import nn
import torch.nn.functional as F


@dataclass
class StableSignatureConfig:
    image: int = 64
    latent_channels: int = 8
    latent_size: int = 8
    message_length: int = 48
    hidden_channels: int = 32
    lora_rank: int = 2

    def to_dict(self):
        return asdict(self)


class FixedExtractor(nn.Module):
    """A deterministic extractor stand-in with a 48-bit signed carrier bank.

    The official project uses a pretrained robust image decoder. This local
    extractor keeps the same fixed-key training boundary while remaining
    dependency-light and inspectable.
    """

    def __init__(self, config: StableSignatureConfig):
        super().__init__()
        h = w = config.image
        yy, xx = torch.meshgrid(torch.arange(h), torch.arange(w), indexing="ij")
        carriers = []
        for bit in range(config.message_length):
            freq = bit // 3 + 1
            channel = bit % 3
            phase = (bit % 5) * 0.37
            carrier = torch.sin((xx + phase) * freq * 0.17) + torch.cos((yy - phase) * freq * 0.13)
            carrier = carrier / carrier.square().mean().sqrt()
            row = torch.zeros(3, h, w)
            row[channel] = carrier
            carriers.append(row)
        self.register_buffer("carriers", torch.stack(carriers))

    def forward(self, image: torch.Tensor) -> torch.Tensor:
        image = image.clamp(-1, 1)
        return torch.einsum("bchw,mchw->bm", image, self.carriers) / image.shape[-1]


class LatentDecoder(nn.Module):
    def __init__(self, config: StableSignatureConfig):
        super().__init__()
        c = config.hidden_channels
        self.net = nn.Sequential(
            nn.ConvTranspose2d(config.latent_channels, c, 4, 2, 1),
            nn.GELU(),
            nn.ConvTranspose2d(c, c, 4, 2, 1),
            nn.GELU(),
            nn.ConvTranspose2d(c, c // 2, 4, 2, 1),
            nn.GELU(),
            nn.Conv2d(c // 2, 3, 3, padding=1),
            nn.Tanh(),
        )
        self.lora_down = nn.Conv2d(config.latent_channels, config.lora_rank, 1, bias=False)
        self.lora_up = nn.Conv2d(config.lora_rank, config.latent_channels, 1, bias=False)
        self.message_scale = nn.Linear(config.message_length, config.lora_rank, bias=False)
        self.message_mapper = nn.Linear(
            config.message_length,
            config.latent_channels * config.latent_size * config.latent_size,
            bias=False,
        )
        self.config = config
        nn.init.zeros_(self.lora_up.weight)

    def forward(self, latent: torch.Tensor, fingerprint: torch.Tensor | None = None) -> torch.Tensor:
        update = self.lora_down(latent)
        if fingerprint is not None:
            if fingerprint.ndim == 1:
                fingerprint = fingerprint.unsqueeze(0)
            if fingerprint.shape != (latent.shape[0], self.message_scale.in_features):
                if fingerprint.shape[0] == 1 and latent.shape[0] > 1:
                    fingerprint = fingerprint.expand(latent.shape[0], -1)
                else:
                    raise ValueError("fingerprint shape must match batch and message length")
            scale = torch.tanh(self.message_scale(fingerprint.mul(2).sub(1))).unsqueeze(-1).unsqueeze(-1)
            update = update * scale
            message_residual = torch.tanh(self.message_mapper(fingerprint.mul(2).sub(1))).view_as(latent)
        else:
            message_residual = torch.zeros_like(latent)
        adapted = latent + 0.5 * (self.lora_up(update) + message_residual)
        return self.net(adapted)


class SignatureModel(nn.Module):
    def __init__(self, config: StableSignatureConfig):
        super().__init__()
        self.config = config
        self.extractor = FixedExtractor(config)
        self.decoder = LatentDecoder(config)

    def decode(self, latent, fingerprint=None):
        return self.decoder(latent, fingerprint)

    def logits(self, image):
        return self.extractor(image)


def bits_to_tensor(bits: str, device=None) -> torch.Tensor:
    if len(bits) == 0 or any(ch not in "01" for ch in bits):
        raise ValueError("message must contain only 0 and 1")
    return torch.tensor([float(ch) for ch in bits], device=device)


def logits_to_bits(logits: torch.Tensor) -> str:
    return "".join("1" if value >= 0 else "0" for value in logits.detach().flatten().tolist())


AquaLoRAConfig = StableSignatureConfig
AquaLoRAModel = SignatureModel
