import argparse,json
from pathlib import Path
import torch
from .io import load_image
from .model import GaussianShadingConfig,LocalDiffusionAdapter,decode_message,bit_error

def main():
    p=argparse.ArgumentParser(); p.add_argument("--checkpoint",required=True); p.add_argument("--image",required=True); a=p.parse_args(); data=torch.load(a.checkpoint,map_location="cpu",weights_only=False); c=GaussianShadingConfig(**data["config"]); recovered=decode_message(LocalDiffusionAdapter(c).invert(load_image(Path(a.image))),c); message=data["message"]
    print(json.dumps({"paper_slug":"gaussian-shading-plus-plus","message":message,"recovered":recovered,"bit_error_rate":bit_error(message,recovered),"exact":message==recovered},indent=2))
if __name__=="__main__": main()
