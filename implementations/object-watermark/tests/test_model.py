import torch

from rosteals_lab.model import RoSteALSConfig, RoSteALSModel, ControlToken


def test_latent_offset_and_outputs_have_expected_shapes():
    config = RoSteALSConfig()
    model = RoSteALSModel(config)
    cover = torch.randn(2, 3, config.image_size, config.image_size)
    message = torch.randint(0, 2, (2, config.message_length)).float()
    encoded, latent, offset = model.encode(cover, message)
    assert latent.shape == (2, 3, 16, 16)
    assert offset.shape == latent.shape
    assert encoded.shape == cover.shape

def test_control_token_is_trainable():
    assert ControlToken(4).embedding.requires_grad
