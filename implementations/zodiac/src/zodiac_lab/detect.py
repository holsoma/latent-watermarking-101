import argparse
import json

import torch

from .checkpoint import load_checkpoint
from .io import load_image
from .model import logits_to_bits


def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--checkpoint", required=True); parser.add_argument("--image", required=True)
    args = parser.parse_args(); renderer, detector, payload = load_checkpoint(args.checkpoint)
    image = load_image(args.image, payload["config"]["image"])
    with torch.no_grad(): recovered = logits_to_bits(detector(image))
    key = payload["message"]; errors = sum(a != b for a,b in zip(key, recovered))
    print(json.dumps({"message":key, "recovered":recovered, "bit_error_rate":errors/len(key), "exact":errors == 0}, indent=2))


if __name__ == "__main__": main()
