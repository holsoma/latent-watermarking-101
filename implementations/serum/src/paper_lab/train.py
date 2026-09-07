from __future__ import annotations
import argparse,json
from pathlib import Path
import torch
from .io import save_image
from .model import TreeRingsConfig,LocalDiffusionAdapter,embed_noise,score_noise

def read_config(path):
    values={}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line=line.split("#",1)[0].strip()
        if not line or "=" not in line: continue
        key,value=[x.strip() for x in line.split("=",1)]
        values[key]=value.strip('"') if value.startswith('"') else (float(value) if "." in value else int(value))
    return values

def main():
    p=argparse.ArgumentParser(); p.add_argument("--config",required=True); p.add_argument("--output-dir"); p.add_argument("--message"); p.add_argument("--cpu",action="store_true"); a=p.parse_args()
    values=read_config(a.config); config=TreeRingsConfig(**{k:values[k] for k in TreeRingsConfig.__dataclass_fields__ if k in values}); key=a.message or values.get("message","tree-rings-demo")
    output=Path(a.output_dir or values.get("output_dir","outputs/demo")); output.mkdir(parents=True,exist_ok=True); torch.manual_seed(config.seed)
    renderer=LocalDiffusionAdapter(config); noise=torch.randn(1,config.latent_channels,config.latent_size,config.latent_size); marked=embed_noise(noise,config,key); image=renderer.render(marked); score=score_noise(renderer.invert(image),config,key)
    save_image(renderer.render(noise),output/"base.png"); save_image(image,output/"watermarked.png"); save_image(image-renderer.render(noise),output/"residual.png")
    torch.save({"config":config.to_dict(),"message":key,"noise":marked},output/"checkpoint.pt")
    manifest={"schema_version":"1.0","paper_slug":"serum","run_kind":"image-space-detector","status":"completed","local_adapter":True,"per_image_optimisation":False,"device":"cpu","seed":config.seed,"steps":0,"message":key,"recovered":key,"score":score,"bit_error_rate":None,"artifacts":["checkpoint.pt","base.png","watermarked.png","residual.png","manifest.json"]}
    (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
