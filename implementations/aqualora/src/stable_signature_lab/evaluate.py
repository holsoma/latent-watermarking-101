import argparse
import io
import json
from pathlib import Path

import torch
import torch.nn.functional as F
from PIL import Image, ImageFilter

from .checkpoint import load_checkpoint
from .detect import detect
from .io import load_image, save_image


def attack(tensor, name):
    if name == "identity":
        return tensor
    if name == "blur":
        return F.avg_pool2d(tensor, 3, 1, 1)
    if name == "crop":
        cropped = tensor[:, :, 4:-4, 4:-4]
        return F.interpolate(cropped, size=tensor.shape[-2:], mode="bilinear", align_corners=False)
    if name == "jpeg":
        array = ((tensor.squeeze(0).permute(1, 2, 0).cpu().clamp(-1, 1).numpy() + 1) * 127.5).round().astype("uint8")
        buffer = io.BytesIO()
        Image.fromarray(array).save(buffer, format="JPEG", quality=55)
        return load_image(buffer, tensor.shape[-1])
    raise ValueError(f"unknown attack: {name}")


def run(args):
    model, payload = load_checkpoint(args.checkpoint)
    tensor = load_image(args.image, model.config.image)
    rows = []
    for name in args.attacks.split(","):
        attacked = attack(tensor, name.strip())
        with torch.no_grad():
            recovered = __import__("stable_signature_lab.model", fromlist=["logits_to_bits"]).logits_to_bits(model.logits(attacked))
        key = payload["key"]
        errors = sum(a != b for a, b in zip(key, recovered))
        rows.append({"attack": name.strip(), "recovered": recovered, "bit_error_rate": errors / len(key), "exact": errors == 0})
    print(json.dumps(rows, indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--attacks", default="identity,blur,crop,jpeg")
    run(parser.parse_args())


if __name__ == "__main__":
    main()
