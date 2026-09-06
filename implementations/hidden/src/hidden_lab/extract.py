from __future__ import annotations

import argparse
import torch

from .checkpoint import load_model
from .io import load_image


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract a binary message from an image")
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--image", required=True)
    args = parser.parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = load_model(args.checkpoint, device)
    image = load_image(args.image, model.config.image_size, device)
    with torch.no_grad():
        bits = (torch.sigmoid(model.decoder(image)) >= 0.5).int().flatten().tolist()
    print("".join(str(bit) for bit in bits))


if __name__ == "__main__":
    main()
