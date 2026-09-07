"""Generate with the paper's 4x64x64 Gaussian Shading latent path."""
import argparse,json
from pathlib import Path
import torch
from .model import OfficialGaussianShading,diffusers_pipeline

def main():
    p=argparse.ArgumentParser(); p.add_argument("--model-id",required=True); p.add_argument("--prompt",required=True); p.add_argument("--steps",type=int,default=30); p.add_argument("--seed",type=int,default=23); p.add_argument("--ch-factor",type=int,default=1); p.add_argument("--hw-factor",type=int,default=8); p.add_argument("--output-dir",default="outputs/official"); a=p.parse_args()
    device="cuda" if torch.cuda.is_available() else "cpu"; pipe=diffusers_pipeline(a.model_id,device); method=OfficialGaussianShading(a.ch_factor,a.hw_factor,a.seed); latent,key,watermark=method.sample(0); latent=latent.to(device); result=pipe(a.prompt,latents=latent,num_inference_steps=a.steps,output_type="pil"); output=Path(a.output_dir); output.mkdir(parents=True,exist_ok=True); result.images[0].save(output/"watermarked.png")
    manifest={"schema_version":"1.0","paper_slug":"gaussian-shading","run_kind":"official-diffusers-generation","status":"completed","local_adapter":False,"per_image_optimisation":False,"device":device,"seed":a.seed,"steps":a.steps,"message":None,"recovered":None,"bit_error_rate":None,"artifacts":["watermarked.png","manifest.json"],"model_id":a.model_id,"mark_shape":list(method.mark_shape)}; (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
