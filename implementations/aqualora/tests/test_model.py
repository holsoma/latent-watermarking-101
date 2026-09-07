import torch

from stable_signature_lab.model import FixedExtractor, LatentDecoder, StableSignatureConfig


def test_extractor_shape():
    config = StableSignatureConfig()
    extractor = FixedExtractor(config)
    assert extractor(torch.zeros(2, 3, config.image, config.image)).shape == (2, config.message_length)


def test_zero_initialised_lora_preserves_base_output():
    config = StableSignatureConfig()
    decoder = LatentDecoder(config)
    latent = torch.randn(1, config.latent_channels, config.latent_size, config.latent_size)
    expected = decoder.net(latent)
    assert torch.equal(decoder(latent), expected)


def test_lora_weights_can_change_decoder_output():
    config = StableSignatureConfig()
    decoder = LatentDecoder(config)
    latent = torch.randn(1, config.latent_channels, config.latent_size, config.latent_size)
    before = decoder(latent)
    torch.nn.init.constant_(decoder.lora_down.weight, 0.25)
    torch.nn.init.constant_(decoder.lora_up.weight, 0.25)
    assert not torch.equal(decoder(latent), before)


def test_fingerprint_scales_lora_update():
    config = StableSignatureConfig()
    decoder = LatentDecoder(config)
    torch.nn.init.constant_(decoder.lora_down.weight, 0.25)
    torch.nn.init.constant_(decoder.lora_up.weight, 0.25)
    torch.nn.init.constant_(decoder.message_scale.weight, 0.05)
    latent = torch.randn(1, config.latent_channels, config.latent_size, config.latent_size)
    zeros = torch.zeros(1, config.message_length)
    ones = torch.ones(1, config.message_length)
    assert not torch.equal(decoder(latent, zeros), decoder(latent, ones))
