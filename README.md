# Latent Watermarking 101

A source-backed introduction to latent diffusion image watermarking for readers who are new to the field.

[Read the guide](https://holsoma.github.io/latent-watermarking-101/)

## What this project does

Watermarking papers often begin after several important ideas have already been assumed: latent diffusion, Gaussian initial noise, inversion, keyed detection, payloads, false-positive rates, and threat models.

This guide builds that foundation in order. It starts with the Stable Diffusion generation path, treats a watermark as a message sent through a noisy channel, then introduces the mathematical and experimental questions needed to read current papers critically.

After working through the guide, a reader should be able to:

- trace the path from a prompt and initial latent to a decoded image;
- distinguish post-hoc image watermarking from in-generation watermarking;
- identify where a method embeds, detects, trains, and uses a key;
- explain why diffusion inversion is approximate;
- distinguish marginal Gaussian statistics from joint independence;
- interpret detection results at a stated false-positive rate;
- ask whether a robustness or security claim matches its threat model.

## How the guide teaches

The teaching structure is informed by [Arjun Virk's ML Bible](https://www.arjunvirk.com/writing/ml-guide): sustained explanation, small worked examples, and regular checks for understanding. This project applies that approach to diffusion watermarking rather than presenting a gallery of diagrams.

Each interactive element must have a clear instructional role:

1. **Question:** the concept the reader should resolve.
2. **Manipulation:** one variable the reader can change.
3. **Observation:** the visible consequence of that change.
4. **Takeaway:** the conclusion the visual supports, with its limits stated.

Controls that cannot meet this standard do not belong in the guide. Conceptual diagrams are labelled as such, and the site does not invent benchmark results.

## Learning route

| Topic | Why it comes next |
| --- | --- |
| Latent diffusion | Establishes where generation happens and what \(z_T\), denoising, and VAE decoding mean. |
| Watermarking models | Separates post-hoc pixel changes from marks introduced during generation. |
| Communication channel | Connects payload, key, generator, edits, inversion, and detector in one system. |
| Inversion failure | Explains why image transformations disturb the latent estimate used for detection. |
| Method families | Groups methods by geometric structure, distribution-aware mapping, semantic binding, and learned recovery. |
| Angular coding | Gives a concrete coordinate-pair example of an embedding and decision boundary. |
| Joint Gaussian structure | Shows why normal-looking coordinates do not prove an unchanged joint prior. |
| Result interpretation | Turns accuracy, robustness, quality, and security claims into reproducible questions. |
| Primary reading path | Moves from diffusion foundations to geometry, distribution preservation, security, and semantic binding. |

## Related learning and research projects

These projects solve adjacent parts of the learning or research problem:

- [ML Bible](https://www.arjunvirk.com/writing/ml-guide) is the main reference for the guide's prose-led, chapter-based teaching format.
- [Dive into Deep Learning](https://github.com/d2l-ai/d2l-en) is an open interactive deep learning book that combines explanation, mathematics, and runnable code.
- [MarkDiffusion](https://github.com/THU-BPM/MarkDiffusion) provides a unified implementation and evaluation toolkit for generative watermarking methods.
- [Secure Diffusion Watermarking Survey and Implementation](https://github.com/tongyu0924/Secure-Diffusion-Watermarking-Survey-and-Implementation) organises papers on watermarking, attribution, and provenance in diffusion models.
- [Awesome GenAI Watermarking](https://github.com/and-mill/Awesome-GenAI-Watermarking) maintains a broader bibliography across generative model watermarking.
- [Hugging Face Diffusers](https://github.com/huggingface/diffusers) provides production implementations and documentation for diffusion pipelines, schedulers, and inversion-related components.
- [CompVis Latent Diffusion](https://github.com/CompVis/latent-diffusion) is the source implementation associated with the latent diffusion foundation used throughout this guide.

For implementation-level study, start with the official repositories for [Tree-Ring Watermarks](https://github.com/YuxinWenRick/tree-ring-watermark), [Gaussian Shading](https://github.com/bsmhmmlf/Gaussian-Shading), [Stable Signature](https://github.com/facebookresearch/stable_signature), and [PRC Watermark](https://github.com/XuandongZhao/PRC-Watermark).

## Primary papers

- [High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752)
- [Denoising Diffusion Implicit Models](https://arxiv.org/abs/2010.02502)
- [Tree-Rings Watermarks](https://arxiv.org/abs/2305.20030)
- [Gaussian Shading](https://openaccess.thecvf.com/content/CVPR2024/html/Yang_Gaussian_Shading_Provable_Performance-Lossless_Image_Watermarking_for_Diffusion_Models_CVPR_2024_paper.html)
- [RingID](https://www.ecva.net/papers/eccv_2024/papers_ECCV/html/4104_ECCV_2024_paper.php)
- [An Undetectable Watermark for Generative Image Models](https://openreview.net/forum?id=jlhBFm7T2J)
- [SEAL](https://openaccess.thecvf.com/content/ICCV2025/html/Arabi_SEAL_Semantic_Aware_Image_Watermarking_ICCV_2025_paper.html)

## Run locally

Requirements: Node.js 20.19 or newer, or Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Build and type-check the static site:

```bash
npm test
```

The GitHub Actions workflow deploys the generated `dist/` directory to GitHub Pages after changes reach `main`.

## Contributing

Contributions should improve explanation, factual accuracy, accessibility, or source coverage. A proposed interaction should state its learning question and avoid unsupported numerical claims. Please link a primary paper or official implementation when changing technical content.

## Scope

This project explains publicly available ideas. It does not reproduce private manuscripts, provide a detector implementation, or present conceptual simulations as empirical evidence.
