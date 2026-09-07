import argparse,json
from pathlib import Path
import torch
from .io import load_image
from .model import SealConfig,LocalDiffusionAdapter,score_noise,semantic_key

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); p.add_argument("--threshold",type=float,default=0.05); a=p.parse_args()
    data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); config=SealConfig(**data["config"]); image=load_image(Path(a.image)); key=semantic_key(image); score=score_noise(LocalDiffusionAdapter(config).invert(image),config,key)
    print(json.dumps({"paper_slug":"seal","derived_key":key,"score":score,"threshold":a.threshold,"detected":score>=a.threshold},indent=2))
if __name__=="__main__": main()
