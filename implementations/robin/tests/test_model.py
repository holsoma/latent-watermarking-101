import torch

from zodiac_lab.model import FixedDiffusionProxy, FrequencyDetector, ZodiacConfig


def test_renderer_detector_shapes():
    config = ZodiacConfig()
    image = FixedDiffusionProxy(config)(torch.zeros(2, config.latent_channels, config.latent_size, config.latent_size))
    assert image.shape == (2, 3, config.image, config.image)
    assert FrequencyDetector(config)(image).shape == (2, config.message_length)
