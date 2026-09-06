import argparse
import json
from pathlib import Path

import torch

from .checkpoint import load_checkpoint
from .io import load_image
from .model import logits_to_bits
from .stats import binomial_upper_tail


def detect(checkpoint, image, device="cpu"):
    model, payload = load_checkpoint(checkpoint, device)
    tensor = load_image(image, model.config.image).to(device)
    with torch.no_grad():
        bits = logits_to_bits(model.logits(tensor))
    key = payload["key"]
    agreements = sum(a == b for a, b in zip(bits, key))
    return {"key": key, "recovered": bits, "agreements": agreements, "bits": len(key), "null_tail_probability": binomial_upper_tail(agreements, len(key))}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--image", required=True)
    args = parser.parse_args()
    print(json.dumps(detect(args.checkpoint, args.image), indent=2))


if __name__ == "__main__":
    main()
