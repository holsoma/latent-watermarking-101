from __future__ import annotations

from dataclasses import dataclass

import torch
from torch import Tensor, nn

from .noise import Channel, Identity


@dataclass(frozen=True)
class HiddenConfig:
    image_size: int = 64
    message_length: int = 30
    encoder_channels: int = 64
    encoder_blocks: int = 4
    decoder_channels: int = 64
    decoder_blocks: int = 7
    discriminator_channels: int = 64
    discriminator_blocks: int = 3


class ConvBlock(nn.Module):
    def __init__(self, channels_in: int, channels_out: int) -> None:
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels_in, channels_out, kernel_size=3, padding=1),
            nn.BatchNorm2d(channels_out),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: Tensor) -> Tensor:
        return self.block(x)


class Encoder(nn.Module):
    """Broadcast the message and write it into the cover image."""

    def __init__(self, config: HiddenConfig) -> None:
        super().__init__()
        layers: list[nn.Module] = [ConvBlock(3, config.encoder_channels)]
        layers.extend(ConvBlock(config.encoder_channels, config.encoder_channels) for _ in range(config.encoder_blocks - 1))
        self.image_features = nn.Sequential(*layers)
        self.fusion = ConvBlock(config.encoder_channels + 3 + config.message_length, config.encoder_channels)
        self.output = nn.Conv2d(config.encoder_channels, 3, kernel_size=1)
        self.height = config.image_size
        self.width = config.image_size

    def forward(self, image: Tensor, message: Tensor) -> Tensor:
        expanded = message.unsqueeze(-1).unsqueeze(-1).expand(-1, -1, self.height, self.width)
        features = self.image_features(image)
        return self.output(self.fusion(torch.cat([expanded, features, image], dim=1)))


class Decoder(nn.Module):
    """Recover the message from a received image without the cover image."""

    def __init__(self, config: HiddenConfig) -> None:
        super().__init__()
        layers: list[nn.Module] = [ConvBlock(3, config.decoder_channels)]
        layers.extend(ConvBlock(config.decoder_channels, config.decoder_channels) for _ in range(config.decoder_blocks - 1))
        layers.append(ConvBlock(config.decoder_channels, config.message_length))
        self.features = nn.Sequential(*layers)
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.output = nn.Linear(config.message_length, config.message_length)

    def forward(self, image: Tensor) -> Tensor:
        pooled = self.pool(self.features(image)).flatten(1)
        return self.output(pooled)


class Discriminator(nn.Module):
    def __init__(self, config: HiddenConfig) -> None:
        super().__init__()
        layers: list[nn.Module] = [ConvBlock(3, config.discriminator_channels)]
        layers.extend(ConvBlock(config.discriminator_channels, config.discriminator_channels) for _ in range(config.discriminator_blocks - 1))
        self.features = nn.Sequential(*layers)
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.output = nn.Linear(config.discriminator_channels, 1)

    def forward(self, image: Tensor) -> Tensor:
        return self.output(self.pool(self.features(image)).flatten(1))


class HiddenModel(nn.Module):
    def __init__(self, config: HiddenConfig, channel: Channel | None = None) -> None:
        super().__init__()
        self.config = config
        self.encoder = Encoder(config)
        self.decoder = Decoder(config)
        self.discriminator = Discriminator(config)
        self.channel = channel or Identity()

    def encode(self, image: Tensor, message: Tensor) -> Tensor:
        return self.encoder(image, message)

    def forward(self, image: Tensor, message: Tensor) -> tuple[Tensor, Tensor, Tensor]:
        encoded = self.encode(image, message)
        noised = self.channel(encoded)
        decoded_logits = self.decoder(noised)
        return encoded, noised, decoded_logits
