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
        label: "Open the website",
        command: "cd /c/amos/research/latent-watermarking-101\ngit switch feat/hidden-implementation-lab\nnpm install\nnpm run dev",
        output: "> latent-watermarking-101@1.0.0 dev\n> vite\n\nVITE ready\nLocal: http://127.0.0.1:5173/latent-watermarking-101/",
        purpose: "Start the implementation guide from Git Bash.",
        interpretation: "Open the local URL and select Paper labs, then HiDDeN. Keep this terminal running while using the site.",
      },
      {
        label: "Install",
        command: "cd /c/amos/research/latent-watermarking-101/implementations/hidden\nPYTHON311='/c/Users/amosl/AppData/Local/Programs/Python/Python311/python.exe'\n\"$PYTHON311\" -m venv .venv\nsource .venv/Scripts/activate\npython -m pip install -e '.[dev]'\nexport PYTHONPATH=src",
        output: "Successfully built hidden-lab\nSuccessfully installed hidden-lab-0.1.0",
        purpose: "Create an isolated environment for the lab.",
        interpretation: "The prompt should now begin with (.venv). Run the remaining commands from implementations/hidden in the same Git Bash session.",
      },
      {
        label: "Smoke test",
        command: "python -m hidden_lab.train --config configs/smoke.toml",
        output: "{\n  \"checkpoint\": \"outputs\\\\smoke\\\\checkpoint.pt\",\n  \"manifest\": \"outputs\\\\smoke\\\\manifest.json\",\n  \"device\": \"cuda\",\n  \"steps\": 12\n}",
        purpose: "Run a small end-to-end training pass and write a checkpoint.",
        interpretation: "This proves that the model, optimiser, distortion selection, checkpoint writer and GPU path execute. Twelve steps are not enough to establish message accuracy.",
      },
      {
        label: "Embed and extract",
        command: "python -m hidden_lab.embed --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/cover.png --message 10110110 --output outputs/smoke/encoded.png\npython -m hidden_lab.extract --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/encoded.png",
        output: "encoded image written to outputs/smoke/encoded.png\n01101101",
        purpose: "Write a message into a cover image, then recover it from the encoded image.",
        interpretation: "This is the verified output from the 12-step smoke checkpoint. The recovered bits do not match the input, which is expected from an intentionally under-trained model.",
      },
      {
        label: "Evaluate attacks",
        command: "python -m hidden_lab.evaluate --checkpoint outputs/smoke/checkpoint.pt --image outputs/smoke/cover.png --attacks identity,jpeg,crop,blur",
        output: "{\n  \"message\": \"10101010\",\n  \"results\": [\n    { \"attack\": \"identity\", \"bit_error_rate\": 0.625, \"exact_message\": false },\n    { \"attack\": \"jpeg\", \"bit_error_rate\": 0.625, \"exact_message\": false },\n    { \"attack\": \"crop\", \"bit_error_rate\": 0.625, \"exact_message\": false },\n    { \"attack\": \"blur\", \"bit_error_rate\": 0.625, \"exact_message\": false }\n  ]\n}",
        purpose: "Measure bit error and exact-message recovery under named distortions.",
        interpretation: "Identical poor scores across attacks show that this checkpoint has not learned the message channel yet. They do not show that the attacks are harmless.",
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
        method: "Use synthetic covers, an eight-bit payload, small feature widths and twelve steps. Exercise every subsystem without claiming accuracy.",
        evidence: "The run writes a checkpoint, manifest and cover image, then supports embedding, extraction and attack evaluation.",
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
