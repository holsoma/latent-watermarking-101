export type LabStatus = "Runnable locally" | "Implementation planned";

export type CodeMapRow = {
  concept: string;
  paper: string;
  upstream: string;
  upstreamUrl: string;
  local: string;
  note: string;
};

export type LabCommand = {
  label: string;
  command: string;
  output: string;
  purpose: string;
  interpretation: string;
};

export type MethodologyStep = {
  title: string;
  question: string;
  method: string;
  evidence: string;
};

export type DesignDecision = {
  decision: string;
  rationale: string;
  consequence: string;
};

export type LabVisual = {
  src: string;
  label: string;
  description: string;
};

export type PaperLab = {
  slug: string;
  status: LabStatus;
  runtime: string;
  training: string;
  upstream: { label: string; url: string; note: string }[];
  commands: LabCommand[];
  codeMap: CodeMapRow[];
  methodology: MethodologyStep[];
  decisions: DesignDecision[];
  visuals: LabVisual[];
  limitations: string[];
};

export const paperLabs: Record<string, PaperLab> = {
  hidden: {
    slug: "hidden",
    status: "Runnable locally",
    runtime: "Python 3.11 or 3.12 · PyTorch · CPU or CUDA",
    training: "A tiny-set demo is reproducible locally; paper-scale training is still required.",
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
        label: "Open the website",
        command: "cd /c/amos/research/latent-watermarking-101\ngit switch feat/hidden-implementation-lab\nnpm install\nnpm run dev",
        output: "> latent-watermarking-101@1.0.0 dev\n> vite\n\nVITE ready\nLocal: http://127.0.0.1:5173/latent-watermarking-101/",
        purpose: "Start the implementation guide from Git Bash.",
        interpretation: "Open the local URL and select Paper labs, then HiDDeN. Keep this terminal running while using the site.",
      },
      {
        label: "Install",
        command: "cd /c/amos/research/latent-watermarking-101/implementations/hidden\nPYTHON311='/c/Users/amosl/AppData/Local/Programs/Python/Python311/python.exe'\n\"$PYTHON311\" -m venv .venv\nsource .venv/Scripts/activate\npython -m pip install wheel\npython -m pip install --no-build-isolation -e '.[dev]'\nexport PYTHONPATH=src",
        output: "Successfully built hidden-lab\nSuccessfully installed hidden-lab-0.1.0",
        purpose: "Create an isolated environment for the lab.",
        interpretation: "The prompt should now begin with (.venv). Run the remaining commands from implementations/hidden in the same Git Bash session.",
      },
      {
        label: "Train the learning demo",
        command: "python -m hidden_lab.train --config configs/demo.toml",
        output: "{\n  \"checkpoint\": \"outputs\\\\demo\\\\checkpoint.pt\",\n  \"manifest\": \"outputs\\\\demo\\\\manifest.json\",\n  \"device\": \"cpu\",\n  \"steps\": 300\n}",
        purpose: "Overfit one deterministic cover and one eight-bit message for 300 identity-channel steps.",
        interpretation: "This is the first meaningful check: it asks whether the encoder-decoder pair can learn the communication path at all. It is still not a generalisation or paper-reproduction result.",
      },
      {
        label: "Smoke test",
        command: "python -m hidden_lab.train --config configs/smoke.toml",
        output: "{\n  \"checkpoint\": \"outputs\\\\smoke\\\\checkpoint.pt\",\n  \"manifest\": \"outputs\\\\smoke\\\\manifest.json\",\n  \"device\": \"cuda\",\n  \"steps\": 12\n}",
        purpose: "Run the optional fast plumbing check and write a checkpoint.",
        interpretation: "This proves that the model, optimiser, distortion selection, checkpoint writer and GPU path execute. It is deliberately short and should not be used to judge message accuracy.",
      },
      {
        label: "Embed and extract",
        command: "python -m hidden_lab.embed --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/cover.png --message 10110010 --output outputs/demo/encoded.png\npython -m hidden_lab.extract --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded.png",
        output: "encoded image written to outputs/demo/encoded.png\n10110010",
        purpose: "Write a message into a cover image, then recover it from the encoded image.",
        interpretation: "The demo reuses one fixed cover and message, so exact recovery is the expected pass condition. Change the message or cover and the experiment is no longer the same recorded run.",
      },
      {
        label: "Evaluate attacks",
        command: "python -m hidden_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/cover.png --message 10110010 --attacks identity,jpeg,crop,blur",
        output: "{\n  \"message\": \"10110010\",\n  \"results\": [\n    { \"attack\": \"identity\", \"bit_error_rate\": 0.0, \"exact_message\": true },\n    { \"attack\": \"jpeg\", \"bit_error_rate\": 0.0, \"exact_message\": true },\n    { \"attack\": \"crop\", \"bit_error_rate\": 0.0, \"exact_message\": true },\n    { \"attack\": \"blur\", \"bit_error_rate\": 0.0, \"exact_message\": true }\n  ]\n}",
        purpose: "Measure bit error and exact-message recovery under named distortions.",
        interpretation: "Identity should be the clean baseline. The other attacks can still fail because this demo deliberately trains only the identity channel; robustness is the next experiment, not a hidden property of this checkpoint.",
      },
    ],
    codeMap: [
      {
        concept: "Encoder message injection",
        paper: "Encoder concatenates image features with the broadcast message.",
        upstream: "model/encoder.py",
        upstreamUrl: "https://github.com/ando-khachatryan/HiDDeN/blob/master/model/encoder.py",
        local: "src/hidden_lab/model.py · Encoder",
        note: "The message is expanded to H × W before concatenation.",
      },
      {
        concept: "Communication channel",
        paper: "Training includes sampled image distortions.",
        upstream: "noise_layers/noiser.py",
        upstreamUrl: "https://github.com/ando-khachatryan/HiDDeN/blob/master/noise_layers/noiser.py",
        local: "src/hidden_lab/noise/",
        note: "The local lab makes each distortion independently testable.",
      },
      {
        concept: "Blind extraction",
        paper: "The decoder predicts the binary message from the received image.",
        upstream: "model/decoder.py",
        upstreamUrl: "https://github.com/ando-khachatryan/HiDDeN/blob/master/model/decoder.py",
        local: "src/hidden_lab/model.py · Decoder",
        note: "No original cover image is supplied to the decoder.",
      },
      {
        concept: "Visual quality pressure",
        paper: "An adversary discourages detectable encoded-image artefacts.",
        upstream: "model/discriminator.py · model/hidden.py",
        upstreamUrl: "https://github.com/ando-khachatryan/HiDDeN/blob/master/model/hidden.py",
        local: "src/hidden_lab/model.py · train.py",
        note: "The loss terms and weights are recorded in every experiment manifest.",
      },
    ],
    methodology: [
      {
        title: "Define the claim before writing code",
        question: "What must this implementation demonstrate?",
        method: "Reduce HiDDeN to a communication path: cover and bits enter an encoder, a channel alters the encoded image, and a blind decoder recovers the bits.",
        evidence: "A forward pass must expose encoded image, received image and decoded logits as separate outputs.",
      },
      {
        title: "Triangulate the sources",
        question: "Which source decides behaviour when implementations differ?",
        method: "Use the paper for the method claim, the authors' Torch7 repository for original intent, and the community PyTorch port for a readable implementation comparison.",
        evidence: "Every important component is mapped to a paper statement, upstream path and local class.",
      },
      {
        title: "Build the smallest falsifiable path",
        question: "Can the complete system execute before expensive training begins?",
        method: "First reuse one deterministic cover and eight-bit payload to test learnability. Then use synthetic covers, small feature widths and twelve rotating channels to exercise every subsystem without claiming accuracy.",
        evidence: "The demo must recover its fixed payload; the smoke run must write a checkpoint, manifest and cover image, then support embedding, extraction and attack evaluation.",
      },
      {
        title: "Separate mechanical and empirical validation",
        question: "Does running code reproduce the research result?",
        method: "Treat shape checks and smoke execution as mechanical validation. Reserve reproduction claims for matched data, schedules, attacks, payload and metrics.",
        evidence: "The smoke output is labelled under-trained, including its failed exact-message result.",
      },
      {
        title: "Design the next experiment from failure",
        question: "What should change after the smoke run?",
        method: "First overfit a tiny fixed dataset, then introduce each distortion separately, then compare proxy and real image operations.",
        evidence: "Progress is measured by clean bit error, exact-message recovery, fidelity and attack curves, not by loss alone.",
      },
    ],
    decisions: [
      {
        decision: "Write a modern PyTorch implementation",
        rationale: "Torch7 is difficult to install and inspect in a current Windows workflow.",
        consequence: "The lab must record deviations and cannot claim byte-for-byte equivalence with the authors' code.",
      },
      {
        decision: "Keep Python outside the React runtime",
        rationale: "GitHub Pages is static and cannot train a PyTorch model.",
        consequence: "The site teaches and displays results; the local command line performs training and inference.",
      },
      {
        decision: "Start with synthetic covers",
        rationale: "A smoke run should fail quickly on code defects without requiring a COCO download.",
        consequence: "Its accuracy and fidelity values are not paper-comparable.",
      },
      {
        decision: "Label differentiable JPEG as a proxy",
        rationale: "Straight-through quantisation permits gradients but is not a real JPEG codec.",
        consequence: "A later experiment must test a real encoder at explicit quality levels.",
      },
    ],
    visuals: [
      {
        src: "/latent-watermarking-101/experiments/hidden/cover.png",
        label: "Cover image",
        description: "The deterministic cover presented to the encoder.",
      },
      {
        src: "/latent-watermarking-101/experiments/hidden/encoded.png",
        label: "Encoded image",
        description: "The encoder output carrying the eight-bit payload.",
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
