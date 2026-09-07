"""Render a Gaussian Shading latent with Diffusers and save its detection key."""
import argparse,json
from pathlib import Path
import torch
from .model import OfficialGaussianShading,diffusers_pipeline

def main():
    p=argparse.ArgumentParser(); p.add_argument("--model-id",required=True); p.add_argument("--prompt",required=True); p.add_argument("--message",help="Optional binary payload; length must match the configured mark shape"); p.add_argument("--steps",type=int,default=30); p.add_argument("--seed",type=int,default=23); p.add_argument("--ch-factor",type=int,default=1); p.add_argument("--hw-factor",type=int,default=8); p.add_argument("--output-dir",default="outputs/official"); a=p.parse_args()
    device="cuda" if torch.cuda.is_available() else "cpu"; pipe=diffusers_pipeline(a.model_id,device); method=OfficialGaussianShading(a.ch_factor,a.hw_factor,a.seed); latent,key,watermark=method.sample(a.message); latent=latent.to(device); result=pipe(a.prompt,latents=latent,num_inference_steps=a.steps,output_type="pil"); output=Path(a.output_dir); output.mkdir(parents=True,exist_ok=True); result.images[0].save(output/"watermarked.png")
    state={"key":key.cpu(),"watermark":watermark.cpu(),"ch_factor":a.ch_factor,"hw_factor":a.hw_factor,"seed":a.seed}; torch.save(state,output/"watermark-state.pt")
    message="".join(str(int(bit)) for bit in watermark.flatten().tolist())
    manifest={"schema_version":"1.0","paper_slug":"gaussian-shading","run_kind":"diffusers-rendered-mechanism-adapter","status":"completed","local_adapter":True,"implementation_fidelity":"mechanism-adapter","verification_status":"not-run","per_image_optimisation":False,"device":device,"seed":a.seed,"steps":a.steps,"message":message,"recovered":None,"bit_error_rate":None,"artifacts":["watermarked.png","watermark-state.pt","manifest.json"],"model_id":a.model_id,"mark_shape":list(method.mark_shape),"note":"The key is saved, but verification still requires DDIM inversion of the generated image."}; (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
