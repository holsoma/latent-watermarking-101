import argparse
import json
from pathlib import Path

import torch
import torch.nn.functional as F

from .io import save_image
from .model import SignatureModel, StableSignatureConfig, bits_to_tensor, logits_to_bits


def read_config(path: str | Path) -> dict:
    values = {}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.split("#", 1)[0].strip()
        if not line or "=" not in line:
            continue
        key, value = [part.strip() for part in line.split("=", 1)]
        if value.startswith('"'):
            values[key] = value.strip('"')
        elif "." in value:
            values[key] = float(value)
        else:
            values[key] = int(value)
    return values


def make_latents(config, batch, generator, device):
    return torch.randn(batch, config.latent_channels, config.latent_size, config.latent_size, generator=generator, device=device)


def train(args):
    values = read_config(args.config)
    config = StableSignatureConfig(**{k: values[k] for k in StableSignatureConfig.__dataclass_fields__ if k in values})
    output = Path(args.output_dir or values.get("output_dir", "outputs/demo"))
    output.mkdir(parents=True, exist_ok=True)
    torch.manual_seed(values.get("seed", 23))
    device = torch.device("cuda" if torch.cuda.is_available() and not args.cpu else "cpu")
    generator = torch.Generator(device=device).manual_seed(values.get("seed", 23))

    model = SignatureModel(config).to(device)
    for parameter in model.extractor.parameters():
        parameter.requires_grad_(False)
    model.extractor.eval()
    base_decoder = type(model.decoder)(config).to(device)
    base_decoder.load_state_dict(model.decoder.state_dict())
    base_decoder.eval()
    for parameter in base_decoder.parameters():
        parameter.requires_grad_(False)
    optimiser = torch.optim.AdamW(model.decoder.parameters(), lr=float(values.get("learning_rate", .003)))
    key = torch.randint(0, 2, (config.message_length,), generator=generator, device=device).float()
    target = key
    history = []
    for step in range(1, int(values.get("steps", 700)) + 1):
        latent = make_latents(config, int(values.get("batch_size", 8)), generator, device)
        with torch.no_grad():
            base = base_decoder(latent)
        marked = model.decode(latent)
        logits = model.logits(marked)
        watermark_loss = F.binary_cross_entropy_with_logits(logits, target.expand_as(logits))
        image_loss = F.mse_loss(marked, base)
        loss = float(values.get("watermark_loss_weight", 1.0)) * watermark_loss + float(values.get("image_loss_weight", .35)) * image_loss
        optimiser.zero_grad(set_to_none=True)
        loss.backward()
        optimiser.step()
        if step == 1 or step % max(1, int(values.get("steps", 700)) // 5) == 0:
            history.append({"step": step, "loss": float(loss.detach()), "watermark_loss": float(watermark_loss.detach()), "image_loss": float(image_loss.detach())})

    model.eval()
    fixed_latent = make_latents(config, 1, generator, device)
    with torch.no_grad():
        base_image = base_decoder(fixed_latent)
        marked_image = model.decode(fixed_latent)
        recovered = logits_to_bits(model.logits(marked_image))
    key_text = logits_to_bits(target.mul(2).sub(1))
    errors = sum(a != b for a, b in zip(key_text, recovered))
    save_image(base_image, output / "base_decoder.png")
    save_image(marked_image, output / "marked_decoder.png")
    save_image((marked_image - base_image) * 8, output / "residual_amplified.png")
    checkpoint = output / "checkpoint.pt"
    torch.save({"config": config.to_dict(), "decoder": model.decoder.state_dict(), "key": key_text, "history": history}, checkpoint)
    manifest = {"schema_version": "1.0", "paper_slug": "stable-signature", "method": "stable-signature", "run_kind": "fixed-key-decoder-finetune", "status": "completed", "local_adapter": True, "device": str(device), "seed": int(values.get("seed", 23)), "steps": int(values.get("steps", 700)), "key": key_text, "recovered": recovered, "bit_error_rate": errors / config.message_length, "artifacts": ["checkpoint.pt", "base_decoder.png", "marked_decoder.png", "residual_amplified.png", "manifest.json"], "history": history, "checkpoint": str(checkpoint)}
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Fine-tune a decoder against a fixed image signature.")
    parser.add_argument("--config", required=True)
    parser.add_argument("--output-dir")
    parser.add_argument("--cpu", action="store_true")
    train(parser.parse_args())


if __name__ == "__main__":
    main()
