export type LabStatus = "Runnable locally" | "Implementation planned";

export type CodeMapRow = {
  concept: string;
  paper: string;
  upstream: string;
  local: string;
  note: string;
};

export type LabCommand = {
  label: string;
  command: string;
  purpose: string;
};

export type PaperLab = {
  slug: string;
  status: LabStatus;
  runtime: string;
  training: string;
  upstream: { label: string; url: string; note: string }[];
  commands: LabCommand[];
  codeMap: CodeMapRow[];
  limitations: string[];
};

export const paperLabs: Record<string, PaperLab> = {
  hidden: {
    slug: "hidden",
    status: "Runnable locally",
    runtime: "Python 3.11 or 3.12 · PyTorch · CPU or CUDA",
    training: "Training required. No pre-trained checkpoint is bundled.",
    upstream: [
      {
        label: "Authors · Lua/Torch7",
        url: "https://github.com/jirenz/HiDDeN",
        note: "The reference repository. It is marked work in progress and provides a small debug dataset, not a released checkpoint.",
      },
      {
        label: "Community · PyTorch",
        url: "https://github.com/ando-khachatryan/HiDDeN",
        note: "A readable port with configurable noise layers. Its README says the paper results were not fully reproduced.",
      },
    ],
    commands: [
      {
        label: "Install",
        command: "cd implementations/hidden\npython -m venv .venv\n.venv\\Scripts\\Activate.ps1\npip install -e \".[dev]\"",
        purpose: "Create an isolated environment for the lab.",
      },
      {
        label: "Smoke test",
        command: "python -m hidden_lab.train --config configs/smoke.toml",
        purpose: "Run a small end-to-end training pass and write a checkpoint.",
      },
      {
        label: "Embed and extract",
        command: "python -m hidden_lab.embed --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/cover.png --message 10110110 --output outputs/smoke/encoded.png\npython -m hidden_lab.extract --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/encoded.png",
        purpose: "Write a message into a cover image, then recover it from the encoded image.",
      },
      {
        label: "Evaluate attacks",
        command: "python -m hidden_lab.evaluate --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/cover.png --attacks identity,jpeg,crop,blur",
        purpose: "Measure bit error and exact-message recovery under named distortions.",
      },
    ],
    codeMap: [
      {
        concept: "Encoder message injection",
        paper: "Encoder concatenates image features with the broadcast message.",
        upstream: "model/encoder.py",
        local: "src/hidden_lab/model.py · Encoder",
        note: "The message is expanded to H × W before concatenation.",
      },
      {
        concept: "Communication channel",
        paper: "Training includes sampled image distortions.",
        upstream: "noise_layers/noiser.py",
        local: "src/hidden_lab/noise/",
        note: "The local lab makes each distortion independently testable.",
      },
      {
        concept: "Blind extraction",
        paper: "The decoder predicts the binary message from the received image.",
        upstream: "model/decoder.py",
        local: "src/hidden_lab/model.py · Decoder",
        note: "No original cover image is supplied to the decoder.",
      },
      {
        concept: "Visual quality pressure",
        paper: "An adversary discourages detectable encoded-image artefacts.",
        upstream: "model/discriminator.py · model/hidden.py",
        local: "src/hidden_lab/model.py · train.py",
        note: "The loss terms and weights are recorded in every experiment manifest.",
      },
    ],
    limitations: [
      "This is a modern, readable reimplementation, not a claim of exact paper reproduction.",
      "The original paper uses COCO-derived data and reports settings that must be matched before comparing numbers.",
      "Differentiable JPEG is a training proxy. Real codec behaviour must be evaluated separately.",
    ],
  },
};

export function getLab(slug: string) {
  return paperLabs[slug];
}
