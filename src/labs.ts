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

const adapterLab = (slug: string, packageName: string, upstreamUrl: string, upstreamNote: string): PaperLab => ({
  slug,
  status: "Runnable locally",
  runtime: "Python 3.11 or 3.12 · PyTorch · CPU or CUDA",
  training: "The default run is a deterministic local adapter. Install Diffusers and provide model weights for the paper-scale backend.",
  upstream: [{ label: "Official implementation", url: upstreamUrl, note: upstreamNote }],
  commands: [
    { label: "Run demo", command: `cd /c/amos/research/latent-watermarking-101/implementations/${slug}\npython -m venv .venv\nsource .venv/Scripts/activate\npython -m pip install -e .\nexport PYTHONPATH=src\npython -m ${packageName}_lab.train --config configs/demo.toml`, output: "manifest.json written", purpose: "Run the smallest meaningful experiment.", interpretation: "Read the manifest and inspect the generated images before interpreting robustness." },
    { label: "Detect", command: `python -m ${packageName}_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png`, output: "Detection result written to stdout", purpose: "Recover the registered payload or score.", interpretation: "Detection is calibrated only for the local adapter unless a paper-scale model is supplied." },
    { label: "Evaluate attacks", command: `python -m ${packageName}_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png`, output: "Named attack results written to stdout", purpose: "Measure attack-specific degradation.", interpretation: "Do not treat these adapter results as published benchmark numbers." },
  ],
  codeMap: [{ concept: "Paper information path", paper: "See the lab README for the exact boundary.", upstream: "Official repository", upstreamUrl, local: `src/${packageName}_lab`, note: "The local adapter keeps frozen, trained and optimised components explicit." }],
  methodology: [{ title: "Expose the boundary", question: "What is actually changed?", method: "Run the paper mechanism through separate generation, detection and evaluation commands.", evidence: "The checkpoint and manifest record the run kind and artefacts." }],
  decisions: [{ decision: "Keep the adapter small", rationale: "Make the information path runnable on CPU.", consequence: "Paper-scale model, scheduler and dataset results require the optional backend." }],
  visuals: [],
  limitations: ["The default adapter is not a paper-scale benchmark reproduction.", "False-positive calibration and cross-model transfer remain to be measured with the official stack."],
});

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
        label: "Try a different message",
        command: "python -m hidden_lab.train --config configs/demo.toml --demo-message 01010101 --output-dir outputs/demo-custom\npython -m hidden_lab.embed --checkpoint outputs/demo-custom/checkpoint.pt --image outputs/demo-custom/cover.png --message 01010101 --output outputs/demo-custom/encoded.png\npython -m hidden_lab.extract --checkpoint outputs/demo-custom/checkpoint.pt --image outputs/demo-custom/encoded.png",
        output: "{\n  \"checkpoint\": \"outputs\\\\demo-custom\\\\checkpoint.pt\",\n  \"manifest\": \"outputs\\\\demo-custom\\\\manifest.json\",\n  \"device\": \"cpu\",\n  \"steps\": 300\n}\nencoded image written to outputs/demo-custom/encoded.png\n01010101",
        purpose: "Retrain the tiny-set demo for a new eight-bit payload, then embed and extract that same payload.",
        interpretation: "The output directory is separate so the recorded 10110010 demo remains unchanged. This is the correct way to test a different message with this intentionally fixed demonstration.",
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

Object.assign(paperLabs, {
  rosteals: {
    slug: "rosteals", status: "Runnable locally", runtime: "Python 3.11 or 3.12 · PyTorch · CPU or CUDA",
    training: "Compact latent-offset demo runs on CPU; the official model uses a frozen VQ-f4 autoencoder and a trained secret path.",
    upstream: [{ label: "Authors · RoSteALS", url: "https://github.com/TuBui/RoSteALS", note: "Official repository with inference, training configuration, a 100-bit payload and released checkpoints." }],
    commands: [
      { label: "Install and train", command: "cd /c/amos/research/latent-watermarking-101/implementations/rosteals\npython -m venv .venv\nsource .venv/Scripts/activate\npython -m pip install -e .\nexport PYTHONPATH=src\npython -m rosteals_lab.train --config configs/demo.toml", output: '{\n  "device": "cpu",\n  "steps": 600,\n  "test_message": "0111111000001011",\n  "test_recovered": "0111111000001011",\n  "bit_error_rate": 0.0\n}', purpose: "Train the small message-to-latent offset and image-space decoder.", interpretation: "The clean held-out message is recovered exactly. This validates the local information path, not the paper's 100-bit VQ-f4 checkpoint." },
      { label: "Embed a new payload", command: "python -m rosteals_lab.embed --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/cover.png --message 0101010101010101 --output outputs/demo/encoded-custom.png\npython -m rosteals_lab.extract --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded-custom.png", output: "encoded image written to outputs/demo/encoded-custom.png\n0101010101010101", purpose: "Change the payload without changing the trained model.", interpretation: "The local decoder is trained for 16-bit messages. The official RoSteALS protocol uses a 100-bit code before BCH correction." },
      { label: "Evaluate attacks", command: "python -m rosteals_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/encoded-custom.png --message 0101010101010101 --attacks identity,blur,crop,jpeg", output: '[\n  { "attack": "identity", "bit_error_rate": 0.0, "exact": true },\n  { "attack": "blur", "bit_error_rate": 0.0, "exact": true },\n  { "attack": "crop", "bit_error_rate": 0.25, "exact": false },\n  { "attack": "jpeg", "bit_error_rate": 0.0, "exact": true }\n]', purpose: "Separate clean extraction from robustness under named image operations.", interpretation: "Crop is a visible failure for this compact run. Do not infer the official model's robustness from this proxy." },
    ],
    codeMap: [
      { concept: "Frozen latent autoencoder", paper: "Encode a cover into a latent representation and decode it after adding a learned offset.", upstream: "models/VQ4_mir_inference.yaml · inference.py", upstreamUrl: "https://github.com/TuBui/RoSteALS/blob/main/inference.py", local: "src/rosteals_lab/model.py · FrozenAutoencoder", note: "The local adapter is deterministic and small; it is not the released VQ-f4 checkpoint." },
      { concept: "Message-to-latent offset", paper: "Map the secret bits to an additive latent perturbation.", upstream: "Embed_Secret.py", upstreamUrl: "https://github.com/TuBui/RoSteALS/blob/main/Embed_Secret.py", local: "src/rosteals_lab/model.py · SecretEncoder", note: "The offset is bounded before it is added to the base latent." },
      { concept: "Image-space decoder", paper: "Recover the secret from the generated image.", upstream: "models/decoder.py", upstreamUrl: "https://github.com/TuBui/RoSteALS/tree/main/models", local: "src/rosteals_lab/model.py · SecretDecoder", note: "Blind extraction receives only the image." },
    ],
    methodology: [
      { title: "Start at the representation boundary", question: "What is learned and what stays fixed?", method: "Freeze the image autoencoder and train only the secret encoder and decoder.", evidence: "The checkpoint contains trainable secret modules while the autoencoder has no optimiser parameters." },
      { title: "Make the offset measurable", question: "Can the payload be traced into the latent?", method: "Save base latent, offset and encoded image, then amplify the image residual for inspection.", evidence: "Every run writes autoencoded, encoded and residual_amplified images plus a manifest." },
      { title: "Test message capacity separately", question: "Does a changed payload use the same trained path?", method: "Train once, embed a second 16-bit message, and extract it from a new encoded image.", evidence: "The custom payload command has an exact clean recovery output." },
    ],
    decisions: [
      { decision: "Use a compact frozen autoencoder", rationale: "The official VQ-f4 and checkpoint are large and tied to an older environment.", consequence: "This is a mechanism lab, not a visual or numerical reproduction of the released model." },
      { decision: "Keep 16 bits locally", rationale: "It makes experiments fast and avoids pretending BCH and 100-bit capacity are implemented.", consequence: "Protocol capacity must be tested separately against the official code." },
    ],
    visuals: [
      { src: "/latent-watermarking-101/experiments/rosteals/cover.png", label: "Cover", description: "Deterministic synthetic cover used for the local run." },
      { src: "/latent-watermarking-101/experiments/rosteals/autoencoded.png", label: "Autoencoded cover", description: "The frozen latent autoencoder reconstruction." },
      { src: "/latent-watermarking-101/experiments/rosteals/encoded.png", label: "Encoded image", description: "The cover after adding the learned message offset." },
      { src: "/latent-watermarking-101/experiments/rosteals/residual_amplified.png", label: "Residual ×8", description: "Amplified difference between encoded and autoencoded images." },
    ],
    limitations: ["The local adapter does not load the official VQ-f4 autoencoder or 520 MB checkpoint.", "The local payload is 16 bits and omits the paper repository's BCH protocol.", "The synthetic cover and 600-step run are for mechanism inspection, not paper-scale quality or robustness claims."],
  },
  "stable-signature": {
    slug: "stable-signature", status: "Runnable locally", runtime: "Python 3.11 or 3.12 · PyTorch · CPU or CUDA",
    training: "Compact decoder fine-tuning demo runs on CPU; the official path fine-tunes a Stable Diffusion VAE decoder against a pretrained robust extractor.",
    upstream: [{ label: "Authors · Facebook Research", url: "https://github.com/facebookresearch/stable_signature", note: "Official repository with extractor checkpoints, decoder fine-tuning and attack evaluation scripts." }],
    commands: [
      { label: "Install and fine-tune", command: "cd /c/amos/research/latent-watermarking-101/implementations/stable-signature\npython -m venv .venv\nsource .venv/Scripts/activate\npython -m pip install -e .\nexport PYTHONPATH=src\npython -m stable_signature_lab.train --config configs/demo.toml", output: '{\n  "device": "cpu",\n  "steps": 700,\n  "bit_error_rate": 0.0\n}', purpose: "Fine-tune a decoder while a fixed 48-bit extractor supplies the watermark loss.", interpretation: "The marked decoder recovers its registered 48-bit key cleanly. The local extractor is a deterministic carrier bank, not the official pretrained extractor." },
      { label: "Detect and score", command: "python -m stable_signature_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/marked_decoder.png", output: '{\n  "agreements": 48,\n  "bits": 48,\n  "null_tail_probability": 3.55e-15\n}', purpose: "Recover the key and quantify how surprising the agreement is under a 50/50 null model.", interpretation: "This demonstrates the detection statistic and registered-key boundary. Threshold calibration on negatives is still required." },
      { label: "Evaluate attacks", command: "python -m stable_signature_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/marked_decoder.png --attacks identity,blur,crop,jpeg", output: '[\n  { "attack": "identity", "bit_error_rate": 0.0 },\n  { "attack": "blur", "bit_error_rate": 0.1458 },\n  { "attack": "crop", "bit_error_rate": 0.4583 },\n  { "attack": "jpeg", "bit_error_rate": 0.0625 }\n]', purpose: "Measure extraction under explicit image attacks.", interpretation: "The attack results show why a clean pass is not the same as robustness. The official project evaluates a broader attack suite." },
    ],
    codeMap: [
      { concept: "Fixed robust extractor", paper: "Use a pretrained decoder to turn the image into watermark logits.", upstream: "src/decoder.py", upstreamUrl: "https://github.com/facebookresearch/stable_signature/blob/main/src/decoder.py", local: "src/stable_signature_lab/model.py · FixedExtractor", note: "The local carrier bank preserves the fixed-extractor training boundary." },
      { concept: "Marked VAE decoder", paper: "Fine-tune the generator decoder while preserving image quality.", upstream: "finetune_ldm_decoder.py", upstreamUrl: "https://github.com/facebookresearch/stable_signature/blob/main/finetune_ldm_decoder.py", local: "src/stable_signature_lab/train.py", note: "The local base and marked decoders share the same architecture and compare image MSE." },
      { concept: "Statistical detection", paper: "Use agreement with a registered key rather than free-form message decoding.", upstream: "run_evals.py", upstreamUrl: "https://github.com/facebookresearch/stable_signature/blob/main/run_evals.py", local: "src/stable_signature_lab/stats.py · detect.py", note: "The local tail probability is a binomial null score." },
    ],
    methodology: [
      { title: "Freeze the detector first", question: "Where does the watermark target come from?", method: "Register one fixed 48-bit key and optimise the decoder against fixed extractor logits.", evidence: "The key is stored in checkpoint and manifest; extractor parameters never enter the optimiser." },
      { title: "Compare marked and base outputs", question: "What quality pressure is applied?", method: "Decode the same latent with a frozen base decoder and the fine-tuned marked decoder, then penalise MSE.", evidence: "The run writes base_decoder, marked_decoder and amplified residual images." },
      { title: "Separate detection from calibration", question: "Is an agreement meaningful?", method: "Report agreements and a binomial upper-tail probability, then evaluate real negative images before choosing a threshold.", evidence: "The detector output exposes the null probability instead of only printing recovered bits." },
    ],
    decisions: [
      { decision: "Use a deterministic extractor locally", rationale: "The official extractor checkpoints and Stable Diffusion stack are heavy for a first inspection loop.", consequence: "Robustness and calibration numbers cannot be compared with the paper." },
      { decision: "Train one registered key", rationale: "This mirrors the simplest official fine-tuning command and keeps attribution explicit.", consequence: "Multi-key capacity and key management remain future experiments." },
    ],
    visuals: [
      { src: "/latent-watermarking-101/experiments/stable-signature/base_decoder.png", label: "Base decoder", description: "Output before watermark fine-tuning." },
      { src: "/latent-watermarking-101/experiments/stable-signature/marked_decoder.png", label: "Marked decoder", description: "Output after fine-tuning against the fixed key." },
      { src: "/latent-watermarking-101/experiments/stable-signature/residual_amplified.png", label: "Residual ×8", description: "Amplified visual difference between base and marked output." },
    ],
    limitations: ["The local renderer is a small transposed-convolution decoder, not a Stable Diffusion VAE decoder.", "The local extractor is synthetic and does not use the official whitened robust decoder checkpoint.", "Attack outputs are illustrative and do not establish the paper's COCO, FID, LPIPS or false-positive results."],
  },
  zodiac: {
    slug: "zodiac", status: "Runnable locally", runtime: "Python 3.11 or 3.12 · PyTorch · CPU or CUDA",
    training: "No reusable watermark network is trained; one latent is optimised for one image and key.",
    upstream: [{ label: "Authors · ZoDiac", url: "https://github.com/zhanglijun95/ZoDiac", note: "Official notebook-oriented implementation with Stable Diffusion inversion, trainable latents and attack modules." }],
    commands: [
      { label: "Optimise one image", command: "cd /c/amos/research/latent-watermarking-101/implementations/zodiac\npython -m venv .venv\nsource .venv/Scripts/activate\npython -m pip install -e .\nexport PYTHONPATH=src\npython -m zodiac_lab.optimise --config configs/demo.toml --message 0101010101010101", output: '{\n  "per_image_optimisation": true,\n  "steps": 450,\n  "recovered": "0101010101010101",\n  "bit_error_rate": 0.0\n}', purpose: "Invert a latent proxy, optimise that latent for the target signature, and render the result.", interpretation: "The clean pass confirms the optimisation loop. It is not a trained encoder and it does not claim Stable Diffusion fidelity." },
      { label: "Detect", command: "python -m zodiac_lab.detect --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png", output: '{\n  "message": "0101010101010101",\n  "recovered": "0101010101010101",\n  "bit_error_rate": 0.0,\n  "exact": true\n}', purpose: "Run the image-space detector against the saved optimised result.", interpretation: "The checkpoint stores the optimised latent and target message for this one image only." },
      { label: "Evaluate attacks", command: "python -m zodiac_lab.evaluate --checkpoint outputs/demo/checkpoint.pt --image outputs/demo/watermarked.png --attacks identity,blur,crop,jpeg", output: '[\n  { "attack": "identity", "bit_error_rate": 0.0 },\n  { "attack": "blur", "bit_error_rate": 0.4375 },\n  { "attack": "crop", "bit_error_rate": 0.0 },\n  { "attack": "jpeg", "bit_error_rate": 0.3125 }\n]', purpose: "Show the trade-off between latent optimisation and post-processing robustness.", interpretation: "Blur and JPEG break this compact signature. Robustness requires attack-aware optimisation and a matched diffusion evaluation." },
    ],
    codeMap: [
      { concept: "Inversion and rendering", paper: "Map a cover image into a diffusion latent and render it back.", upstream: "wmdiffusion.py", upstreamUrl: "https://github.com/zhanglijun95/ZoDiac/blob/master/main/wmdiffusion.py", local: "src/zodiac_lab/model.py · FixedDiffusionProxy", note: "The local renderer is frozen so the optimisation boundary is visible." },
      { concept: "Trainable latent", paper: "Optimise selected latent degrees of freedom for watermark evidence.", upstream: "watermarker.py · wmpatch.py", upstreamUrl: "https://github.com/zhanglijun95/ZoDiac/tree/master/main", local: "src/zodiac_lab/optimise.py", note: "The latent, not a network, receives gradients for each image." },
      { concept: "Attack and detector loop", paper: "Reconstruct and test the watermark after transformations.", upstream: "wmattacker.py · attackerpipe.py", upstreamUrl: "https://github.com/zhanglijun95/ZoDiac/tree/master/main", local: "src/zodiac_lab/evaluate.py", note: "Named image operations make each failure inspectable." },
    ],
    methodology: [
      { title: "Mark the optimisation boundary", question: "What is trained once versus per image?", method: "Keep the renderer and detector fixed, then optimise one latent for one target message.", evidence: "The checkpoint stores the latent itself and the manifest labels per_image_optimisation true." },
      { title: "Preserve the cover by construction", question: "How is visual drift controlled?", method: "Use the inversion reconstruction as the image target and penalise latent deviation while increasing detector score.", evidence: "The run writes inversion, watermarked and amplified residual images plus loss history." },
      { title: "Measure attack-specific failure", question: "What does the signature survive?", method: "Apply blur, crop and JPEG separately and report bit error rather than a single success label.", evidence: "The example run exposes large blur and JPEG errors." },
    ],
    decisions: [
      { decision: "Use one fixed renderer", rationale: "It isolates latent optimisation before introducing a full Stable Diffusion installation.", consequence: "Prompt semantics, scheduler choice and inversion error are not represented locally." },
      { decision: "Optimise all latent channels", rationale: "It makes the gradient path easy to inspect in a small demonstration.", consequence: "A paper-faithful implementation should restrict and schedule latent coefficients as the official code does." },
    ],
    visuals: [
      { src: "/latent-watermarking-101/experiments/zodiac/inversion.png", label: "Inversion", description: "The frozen renderer's reconstruction before watermark optimisation." },
      { src: "/latent-watermarking-101/experiments/zodiac/watermarked.png", label: "Watermarked", description: "The image after per-image latent optimisation." },
      { src: "/latent-watermarking-101/experiments/zodiac/residual_amplified.png", label: "Residual ×8", description: "Amplified difference between inversion and optimised output." },
    ],
    limitations: ["The local renderer is not Stable Diffusion and has no prompt or scheduler semantics.", "The optimisation is a compact proxy for the official inversion and latent-frequency procedure.", "The saved checkpoint is tied to one image and message; it is not a reusable encoder."],
  },
  "tree-rings": adapterLab("tree-rings", "paper", "https://github.com/YuxinWenRick/tree-ring-watermark", "Official Tree-Rings implementation."),
  "gaussian-shading": adapterLab("gaussian-shading", "paper", "https://github.com/bsmhmmlf/Gaussian-Shading", "Official Gaussian Shading implementation with DDIM inversion."),
  seal: adapterLab("seal", "paper", "https://github.com/Kasraarabi/SEAL", "Official SEAL implementation; the local adapter demonstrates semantic-key derivation and verification."),
  lawa: adapterLab("lawa", "rosteals", "https://github.com/vbdi/LaWa", "Official LaWa implementation; the local adapter exposes coarse-to-fine latent watermark modules."),
  aqualora: adapterLab("aqualora", "stable_signature", "https://github.com/Georgefwt/AquaLoRA", "Official AquaLoRA implementation; the local adapter exposes rank-limited watermark updates."),
} satisfies Record<string, PaperLab>);

export function getLab(slug: string) {
  return paperLabs[slug];
}
