"""Query-light surrogate forgery attack against a black-box score."""
import argparse,json
from pathlib import Path
import torch
from .io import load_image,save_image
from .model import TreeRingsConfig,LocalDiffusionAdapter,score_noise

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); p.add_argument("--steps",type=int,default=8); p.add_argument("--output",default="outputs/forged.png"); a=p.parse_args()
    data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); c=TreeRingsConfig(**data["config"]); r=LocalDiffusionAdapter(c); image=load_image(Path(a.image)); target=data["message"]; best=image.clone(); best_score=score_noise(r.invert(best),c,target)
    for seed in range(a.steps):
        candidate=(image+torch.randn_like(image)*(.01+.01*seed)).clamp(-1,1); value=score_noise(r.invert(candidate),c,target)
        if value>best_score: best,best_score=candidate,value
    output=Path(a.output); output.parent.mkdir(parents=True,exist_ok=True); save_image(best,output); print(json.dumps({"paper_slug":"semantic-forgery","queries":a.steps,"target_key":target,"score":best_score,"forged_image":str(output)},indent=2))
if __name__=="__main__": main()
