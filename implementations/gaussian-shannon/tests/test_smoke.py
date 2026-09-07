import torch
from paper_lab.model import GaussianShadingConfig,shade_noise,decode_message,repeat_payload,majority_decode,word_error_rate

def test_round_trip():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert decode_message(shade_noise(n,c,"1010"),c)=="1010"

def test_shape_preserved():
    c=GaussianShadingConfig(payload_bits=4,latent_size=4); n=torch.randn(1,3,4,4); assert shade_noise(n,c,"0101").shape==n.shape

def test_majority_and_word_error():
    assert majority_decode(repeat_payload("1010",3))=="1010" and word_error_rate("1010","1010")==0
