import argparse,json
from pathlib import Path
import torch
from .io import save_image
from .model import GaussianShadingConfig,LocalDiffusionAdapter,shade_noise,decode_message,bit_error

def read_config(path):
    out={}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line=line.split("#",1)[0].strip()
        if not line or "=" not in line: continue
        k,v=[x.strip() for x in line.split("=",1)]; out[k]=v.strip('"') if v.startswith('"') else (float(v) if "." in v else int(v))
    return out

def main():
    p=argparse.ArgumentParser(); p.add_argument("--config",required=True); p.add_argument("--output-dir"); p.add_argument("--message"); p.add_argument("--cpu",action="store_true"); a=p.parse_args(); values=read_config(a.config)
    c=GaussianShadingConfig(**{k:values[k] for k in GaussianShadingConfig.__dataclass_fields__ if k in values}); message=a.message or values.get("message","1011001110001111"); output=Path(a.output_dir or values.get("output_dir","outputs/demo")); output.mkdir(parents=True,exist_ok=True); torch.manual_seed(c.seed)
    renderer=LocalDiffusionAdapter(c); base=torch.randn(1,c.latent_channels,c.latent_size,c.latent_size); marked=shade_noise(base,c,message); image=renderer.render(marked); recovered=decode_message(renderer.invert(image),c)
    save_image(renderer.render(base),output/"base.png"); save_image(image,output/"watermarked.png"); save_image(image-renderer.render(base),output/"residual.png"); torch.save({"config":c.to_dict(),"message":message,"noise":marked},output/"checkpoint.pt")
    manifest={"schema_version":"1.0","paper_slug":"t2smark","run_kind":"tail-and-central-gaussian-sampling","status":"completed","local_adapter":True,"per_image_optimisation":False,"device":"cpu","seed":c.seed,"steps":0,"message":message,"recovered":recovered,"bit_error_rate":bit_error(message,recovered),"artifacts":["checkpoint.pt","base.png","watermarked.png","residual.png","manifest.json"]}; (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
