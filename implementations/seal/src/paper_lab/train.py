from __future__ import annotations
import argparse,json
from pathlib import Path
import torch
from .io import save_image
from .model import SealConfig,LocalDiffusionAdapter,embed_noise,score_noise,semantic_key

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
    values=read_config(a.config); config=SealConfig(**{k:values[k] for k in SealConfig.__dataclass_fields__ if k in values}); key=a.message
    output=Path(a.output_dir or values.get("output_dir","outputs/demo")); output.mkdir(parents=True,exist_ok=True); torch.manual_seed(config.seed)
    renderer=LocalDiffusionAdapter(config); noise=torch.randn(1,config.latent_channels,config.latent_size,config.latent_size); base_image=renderer.render(noise); key=key or semantic_key(base_image); marked=embed_noise(noise,config,key); image=renderer.render(marked); derived=semantic_key(image); recovered_noise=renderer.invert(image); wrong_key="".join("1" if bit=="0" else "0" for bit in derived); score=score_noise(recovered_noise,config,derived); negative_score=score_noise(recovered_noise,config,wrong_key); key_error_rate=sum(a!=b for a,b in zip(key,derived))/len(key); verified=key_error_rate<=0.1 and score>negative_score
    save_image(renderer.render(noise),output/"base.png"); save_image(image,output/"watermarked.png"); save_image(image-renderer.render(noise),output/"residual.png")
    torch.save({"config":config.to_dict(),"message":key,"noise":marked},output/"checkpoint.pt")
    manifest={"schema_version":"1.0","paper_slug":"seal","run_kind":"visual-proxy-simhash-noise-mark","status":"completed","local_adapter":True,"implementation_fidelity":"mechanism-adapter","verification_status":"passed" if verified else "failed","per_image_optimisation":False,"device":"cpu","seed":config.seed,"steps":0,"message":key,"recovered":derived,"semantic_key_match":derived==key,"score":score,"negative_control_score":negative_score,"score_margin":score-negative_score,"bit_error_rate":key_error_rate,"artifacts":["checkpoint.pt","base.png","watermarked.png","residual.png","manifest.json"],"note":"The local key uses visual statistics and SimHash, not SEAL's BLIP-2 caption and sentence embedding models."}
    (output/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8"); print(json.dumps(manifest,indent=2))
if __name__=="__main__": main()
