"""Gaussian Shading payload mapping with an invertible local diffusion adapter."""
from dataclasses import asdict,dataclass
import torch
import torch.nn.functional as F

@dataclass
class GaussianShadingConfig:
    image:int=64; latent_channels:int=3; latent_size:int=8; payload_bits:int=16; seed:int=23
    def to_dict(self): return asdict(self)

def bits_tensor(message, device=None):
    if len(message)==0 or any(c not in "01" for c in message): raise ValueError("message must contain only 0 and 1")
    return torch.tensor([1.0 if c=="1" else -1.0 for c in message],device=device)

def _groups(config):
    total=config.latent_channels*config.latent_size*config.latent_size; return torch.arange(total).reshape(config.payload_bits,-1)

def shade_noise(noise,config,message):
    if len(message)!=config.payload_bits: raise ValueError(f"message must be {config.payload_bits} bits")
    flat=noise.flatten(); groups=_groups(config); target=bits_tensor(message,noise.device); result=flat.abs()
    for index,group in enumerate(groups): result[group]=result[group]*target[index]
    return result.reshape_as(noise)

def decode_noise(noise,config):
    groups=_groups(config); flat=noise.flatten(); return (flat[groups].mean(dim=1)>=0).to(torch.int64)

def decode_message(noise,config): return "".join(str(int(v)) for v in decode_noise(noise,config).tolist())

def bit_error(a,b): return sum(x!=y for x,y in zip(a,b))/len(a)

class LocalDiffusionAdapter:
    def __init__(self,config): self.config=config
    def render(self,noise): return F.interpolate(noise,size=(self.config.image,self.config.image),mode="nearest").clamp(-1,1)
    def invert(self,image):
        if image.ndim==3: image=image.unsqueeze(0)
        return F.adaptive_avg_pool2d(image.clamp(-1,1),(self.config.latent_size,self.config.latent_size))

class OfficialGaussianShading:
    """Paper-faithful channel/spatial replication and truncated-normal path."""
    def __init__(self, ch_factor=1, hw_factor=8, seed=23):
        if 4%ch_factor or 64%hw_factor: raise ValueError("factors must divide the 4x64x64 latent")
        self.ch_factor=ch_factor; self.hw_factor=hw_factor; self.seed=seed
        self.mark_shape=(4//ch_factor,64//hw_factor,64//hw_factor)

    def sample(self, bits):
        generator=torch.Generator().manual_seed(self.seed)
        watermark=torch.randint(0,2,self.mark_shape,generator=generator)
        key=torch.randint(0,2,(4,64,64),generator=generator)
        target=(watermark.repeat_interleave(self.ch_factor,0).repeat_interleave(self.hw_factor,1).repeat_interleave(self.hw_factor,2)+key)%2
        uniform=torch.rand(target.shape,generator=generator).clamp(1e-5,1-1e-5)
        normal=torch.distributions.Normal(0.,1.)
        target_float=target.float()
        probability=torch.where(target.bool(),torch.full_like(target_float,.5),torch.zeros_like(target_float))+uniform*.5
        latent=normal.icdf(probability).unsqueeze(0)
        return latent,key,watermark

    def decode(self, latent, key):
        observed=(latent.squeeze(0)>0).to(torch.int64); unkeyed=(observed+key.to(observed.device))%2
        c=self.ch_factor; h=self.hw_factor; grouped=unkeyed.view(4//c,c,64//h,h,64//h,h)
        return (grouped.float().mean(dim=(1,3,5))>=.5).to(torch.int64)

def diffusers_pipeline(model_id,device="cpu"):
    try: from diffusers import DiffusionPipeline
    except ImportError as exc: raise RuntimeError("Install the optional diffusers extra to use an actual pipeline") from exc
    return DiffusionPipeline.from_pretrained(model_id).to(device)
