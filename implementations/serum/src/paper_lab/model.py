"""Tree-Rings initial-noise Fourier marking and a reversible local adapter."""
from __future__ import annotations
from dataclasses import asdict, dataclass
import torch
import torch.nn.functional as F

@dataclass
class TreeRingsConfig:
    image: int = 64
    latent_channels: int = 3
    latent_size: int = 8
    ring_radius: int = 2
    ring_width: int = 2
    amplitude: float = 0.35
    seed: int = 17
    def to_dict(self): return asdict(self)

def _ring_mask(size, radius, width, device=None):
    y,x=torch.meshgrid(torch.arange(size,device=device),torch.arange(size,device=device),indexing="ij")
    d=torch.sqrt((x-size//2).square()+(y-size//2).square())
    return (d>=radius)&(d<radius+width)

def key_pattern(config, key, device=None):
    seed=sum((i+1)*ord(ch) for i,ch in enumerate(key))+config.seed
    g=torch.Generator(device="cpu").manual_seed(seed)
    pattern=torch.randn(config.latent_channels,config.latent_size,config.latent_size,generator=g)
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

def image_score(image, config, key):
    """Image-space detector used by SERUM's no-inversion path."""
    if image.ndim==3: image=image.unsqueeze(0)
    carrier=F.interpolate(torch.fft.ifft2(torch.fft.ifftshift(key_pattern(config,key),dim=(-2,-1))).real.unsqueeze(0),size=image.shape[-2:],mode="nearest")
    return float(torch.cosine_similarity(image.flatten(),carrier.flatten(),dim=0).detach().cpu())

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
