import torch
from paper_lab.model import GaussianShadingConfig,shade_noise,decode_message,decode_soft

def test_round_trip():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert decode_message(shade_noise(n,c,"1010"),c)=="1010"

def test_shape_preserved():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert shade_noise(n,c,"0101").shape==n.shape

def test_soft_decoder_returns_probabilities():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); values=decode_soft(torch.ones(1,3,4,4),c); assert values.shape==(4,) and torch.all((values>0)&(values<1))
