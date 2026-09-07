import torch

from stable_signature_lab.model import FixedExtractor, StableSignatureConfig, retention_score


def test_extractor_shape():
    config = StableSignatureConfig()
    extractor = FixedExtractor(config)
    assert extractor(torch.zeros(2, 3, config.image, config.image)).shape == (2, config.message_length)

def test_retention_score():
    assert retention_score(torch.tensor([[1.,-1.]]),torch.tensor([[2.,-3.]]))==1
