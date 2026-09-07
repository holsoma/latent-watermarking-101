from __future__ import annotations

import argparse
import json
import torch
import torch.nn.functional as F

from .checkpoint import load_model
from .io import load_image, message_tensor


def attack(image: torch.Tensor, name: str) -> torch.Tensor:
    if name == "identity":
        return image
    if name == "blur":
        kernel = torch.ones(3, 1, 5, 5, device=image.device) / 25
        return F.conv2d(image, kernel, padding=2, groups=3)
    if name == "crop":
        height, width = image.shape[-2:]
        cropped = image[..., height // 10:-height // 10, width // 10:-width // 10]
        return F.interpolate(cropped, size=(height, width), mode="bilinear", align_corners=False)
    if name == "jpeg":
        step = 0.08
        quantised = torch.round(image / step) * step
        return image + (quantised - image).detach()
    raise ValueError(f"Unknown attack {name!r}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate RoSteALS extraction under attacks")
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--message", required=True)
    parser.add_argument("--attacks", default="identity,blur,crop,jpeg")
    args = parser.parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = load_model(args.checkpoint, device)
    image = load_image(args.image, model.config.image_size, device)
    target = message_tensor(args.message, device)
    with torch.no_grad():
        results = []
        for name in [item.strip() for item in args.attacks.split(",") if item.strip()]:
            logits = model.decode_message(attack(image, name))
            predicted = (torch.sigmoid(logits) >= 0.5).float()
            ber = float(torch.mean(torch.abs(predicted - target)).item())
            results.append({"attack": name, "bit_error_rate": ber, "exact_message": ber == 0.0})
    print(json.dumps({"message": args.message, "results": results}, indent=2))


if __name__ == "__main__":
    main()
