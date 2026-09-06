import argparse
import io
import json

import torch
import torch.nn.functional as F
from PIL import Image

from .checkpoint import load_checkpoint
from .io import load_image
from .model import logits_to_bits


def attack(tensor, name):
    if name == "identity": return tensor
    if name == "blur": return F.avg_pool2d(tensor, 3, 1, 1)
    if name == "crop": return F.interpolate(tensor[:, :, 4:-4, 4:-4], size=tensor.shape[-2:], mode="bilinear", align_corners=False)
    if name == "jpeg":
        array = ((tensor.squeeze(0).permute(1,2,0).clamp(-1,1).numpy()+1)*127.5).round().astype("uint8"); buffer = io.BytesIO(); Image.fromarray(array).save(buffer, format="JPEG", quality=55); return load_image(buffer, tensor.shape[-1])
    raise ValueError(f"unknown attack: {name}")


def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--checkpoint", required=True); parser.add_argument("--image", required=True); parser.add_argument("--attacks", default="identity,blur,crop,jpeg")
    args = parser.parse_args(); renderer, detector, payload = load_checkpoint(args.checkpoint); tensor = load_image(args.image, payload["config"]["image"]); rows=[]
    for name in args.attacks.split(","):
        with torch.no_grad(): recovered = logits_to_bits(detector(attack(tensor, name.strip())))
        key = payload["message"]; errors = sum(a != b for a,b in zip(key, recovered)); rows.append({"attack":name.strip(), "recovered":recovered, "bit_error_rate":errors/len(key), "exact":errors == 0})
    print(json.dumps(rows, indent=2))


if __name__ == "__main__": main()
