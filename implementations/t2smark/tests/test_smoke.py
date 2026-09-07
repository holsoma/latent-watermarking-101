import torch
from paper_lab.model import GaussianShadingConfig,shade_noise,decode_message

def test_round_trip():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert decode_message(shade_noise(n,c,"1010"),c)=="1010"

def test_shape_preserved():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert shade_noise(n,c,"0101").shape==n.shape

def test_tail_fraction_leaves_some_central_values():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4,tail_fraction=.25); n=torch.arange(48,dtype=torch.float32).reshape(1,3,4,4)-24; marked=shade_noise(n,c,"0000"); assert (marked==n).sum() > 0
