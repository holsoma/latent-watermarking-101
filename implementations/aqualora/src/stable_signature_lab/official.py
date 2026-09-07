"""Generate with an AquaLoRA-merged Stable Diffusion checkpoint."""
import argparse,json
from pathlib import Path
import torch

def main():
    p=argparse.ArgumentParser(); p.add_argument("--model-id",required=True); p.add_argument("--lora-path"); p.add_argument("--prompt",required=True); p.add_argument("--fingerprint",required=True); p.add_argument("--steps",type=int,default=30); p.add_argument("--seed",type=int,default=23); p.add_argument("--output-dir",default="outputs/official"); a=p.parse_args()
    try: from diffusers import StableDiffusionPipeline
    except ImportError as exc: raise RuntimeError("Install the optional official extra first") from exc
    device="cuda" if torch.cuda.is_available() else "cpu"; pipe=StableDiffusionPipeline.from_pretrained(a.model_id).to(device)
    if a.lora_path: pipe.load_lora_weights(a.lora_path)
    generator=torch.Generator(device=device).manual_seed(a.seed); result=pipe(a.prompt,num_inference_steps=a.steps,generator=generator); output=Path(a.output_dir); output.mkdir(parents=True,exist_ok=True); result.images[0].save(output/"watermarked.png")
    manifest={"schema_version":"1.0","paper_slug":"aqualora","run_kind":"official-lora-model-generation","status":"completed","local_adapter":False,"per_image_optimisation":False,"device":device,"seed":a.seed,"steps":a.steps,"message":a.fingerprint,"recovered":None,"bit_error_rate":None,"artifacts":["watermarked.png","manifest.json"],"model_id":a.model_id,"lora_path":a.lora_path}; (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
