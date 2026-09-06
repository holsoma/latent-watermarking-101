import argparse
import json
from pathlib import Path

import torch
import torch.nn.functional as F

from .io import save_image
from .model import ZodiacConfig, FixedDiffusionProxy, FrequencyDetector, bits_to_tensor, logits_to_bits


def read_config(path):
    values = {}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.split("#", 1)[0].strip()
        if not line or "=" not in line: continue
        key, value = [part.strip() for part in line.split("=", 1)]
        values[key] = value.strip('"') if value.startswith('"') else (float(value) if "." in value else int(value))
    return values


def optimise(args):
    values = read_config(args.config)
    config = ZodiacConfig(**{k: values[k] for k in ZodiacConfig.__dataclass_fields__ if k in values})
    output = Path(args.output_dir or values.get("output_dir", "outputs/demo")); output.mkdir(parents=True, exist_ok=True)
    seed = int(values.get("seed", 31)); torch.manual_seed(seed)
    device = torch.device("cuda" if torch.cuda.is_available() and not args.cpu else "cpu")
    renderer = FixedDiffusionProxy(config).to(device); detector = FrequencyDetector(config).to(device)
    key = args.message or "1011001110001111"
    if len(key) != config.message_length: raise ValueError(f"message must be {config.message_length} bits")
    target = bits_to_tensor(key, device).mul(2).sub(1)
    latent = torch.randn(1, config.latent_channels, config.latent_size, config.latent_size, device=device, requires_grad=True)
    with torch.no_grad():
        inversion = renderer(latent.detach())
    optimiser = torch.optim.Adam([latent], lr=float(values.get("learning_rate", .08)))
    history = []
    for step in range(1, int(values.get("steps", 450)) + 1):
        image = renderer(latent)
        logits = detector(image)
        watermark_loss = F.mse_loss(logits.squeeze(0), target)
        image_loss = F.mse_loss(image, inversion)
        frequency_loss = latent[:, 2:].square().mean()
        loss = float(values.get("watermark_loss_weight", 1.0))*watermark_loss + float(values.get("image_loss_weight", 3.0))*image_loss + float(values.get("frequency_penalty", .02))*frequency_loss
        optimiser.zero_grad(set_to_none=True); loss.backward(); optimiser.step()
        if step == 1 or step % max(1, int(values.get("steps", 450)) // 5) == 0:
            history.append({"step": step, "loss": float(loss.detach()), "watermark_loss": float(watermark_loss.detach()), "image_loss": float(image_loss.detach())})
    with torch.no_grad():
        encoded = renderer(latent); recovered = logits_to_bits(detector(encoded))
    errors = sum(a != b for a,b in zip(key, recovered))
    save_image(inversion, output / "inversion.png"); save_image(encoded, output / "watermarked.png"); save_image((encoded-inversion)*8, output / "residual_amplified.png")
    torch.save({"config": config.to_dict(), "latent": latent.detach().cpu(), "message": key, "history": history}, output / "checkpoint.pt")
    manifest = {"method":"zodiac", "local_adapter":True, "per_image_optimisation":True, "device":str(device), "steps":int(values.get("steps",450)), "message":key, "recovered":recovered, "bit_error_rate":errors/config.message_length, "history":history, "checkpoint":str(output/"checkpoint.pt")}
    (output/"manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8"); print(json.dumps(manifest, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Optimise one diffusion latent for a target watermark.")
    parser.add_argument("--config", required=True); parser.add_argument("--output-dir"); parser.add_argument("--message"); parser.add_argument("--cpu", action="store_true")
    optimise(parser.parse_args())


if __name__ == "__main__": main()
