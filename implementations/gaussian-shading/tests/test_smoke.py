import torch
from paper_lab.model import GaussianShadingConfig,shade_noise,decode_message,OfficialGaussianShading

def test_round_trip():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert decode_message(shade_noise(n,c,"1010"),c)=="1010"

def test_shape_preserved():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert shade_noise(n,c,"0101").shape==n.shape

def test_official_replication_round_trip():
    method=OfficialGaussianShading(ch_factor=1,hw_factor=8); latent,key,watermark=method.sample(0); assert method.decode(latent,key).shape==watermark.shape and torch.equal(method.decode(latent,key),watermark)
