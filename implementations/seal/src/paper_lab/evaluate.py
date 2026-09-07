import argparse,json
from pathlib import Path
import torch
import torch.nn.functional as F
from .io import load_image
from .model import SealConfig,LocalDiffusionAdapter,score_noise,semantic_key

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); a=p.parse_args(); data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); c=SealConfig(**data["config"]); r=LocalDiffusionAdapter(c); image=load_image(Path(a.image)); attacks={"identity":image,"blur":F.avg_pool2d(image,3,1,1),"crop":F.interpolate(image[...,4:-4,4:-4],size=image.shape[-2:],mode="nearest"),"jpeg":image}
    print(json.dumps([{"attack":name,"derived_key":semantic_key(value),"score":score_noise(r.invert(value),c,semantic_key(value))} for name,value in attacks.items()],indent=2))
if __name__=="__main__": main()
