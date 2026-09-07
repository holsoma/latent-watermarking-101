import torch
from paper_lab.model import GaussianShadingConfig,shade_noise,decode_message,prc_encode,prc_decode

def test_round_trip():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert decode_message(shade_noise(n,c,"1010"),c)=="1010"

def test_shape_preserved():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert shade_noise(n,c,"0101").shape==n.shape

def test_pseudorandom_code_round_trip():
    chips=prc_encode("1010"); assert prc_decode(chips,4)=="1010"
