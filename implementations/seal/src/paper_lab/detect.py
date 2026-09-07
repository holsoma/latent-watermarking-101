import argparse,json
from pathlib import Path
import torch
from .io import load_image
from .model import SealConfig,LocalDiffusionAdapter,score_noise,semantic_key

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); p.add_argument("--threshold",type=float,default=0.0); p.add_argument("--max-key-error-rate",type=float,default=0.1); a=p.parse_args()
    data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); config=SealConfig(**data["config"]); image=load_image(Path(a.image)); key=semantic_key(image); noise=LocalDiffusionAdapter(config).invert(image); wrong_key="".join("1" if bit=="0" else "0" for bit in key); score=score_noise(noise,config,key); negative=score_noise(noise,config,wrong_key); margin=score-negative; key_error_rate=sum(a!=b for a,b in zip(key,data["message"]))/len(key)
    print(json.dumps({"paper_slug":"seal","embedded_key":data["message"],"derived_key":key,"semantic_key_match":key==data["message"],"semantic_key_error_rate":key_error_rate,"score":score,"negative_control_score":negative,"score_margin":margin,"threshold":a.threshold,"detected":key_error_rate<=a.max_key_error_rate and margin>=a.threshold},indent=2))
if __name__=="__main__": main()
