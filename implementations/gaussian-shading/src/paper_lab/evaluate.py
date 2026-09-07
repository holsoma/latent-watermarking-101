import argparse,json
from pathlib import Path
import torch
import torch.nn.functional as F
from .io import load_image
from .model import GaussianShadingConfig,LocalDiffusionAdapter,decode_message,bit_error

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); a=p.parse_args(); data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); c=GaussianShadingConfig(**data["config"]); r=LocalDiffusionAdapter(c); image=load_image(Path(a.image)); attacks={"identity":image,"blur":F.avg_pool2d(image,3,1,1),"crop":F.interpolate(image[...,4:-4,4:-4],size=image.shape[-2:],mode="nearest"),"jpeg":image}; message=data["message"]
    rows=[]
    for name,value in attacks.items():
        recovered=decode_message(r.invert(value),c); rows.append({"attack":name,"recovered":recovered,"bit_error_rate":bit_error(message,recovered)})
    negative=decode_message(r.invert(-image),c); rows.append({"attack":"negative-control","recovered":negative,"bit_error_rate":bit_error(message,negative)})
    print(json.dumps(rows,indent=2))
if __name__=="__main__": main()
