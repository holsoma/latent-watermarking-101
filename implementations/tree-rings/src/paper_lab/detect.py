import argparse,json
from pathlib import Path
import torch
from .io import load_image
from .model import TreeRingsConfig,LocalDiffusionAdapter,score_noise

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); p.add_argument("--threshold",type=float,default=0.0,help="Minimum score margin over the deterministic wrong-key control"); a=p.parse_args()
    data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); config=TreeRingsConfig(**data["config"]); noise=LocalDiffusionAdapter(config).invert(load_image(Path(a.image))); score=score_noise(noise,config,data["message"]); negative=score_noise(noise,config,"null:"+data["message"]); margin=score-negative
    print(json.dumps({"paper_slug":"tree-rings","message":data["message"],"score":score,"negative_control_score":negative,"score_margin":margin,"threshold":a.threshold,"detected":margin>=a.threshold},indent=2))
if __name__=="__main__": main()
