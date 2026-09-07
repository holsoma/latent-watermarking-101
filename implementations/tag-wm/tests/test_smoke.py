import torch
from paper_lab.model import TreeRingsConfig,embed_noise,key_pattern,score_noise,tamper_map

def test_key_is_deterministic():
    c=TreeRingsConfig(); assert torch.equal(key_pattern(c,"k"),key_pattern(c,"k"))

def test_mark_increases_key_score():
    c=TreeRingsConfig(amplitude=1.0); n=torch.randn(1,3,8,8)
    assert score_noise(embed_noise(n,c,"k"),c,"k")>score_noise(n,c,"k")

def test_tamper_map_shape():
    x=torch.zeros(1,3,8,8); assert tamper_map(x,x).shape==(1,1,8,8)
