// Generated from handbookEntries by scripts/generate-paper-catalog.mjs. Do not edit.
import type { HandbookEntry } from './handbookTypes';

export type PaperCatalogEntry = Pick<HandbookEntry, 'slug' | 'shortTitle' | 'title' | 'kind' | 'year' | 'summary' | 'insertion' | 'training' | 'labSlug'>;
export const paperCatalog: PaperCatalogEntry[] = [
  {
    "slug": "ldm",
    "shortTitle": "Latent Diffusion",
    "title": "High-Resolution Image Synthesis with Latent Diffusion Models",
    "kind": "Foundation",
    "year": "2022",
    "summary": "A learned image codec moves diffusion into a smaller representation while retaining an image decoder at the output.",
    "insertion": "No watermark",
    "training": "Generator training"
  },
  {
    "slug": "ddim",
    "shortTitle": "DDIM",
    "title": "Denoising Diffusion Implicit Models",
    "kind": "Foundation",
    "year": "2021",
    "summary": "A sampling formulation with a deterministic limit provides the trajectory used by many approximate watermark inversions.",
    "insertion": "No watermark",
    "training": "No watermark-specific training"
  },
  {
    "slug": "latent-watermark",
    "shortTitle": "Latent Watermark",
    "title": "Latent Watermark: Inject and Detect Watermarks in Latent Diffusion Space",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "A learned system that embeds and detects a watermark inside the latent representation of a latent diffusion model.",
    "insertion": "Learned latent representation",
    "training": "Auxiliary training",
    "labSlug": "latent-watermark"
  },
  {
    "slug": "gaussian-shannon",
    "shortTitle": "Gaussian Shannon",
    "title": "Gaussian Shannon: High-Precision Diffusion Model Watermarking Based on Communication",
    "kind": "Watermark method",
    "year": "2026",
    "summary": "Treats the generation and inversion pipeline as a noisy communication channel, then adds error correction for exact bit recovery.",
    "insertion": "Initial noise",
    "training": "No method-specific training",
    "labSlug": "gaussian-shannon"
  },
  {
    "slug": "gaussmarker",
    "shortTitle": "GaussMarker",
    "title": "GaussMarker: Robust Dual-Domain Watermark for Diffusion Models",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Combines spatial and frequency patterns in the initial noise, then restores the noisy inverted latent before detection.",
    "insertion": "Initial noise: spatial and Fourier",
    "training": "Auxiliary training",
    "labSlug": "gaussmarker"
  },
  {
    "slug": "lawa",
    "shortTitle": "LaWa",
    "title": "LaWa: Using Latent Space for In-Generation Image Watermarking",
    "kind": "Watermark method",
    "year": "2024",
    "summary": "A coarse-to-fine learned system that writes a high-capacity message into autoencoder latents during generation.",
    "insertion": "VAE decoder feature maps",
    "training": "Auxiliary training",
    "labSlug": "lawa"
  },
  {
    "slug": "tree-rings",
    "shortTitle": "Tree-Rings",
    "title": "Tree-Rings Watermarks: Invisible Fingerprints for Diffusion Images",
    "kind": "Watermark method",
    "year": "2023",
    "summary": "Places a structured key in the Fourier transform of the initial noise, then looks for it after diffusion inversion.",
    "insertion": "Initial noise: Fourier",
    "training": "No method-specific training",
    "labSlug": "tree-rings"
  },
  {
    "slug": "robin",
    "shortTitle": "ROBIN",
    "title": "ROBIN: Robust and Invisible Watermarks for Diffusion Models with Adversarial Optimization",
    "kind": "Watermark method",
    "year": "2024",
    "summary": "Writes a strong signal into an intermediate diffusion state, then adjusts conditioning to hide its visible effect in the final image.",
    "insertion": "Intermediate diffusion state",
    "training": "Per-image optimisation",
    "labSlug": "robin"
  },
  {
    "slug": "ringid",
    "shortTitle": "RingID",
    "title": "RingID: Rethinking Tree-Ring Watermarking for Enhanced Multi-key Identification",
    "kind": "Watermark method",
    "year": "2024",
    "summary": "Audits why Tree-Rings works, then redesigns its patterns for many-key identification.",
    "insertion": "Initial noise: Fourier",
    "training": "No method-specific training",
    "labSlug": "ringid"
  },
  {
    "slug": "object-watermark",
    "shortTitle": "Text Encoder Controller",
    "title": "Your Text Encoder Can Be An Object-Level Watermarking Controller",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Uses learned text-token embeddings to control whether a watermark is applied to a whole image or a prompted object.",
    "insertion": "Object-conditioned latent",
    "training": "Conditioning fine-tuning",
    "labSlug": "object-watermark"
  },
  {
    "slug": "serum",
    "shortTitle": "SERUM",
    "title": "SERUM: Simple, Efficient, Robust, and Unifying Marking for Diffusion-Based Image Generation",
    "kind": "Watermark method",
    "year": "2026",
    "summary": "Adds a user-specific mark to the initial noise and trains a fast image-space detector to recognise its generated effect.",
    "insertion": "Initial noise",
    "training": "Auxiliary training",
    "labSlug": "serum"
  },
  {
    "slug": "seal",
    "shortTitle": "SEAL",
    "title": "SEAL: Semantic Aware Image Watermarking",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Derives the noise key from image semantics so verification binds the watermark to the depicted content.",
    "insertion": "Semantic content and latent key",
    "training": "No method-specific training",
    "labSlug": "seal"
  },
  {
    "slug": "sfwmark",
    "shortTitle": "SFWMark",
    "title": "Semantic Watermarking Reinvented: Enhancing Robustness and Generation Quality with Fourier Integrity",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Uses Hermitian-symmetric Fourier patterns and centre-aware placement to improve validity and crop robustness.",
    "insertion": "Initial noise: Fourier",
    "training": "No method-specific training",
    "labSlug": "sfwmark"
  },
  {
    "slug": "tag-wm",
    "shortTitle": "TAG-WM",
    "title": "TAG-WM: Tamper-Aware Generative Image Watermarking via Diffusion Inversion Sensitivity",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Combines an ownership payload with a spatial localisation mark so the decoder can recover identity and flag edited regions.",
    "insertion": "Semantic content and integrity signal",
    "training": "No method-specific training",
    "labSlug": "tag-wm"
  },
  {
    "slug": "gaussian-shading",
    "shortTitle": "Gaussian Shading",
    "title": "Gaussian Shading: Provable Performance-Lossless Image Watermarking for Diffusion Models",
    "kind": "Watermark method",
    "year": "2024",
    "summary": "Maps encrypted bits into Gaussian latent coordinates while preserving the latent distribution used by the generator.",
    "insertion": "Initial noise",
    "training": "No method-specific training",
    "labSlug": "gaussian-shading"
  },
  {
    "slug": "t2smark",
    "shortTitle": "T2SMark",
    "title": "T2SMark: Balancing Robustness and Diversity in Noise-as-Watermark for Diffusion Models",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Places bits in reliable Gaussian tails while leaving the central region random to protect image diversity.",
    "insertion": "Initial noise: tails",
    "training": "No method-specific training",
    "labSlug": "t2smark"
  },
  {
    "slug": "gaussian-shading-plus-plus",
    "shortTitle": "Gaussian Shading++",
    "title": "Gaussian Shading++: Rethinking the Realistic Deployment Challenge of Performance-Lossless Image Watermark for Diffusion Models",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Extends Gaussian Shading with seed transport, soft decoding and signatures for operational deployment.",
    "insertion": "Initial noise",
    "training": "No method-specific training",
    "labSlug": "gaussian-shading-plus-plus"
  },
  {
    "slug": "prc-watermark",
    "shortTitle": "PRC Watermark",
    "title": "An Undetectable Watermark for Generative Image Models",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Uses pseudorandom error-correcting codes to combine message recovery, removal robustness and computational undetectability.",
    "insertion": "Initial noise",
    "training": "No method-specific training",
    "labSlug": "prc-watermark"
  },
  {
    "slug": "hidden",
    "shortTitle": "HiDDeN",
    "title": "HiDDeN: Hiding Data With Deep Networks",
    "kind": "Watermark method",
    "year": "2018",
    "summary": "The neural encoder-decoder baseline that made the attack channel part of watermark training.",
    "insertion": "RGB pixels",
    "training": "Auxiliary training",
    "labSlug": "hidden"
  },
  {
    "slug": "rosteals",
    "shortTitle": "RoSteALS",
    "title": "RoSteALS: Robust Steganography Using Autoencoder Latent Space",
    "kind": "Watermark method",
    "year": "2023",
    "summary": "A bridge from cover-image watermarking to latent generation, using a frozen autoencoder as the image prior.",
    "insertion": "Clean autoencoder latent",
    "training": "Auxiliary training",
    "labSlug": "rosteals"
  },
  {
    "slug": "stable-signature",
    "shortTitle": "Stable Signature",
    "title": "The Stable Signature: Rooting Watermarks in Latent Diffusion Models",
    "kind": "Watermark method",
    "year": "2023",
    "summary": "Fine-tunes the latent decoder so watermark embedding becomes an unavoidable part of image decoding.",
    "insertion": "VAE decoder weights",
    "training": "Base model fine-tuning",
    "labSlug": "stable-signature"
  },
  {
    "slug": "wouaf",
    "shortTitle": "WOUAF",
    "title": "WOUAF: Weight Modulation for User Attribution and Fingerprinting in Text-to-Image Diffusion Models",
    "kind": "Watermark method",
    "year": "2024",
    "summary": "Treats user attribution as conditional weight generation rather than a message added to each image.",
    "insertion": "Generator weights",
    "training": "Base model fine-tuning",
    "labSlug": "wouaf"
  },
  {
    "slug": "aqualora",
    "shortTitle": "AquaLoRA",
    "title": "AquaLoRA: Toward White-box Protection for Customized Stable Diffusion Models via Watermark LoRA",
    "kind": "Watermark method",
    "year": "2024",
    "summary": "Entangles a changeable watermark with a customised diffusion model through low-rank weight updates.",
    "insertion": "Denoiser weights",
    "training": "Base model fine-tuning",
    "labSlug": "aqualora"
  },
  {
    "slug": "sleepermark",
    "shortTitle": "SleeperMark",
    "title": "SleeperMark: Towards Robust Watermark against Fine-Tuning Text-to-image Diffusion Models",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "A model-ownership watermark designed to remain dormant in ordinary semantics and survive later customisation.",
    "insertion": "Denoiser weights",
    "training": "Base model fine-tuning",
    "labSlug": "sleepermark"
  },
  {
    "slug": "zodiac",
    "shortTitle": "ZoDiac",
    "title": "Attack-Resilient Image Watermarking Using Stable Diffusion",
    "kind": "Watermark method",
    "year": "2024",
    "summary": "Uses diffusion as a post-generation watermarking prior, optimising a cover image's latent rather than marking the initial noise of synthesis.",
    "insertion": "Optimised cover-image latent",
    "training": "Per-image optimisation",
    "labSlug": "zodiac"
  },
  {
    "slug": "semantic-forgery",
    "shortTitle": "Black-Box Forgery",
    "title": "Black-Box Forgery Attacks on Semantic Watermarks for Diffusion Models",
    "kind": "Attack",
    "year": "2025",
    "summary": "Shows that robust detection is not authenticity: a single marked image can support watermark forgery or removal with an unrelated model.",
    "insertion": "No embedding: forgery attack",
    "training": "Per-image optimisation",
    "labSlug": "semantic-forgery"
  },
  {
    "slug": "wind",
    "shortTitle": "WIND",
    "title": "Hidden in the Noise: Two-Stage Robust Watermarking for Images",
    "kind": "Watermark method",
    "year": "2025",
    "summary": "Use the initial random noise as an identity, then add a group signal to make searching for that identity practical.",
    "insertion": "Initial noise: identity and Fourier group",
    "training": "No method-specific training"
  },
  {
    "slug": "spherical-watermark",
    "shortTitle": "Spherical Watermark",
    "title": "Spherical Watermark: Encryption-Free, Lossless Watermarking for Diffusion Models",
    "kind": "Watermark method",
    "year": "2026",
    "summary": "Combine message bits and random padding with spherical geometry to construct message-bearing initial noise.",
    "insertion": "Initial noise: direction and radius",
    "training": "No method-specific training"
  },
  {
    "slug": "law",
    "shortTitle": "LAW / LAW-M",
    "title": "Correlation-Aware and Gaussianity-Preserving Robust Latent Angular Watermarking for Diffusion Models",
    "kind": "Watermark method",
    "year": "2026",
    "summary": "Encode bits through relative angles while exposing the induced dependence; LAW-M selects larger pairs and requires per-image ordering state.",
    "insertion": "Initial noise: paired relative angles",
    "training": "No method-specific training"
  },
  {
    "slug": "watermark-attacker",
    "shortTitle": "WatermarkAttacker",
    "title": "Invisible Image Watermarks Are Provably Removable Using Generative AI",
    "kind": "Attack",
    "year": "2024",
    "summary": "Destroy fragile evidence through noise or compression, then reconstruct useful image content with a generative model.",
    "insertion": "No embedding: attacks received pixels",
    "training": "Uses a pre-trained regeneration model"
  },
  {
    "slug": "waves",
    "shortTitle": "WAVES",
    "title": "WAVES: Benchmarking the Robustness of Image Watermarks",
    "kind": "Benchmark",
    "year": "2024",
    "summary": "Evaluate detection and identification across attack families while recording the quality cost of removal.",
    "insertion": "No watermark",
    "training": "Depends on the evaluated method"
  },
  {
    "slug": "markdiffusion",
    "shortTitle": "MarkDiffusion",
    "title": "MarkDiffusion: An Open-Source Toolkit for Generative Watermarking of Latent Diffusion Models",
    "kind": "Benchmark",
    "year": "2026",
    "summary": "A shared implementation and evaluation interface reduces repeated engineering while keeping method fidelity an explicit responsibility.",
    "insertion": "No single embedding location",
    "training": "Depends on the selected algorithm"
  },
  {
    "slug": "push-it-away",
    "shortTitle": "Push It Away",
    "title": "Push It Away: Repulsive Non-Watermark Representation for Box-Free Model Watermarking",
    "kind": "Watermark method",
    "year": "2026",
    "summary": "Change the non-watermark training target so clean extractor responses are separated from the watermark, rather than accidentally correlated with it.",
    "insertion": "RGB model output",
    "training": "Auxiliary training"
  }
];
