import torch

from rosteals_lab.model import RoSteALSConfig, RoSteALSModel


def test_latent_offset_and_outputs_have_expected_shapes():
    config = RoSteALSConfig()
    model = RoSteALSModel(config)
    cover = torch.randn(2, 3, config.image_size, config.image_size)
    message = torch.randint(0, 2, (2, config.message_length)).float()
    encoded, latent, offset = model.encode(cover, message)
    assert latent.shape == (2, 3, 16, 16)
    assert offset.shape == latent.shape
    assert encoded.shape == cover.shape


def test_message_changes_coarse_to_fine_offset():
    config = RoSteALSConfig()
    model = RoSteALSModel(config)
    zeros = torch.zeros(1, config.message_length)
    ones = torch.ones(1, config.message_length)
    assert not torch.equal(model.secret_encoder(zeros), model.secret_encoder(ones))


def test_message_decoder_closes_local_path():
    config = RoSteALSConfig()
    model = RoSteALSModel(config)
    cover = torch.zeros(1, 3, config.image_size, config.image_size)
    message = torch.zeros(1, config.message_length)
    encoded, _, _ = model.encode(cover, message)
    assert model.decode_message(encoded).shape == message.shape
