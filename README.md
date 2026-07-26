# Latent Watermarking 101

A source-backed technical guide to image watermarking, latent diffusion watermarking and the security claims surrounding generative provenance.

[Read the guide](https://holsoma.github.io/latent-watermarking-101/) · [Report an issue](https://github.com/holsoma/latent-watermarking-101/issues)

## Purpose

Research on generative image watermarking sits across signal processing, neural data hiding, diffusion modelling, coding theory, statistical detection and security. Papers often assume that readers already understand these areas, which makes it easy to remember method names without understanding what the method changes, what the detector observes or what its results prove.

This project builds those foundations in order and then studies the primary literature in depth.

The guide is designed to help a reader:

- formalise embedding, attack and extraction as a communication path;
- distinguish visible, invisible, blind, non-blind, zero-bit and multi-bit watermarking;
- explain the VAE, text encoder, noise predictor and sampler in latent diffusion;
- identify whether a method changes pixels, VAE latents, initial noise, an intermediate state, conditioning or model weights;
- distinguish a fixed generator from a wholly training-free watermark system;
- reason about spatial frequency, Fourier structure and geometric synchronisation;
- interpret robustness at a stated attack strength and false-positive operating point;
- separate detection, attribution, model ownership, integrity and unforgeability;
- identify which assumptions a detector, theorem or experiment leaves untested.

## Reading structure

The website is organised as a technical book with persistent chapter navigation.

| Section | Purpose |
| --- | --- |
| Start here | Build a map of the field and its embedding locations. |
| How to read a paper | Reduce a paper to an information path, operating point and threat model. |
| Image watermarking | Learn the embed, attack and extract pipeline, including residual analysis. |
| Neural networks | Separate discriminative, generative, autoencoder, GAN and diffusion roles. |
| Latent diffusion | Follow training, generation and inversion without collapsing the model components. |
| Image frequency | Understand spatial frequency, Fourier transforms, alignment and semantic representation. |
| Evaluation | Study fidelity, robustness, security, payload, calibration and computation together. |
| Paper studies | Move from a field-level comparison into method-specific technical readings. |
| Threats and gaps | Turn recurring evaluation weaknesses into focused research questions. |
| Research ideation | Keep the proposed short-paper programme separate from the literature summary. |
| Glossary | Look up recurring mathematical and security terms. |

## Literature coverage

The paper studies are organised by the problem each lineage introduced.

### Neural watermarking and latent bridges

- **HiDDeN** introduces the learned encoder, distortion layer and message decoder.
- **RoSteALS** separates image modelling from message embedding through a frozen autoencoder latent.
- **Stable Signature** fine-tunes a latent decoder to satisfy a fixed image watermark extractor.
- **ZoDiac** uses a pre-trained diffusion latent to watermark an existing cover image through per-image optimisation.

### Initial-noise and inversion methods

- **Tree-Rings** establishes Fourier-pattern watermarking in the starting Gaussian latent.
- **RingID** audits Tree-Rings and extends it towards multi-key identification.
- **Gaussian Shading** maps payload bits into a target Gaussian distribution.
- **T2SMark** divides Gaussian sampling between robust tails and diversity-preserving central regions.
- **Gaussian Shannon** treats generation and inversion as a coded communication channel.
- **PRC Watermark** adds pseudorandom coding and a computational-undetectability objective.
- **ROBIN** writes a strong mark at an intermediate diffusion state and optimises conditioning to hide its visible effect.

### Learned and model-integrated methods

- **Latent Watermark**, **LaWa**, **GaussMarker** and **SERUM** place learned components at different points in the latent or verification path.
- **WOUAF** treats user attribution as fingerprint-conditioned weight modulation.
- **AquaLoRA** places watermark behaviour inside low-rank U-Net updates.
- **SleeperMark** studies model ownership evidence that must survive downstream fine-tuning.
- **Your Text Encoder Can Be An Object-Level Watermarking Controller** uses learned conditioning tokens for local control.

### Semantics, integrity and security

- **SEAL** binds expected evidence to semantic content.
- **SFWMark** makes Hermitian symmetry and centre-aware Fourier placement explicit.
- **TAG-WM** separates ownership payload recovery from tamper localisation.
- **Gaussian Shading++** adds seed transport, soft decoding and public-key verification.
- **Black-Box Forgery Attacks on Semantic Watermarks** shows why robust detection is not equivalent to unforgeable attribution.

Each study begins with a high-level argument, then follows the information path and develops the method-specific details. Shared summary fields remain available for orientation, but they are not used as a substitute for technical explanation.

## Evidence policy

Technical content is based on public primary papers, official proceedings pages and author-provided implementations.

The guide follows these rules:

- distinguish the paper's claim from this project's interpretation;
- state when only the base generator is fixed but an auxiliary component is trained;
- identify preprints as preprints;
- avoid isolated performance values without their attack, payload and operating point;
- separate bit accuracy from exact-message recovery;
- treat a theorem as conditional on its adversary, oracle and randomness assumptions;
- include attack papers when they change how a watermark claim should be interpreted;
- do not reproduce private manuscripts.

## Related projects

- [MarkDiffusion](https://github.com/THU-BPM/MarkDiffusion) provides shared implementations, visualisation and evaluation for generative watermarking.
- [Awesome GenAI Watermarking](https://github.com/and-mill/Awesome-GenAI-Watermarking) maintains a broad bibliography across generative modalities.
- [Secure Diffusion Watermarking Survey and Implementation](https://github.com/tongyu0924/Secure-Diffusion-Watermarking-Survey-and-Implementation) collects diffusion watermarking papers and implementations.
- [Hugging Face Diffusers](https://github.com/huggingface/diffusers) provides maintained diffusion pipelines and schedulers.
- [CompVis Latent Diffusion](https://github.com/CompVis/latent-diffusion) is the reference implementation associated with the latent diffusion paper.
- [Dive into Deep Learning](https://github.com/d2l-ai/d2l-en) demonstrates how prose, mathematics and executable material can form one learning resource.

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

The site uses React, TypeScript and Vite. Hash routes allow every chapter and paper study to open directly on GitHub Pages.

## Contributing

Contributions should improve factual accuracy, explanation, accessibility or public source coverage.

When changing technical content:

- link the primary paper or official implementation;
- explain where information is embedded and what verification observes;
- state all trained and optimised components;
- provide the model, attack, payload and operating point for reported results;
- identify whether an experiment is closed-set or open-set;
- label conceptual simulations as conceptual;
- avoid claims that exceed the stated threat model.

## Scope

This repository is a learning resource, not an implementation of the covered watermarking methods. Refer to each linked paper and repository for its licence and citation requirements.
