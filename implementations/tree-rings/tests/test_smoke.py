import torch
from paper_lab.model import TreeRingsConfig,embed_noise,key_pattern,score_noise,official_mask,watermark_mask

def test_key_is_deterministic():
    c=TreeRingsConfig(); assert torch.equal(key_pattern(c,"k"),key_pattern(c,"k"))

def test_mark_increases_key_score():
    c=TreeRingsConfig(amplitude=1.0); n=torch.randn(1,3,8,8)
    assert score_noise(embed_noise(n,c,"k"),c,"k")>score_noise(n,c,"k")

def test_official_ring_mask_is_nonempty():
    assert official_mask(TreeRingsConfig()).any()

def test_channel_mask_respects_w_channel():
    mask=watermark_mask(TreeRingsConfig(w_channel=1))
    assert not mask[0].any() and mask[1].any() and not mask[2].any()

def test_full_strength_replaces_selected_coefficients():
    c=TreeRingsConfig(amplitude=1.0,w_channel=2,w_pattern="zeros")
    marked=embed_noise(torch.randn(1,3,8,8),c,"registered")
    spectrum=torch.fft.fftshift(torch.fft.fft2(marked),dim=(-2,-1))
    target=key_pattern(c,"registered"); mask=watermark_mask(c)
    assert torch.allclose(spectrum[:,mask],target[mask].unsqueeze(0),atol=1e-4)

def test_registered_key_beats_wrong_key():
    c=TreeRingsConfig(amplitude=1.0)
    marked=embed_noise(torch.randn(1,3,8,8),c,"registered")
    assert score_noise(marked,c,"registered")>score_noise(marked,c,"wrong")
