from __future__ import annotations

import argparse
import json
import torch

from .checkpoint import load_model
from .io import load_image, message_tensor
from .noise import channel_from_name


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate extraction through named attack channels")
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--attacks", default="identity,jpeg,crop,blur")
    parser.add_argument("--message", default=None)
    args = parser.parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    base = load_model(args.checkpoint, device)
    message = args.message or "10" * (base.config.message_length // 2) + "1" * (base.config.message_length % 2)
    if len(message) != base.config.message_length:
        raise ValueError(f"Message must contain {base.config.message_length} bits")
    image = load_image(args.image, base.config.image_size, device)
    target = message_tensor(message, device)
    results = []
    with torch.no_grad():
        encoded = base.encode(image, target)
        for name in [value.strip() for value in args.attacks.split(",") if value.strip()]:
            received = channel_from_name(name).to(device)(encoded)
            logits = base.decoder(received)
            predicted = (torch.sigmoid(logits) >= 0.5).float()
            bit_error = float(torch.mean(torch.abs(predicted - target)).item())
            results.append({"attack": name, "bit_error_rate": bit_error, "exact_message": bit_error == 0.0})
    print(json.dumps({"message": message, "results": results}, indent=2))


if __name__ == "__main__":
    main()
