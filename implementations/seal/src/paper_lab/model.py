"""SEAL semantic-key watermarking and a reversible local adapter."""
from __future__ import annotations
from dataclasses import asdict, dataclass
import hashlib
import torch
import torch.nn.functional as F

@dataclass
class SealConfig:
    image: int = 64
    latent_channels: int = 3
    latent_size: int = 8
    ring_radius: int = 2
    ring_width: int = 2
    amplitude: float = 0.35
    seed: int = 17
    def to_dict(self): return asdict(self)

def visual_proxy_embedding(image: torch.Tensor) -> torch.Tensor:
    """Return cheap visual statistics for the local adapter.

    This is not the BLIP-2 caption and sentence embedding used by SEAL.
    """
    if image.ndim == 3: image = image.unsqueeze(0)
    pooled = F.adaptive_avg_pool2d(image, (4, 4)).mean(dim=1).flatten()
    return torch.cat((pooled, image.mean(dim=(-2, -1)).flatten(), image.std(dim=(-2, -1)).flatten()))

def simhash_key(embedding: torch.Tensor, bits: int = 32, seed: int = 17) -> str:
    """Map an embedding to a deterministic locality-sensitive binary key."""
    vector=embedding.detach().float().flatten().cpu()
    if vector.numel()==0 or bits<=0: raise ValueError("embedding and bits must be non-empty")
    digest=hashlib.sha256(f"seal-simhash:{seed}:{vector.numel()}".encode("utf-8")).digest()
    generator=torch.Generator().manual_seed(int.from_bytes(digest[:8],"little")%(2**63-1))
    projections=torch.randn(bits,vector.numel(),generator=generator)
    return "".join("1" if value>=0 else "0" for value in projections.mv(vector).tolist())

def semantic_key(image: torch.Tensor) -> str:
    """Return the local visual-proxy SimHash key.

    The name is retained for command compatibility. Paper-faithful work must
    replace ``visual_proxy_embedding`` with SEAL's caption embedding model.
    """
    return simhash_key(visual_proxy_embedding(image))

def _ring_mask(size, radius, width, device=None):
    y,x=torch.meshgrid(torch.arange(size,device=device),torch.arange(size,device=device),indexing="ij")
    d=torch.sqrt((x-size//2).square()+(y-size//2).square())
    return (d>=radius)&(d<radius+width)

def key_pattern(config, key, device=None):
    g=torch.Generator(device="cpu").manual_seed(config.seed)
    basis=torch.randn(len(key),config.latent_channels,config.latent_size,config.latent_size,generator=g)
    values=torch.tensor([1.0 if ch=="1" else -1.0 if ch=="0" else (ord(ch)%17-8)/8 for ch in key])
    pattern=(basis*values[:,None,None,None]).sum(dim=0)/max(1,len(key))**0.5
    pattern=torch.fft.fftshift(torch.fft.fft2(pattern),dim=(-2,-1))
    return (pattern*_ring_mask(config.latent_size,config.ring_radius,config.ring_width)).to(device)

def embed_noise(noise, config, key):
    spectrum=torch.fft.fftshift(torch.fft.fft2(noise),dim=(-2,-1)); mark=key_pattern(config,key,noise.device)
    mask=_ring_mask(config.latent_size,config.ring_radius,config.ring_width,noise.device)
    return torch.fft.ifft2(torch.fft.ifftshift(spectrum+config.amplitude*mark*mask,dim=(-2,-1))).real

def recover_noise(image, config):
    if image.ndim==3: image=image.unsqueeze(0)
    return F.adaptive_avg_pool2d(image.clamp(-1,1),(config.latent_size,config.latent_size))

def score_noise(noise, config, key):
    spectrum=torch.fft.fftshift(torch.fft.fft2(noise),dim=(-2,-1)); target=key_pattern(config,key,noise.device)
    mask=_ring_mask(config.latent_size,config.ring_radius,config.ring_width,noise.device)
    observed=spectrum[...,mask]; expected=target[...,mask]
    dot=(observed.real*expected.real+observed.imag*expected.imag).sum()
    return float((dot/(observed.abs().norm()*expected.abs().norm()+1e-8)).detach().cpu())

class LocalDiffusionAdapter:
    """Reversible stand-in for SD encode/decode used by CPU smoke tests."""
    def __init__(self, config): self.config=config
    def render(self, noise): return F.interpolate(noise,size=(self.config.image,self.config.image),mode="nearest").clamp(-1,1)
    def invert(self, image): return recover_noise(image,self.config)

def diffusers_pipeline(model_id, device="cpu"):
    try:
        from diffusers import DiffusionPipeline
    except ImportError as exc:
        raise RuntimeError("Install the optional diffusers extra to use an actual pipeline") from exc
    return DiffusionPipeline.from_pretrained(model_id).to(device)
