import torch
from paper_lab.model import SealConfig,embed_noise,key_pattern,score_noise,semantic_key,simhash_key

def test_key_is_deterministic():
    c=SealConfig(); assert torch.equal(key_pattern(c,"k"),key_pattern(c,"k"))

def test_mark_increases_key_score():
    c=SealConfig(amplitude=1.0); n=torch.randn(1,3,8,8)
    assert score_noise(embed_noise(n,c,"k"),c,"k")>score_noise(n,c,"k")

def test_semantic_key_is_stable():
    image=torch.zeros(1,3,16,16); assert semantic_key(image)==semantic_key(image.clone())

def test_simhash_key_is_sensitive_to_embedding_direction():
    positive=simhash_key(torch.tensor([1.0,0.0,0.0]),bits=64)
    negative=simhash_key(torch.tensor([-1.0,0.0,0.0]),bits=64)
    assert positive!=negative

def test_marked_noise_prefers_registered_key():
    c=SealConfig(amplitude=1.0); marked=embed_noise(torch.randn(1,3,8,8),c,"registered")
    assert score_noise(marked,c,"registered")>score_noise(marked,c,"wrong")
