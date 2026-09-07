from __future__ import annotations

import argparse
import json
import random
import tomllib
from pathlib import Path

import torch
from torch import nn

from .io import save_image
from .model import RoSteALSConfig, RoSteALSModel


def read_config(path: str | Path) -> dict:
    with open(path, "rb") as stream:
        return tomllib.load(stream)


def make_covers(batch_size: int, image_size: int, device: torch.device, generator: torch.Generator) -> torch.Tensor:
    axis = torch.linspace(-1, 1, image_size, device=device)
    grid_y, grid_x = torch.meshgrid(axis, axis, indexing="ij")
    base = torch.stack((grid_x, grid_y, grid_x * grid_y), dim=0)
    noise = torch.rand(batch_size, 3, image_size, image_size, generator=generator, device=device) * 0.08 - 0.04
    return (base.unsqueeze(0) + noise).clamp(-1, 1)


def train(config_path: str, output_directory: str | None = None) -> Path:
    values = read_config(config_path)
    config = RoSteALSConfig(**values["model"])
    settings = values["training"]
    output = Path(output_directory or values["output"]["directory"])
    output.mkdir(parents=True, exist_ok=True)
    seed = int(settings.get("seed", 11))
    random.seed(seed)
    torch.manual_seed(seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    generator = torch.Generator(device=device).manual_seed(seed + 1)
    model = RoSteALSModel(config).to(device)
    model.train()
    for parameter in model.autoencoder.parameters():
        parameter.requires_grad_(False)
    optimiser = torch.optim.Adam(
        list(model.secret_encoder.parameters()) + list(model.secret_decoder.parameters()),
        lr=float(settings.get("learning_rate", 0.002)),
    )
    message_loss = nn.BCEWithLogitsLoss()
    image_loss = nn.MSELoss()
    history: list[dict[str, float | int | str]] = []
    last_cover = None
    last_encoded = None
    last_offset = None
    for step in range(1, int(settings.get("steps", 600)) + 1):
        cover = make_covers(int(settings.get("batch_size", 8)), config.image_size, device, generator)
        message = torch.randint(0, 2, (cover.shape[0], config.message_length), generator=generator, device=device).float()
        encoded, base_latent, offset = model.encode(cover, message)
        decoded = model.decode_message(encoded)
        msg_value = message_loss(decoded, message)
        img_value = image_loss(encoded, model.autoencoder.decode(base_latent))
        offset_value = offset.square().mean()
        total = float(settings.get("message_loss_weight", 1.0)) * msg_value + float(settings.get("image_loss_weight", 2.0)) * img_value + float(settings.get("offset_weight", 0.02)) * offset_value
        optimiser.zero_grad(set_to_none=True)
        total.backward()
        optimiser.step()
        history.append({"step": step, "loss": float(total.item()), "message_loss": float(msg_value.item()), "image_mse": float(img_value.item()), "offset_rms": float(offset.square().mean().sqrt().item()), "device": str(device)})
        last_cover, last_encoded, last_offset = cover[:1].detach(), encoded[:1].detach(), offset[:1].detach()

    model.eval()
    assert last_cover is not None and last_encoded is not None and last_offset is not None
    decoded = model.decode_message(last_encoded)
    target = torch.randint(0, 2, (1, config.message_length), generator=torch.Generator(device=device).manual_seed(seed + 99), device=device).float()
    # The saved visual uses a fresh message so the checkpoint is tested on a
    # message that was not the final training batch.
    with torch.no_grad():
        encoded, base_latent, offset = model.encode(last_cover, target)
        decoded = model.decode_message(encoded)
    predicted = (torch.sigmoid(decoded) >= 0.5).float()
    ber = float(torch.mean(torch.abs(predicted - target)).item())
    save_image(last_cover, output / "cover.png")
    save_image(model.autoencoder.decode(model.autoencoder.encode(last_cover)), output / "autoencoded.png")
    save_image(encoded, output / "encoded.png")
    residual = (encoded - last_cover).abs() * 8
    save_image(residual.clamp(-1, 1), output / "residual_amplified.png")
    manifest = {"schema_version": "1.0", "paper_slug": "lawa", "paper": "LaWa", "run_kind": "coarse-to-fine-latent-training", "status": "completed", "local_adapter": True, "config": values, "checkpoint": str(output / "checkpoint.pt"), "device": str(device), "steps": len(history), "message_length": config.message_length, "test_message": "".join(str(int(bit)) for bit in target[0].tolist()), "test_recovered": "".join(str(int(bit)) for bit in predicted[0].tolist()), "bit_error_rate": ber, "artifacts": ["checkpoint.pt", "cover.png", "autoencoded.png", "encoded.png", "residual_amplified.png", "manifest.json"], "image_mse_vs_autoencoder": float(((encoded - model.autoencoder.decode(model.autoencoder.encode(last_cover))) ** 2).mean().item()), "history": history, "note": "Frozen analytic autoencoder plus coarse-to-fine watermark modules. Replace it with the official autoencoder and MIRFlickr training recipe for paper-matched work."}
    torch.save({"config": values["model"], "state_dict": model.state_dict(), "history": history}, output / "checkpoint.pt")
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps({"checkpoint": str(output / "checkpoint.pt"), "manifest": str(output / "manifest.json"), "device": str(device), "steps": len(history), "test_message": manifest["test_message"], "test_recovered": manifest["test_recovered"], "bit_error_rate": ber}, indent=2))
    return output / "checkpoint.pt"


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the local RoSteALS mechanism demo")
    parser.add_argument("--config", required=True)
    parser.add_argument("--output-dir", default=None)
    args = parser.parse_args()
    train(args.config, args.output_dir)


if __name__ == "__main__":
    main()
