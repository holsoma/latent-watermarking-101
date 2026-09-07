"""Run the trained local LaWa adapter against a real Diffusers VAE."""
import argparse,json
from pathlib import Path
import numpy as np
import torch
from PIL import Image
from .checkpoint import load_model

def main():
    p=argparse.ArgumentParser(); p.add_argument("--model-id",required=True); p.add_argument("--checkpoint",required=True,help="Checkpoint produced by this lab"); p.add_argument("--image",required=True); p.add_argument("--message",required=True); p.add_argument("--output-dir",default="outputs/official"); a=p.parse_args()
    try: from diffusers import AutoencoderKL
    except ImportError as exc: raise RuntimeError("Install the optional official extra first") from exc
    device=torch.device("cuda" if torch.cuda.is_available() else "cpu"); vae=AutoencoderKL.from_pretrained(a.model_id,subfolder="vae").to(device).eval(); model=load_model(a.checkpoint,device); raw=np.asarray(Image.open(a.image).convert("RGB").resize((model.config.image_size,model.config.image_size))); image=torch.from_numpy(raw.copy()).float().permute(2,0,1).div(127.5).sub(1).unsqueeze(0).to(device)
    with torch.no_grad(): latent=vae.encode(image).latent_dist.sample()*vae.config.scaling_factor
    if any(ch not in "01" for ch in a.message) or len(a.message)!=model.config.message_length: raise ValueError(f"message must contain {model.config.message_length} binary digits")
    if latent.shape[1:]!=(model.config.latent_channels,model.config.latent_size,model.config.latent_size): raise ValueError("The Diffusers VAE latent shape does not match the local adapter checkpoint")
    bits=torch.tensor([[float(x) for x in a.message]],device=device); offset=model.secret_encoder(bits)
    with torch.no_grad(): marked=vae.decode((latent+offset)/vae.config.scaling_factor).sample
    with torch.no_grad(): recovered_logits=model.decode_message(marked); recovered="".join("1" if value>=0 else "0" for value in recovered_logits.flatten().tolist())
    errors=sum(expected!=actual for expected,actual in zip(a.message,recovered)); ber=errors/len(a.message)
    output=Path(a.output_dir); output.mkdir(parents=True,exist_ok=True); array=((marked[0].clamp(-1,1).permute(1,2,0)+1)*127.5).byte().cpu().numpy(); Image.fromarray(array).save(output/"watermarked.png")
    manifest={"schema_version":"1.0","paper_slug":"lawa","run_kind":"diffusers-vae-mechanism-adapter","status":"completed","local_adapter":True,"implementation_fidelity":"mechanism-adapter","verification_status":"passed" if ber==0 else "failed","per_image_optimisation":False,"device":str(device),"seed":None,"steps":0,"message":a.message,"recovered":recovered,"bit_error_rate":ber,"artifacts":["watermarked.png","manifest.json"],"model_id":a.model_id,"checkpoint":a.checkpoint,"note":"This uses the lab's trained adapter with a real VAE. It is not the official LaWa KL-f8 modified-decoder checkpoint."}; (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
