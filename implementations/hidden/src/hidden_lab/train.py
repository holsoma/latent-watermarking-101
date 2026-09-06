from __future__ import annotations

import argparse
import json
import random
import tomllib
from pathlib import Path

import torch
from torch import nn

from .io import load_image, save_image
from .model import HiddenConfig, HiddenModel
from .noise import channel_from_name


def read_config(path: str | Path) -> dict:
    with open(path, "rb") as stream:
        return tomllib.load(stream)


def config_from_values(values: dict) -> HiddenConfig:
    return HiddenConfig(**values["model"])


def synthetic_batch(batch_size: int, image_size: int, message_length: int, device: torch.device):
    image = torch.rand(batch_size, 3, image_size, image_size, device=device) * 2 - 1
    message = torch.randint(0, 2, (batch_size, message_length), device=device).float()
    return image, message


def fixed_demo_batch(batch_size: int, image_size: int, message_length: int, device: torch.device, message_bits: str):
    """Return one repeatable cover/message pair for the tiny-set overfit demo.

    Reusing the same pair is deliberate: this experiment asks whether the
    implementation can learn the communication path before we add data and
    distortion complexity. It is not a training recipe for paper results.
    """
    axis = torch.linspace(-1, 1, image_size, device=device)
    grid_y, grid_x = torch.meshgrid(axis, axis, indexing="ij")
    image = torch.stack((grid_x, grid_y, grid_x * grid_y), dim=0).unsqueeze(0)
    if len(message_bits) != message_length or set(message_bits) - {"0", "1"}:
        raise ValueError(f"Demo message must contain exactly {message_length} binary digits")
    message = torch.tensor([[int(bit) for bit in message_bits]], device=device, dtype=torch.float32)
    return image.repeat(batch_size, 1, 1, 1), message.repeat(batch_size, 1)


def dataset_batch(paths: list[Path], batch_size: int, image_size: int, message_length: int, device: torch.device):
    selected = random.choices(paths, k=batch_size)
    images = torch.cat([load_image(path, image_size, device) for path in selected], dim=0)
    message = torch.randint(0, 2, (batch_size, message_length), device=device).float()
    return images, message


def train(config_path: str, data_dir: str | None = None, demo_message: str | None = None, output_directory: str | None = None) -> Path:
    values = read_config(config_path)
    config = config_from_values(values)
    settings = values["training"]
    output = Path(output_directory or values["output"]["directory"])
    output.mkdir(parents=True, exist_ok=True)
    seed = int(settings.get("seed", 7))
    random.seed(seed)
    torch.manual_seed(seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    data_root = data_dir or values.get("data", {}).get("directory")
    image_paths = []
    if data_root:
        image_paths = [path for path in Path(data_root).rglob("*") if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
        if not image_paths:
            raise ValueError(f"No supported images found under {data_root}")
    model = HiddenModel(config).to(device)
    model.train()
    generator_parameters = list(model.encoder.parameters()) + list(model.decoder.parameters())
    optimizer = torch.optim.Adam(generator_parameters, lr=float(settings.get("learning_rate", 1e-3)))
    discriminator_optimizer = torch.optim.Adam(model.discriminator.parameters(), lr=float(settings.get("learning_rate", 1e-3)))
    message_loss = nn.BCEWithLogitsLoss()
    image_loss = nn.MSELoss()
    adversarial_loss = nn.BCEWithLogitsLoss()
    channels = ["identity", "dropout", "blur", "crop", "jpeg"]
    fixed_demo = bool(settings.get("fixed_demo", False))
    selected_demo_message = demo_message or str(settings.get("demo_message", "10110010"))
    demo_image, demo_message_tensor = fixed_demo_batch(int(settings.get("batch_size", 1)), config.image_size, config.message_length, device, selected_demo_message) if fixed_demo else (None, None)
    history: list[dict[str, float | int | str]] = []

    for step in range(1, int(settings.get("steps", 12)) + 1):
        if fixed_demo:
            image, message = demo_image, demo_message_tensor
        else:
            image, message = dataset_batch(image_paths, int(settings.get("batch_size", 4)), config.image_size, config.message_length, device) if image_paths else synthetic_batch(int(settings.get("batch_size", 4)), config.image_size, config.message_length, device)
        channel_name = "identity" if fixed_demo else channels[(step - 1) % len(channels)]
        model.channel = channel_from_name(channel_name).to(device)
        encoded, noised, decoded = model(image, message)

        discriminator_optimizer.zero_grad(set_to_none=True)
        real_logits = model.discriminator(image)
        fake_logits = model.discriminator(encoded.detach())
        discriminator_loss = (adversarial_loss(real_logits, torch.ones_like(real_logits)) + adversarial_loss(fake_logits, torch.zeros_like(fake_logits))) / 2
        discriminator_loss.backward()
        discriminator_optimizer.step()

        optimizer.zero_grad(set_to_none=True)
        message_value = message_loss(decoded, message)
        image_value = image_loss(encoded, image)
        generator_value = adversarial_loss(model.discriminator(encoded), torch.ones_like(fake_logits))
        total = float(settings.get("message_loss_weight", 1.0)) * message_value + float(settings.get("image_loss_weight", 1.0)) * image_value + float(settings.get("adversarial_loss_weight", 0.001)) * generator_value
        total.backward()
        optimizer.step()
        history.append({"step": step, "channel": channel_name, "loss": float(total.item()), "message_loss": float(message_value.item()), "image_mse": float(image_value.item()), "device": str(device)})

    checkpoint = output / "checkpoint.pt"
    torch.save({"config": values["model"], "state_dict": model.state_dict(), "history": history}, checkpoint)
    save_image(image[:1], output / "cover.png")
    manifest = {"paper": "HiDDeN", "kind": "tiny-set-overfit" if fixed_demo else ("dataset" if image_paths else "smoke"), "data_directory": data_root, "demo_message": selected_demo_message if fixed_demo else None, "config": values, "history": history, "checkpoint": str(checkpoint), "device": str(device), "note": "Fixed one-image demo. It validates learnability, not generalisation or paper reproduction." if fixed_demo else ("Synthetic smoke run. Not a paper reproduction." if not image_paths else "Local dataset run. Match paper settings before comparing results." )}
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps({"checkpoint": str(checkpoint), "manifest": str(output / 'manifest.json'), "device": str(device), "steps": len(history)}, indent=2))
    return checkpoint


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the HiDDeN smoke or reproduction configuration")
    parser.add_argument("--config", required=True, help="Path to a TOML configuration")
    parser.add_argument("--data-dir", default=None, help="Optional directory of JPG, PNG, or WebP cover images")
    parser.add_argument("--demo-message", default=None, help="Override the fixed payload used by a tiny-set demo")
    parser.add_argument("--output-dir", default=None, help="Override the output directory from the TOML file")
    args = parser.parse_args()
    train(args.config, args.data_dir, args.demo_message, args.output_dir)


if __name__ == "__main__":
    main()
