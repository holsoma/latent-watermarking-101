"""Tree-Rings initial-noise Fourier marking and a reversible local adapter."""
from __future__ import annotations
from dataclasses import asdict, dataclass
import hashlib
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
    w_channel: int = -1
    w_pattern: str = "ring"
    def to_dict(self): return asdict(self)

def _circle_mask(size, radius, device=None):
    y,x=torch.meshgrid(torch.arange(size,device=device),torch.arange(size,device=device),indexing="ij")
    d=torch.sqrt((x-size//2).square()+(y-size//2).square())
    return d<=radius

def watermark_mask(config, device=None):
    """Return the paper's centred circular mask for the selected channels."""
    mask=torch.zeros(config.latent_channels,config.latent_size,config.latent_size,dtype=torch.bool,device=device)
    circle=_circle_mask(config.latent_size,config.ring_radius,device)
    if config.w_channel == -1:
        mask[:]=circle
    elif 0 <= config.w_channel < config.latent_channels:
        mask[config.w_channel]=circle
    else:
        raise ValueError("w_channel must be -1 or a valid latent channel")
    return mask

def key_pattern(config, key, device=None):
    digest=hashlib.sha256(f"{config.seed}:{key}".encode("utf-8")).digest()
    seed=int.from_bytes(digest[:8],"little")%(2**63-1)
    g=torch.Generator(device="cpu").manual_seed(seed)
    initial=torch.randn(config.latent_channels,config.latent_size,config.latent_size,generator=g)
    spectrum=torch.fft.fftshift(torch.fft.fft2(initial),dim=(-2,-1))
    if config.w_pattern == "zeros":
        spectrum.zero_()
    elif config.w_pattern == "ring":
        source=spectrum.clone(); centre=config.latent_size//2
        for radius in range(config.ring_radius,0,-1):
            circle=_circle_mask(config.latent_size,radius)
            sample_x=max(0,centre-radius)
            for channel in range(config.latent_channels):
                spectrum[channel,circle]=source[channel,centre,sample_x]
    elif config.w_pattern != "rand":
        raise ValueError("w_pattern must be ring, rand or zeros")
    return spectrum.to(device)

def embed_noise(noise, config, key):
    spectrum=torch.fft.fftshift(torch.fft.fft2(noise),dim=(-2,-1)); mark=key_pattern(config,key,noise.device)
    mask=watermark_mask(config,noise.device); spectrum=spectrum.clone()
    if noise.ndim==4:
        expanded_mask=mask.unsqueeze(0).expand(noise.shape[0],-1,-1,-1)
        expanded_mark=mark.unsqueeze(0).expand(noise.shape[0],-1,-1,-1)
        spectrum[expanded_mask]=(1-config.amplitude)*spectrum[expanded_mask]+config.amplitude*expanded_mark[expanded_mask]
    else:
        spectrum[mask]=(1-config.amplitude)*spectrum[mask]+config.amplitude*mark[mask]
    return torch.fft.ifft2(torch.fft.ifftshift(spectrum,dim=(-2,-1))).real

def official_mask(config):
    """Expose the spatial part of the official circular mask."""
    return _circle_mask(config.latent_size,config.ring_radius)

def recover_noise(image, config):
    if image.ndim==3: image=image.unsqueeze(0)
    return F.adaptive_avg_pool2d(image.clamp(-1,1),(config.latent_size,config.latent_size))

def score_noise(noise, config, key):
    spectrum=torch.fft.fftshift(torch.fft.fft2(noise),dim=(-2,-1)); target=key_pattern(config,key,noise.device)
    mask=watermark_mask(config,noise.device)
    if noise.ndim==4:
        observed=spectrum[:,mask]; expected=target[mask].unsqueeze(0).expand(noise.shape[0],-1)
    else:
        observed=spectrum[mask]; expected=target[mask]
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
