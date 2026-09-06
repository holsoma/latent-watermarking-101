from __future__ import annotations

from dataclasses import dataclass

import torch
from torch import Tensor, nn
import torch.nn.functional as F


@dataclass(frozen=True)
class RoSteALSConfig:
    image_size: int = 64
    latent_channels: int = 3
    latent_size: int = 16
    message_length: int = 16
    hidden_channels: int = 24


class FrozenAutoencoder(nn.Module):
    """A deterministic low-resolution autoencoder for the local lab.

    RoSteALS uses a pretrained VQ-f4 autoencoder. This compact adapter keeps
    that boundary explicit while avoiding a 500 MB checkpoint for the first
    experiment: the latent is an average-pooled image and decoding is fixed
    interpolation. No autoencoder parameters are trained.
    """

    def __init__(self, config: RoSteALSConfig) -> None:
        super().__init__()
        self.config = config

    def encode(self, image: Tensor) -> Tensor:
        return F.adaptive_avg_pool2d(image, (self.config.latent_size, self.config.latent_size))

    def decode(self, latent: Tensor) -> Tensor:
        return F.interpolate(latent, size=(self.config.image_size, self.config.image_size), mode="bilinear", align_corners=False).clamp(-1, 1)

    def forward(self, image: Tensor) -> Tensor:
        return self.decode(self.encode(image))


class SecretEncoder(nn.Module):
    def __init__(self, config: RoSteALSConfig) -> None:
        super().__init__()
        latent_values = config.latent_channels * config.latent_size * config.latent_size
        self.net = nn.Sequential(
            nn.Linear(config.message_length, 128),
            nn.GELU(),
            nn.Linear(128, latent_values),
            nn.Tanh(),
        )
        self.config = config

    def forward(self, message: Tensor) -> Tensor:
        values = self.net(message)
        return values.view(-1, self.config.latent_channels, self.config.latent_size, self.config.latent_size) * 0.18


class SecretDecoder(nn.Module):
    def __init__(self, config: RoSteALSConfig) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(3, config.hidden_channels, 3, padding=1),
            nn.GELU(),
            nn.Conv2d(config.hidden_channels, config.hidden_channels, 3, padding=1),
            nn.GELU(),
            nn.AdaptiveAvgPool2d(4),
            nn.Flatten(),
            nn.Linear(config.hidden_channels * 4 * 4, config.message_length),
        )

    def forward(self, image: Tensor) -> Tensor:
        return self.net(image)


class RoSteALSModel(nn.Module):
    def __init__(self, config: RoSteALSConfig) -> None:
        super().__init__()
        self.autoencoder = FrozenAutoencoder(config)
        self.secret_encoder = SecretEncoder(config)
        self.secret_decoder = SecretDecoder(config)
        self.config = config

    def encode(self, cover: Tensor, message: Tensor) -> tuple[Tensor, Tensor, Tensor]:
        base_latent = self.autoencoder.encode(cover)
        offset = self.secret_encoder(message)
        encoded = self.autoencoder.decode(base_latent + offset)
        return encoded, base_latent, offset

    def decode_message(self, image: Tensor) -> Tensor:
        return self.secret_decoder(image)
