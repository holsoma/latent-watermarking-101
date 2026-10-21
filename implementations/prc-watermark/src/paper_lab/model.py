"""Seeded repetition-code teaching exercise, not cryptographically secure PRC."""
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
    code = prc_encode(message, seed=config.seed)
    flat = noise.flatten().clone()
    if flat.numel() < len(code): raise ValueError("latent must hold three chips per message bit")
    signs = torch.tensor(code, device=noise.device).mul(2).sub(1)
    flat[:len(code)] = flat[:len(code)].abs() * signs
    return flat.reshape_as(noise)

def decode_noise(noise,config):
    count = config.payload_bits * 3
    return (noise.flatten()[:count] >= 0).to(torch.int64)

def decode_message(noise,config):
    return prc_decode(decode_noise(noise,config).tolist(), config.payload_bits, seed=config.seed)

def bit_error(a,b): return sum(x!=y for x,y in zip(a,b))/len(a)

def prc_encode(message, redundancy=3, seed=41):
    """Repeat each bit with a seeded pseudorandom chip sequence."""
    generator=torch.Generator().manual_seed(seed); chips=torch.randint(0,2,(len(message)*redundancy,),generator=generator)
    bits=torch.tensor([int(ch) for ch in message]).repeat_interleave(redundancy); return (bits^chips).tolist()

def prc_decode(chips, length, redundancy=3, seed=41):
    generator=torch.Generator().manual_seed(seed); mask=torch.randint(0,2,(length*redundancy,),generator=generator); values=torch.tensor(chips)^mask
    return "".join(str(int(values[i*redundancy:(i+1)*redundancy].float().mean()>=.5)) for i in range(length))

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
