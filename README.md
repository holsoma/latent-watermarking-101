# Latent Watermarking 101

An interactive introduction to latent diffusion image watermarking. The site starts with Stable Diffusion fundamentals, compares traditional and in-generation watermarking, then explains inversion, detection, Gaussian latent structure, and major method families.

[Open the interactive site](https://holsoma.github.io/latent-watermarking-101/)

## Why this exists

Research papers often assume that the reader already understands latent diffusion, initial Gaussian noise, inversion, payloads, keying, and operational false-positive rates. This project supplies that missing frame of reference.

## Interactive lessons

- A denoising timeline from random latent noise to a decoded image
- Traditional post-hoc watermarking compared with in-generation watermarking
- A keyed communication-channel view of embedding and detection
- An attack playground for compression, cropping, regeneration, and editing
- A two-dimensional angular coding laboratory
- Independent and correlated Gaussian point clouds
- A conceptual robustness, diversity, and payload trade-off laboratory
- Glossary and primary-source reading path

## Accuracy note

The interactive trade-off laboratory is conceptual. Its values are not experimental measurements. It is designed to make relationships visible before readers inspect reported results in the cited papers.

## Local development

```bash
npm install
npm run dev
```

Build the static site with:

```bash
npm run build
```

The repository deploys `dist/` to GitHub Pages through GitHub Actions.

## Primary references

- [High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752)
- [Denoising Diffusion Implicit Models](https://arxiv.org/abs/2010.02502)
- [Tree-Rings Watermarks](https://arxiv.org/abs/2305.20030)
- [Gaussian Shading](https://openaccess.thecvf.com/content/CVPR2024/html/Yang_Gaussian_Shading_Provable_Performance-Lossless_Image_Watermarking_for_Diffusion_Models_CVPR_2024_paper.html)
- [RingID](https://www.ecva.net/papers/eccv_2024/papers_ECCV/html/4104_ECCV_2024_paper.php)
- [An Undetectable Watermark for Generative Image Models](https://openreview.net/forum?id=jlhBFm7T2J)
- [SEAL](https://openaccess.thecvf.com/content/ICCV2025/html/Arabi_SEAL_Semantic_Aware_Image_Watermarking_ICCV_2025_paper.html)

## Scope

This project explains publicly available ideas. It does not reproduce private manuscripts or claim that the visual simulations are benchmarks.

For the companion research synthesis, see the [Latent Watermark Atlas](https://holsoma.github.io/watermarking-gap-analysis/).
