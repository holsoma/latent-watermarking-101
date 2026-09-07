"""Gaussian Shading payload mapping with an invertible local diffusion adapter."""
from dataclasses import asdict,dataclass
import torch
import torch.nn.functional as F

@dataclass
class GaussianShadingConfig:
    image:int=64; latent_channels:int=3; latent_size:int=8; payload_bits:int=16; seed:int=23; tail_fraction:float=0.5
    def to_dict(self): return asdict(self)

def bits_tensor(message, device=None):
    if len(message)==0 or any(c not in "01" for c in message): raise ValueError("message must contain only 0 and 1")
    return torch.tensor([1.0 if c=="1" else -1.0 for c in message],device=device)

def _groups(config):
    total=config.latent_channels*config.latent_size*config.latent_size; return torch.arange(total).reshape(config.payload_bits,-1)

def shade_noise(noise,config,message):
    if len(message)!=config.payload_bits: raise ValueError(f"message must be {config.payload_bits} bits")
    flat=noise.flatten(); groups=_groups(config); target=bits_tensor(message,noise.device); result=flat.abs()
    threshold=torch.quantile(flat.abs(),1-config.tail_fraction)
    for index,group in enumerate(groups):
        selected=group[flat[group].abs()>=threshold]
        result[selected]=result[selected]*target[index]
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

def diffusers_pipeline(model_id,device="cpu"):
    try: from diffusers import DiffusionPipeline
    except ImportError as exc: raise RuntimeError("Install the optional diffusers extra to use an actual pipeline") from exc
    return DiffusionPipeline.from_pretrained(model_id).to(device)
