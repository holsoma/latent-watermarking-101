"""Run LaWa's latent-offset boundary against a real Diffusers VAE."""
import argparse,json
from pathlib import Path
import numpy as np
import torch
from PIL import Image
from .model import RoSteALSConfig,SecretEncoder

def main():
    p=argparse.ArgumentParser(); p.add_argument("--model-id",required=True); p.add_argument("--image",required=True); p.add_argument("--message",required=True); p.add_argument("--output-dir",default="outputs/official"); a=p.parse_args()
    try: from diffusers import AutoencoderKL
    except ImportError as exc: raise RuntimeError("Install the optional official extra first") from exc
    device="cuda" if torch.cuda.is_available() else "cpu"; vae=AutoencoderKL.from_pretrained(a.model_id,subfolder="vae").to(device).eval(); raw=np.asarray(Image.open(a.image).convert("RGB")); image=torch.from_numpy(raw.copy()).float().permute(2,0,1).div(127.5).sub(1).unsqueeze(0).to(device)
    with torch.no_grad(): latent=vae.encode(image).latent_dist.sample()*vae.config.scaling_factor
    config=RoSteALSConfig(image_size=image.shape[-1],latent_channels=latent.shape[1],latent_size=latent.shape[-1],message_length=len(a.message)); encoder=SecretEncoder(config).to(device).eval(); bits=torch.tensor([[float(x) for x in a.message]],device=device); offset=encoder(bits); 
    with torch.no_grad(): marked=vae.decode((latent+offset)/vae.config.scaling_factor).sample
    output=Path(a.output_dir); output.mkdir(parents=True,exist_ok=True); array=((marked[0].clamp(-1,1).permute(1,2,0)+1)*127.5).byte().cpu().numpy(); Image.fromarray(array).save(output/"watermarked.png")
    manifest={"schema_version":"1.0","paper_slug":"lawa","run_kind":"official-diffusers-vae-latent-mark","status":"completed","local_adapter":False,"per_image_optimisation":False,"device":device,"seed":None,"steps":0,"message":a.message,"recovered":None,"bit_error_rate":None,"artifacts":["watermarked.png","manifest.json"],"model_id":a.model_id}; (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
