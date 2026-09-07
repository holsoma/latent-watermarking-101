import argparse,json
from pathlib import Path
import torch
from .io import load_image
from .model import TreeRingsConfig,LocalDiffusionAdapter,score_noise

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); p.add_argument("--threshold",type=float,default=0.05); a=p.parse_args()
    data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); config=TreeRingsConfig(**data["config"]); score=score_noise(LocalDiffusionAdapter(config).invert(load_image(Path(a.image))),config,data["message"])
    print(json.dumps({"paper_slug":"tag-wm","message":data["message"],"score":score,"threshold":a.threshold,"detected":score>=a.threshold},indent=2))
if __name__=="__main__": main()
