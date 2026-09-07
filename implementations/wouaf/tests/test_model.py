import torch

from stable_signature_lab.model import FixedExtractor, StableSignatureConfig, FingerprintModulator


def test_extractor_shape():
    config = StableSignatureConfig()
    extractor = FixedExtractor(config)
    assert extractor(torch.zeros(2, 3, config.image, config.image)).shape == (2, config.message_length)

def test_fingerprint_modulator_shape():
    assert FingerprintModulator()(torch.zeros(3,48)).shape==(3,2)
