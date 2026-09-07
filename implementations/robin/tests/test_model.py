import torch

from zodiac_lab.model import FixedDiffusionProxy, FrequencyDetector, ZodiacConfig
from zodiac_lab.conditioning import ConditioningProxy, conditioning_drift


def test_renderer_detector_shapes():
    config = ZodiacConfig()
    image = FixedDiffusionProxy(config)(torch.zeros(2, config.latent_channels, config.latent_size, config.latent_size))
    assert image.shape == (2, 3, config.image, config.image)
    assert FrequencyDetector(config)(image).shape == (2, config.message_length)

def test_conditioning_proxy_and_drift():
    proxy=ConditioningProxy(8); image=torch.zeros(1,3,8,8); assert proxy(image).shape==image.shape and conditioning_drift(image,image)==0
