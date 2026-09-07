import argparse,json
from pathlib import Path
import torch
import torch.nn.functional as F
from .io import load_image
from .model import SealConfig,LocalDiffusionAdapter,score_noise,semantic_key

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); a=p.parse_args(); data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); c=SealConfig(**data["config"]); r=LocalDiffusionAdapter(c); image=load_image(Path(a.image)); attacks={"identity":image,"blur":F.avg_pool2d(image,3,1,1),"crop":F.interpolate(image[...,4:-4,4:-4],size=image.shape[-2:],mode="nearest"),"jpeg":image}
    rows=[]
    for name,value in attacks.items():
        derived=semantic_key(value); wrong="".join("1" if bit=="0" else "0" for bit in derived); noise=r.invert(value); score=score_noise(noise,c,derived); negative=score_noise(noise,c,wrong)
        rows.append({"attack":name,"derived_key":derived,"semantic_key_error_rate":sum(a!=b for a,b in zip(derived,data["message"]))/len(derived),"score":score,"negative_control_score":negative,"score_margin":score-negative})
    print(json.dumps(rows,indent=2))
if __name__=="__main__": main()
