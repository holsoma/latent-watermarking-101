"""Closed-set and open-set identification for a RingID key registry."""
import argparse, json
from pathlib import Path
import torch
from .io import load_image
from .model import TreeRingsConfig, LocalDiffusionAdapter, score_noise

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); p.add_argument("--keys",default="alpha,beta,gamma"); p.add_argument("--threshold",type=float,default=.05); a=p.parse_args()
    data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); c=TreeRingsConfig(**data["config"]); noise=LocalDiffusionAdapter(c).invert(load_image(Path(a.image)))
    rows=sorted(({"key":key,"score":score_noise(noise,c,key)} for key in a.keys.split(",") if key),key=lambda row:row["score"],reverse=True); best=rows[0] if rows else {"key":None,"score":-1}
    print(json.dumps({"paper_slug":"ringid","candidates":rows,"selected":best["key"] if best["score"]>=a.threshold else None,"open_set_rejected":best["score"]<a.threshold,"threshold":a.threshold},indent=2))
if __name__=="__main__": main()
