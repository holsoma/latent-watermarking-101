from __future__ import annotations

import argparse
import torch

from .checkpoint import load_model
from .io import load_image, message_tensor, save_image


def main() -> None:
    parser = argparse.ArgumentParser(description="Embed a binary message into an image")
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--message", required=True)
    parser.add_argument("--output", default="outputs/encoded.png")
    args = parser.parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = load_model(args.checkpoint, device)
    if len(args.message) != model.config.message_length:
        raise ValueError(f"Checkpoint expects {model.config.message_length} bits, got {len(args.message)}")
    image = load_image(args.image, model.config.image_size, device)
    message = message_tensor(args.message, device)
    with torch.no_grad():
        encoded = model.encode(image, message)
    save_image(encoded, args.output)
    print(f"encoded image written to {args.output}")


if __name__ == "__main__":
    main()
