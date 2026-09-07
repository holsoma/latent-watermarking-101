import torch
from paper_lab.model import TreeRingsConfig,embed_noise,key_pattern,score_noise

def test_key_is_deterministic():
    c=TreeRingsConfig(); assert torch.equal(key_pattern(c,"k"),key_pattern(c,"k"))

def test_mark_increases_key_score():
    c=TreeRingsConfig(amplitude=1.0); n=torch.randn(1,3,8,8)
    assert score_noise(embed_noise(n,c,"k"),c,"k")>score_noise(n,c,"k")

def test_fourier_key_is_hermitian():
    c=TreeRingsConfig(); pattern=key_pattern(c,"k"); assert torch.max(torch.abs(pattern-torch.conj(torch.flip(pattern,dims=(-2,-1))))).item()<1e-5
