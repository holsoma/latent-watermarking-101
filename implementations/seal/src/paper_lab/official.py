"""Run SEAL marking with a real Diffusers pipeline and a supplied semantic key."""
import argparse,json
from pathlib import Path
import torch
from .model import SealConfig,embed_noise,diffusers_pipeline

def main():
    p=argparse.ArgumentParser(); p.add_argument("--model-id",required=True); p.add_argument("--prompt",required=True); p.add_argument("--semantic-key",required=True); p.add_argument("--steps",type=int,default=30); p.add_argument("--seed",type=int,default=17); p.add_argument("--output-dir",default="outputs/official"); a=p.parse_args(); device="cuda" if torch.cuda.is_available() else "cpu"; pipe=diffusers_pipeline(a.model_id,device); height=pipe.unet.config.sample_size*pipe.vae_scale_factor; channels=pipe.unet.config.in_channels; c=SealConfig(image=height,latent_channels=channels,latent_size=height//pipe.vae_scale_factor,seed=a.seed); generator=torch.Generator(device=device).manual_seed(a.seed); noise=torch.randn((1,channels,c.latent_size,c.latent_size),generator=generator,device=device); marked=embed_noise(noise,c,a.semantic_key); result=pipe(a.prompt,latents=marked,num_inference_steps=a.steps,output_type="pil"); output=Path(a.output_dir); output.mkdir(parents=True,exist_ok=True); result.images[0].save(output/"watermarked.png"); manifest={"schema_version":"1.0","paper_slug":"seal","run_kind":"official-diffusers-semantic-key-generation","status":"completed","local_adapter":False,"per_image_optimisation":False,"device":device,"seed":a.seed,"steps":a.steps,"message":a.semantic_key,"recovered":None,"bit_error_rate":None,"artifacts":["watermarked.png","manifest.json"],"model_id":a.model_id}; (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
