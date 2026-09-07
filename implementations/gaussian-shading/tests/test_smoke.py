import torch
from paper_lab.model import GaussianShadingConfig,shade_noise,decode_message,OfficialGaussianShading

def test_round_trip():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert decode_message(shade_noise(n,c,"1010"),c)=="1010"

def test_shape_preserved():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert shade_noise(n,c,"0101").shape==n.shape

def test_official_replication_round_trip():
    method=OfficialGaussianShading(ch_factor=1,hw_factor=8); latent,key,watermark=method.sample(); assert method.decode(latent,key).shape==watermark.shape and torch.equal(method.decode(latent,key),watermark)

def test_official_payload_controls_watermark():
    method=OfficialGaussianShading(ch_factor=4,hw_factor=64)
    latent,key,watermark=method.sample("1")
    assert watermark.item()==1 and method.decode(latent,key).item()==1

def test_official_payload_length_is_checked():
    method=OfficialGaussianShading(ch_factor=1,hw_factor=8)
    try:
        method.sample("101")
    except ValueError:
        return
    raise AssertionError("invalid payload length was accepted")
