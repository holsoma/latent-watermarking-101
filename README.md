# Latent Watermarking 101

A source-backed field guide to image watermarking and latent diffusion watermarking.

[Read the guide](https://holsoma.github.io/latent-watermarking-101/) · [Report an issue](https://github.com/holsoma/latent-watermarking-101/issues)

## Why this exists

Research papers on generative image watermarking often assume that the reader already understands image watermarking, spatial frequency, latent diffusion, inversion, statistical detection and threat models. That makes it easy to remember method names without understanding what information travels through the system or what a result establishes.

This project builds the missing foundation, then applies one comparison grammar to sixteen public methods. It is intended for students, engineers and researchers who want to read the primary literature critically.

After studying the guide, a reader should be able to:

- write the traditional embed, attack and extract pipeline;
- distinguish visible, invisible, blind, non-blind, zero-bit and multi-bit watermarking;
- explain the roles of the VAE, text encoder, noise predictor and sampler in latent diffusion;
- distinguish pixel, VAE-latent, initial-noise, intermediate-state and conditioning-based embedding;
- reason about low and high spatial frequencies without treating frequency as semantics;
- evaluate fidelity, robustness, security, payload and computation together;
- distinguish a training-free system from a fixed base generator with trained auxiliary components;
- read a detector result at a stated false-positive operating point;
- identify where a paper's evidence stops.

## Guide structure

The website is organised as a small technical textbook rather than a landing page.

| Chapter | Main question |
| --- | --- |
| Start here | How do the method families fit together? |
| How to read a paper | Which claim, operating point and threat model should be recorded? |
| Image watermarking | How does a payload survive an attack channel while preserving the image? |
| Neural networks | Which components discriminate, reconstruct and generate? |
| Latent diffusion | How does training differ from generation, and where can evidence be embedded? |
| Image frequency | What do spatial frequencies represent, and why do transforms disturb them? |
| Evaluation | How should fidelity, robustness, security, payload and cost be measured? |
| Method atlas | How do sixteen public methods differ under the same comparison grammar? |
| Threats and gaps | Which open measurements can support a focused research contribution? |
| Glossary | What do the recurring technical terms mean? |

Interactions are used only when changing one variable supports a clear learning point. Current examples show denoising progress, spatial frequency and detector-threshold trade-offs. Values in conceptual simulations are labelled as illustrative and are not presented as benchmark results.

## Paper dossiers

Every dossier records:

1. the problem isolated by the paper;
2. the training boundary;
3. the embedding and generation path;
4. the verification procedure;
5. the main contributions;
6. the limits of the claim;
7. questions for close reading and replication;
8. links to the primary paper and official implementation.

The current atlas covers:

- Tree-Rings, RingID, ROBIN and SFWMark;
- Gaussian Shading, Gaussian Shading++, T2SMark, Gaussian Shannon and PRC Watermark;
- Latent Watermark, LaWa, GaussMarker and SERUM;
- SEAL, TAG-WM and Your Text Encoder Can Be An Object-Level Watermarking Controller.

The guide makes one boundary explicit: leaving the base diffusion model unchanged does not necessarily make the whole system training-free. A learned decoder, noise restorer, token embedding or classifier is still a trained component.

## Evidence policy

Technical explanations are based on public primary papers, proceedings pages and official repositories. The guide paraphrases mechanisms and avoids copying abstract prose.

Performance values are omitted unless the metric, attack, payload and operating point can be stated together. Venue labels follow the public record. Preprints are identified as preprints. No private manuscript content is reproduced.

## Related projects

These repositories are useful complements rather than substitutes for the primary papers:

- [MarkDiffusion](https://github.com/THU-BPM/MarkDiffusion) provides a unified implementation and evaluation toolkit for generative watermarking.
- [Awesome GenAI Watermarking](https://github.com/and-mill/Awesome-GenAI-Watermarking) maintains a broad bibliography across generative modalities.
- [Secure Diffusion Watermarking Survey and Implementation](https://github.com/tongyu0924/Secure-Diffusion-Watermarking-Survey-and-Implementation) collects diffusion watermarking papers and implementations.
- [Hugging Face Diffusers](https://github.com/huggingface/diffusers) provides maintained diffusion pipelines, schedulers and examples.
- [CompVis Latent Diffusion](https://github.com/CompVis/latent-diffusion) is the reference implementation associated with the latent diffusion paper.
- [Dive into Deep Learning](https://github.com/d2l-ai/d2l-en) is a useful model for combining technical explanation, mathematics and executable material.

The chapter-based teaching format was also informed by [Arjun Virk's ML guide](https://www.arjunvirk.com/writing/ml-guide).

## Run locally

Requirements: Node.js 20.19 or newer, or Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Build and type-check:

```bash
npm test
```

The site uses React, TypeScript and Vite. Hash-based chapter routes keep every page directly addressable on GitHub Pages without server-side routing.

## Contributing

Contributions should improve factual accuracy, explanation, accessibility or public source coverage.

When proposing a technical change:

- link the primary paper or official implementation;
- separate the paper's claim from your interpretation;
- state the model, attack, payload and operating point for any reported result;
- identify trained auxiliary components;
- label conceptual examples as conceptual;
- avoid claims that exceed the stated threat model.

## Licence and citation

The repository is a learning resource, not an implementation of the covered watermarking methods. Refer to each paper and repository for its own licence and citation instructions.
