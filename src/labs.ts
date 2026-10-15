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
  evidenceUrl?: string;
};

export type PaperLab = {
  slug: string;
  labKind?: "prerequisite-exercise" | "mechanism-demonstration";
  runtimeStatus?: string;
  verificationStatus?: string;
  verificationScope?: string;
  resultKind?: string;
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


type LabDefinition = { slug: string; packageName: string; upstreamUrl: string; boundary: string };
const definitions: LabDefinition[] = [
  {
    "slug": "aqualora",
    "packageName": "stable_signature_lab",
    "upstreamUrl": "https://github.com/Georgefwt/AquaLoRA",
    "boundary": "Rank-limited latent updates illustrate adaptation. This is not AquaLoRA weight-space training."
  },
  {
    "slug": "gaussian-shading",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/bsmhmmlf/Gaussian-Shading",
    "boundary": "A compact CPU teaching implementation. Frozen proxy components and small synthetic examples do not establish paper-level performance."
  },
  {
    "slug": "gaussian-shading-plus-plus",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/THU-BPM/MarkDiffusion",
    "boundary": "Repeated sign mapping prerequisite. Seed transport and soft-decoding claims are not verified."
  },
  {
    "slug": "gaussian-shannon",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/Rambo-Yi/Gaussian-Shannon",
    "boundary": "Repeated sign mapping prerequisite. Capacity claims and coding bounds are not established."
  },
  {
    "slug": "gaussmarker",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/SunnierLee/GaussMarker",
    "boundary": "Fourier prerequisite exercise only. Spatial evidence and restoration are not implemented."
  },
  {
    "slug": "hidden",
    "packageName": "hidden_lab",
    "upstreamUrl": "https://github.com/jirenz/HiDDeN",
    "boundary": "A compact CPU teaching implementation. Frozen proxy components and small synthetic examples do not establish paper-level performance."
  },
  {
    "slug": "latent-watermark",
    "packageName": "rosteals_lab",
    "upstreamUrl": "https://github.com/RichardSunnyMeng/LatentWatermark-official-codes",
    "boundary": "Latent offset training prerequisite. The full progressive paper recipe is not reproduced."
  },
  {
    "slug": "lawa",
    "packageName": "rosteals_lab",
    "upstreamUrl": "https://github.com/vbdi/LaWa",
    "boundary": "A compact CPU teaching implementation. Frozen proxy components and small synthetic examples do not establish paper-level performance."
  },
  {
    "slug": "object-watermark",
    "packageName": "rosteals_lab",
    "upstreamUrl": "https://github.com/naresh-ub/object_watermark",
    "boundary": "Latent offset training prerequisite. Text-encoder control and object specificity are not implemented."
  },
  {
    "slug": "prc-watermark",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/THU-BPM/MarkDiffusion",
    "boundary": "Seeded repetition and XOR chips illustrate error correction. This is not a cryptographically secure pseudorandom code."
  },
  {
    "slug": "ringid",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/showlab/RingID",
    "boundary": "A compact CPU teaching implementation. Frozen proxy components and small synthetic examples do not establish paper-level performance."
  },
  {
    "slug": "robin",
    "packageName": "zodiac_lab",
    "upstreamUrl": "https://github.com/Hannah1102/ROBIN",
    "boundary": "Only additive conditioning is optimised. The sampled latent and renderer remain fixed. This is not a diffusion text-conditioning implementation."
  },
  {
    "slug": "rosteals",
    "packageName": "rosteals_lab",
    "upstreamUrl": "https://github.com/TuBui/RoSteALS",
    "boundary": "A compact CPU teaching implementation. Frozen proxy components and small synthetic examples do not establish paper-level performance."
  },
  {
    "slug": "seal",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/Kasraarabi/SEAL",
    "boundary": "Visual statistics and SimHash replace caption and sentence embeddings. This does not reproduce SEAL semantic security."
  },
  {
    "slug": "semantic-forgery",
    "packageName": "paper_lab",
    "upstreamUrl": "https://openaccess.thecvf.com/content/CVPR2025/html/Muller_Black-Box_Forgery_Attacks_on_Semantic_Watermarks_for_Diffusion_Models_CVPR_2025_paper.html",
    "boundary": "Fourier marking prerequisite only. The executable does not implement the paper attack."
  },
  {
    "slug": "serum",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/Hubizon/SERUM",
    "boundary": "Fourier marking and image-space carrier correlation prerequisite. The paper recovery pipeline is not reproduced."
  },
  {
    "slug": "sfwmark",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/THU-BPM/MarkDiffusion",
    "boundary": "Fourier placement prerequisite only. The paper verification path is not implemented."
  },
  {
    "slug": "sleepermark",
    "packageName": "stable_signature_lab",
    "upstreamUrl": "https://github.com/taco-group/SleeperMark",
    "boundary": "Decoder fine-tuning prerequisite. Retention under downstream fine-tuning is not evaluated."
  },
  {
    "slug": "stable-signature",
    "packageName": "stable_signature_lab",
    "upstreamUrl": "https://github.com/facebookresearch/stable_signature",
    "boundary": "A compact CPU teaching implementation. Frozen proxy components and small synthetic examples do not establish paper-level performance."
  },
  {
    "slug": "t2smark",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/THU-BPM/MarkDiffusion",
    "boundary": "Tail sign selection preserves central samples. Quantisation can change tail membership; the renderer is a nearest-neighbour proxy."
  },
  {
    "slug": "tag-wm",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/THU-BPM/MarkDiffusion",
    "boundary": "Fourier marking prerequisite only. Payload localisation and tamper evidence are absent."
  },
  {
    "slug": "tree-rings",
    "packageName": "paper_lab",
    "upstreamUrl": "https://github.com/YuxinWenRick/tree-ring-watermark",
    "boundary": "A compact CPU teaching implementation. Frozen proxy components and small synthetic examples do not establish paper-level performance."
  },
  {
    "slug": "wouaf",
    "packageName": "stable_signature_lab",
    "upstreamUrl": "https://github.com/kylemin/WOUAF",
    "boundary": "Rank-limited latent update prerequisite. Generator weight modulation is not implemented."
  },
  {
    "slug": "zodiac",
    "packageName": "zodiac_lab",
    "upstreamUrl": "https://github.com/zhanglijun95/ZoDiac",
    "boundary": "A compact CPU teaching implementation. Frozen proxy components and small synthetic examples do not establish paper-level performance."
  }
];

const recordedImages: Record<string, [string, string][]> = {
  hidden: [["cover.png", "Synthetic cover"], ["encoded.png", "Encoded smoke output"]],
  rosteals: [["cover.png", "Synthetic cover"], ["autoencoded.png", "Frozen reconstruction"], ["encoded.png", "Encoded smoke output"]],
  "stable-signature": [["base_decoder.png", "Base decoder output"], ["marked_decoder.png", "Fine-tuned smoke output"]],
  zodiac: [["inversion.png", "Frozen reconstruction"], ["watermarked.png", "Optimised smoke output"]],
};

export const paperLabs: Record<string, PaperLab> = Object.fromEntries(definitions.map(({ slug, packageName, upstreamUrl, boundary }) => {
  const command = (action: string) => `python implementations/shared/run_lab.py ${slug} ${action}`;
  const scope = "Bounded CPU commands and behavioural checks. A completed command does not establish successful recovery, robustness, calibration or paper reproduction.";
  return [slug, {
    slug, status: "Runnable locally", labKind: "prerequisite-exercise",
    runtime: "Python 3.11 or 3.12, CPU PyTorch, NumPy and Pillow",
    runtimeStatus: "CPU only; no model downloads", verificationStatus: "CPU command and behavioural checks passed; recovery is measured separately",
    verificationScope: scope, resultKind: ["tree-rings", "ringid", "seal", "gaussmarker", "serum", "sfwmark", "tag-wm", "semantic-forgery"].includes(slug) ? "Keyed detector score; no extracted payload" : "Extracted bits measured separately from the target",
    training: boundary,
    upstream: [{label: "Paper reference implementation or reference collection", url: upstreamUrl, note: "This local exercise is separate from the linked implementation. Collections are not evidence of author endorsement."}],
    commands: [
      {label: "Create a bounded example", command: command("create"), output: `implementations/${slug}/outputs/handbook/manifest.json`, purpose: "Run the smoke configuration in an isolated CPU subprocess and save images and a checkpoint.", interpretation: "Run from the repository root after installing this lab's dependencies with python -m pip install -e implementations/" + slug + ". Uses bounded smoke settings, not a trained research model."},
      {label: "Read saved evidence", command: command("detect"), output: `implementations/${slug}/outputs/handbook/detect.stdout.txt`, purpose: "Load the saved image and compute detector evidence.", interpretation: "A known key is input to a detector, never an extracted payload. Inspect errors rather than inferring success from exit status."},
      {label: "Evaluate saved evidence", command: command("evaluate"), output: `implementations/${slug}/outputs/handbook/evaluate.stdout.txt`, purpose: "Apply actual image transformations to the saved marked image, without embedding a new message.", interpretation: "JPEG quality is recorded. These single-image observations do not measure dataset robustness."},
      {label: "Check teaching behaviour", command: command("controls"), output: `implementations/${slug}/outputs/handbook/controls.stdout.txt`, purpose: "Run existing unit assertions and applicable coding, corruption, key and optimisation checks.", interpretation: scope},
    ],
    codeMap: [{concept: "Executable teaching boundary", paper: boundary, upstream: "Reference", upstreamUrl, local: `implementations/${slug}/src/${packageName}`, note: "The portable runner chooses this package in a separate subprocess to prevent package-name collisions."}],
    methodology: [{title: "Separate execution from recovery", question: "What does this run establish?", method: "Create, save, reload, detect and evaluate the bounded example. Read the measured output and negative controls.", evidence: "Exact commands, outputs, return codes and run timestamps are recorded in docs/lab-verification.json."}],
    decisions: [{decision: "Use a small CPU exercise", rationale: "Expose supporting operations without downloading a diffusion model.", consequence: boundary}],
    visuals: (recordedImages[slug] ?? []).map(([file, label]) => ({
      src: `${import.meta.env.BASE_URL}experiments/handbook/${slug}/${file}`, label,
      evidenceUrl: `${import.meta.env.BASE_URL}experiments/handbook/${slug}/run.json`,
      description: `Recorded bounded CPU fixture. Recovery may fail. Timestamp, configuration, measured recovery and image hashes: experiments/handbook/${slug}/run.json.`,
    })),
    limitations: [boundary, scope, "No paper reproduction or empirical false-positive calibration is claimed. Small CPU training runs can fail to recover their own messages."],
  } satisfies PaperLab];
}));

export function getLab(slug: string) { return paperLabs[slug]; }
