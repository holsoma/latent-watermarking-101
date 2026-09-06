import torch

from hidden_lab.model import Decoder, Encoder, HiddenConfig, HiddenModel
from hidden_lab.noise import channel_from_name


def test_encoder_decoder_shapes():
    config = HiddenConfig(image_size=16, message_length=8, encoder_channels=8, decoder_channels=8, discriminator_channels=8)
    image = torch.randn(2, 3, 16, 16)
    message = torch.randint(0, 2, (2, 8)).float()
    encoded, noised, decoded = HiddenModel(config)(image, message)
    assert encoded.shape == image.shape
    assert noised.shape == image.shape
    assert decoded.shape == message.shape


def test_all_channels_preserve_shape():
    image = torch.randn(2, 3, 16, 16)
    for name in ("identity", "dropout", "blur", "crop", "jpeg"):
        assert channel_from_name(name)(image).shape == image.shape
