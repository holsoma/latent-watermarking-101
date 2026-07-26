export type TrainingBoundary =
  | "No method-specific training"
  | "Auxiliary training"
  | "Conditioning fine-tuning"
  | "Per-image optimisation";

export type Paper = {
  slug: string;
  shortTitle: string;
  title: string;
  venue: string;
  year: string;
  authors: string;
  family: "Latent pattern" | "Gaussian mapping" | "Learned latent" | "Semantic or task-aware";
  boundary: TrainingBoundary;
  boundaryDetail: string;
  oneLine: string;
  problem: string;
  mechanism: string[];
  detection: string;
  contributions: string[];
  limitations: string[];
  studyQuestions: string[];
  paperUrl: string;
  codeUrl?: string;
};

export const papers: Paper[] = [
  {
    slug: "latent-watermark",
    shortTitle: "Latent Watermark",
    title: "Latent Watermark: Inject and Detect Watermarks in Latent Diffusion Space",
    venue: "IEEE Transactions on Multimedia",
    year: "2025",
    authors: "Zheling Meng, Bo Peng and Jing Dong",
    family: "Learned latent",
    boundary: "Auxiliary training",
    boundaryDetail:
      "The method uses progressive training to learn watermark injection and detection. It should not be labelled training-free, even though its focus is the latent space.",
    oneLine:
      "A learned system that embeds and detects a watermark inside the latent representation of a latent diffusion model.",
    problem:
      "Pixel-space watermarking is separated from the generative process and can lose information under editing. This paper asks whether the compact latent representation can carry a watermark that remains visually unobtrusive and survives common image processing.",
    mechanism: [
      "Represent both the image and watermark inside the latent diffusion pipeline.",
      "Use progressive training to stabilise watermark injection and recovery rather than solving both objectives at full difficulty from the first step.",
      "Balance latent recovery with image fidelity so the decoded image remains close to the intended output.",
    ],
    detection:
      "A trained detector recovers the watermark from the received image or its representation. The detector is part of the learned system, so transfer to an unseen model or decoder is an empirical question rather than an automatic property.",
    contributions: [
      "Moves both embedding and detection into latent diffusion space.",
      "Uses a progressive training schedule to manage the fidelity and robustness objectives.",
      "Evaluates the method on two datasets and a set of image attacks.",
    ],
    limitations: [
      "Training cost and training data become part of the deployment cost.",
      "The learned detector can inherit dataset, architecture and attack-distribution bias.",
      "A comparison against training-free methods must report this extra supervision explicitly.",
    ],
    studyQuestions: [
      "What exactly is trained, and which pre-trained components remain fixed?",
      "Does robustness hold for attacks not represented during training?",
      "How does the detector's false-positive rate change on unrelated real images?",
    ],
    paperUrl: "https://arxiv.org/abs/2404.00230",
    codeUrl: "https://github.com/RichardSunnyMeng/LatentWatermark-official-codes",
  },
  {
    slug: "gaussian-shannon",
    shortTitle: "Gaussian Shannon",
    title: "Gaussian Shannon: High-Precision Diffusion Model Watermarking Based on Communication",
    venue: "CVPR",
    year: "2026",
    authors: "Yi Zhang, Hongbo Huang and Liang-Jie Zhang",
    family: "Gaussian mapping",
    boundary: "No method-specific training",
    boundaryDetail:
      "The method is presented as training-free. Its protection comes from coding and repeated communication rather than a learned embedder or detector.",
    oneLine:
      "Treats the generation and inversion pipeline as a noisy communication channel, then adds error correction for exact bit recovery.",
    problem:
      "High average bit accuracy can still be inadequate when an identifier, signature or ownership message must be recovered exactly. The paper reframes watermark recovery as digital communication through a channel that produces local bit flips and global distortion.",
    mechanism: [
      "Encode the payload with cascaded error-correcting codes.",
      "Map the coded message into the initial Gaussian noise while preserving its intended distribution.",
      "Generate several redundant observations and combine them with majority voting.",
    ],
    detection:
      "The image is inverted to estimate the initial noise. The receiver demaps the noisy latent, combines repeated observations and applies the error-correcting decoder to recover the message.",
    contributions: [
      "Makes exact message recovery, rather than only average bit accuracy, a central objective.",
      "Separates local bit corruption from larger shared distortions in the communication model.",
      "Combines coding and voting without fine-tuning the image generator.",
    ],
    limitations: [
      "Inversion error is model and scheduler dependent, so the assumed channel can shift.",
      "Redundancy improves reliability but consumes payload and generation cost.",
      "A communication model calibrated on single attacks may not describe composed edits.",
    ],
    studyQuestions: [
      "What is the word-error rate at a fixed false-positive rate?",
      "How much effective payload remains after all coding and repetition?",
      "Does the estimated channel remain valid under regeneration and inpainting?",
    ],
    paperUrl: "https://arxiv.org/abs/2603.26167",
    codeUrl: "https://github.com/Rambo-Yi/Gaussian-Shannon",
  },
  {
    slug: "gaussmarker",
    shortTitle: "GaussMarker",
    title: "GaussMarker: Robust Dual-Domain Watermark for Diffusion Models",
    venue: "ICML",
    year: "2025",
    authors: "Kecen Li and collaborators",
    family: "Learned latent",
    boundary: "Auxiliary training",
    boundaryDetail:
      "The base diffusion model can remain unchanged, but the Gaussian Noise Restorer is learned. This is not a wholly training-free system.",
    oneLine:
      "Combines spatial and frequency patterns in the initial noise, then restores the noisy inverted latent before detection.",
    problem:
      "A single watermark representation tends to have uneven resistance across attacks. In addition, inversion does not reproduce the original Gaussian noise exactly. GaussMarker addresses both the embedding representation and the recovery error.",
    mechanism: [
      "Insert complementary watermark signals into spatial and frequency components of the initial Gaussian noise.",
      "Generate the image with an unmodified diffusion model.",
      "Use a learned, model-independent Gaussian Noise Restorer to reduce inversion corruption.",
      "Fuse the evidence from both domains for the final decision.",
    ],
    detection:
      "After inversion and restoration, separate detectors score the spatial and frequency evidence. Their combination is intended to avoid dependence on one fragile representation.",
    contributions: [
      "Uses dual-domain evidence rather than a single ring or coordinate partition.",
      "Treats latent restoration as a separate component of the verification pipeline.",
      "Evaluates several diffusion versions and both conventional and advanced attacks.",
    ],
    limitations: [
      "The restorer adds training data, inference cost and a new distribution-shift surface.",
      "Score fusion requires calibration at the intended false-positive rate.",
      "Model independence should be tested across architectures, not only nearby Stable Diffusion versions.",
    ],
    studyQuestions: [
      "Which attacks are handled by each domain, and where do both fail?",
      "How much gain comes from the restorer rather than dual-domain embedding?",
      "Can the restoration network create false evidence on clean images?",
    ],
    paperUrl: "https://proceedings.mlr.press/v267/li25ae.html",
    codeUrl: "https://github.com/SunnierLee/GaussMarker",
  },
  {
    slug: "lawa",
    shortTitle: "LaWa",
    title: "LaWa: Using Latent Space for In-Generation Image Watermarking",
    venue: "ECCV",
    year: "2024",
    authors: "Tu Bui and collaborators",
    family: "Learned latent",
    boundary: "Auxiliary training",
    boundaryDetail:
      "LaWa leaves the pre-trained latent diffusion model unchanged, but learns multi-scale watermark modules and a decoder. Base-model-free is not the same as training-free.",
    oneLine:
      "A coarse-to-fine learned system that writes a high-capacity message into autoencoder latents during generation.",
    problem:
      "Many in-generation methods carry only a small key or require a separate detector per user. LaWa targets higher payload and scalable user identification while keeping the pre-trained generator fixed.",
    mechanism: [
      "Inject message features at several latent resolutions using coarse-to-fine watermark modules.",
      "Decode the modified latent through the existing image decoder.",
      "Train one image-space decoder to recover many different messages.",
    ],
    detection:
      "A blind learned decoder predicts the message directly from the watermarked image. It does not require the original image at verification time.",
    contributions: [
      "Supports larger payloads than single-bit presence detection.",
      "Uses one decoder for many user messages.",
      "Can operate during generation and can also be used after generation.",
    ],
    limitations: [
      "Learned modules need training and may depend on the autoencoder family.",
      "High payload increases the number of opportunities for bit errors.",
      "Image-space decoder security under adaptive forgery is separate from ordinary robustness.",
    ],
    studyQuestions: [
      "How does payload affect exact-message accuracy, not only average bit accuracy?",
      "Does one decoder remain calibrated as the number of registered users grows?",
      "What happens when the image is edited by a different generative model?",
    ],
    paperUrl: "https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/12460.pdf",
    codeUrl: "https://github.com/vbdi/LaWa",
  },
  {
    slug: "tree-rings",
    shortTitle: "Tree-Rings",
    title: "Tree-Rings Watermarks: Invisible Fingerprints for Diffusion Images",
    venue: "NeurIPS",
    year: "2023",
    authors: "Yuxin Wen, John Kirchenbauer, Jonas Geiping and Tom Goldstein",
    family: "Latent pattern",
    boundary: "No method-specific training",
    boundaryDetail:
      "Tree-Rings directly modifies the sampled initial noise and uses inversion for detection. It does not train an embedder, detector or base generator.",
    oneLine:
      "Places a structured key in the Fourier transform of the initial noise, then looks for it after diffusion inversion.",
    problem:
      "A watermark written after generation can be removed from the output pipeline or detached from the generator. Tree-Rings asks whether the randomness that starts generation can itself carry a persistent fingerprint.",
    mechanism: [
      "Sample an initial noise tensor and transform it into the Fourier domain.",
      "Replace a selected region with a key-dependent ring pattern.",
      "Run the ordinary denoising process to generate the image.",
    ],
    detection:
      "Invert the received image towards its starting latent, transform that estimate into the Fourier domain and compare the selected region with the secret key using a statistical distance.",
    contributions: [
      "Established initial-noise watermarking as a practical training-free family.",
      "Uses Fourier structure chosen for tolerance to common geometric operations.",
      "Keeps the model weights and standard sampling loop unchanged.",
    ],
    limitations: [
      "Detection requires diffusion inversion, which is slow and approximate.",
      "Later work shows that unintended distribution shift can help detection.",
      "A single detection key does not directly solve large-scale multi-user identification.",
    ],
    studyQuestions: [
      "Is detection using the intended pattern or a broader distribution artefact?",
      "How is the threshold selected for a stated false-positive rate?",
      "How does performance change under a different scheduler or model version?",
    ],
    paperUrl:
      "https://papers.nips.cc/paper_files/paper/2023/hash/b54d1757c190ba20dbc4f9e4a2f54149-Abstract-Conference.html",
    codeUrl: "https://github.com/YuxinWenRick/tree-ring-watermark",
  },
  {
    slug: "robin",
    shortTitle: "ROBIN",
    title: "ROBIN: Robust and Invisible Watermarks for Diffusion Models with Adversarial Optimization",
    venue: "NeurIPS",
    year: "2024",
    authors: "Hannah He and collaborators",
    family: "Latent pattern",
    boundary: "Per-image optimisation",
    boundaryDetail:
      "ROBIN does not require conventional model fine-tuning, but it performs adversarial optimisation for a watermark instance. Its cost belongs in the comparison.",
    oneLine:
      "Writes a strong signal into an intermediate diffusion state, then adjusts conditioning to hide its visible effect in the final image.",
    problem:
      "A stronger internal watermark is usually easier to detect but more likely to change the image. ROBIN separates strength and invisibility across the diffusion trajectory instead of treating them as one embedding operation.",
    mechanism: [
      "Insert a strong watermark into an intermediate diffusion state.",
      "Optimise the prompt embedding adversarially so subsequent denoising conceals visible artefacts.",
      "Finish the trajectory with the modified conditioning.",
    ],
    detection:
      "Reverse the generative process towards the marked intermediate state and test for the embedded signal.",
    contributions: [
      "Uses intermediate steps rather than only the initial noise or final pixels.",
      "Treats prompt conditioning as a control variable for watermark invisibility.",
      "Makes the robustness-fidelity tension an explicit optimisation problem.",
    ],
    limitations: [
      "Per-image optimisation increases latency and complicates high-throughput serving.",
      "Optimised conditioning may alter prompt alignment in ways that simple image metrics miss.",
      "Detection remains dependent on an approximate reverse process.",
    ],
    studyQuestions: [
      "What is the wall-clock cost per image at a fixed sampler budget?",
      "Does optimisation change rare objects or compositional relations in the prompt?",
      "How stable is the marked intermediate state after generative editing?",
    ],
    paperUrl: "https://arxiv.org/abs/2411.03862",
    codeUrl: "https://github.com/Hannah1102/ROBIN",
  },
  {
    slug: "ringid",
    shortTitle: "RingID",
    title: "RingID: Rethinking Tree-Ring Watermarking for Enhanced Multi-key Identification",
    venue: "ECCV",
    year: "2024",
    authors: "Zilin Pan and collaborators",
    family: "Latent pattern",
    boundary: "No method-specific training",
    boundaryDetail:
      "RingID modifies and verifies initial-noise patterns without learning a method-specific network.",
    oneLine:
      "Audits why Tree-Rings works, then redesigns its patterns for many-key identification.",
    problem:
      "Binary presence detection is easier than deciding which one of many keys produced an image. RingID also questions whether Tree-Rings is detecting its designed ring or an unintended shift in the latent distribution.",
    mechanism: [
      "Analyse Tree-Rings under a null-hypothesis view and isolate the effect of distribution shift.",
      "Construct heterogeneous patterns across multiple latent channels.",
      "Improve how those patterns are imprinted into the initial noise.",
    ],
    detection:
      "Invert the image, compare the recovered latent against a key set and select a key only when its evidence clears the verification rule.",
    contributions: [
      "Separates watermark verification from multi-key identification.",
      "Shows that a method can work partly for a reason different from its stated mechanism.",
      "Improves key separability with multi-channel heterogeneous patterns.",
    ],
    limitations: [
      "Searching a large key set creates computational and multiple-testing costs.",
      "Inversion dependence remains.",
      "Open-set rejection is harder than closed-set top-one key accuracy.",
    ],
    studyQuestions: [
      "Does the evaluation include an explicit none-of-the-above case?",
      "How does false attribution scale with the number of keys?",
      "What part of the gain remains when latent distributions are matched?",
    ],
    paperUrl: "https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/04104.pdf",
    codeUrl: "https://github.com/showlab/RingID",
  },
  {
    slug: "object-watermark",
    shortTitle: "Text Encoder Controller",
    title: "Your Text Encoder Can Be An Object-Level Watermarking Controller",
    venue: "ICCV",
    year: "2025",
    authors: "Naresh Devulapally and collaborators",
    family: "Semantic or task-aware",
    boundary: "Conditioning fine-tuning",
    boundaryDetail:
      "The full generator is not tuned, but new text-token embeddings and a detector are learned. This is a parameter-efficient training method, not a training-free method.",
    oneLine:
      "Uses learned text-token embeddings to control whether a watermark is applied to a whole image or a prompted object.",
    problem:
      "Image-level ownership marks do not say which object or requested concept should be protected. This work uses the prompt interface to make watermark placement conditional and object-aware.",
    mechanism: [
      "Add new control tokens to the text encoder vocabulary.",
      "Learn their embeddings while keeping most generator parameters fixed.",
      "Place a control token in the prompt to request image-level or object-level marking.",
    ],
    detection:
      "A blind neural detector recovers the payload from the generated image or relevant object region.",
    contributions: [
      "Connects prompt syntax with watermark control.",
      "Supports object-level placement rather than only whole-image presence.",
      "Uses a small trainable parameter set compared with full generator fine-tuning.",
    ],
    limitations: [
      "Training and a learned detector remain necessary.",
      "Object boundaries implied by language can be ambiguous or overlap.",
      "A user who controls the prompt may omit, move or conflict with the control token.",
    ],
    studyQuestions: [
      "How is the protected object localised when several instances share a noun?",
      "Does cropping the object preserve the mark and remove image-level context?",
      "Can prompt injection or token substitution disable control?",
    ],
    paperUrl:
      "https://openaccess.thecvf.com/content/ICCV2025/html/Devulapally_Your_Text_Encoder_Can_Be_An_Object-Level_Watermarking_Controller_ICCV_2025_paper.html",
    codeUrl: "https://github.com/naresh-ub/object_watermark",
  },
  {
    slug: "serum",
    shortTitle: "SERUM",
    title: "SERUM: Simple, Efficient, Robust, and Unifying Marking for Diffusion-Based Image Generation",
    venue: "ICLR",
    year: "2026",
    authors: "Jan Kociszewski and collaborators",
    family: "Learned latent",
    boundary: "Auxiliary training",
    boundaryDetail:
      "The generator is unchanged, but a lightweight image-space detector is trained for the noise mark. Detection avoids inversion.",
    oneLine:
      "Adds a user-specific mark to the initial noise and trains a fast image-space detector to recognise its generated effect.",
    problem:
      "Latent inversion can dominate verification cost and requires access to a compatible model. SERUM asks whether an initial-noise mark can be recognised directly in output pixels.",
    mechanism: [
      "Add a unique watermark noise pattern to the initial diffusion noise.",
      "Generate with the standard model and sampler.",
      "Train a lightweight detector on images produced with and without the mark.",
    ],
    detection:
      "The detector operates directly in image space, avoiding diffusion inversion. Different noise marks can represent different users.",
    contributions: [
      "Reduces detection latency by removing inversion.",
      "Keeps the image generator fixed.",
      "Supports multi-user marking through distinct initial-noise marks.",
    ],
    limitations: [
      "The detector learns the generator and attack distribution represented by its training data.",
      "Fast detection does not by itself establish low false-positive rates at web scale.",
      "Training a separate or conditional detector for many users can become a scaling problem.",
    ],
    studyQuestions: [
      "How does the detector behave on images from unseen generators?",
      "Can a classifier-based removal attack erase the learned feature?",
      "Is multi-user evaluation open-set or limited to registered keys?",
    ],
    paperUrl: "https://iclr.cc/virtual/2026/poster/10011005",
    codeUrl: "https://github.com/Hubizon/SERUM",
  },
  {
    slug: "seal",
    shortTitle: "SEAL",
    title: "SEAL: Semantic Aware Image Watermarking",
    venue: "ICCV",
    year: "2025",
    authors: "Kasra Arabi and collaborators",
    family: "Semantic or task-aware",
    boundary: "No method-specific training",
    boundaryDetail:
      "The core mapping uses existing semantic embeddings and locality-sensitive hashing rather than training a new generator or watermark network.",
    oneLine:
      "Derives the noise key from image semantics so verification binds the watermark to the depicted content.",
    problem:
      "A content-agnostic watermark can be copied from one generated image to another or preserved while the meaning is changed. SEAL aims to verify both source and semantic consistency.",
    mechanism: [
      "Compute a semantic representation associated with the target content.",
      "Use locality-sensitive hashing to map nearby semantic representations to related keys.",
      "Construct corresponding noise patches and generate the marked image.",
    ],
    detection:
      "Recompute semantic evidence from the received image, derive the expected key and compare it with evidence recovered from the image. No exhaustive key-database search is required.",
    contributions: [
      "Binds watermark evidence to content instead of only to a producer key.",
      "Targets copy-forgery and semantic tampering attacks.",
      "Uses locality-sensitive hashing to tolerate modest semantic variation.",
    ],
    limitations: [
      "The boundary between benign semantic change and malicious change is not objective.",
      "Semantic encoders can be biased, unstable or adversarially manipulated.",
      "Hash collisions and near-neighbour choices create a security-robustness trade-off.",
    ],
    studyQuestions: [
      "Which semantic encoder defines identity, and can it be replaced?",
      "How does the system treat captions or crops that preserve only part of the scene?",
      "Can an attacker search for an edit that crosses the semantic hash boundary?",
    ],
    paperUrl: "https://arxiv.org/abs/2503.12172",
    codeUrl: "https://github.com/Kasraarabi/SEAL",
  },
  {
    slug: "sfwmark",
    shortTitle: "SFWMark",
    title: "Semantic Watermarking Reinvented: Enhancing Robustness and Generation Quality with Fourier Integrity",
    venue: "ICCV",
    year: "2025",
    authors: "Thomas Lee and collaborators",
    family: "Latent pattern",
    boundary: "No method-specific training",
    boundaryDetail:
      "The central contribution is an algorithmic Fourier construction. It does not require learning a new embedder or fine-tuning the generator.",
    oneLine:
      "Uses Hermitian-symmetric Fourier patterns and centre-aware placement to improve validity and crop robustness.",
    problem:
      "Naively editing Fourier coefficients can violate the symmetry required for real-valued spatial signals, while fixed placement can fail under cropping. SFWMark treats Fourier integrity as a design constraint rather than a visual preference.",
    mechanism: [
      "Build a watermark whose Fourier coefficients obey Hermitian symmetry.",
      "Place evidence with awareness of the image centre and expected crop transformations.",
      "Apply the construction to verification and identification patterns.",
    ],
    detection:
      "Invert the image, examine the prescribed Fourier evidence and perform verification or key identification using the matching symmetric construction.",
    contributions: [
      "Connects valid real-valued signals to Hermitian symmetry in the watermark design.",
      "Adds centre-aware embedding for crop resistance.",
      "Studies both generation quality and identification capacity.",
    ],
    limitations: [
      "Fourier validity does not guarantee resistance to semantic reconstruction.",
      "Centre-aware assumptions can fail for off-centre content or aggressive composition changes.",
      "Capacity and key separation still interact with false attribution.",
    ],
    studyQuestions: [
      "What fails when Hermitian symmetry is intentionally broken?",
      "Does crop robustness persist after crop plus resize plus compression?",
      "How is identification calibrated as the key set expands?",
    ],
    paperUrl: "https://arxiv.org/abs/2509.07647",
    codeUrl: "https://github.com/thomas11809/SFWMark",
  },
  {
    slug: "tag-wm",
    shortTitle: "TAG-WM",
    title: "TAG-WM: Tamper-Aware Generative Image Watermarking via Diffusion Inversion Sensitivity",
    venue: "ICCV",
    year: "2025",
    authors: "Suchen Chen and collaborators",
    family: "Semantic or task-aware",
    boundary: "No method-specific training",
    boundaryDetail:
      "The method's main mechanism uses joint sampling and inversion sensitivity rather than a trained watermark network.",
    oneLine:
      "Combines an ownership payload with a spatial localisation mark so the decoder can recover identity and flag edited regions.",
    problem:
      "A robust ownership watermark may survive a tampered image and therefore validate content that is no longer authentic. TAG-WM separates global provenance from local integrity.",
    mechanism: [
      "Jointly sample a copyright watermark and a localisation watermark during generation.",
      "Invert the received image and measure where the reverse trajectory is unusually sensitive.",
      "Use the sensitivity map to guide tamper-aware message decoding.",
    ],
    detection:
      "The verifier produces both a recovered payload and a dense estimate of likely edited regions, rather than reducing all evidence to one binary decision.",
    contributions: [
      "Distinguishes ownership from content integrity.",
      "Uses diffusion inversion sensitivity as a localisation signal.",
      "Supports a paper-reported 256-bit payload alongside tamper localisation.",
    ],
    limitations: [
      "Dense localisation is difficult to calibrate across edit types and region sizes.",
      "Inversion cost and model dependence remain.",
      "An attacker may target the localisation signal while preserving global payload evidence.",
    ],
    studyQuestions: [
      "What is the smallest edited region that can be located reliably?",
      "Are payload recovery and localisation evaluated under the same composed attacks?",
      "How are false localisation pixels penalised?",
    ],
    paperUrl: "https://arxiv.org/abs/2506.23484",
    codeUrl: "https://github.com/Suchenl/TAG-WM",
  },
  {
    slug: "gaussian-shading",
    shortTitle: "Gaussian Shading",
    title: "Gaussian Shading: Provable Performance-Lossless Image Watermarking for Diffusion Models",
    venue: "CVPR",
    year: "2024",
    authors: "Zijin Yang, Kai Zeng, Kejiang Chen, Han Fang, Weiming Zhang and Nenghai Yu",
    family: "Gaussian mapping",
    boundary: "No method-specific training",
    boundaryDetail:
      "The payload is mapped into standard Gaussian noise with cryptographic randomisation and repeated coordinates. No method-specific network is trained.",
    oneLine:
      "Maps encrypted bits into Gaussian latent coordinates while preserving the latent distribution used by the generator.",
    problem:
      "Directly forcing bits into initial noise can alter its distribution and therefore change generation quality or reveal that the sample is marked. Gaussian Shading seeks a message-conditioned sample that remains standard Gaussian.",
    mechanism: [
      "Diffuse the payload across channels and spatial positions for redundancy.",
      "Randomise the message with a secret key.",
      "Sample each latent value from a message-selected part of the Gaussian distribution.",
      "Generate normally with the resulting latent.",
    ],
    detection:
      "Use DDIM inversion to estimate the starting latent, reverse the coordinate mapping and combine repeated copies of each bit.",
    contributions: [
      "Makes distribution preservation a first-class watermark requirement.",
      "Provides a training-free multi-bit construction.",
      "Connects latent sampling, encryption and inversion-based extraction.",
    ],
    limitations: [
      "Performance-lossless is a distributional statement under assumptions, not proof of identical individual images.",
      "Key and nonce management become practical security requirements.",
      "Hard bit decisions discard uncertainty created by generation and inversion.",
    ],
    studyQuestions: [
      "Which theorem assumptions are violated by a practical sampler?",
      "What happens when the same key or randomisation state is reused?",
      "Would soft decoding improve robustness without increasing false positives?",
    ],
    paperUrl: "https://arxiv.org/abs/2404.04956",
    codeUrl: "https://github.com/bsmhmmlf/Gaussian-Shading",
  },
  {
    slug: "t2smark",
    shortTitle: "T2SMark",
    title: "T2SMark: Balancing Robustness and Diversity in Noise-as-Watermark for Diffusion Models",
    venue: "NeurIPS",
    year: "2025",
    authors: "Jindong Yang and collaborators",
    family: "Gaussian mapping",
    boundary: "No method-specific training",
    boundaryDetail:
      "T2SMark changes how Gaussian noise is sampled and decoded. It does not train a watermark-specific network.",
    oneLine:
      "Places bits in reliable Gaussian tails while leaving the central region random to protect image diversity.",
    problem:
      "Forcing many latent coordinates to encode deterministic bits can improve detection but reduce random variation across generated images. T2SMark explicitly allocates reliable and diverse regions of the Gaussian.",
    mechanism: [
      "Assign robust bit evidence to truncated tail regions of the Gaussian distribution.",
      "Retain ordinary random sampling in the central region.",
      "Use a session key so repeated generations do not expose the same latent structure.",
    ],
    detection:
      "Invert the image and classify selected latent coordinates according to the tail regions associated with the encoded bits.",
    contributions: [
      "Frames robustness and diversity as competing sampling objectives.",
      "Uses a two-stage tail-truncated sampler.",
      "Evaluates U-Net and diffusion-transformer generator families.",
    ],
    limitations: [
      "Tail allocation changes the conditional sampling process even if aggregate moments look plausible.",
      "The central-to-tail boundary is a tunable operating point, not a universal constant.",
      "Diversity needs evaluation beyond FID or a small prompt set.",
    ],
    studyQuestions: [
      "How is diversity measured conditional on the same prompt?",
      "What fraction of coordinates must remain central for useful stochasticity?",
      "Can an attacker estimate the tail partition from many outputs?",
    ],
    paperUrl:
      "https://papers.nips.cc/paper_files/paper/2025/hash/abf731c2993f9b1ee417cc3734787d7a-Abstract-Conference.html",
    codeUrl: "https://github.com/0xD009/T2SMark",
  },
  {
    slug: "gaussian-shading-plus-plus",
    shortTitle: "Gaussian Shading++",
    title: "Gaussian Shading++: Rethinking the Realistic Deployment Challenge of Performance-Lossless Image Watermark for Diffusion Models",
    venue: "arXiv preprint",
    year: "2025",
    authors: "Zijin Yang and collaborators",
    family: "Gaussian mapping",
    boundary: "No method-specific training",
    boundaryDetail:
      "The construction adds coding and public-key verification to Gaussian sampling without training a watermark network. No official code repository is linked by the paper at present.",
    oneLine:
      "Extends Gaussian Shading with seed transport, soft decoding and signatures for operational deployment.",
    problem:
      "A distribution-preserving algorithm is not yet a deployment system. Real services need manageable keys, tolerance to user-selected generation settings and verification by parties who should not receive the signing secret.",
    mechanism: [
      "Use a second channel and pseudorandom error-correcting codes to carry the seed needed for payload randomisation.",
      "Model generation plus inversion error as an additive Gaussian channel.",
      "Use soft decisions rather than thresholding every recovered coordinate immediately.",
      "Sign the payload so third parties can verify it with a public key.",
    ],
    detection:
      "The verifier recovers both channels, decodes them using confidence information and checks the public-key signature before accepting the claim.",
    contributions: [
      "Treats key management as part of the watermark design.",
      "Uses soft decoding for variable generation and inversion conditions.",
      "Separates public verification from secret signing.",
    ],
    limitations: [
      "An additive white Gaussian channel may not capture structured model and editing errors.",
      "A valid signature proves that a signer created a message, not that all image content is unedited.",
      "The work is currently a preprint and does not provide an official implementation link.",
    ],
    studyQuestions: [
      "Which errors are non-Gaussian or correlated in real inversion traces?",
      "How are key revocation and compromised signing keys handled?",
      "Can the signed payload be transplanted into another image?",
    ],
    paperUrl: "https://arxiv.org/abs/2504.15026",
  },
  {
    slug: "prc-watermark",
    shortTitle: "PRC Watermark",
    title: "An Undetectable Watermark for Generative Image Models",
    venue: "ICLR",
    year: "2025",
    authors: "Sam Gunn, Xuandong Zhao and Dawn Song",
    family: "Gaussian mapping",
    boundary: "No method-specific training",
    boundaryDetail:
      "The watermark uses pseudorandom codes to select initial latents and does not require a trained watermark model.",
    oneLine:
      "Uses pseudorandom error-correcting codes to combine message recovery, removal robustness and computational undetectability.",
    problem:
      "Visual similarity is weaker than security. A watermark can be imperceptible to people but statistically detectable by an adversary, revealing which images are protected and enabling targeted removal.",
    mechanism: [
      "Encode the payload with a pseudorandom error-correcting code.",
      "Select initial latent samples that satisfy the secret code constraints while resembling ordinary randomness.",
      "Generate with the normal image model.",
    ],
    detection:
      "Invert the image to estimate latent evidence, then apply the secret decoder with a threshold chosen to control false positives.",
    contributions: [
      "States computational undetectability as a cryptographic goal.",
      "Provides robustness and payload recovery through error-correcting structure.",
      "Reports experiments up to 512 bits under removal attacks and larger payloads without attack.",
    ],
    limitations: [
      "Security guarantees depend on explicit computational and oracle assumptions.",
      "A cryptographic construction does not remove inversion error or implementation leakage.",
      "Long payload claims should be separated into attacked and clean settings.",
    ],
    studyQuestions: [
      "What can the adversary query, and what remains secret in the proof?",
      "Does the implementation preserve the randomness assumptions?",
      "What is the exact-message success rate at a web-scale false-positive target?",
    ],
    paperUrl:
      "https://proceedings.iclr.cc/paper_files/paper/2025/hash/1331202ea3bb0a53ae897af0bb16e309-Abstract-Conference.html",
    codeUrl: "https://github.com/XuandongZhao/PRC-Watermark",
  },
];

export const paperBySlug = new Map(papers.map((paper) => [paper.slug, paper]));

export const glossary = [
  ["Attack channel", "The transformations between embedding and verification, including benign processing and deliberate removal."],
  ["Blind detection", "Verification that does not need the original unwatermarked image."],
  ["Capacity", "The number of payload bits that can be recovered at a stated error rate and attack setting."],
  ["DDIM inversion", "A numerical reverse process that estimates an earlier diffusion latent from an image or final latent."],
  ["False positive rate", "The probability that an unwatermarked sample is incorrectly accepted as watermarked."],
  ["Fidelity", "How little embedding changes the intended image, distribution or task performance."],
  ["Fourier domain", "A representation of an image or latent as spatial frequency components with amplitude and phase."],
  ["iid Gaussian", "Entries sampled independently from the same normal distribution, usually N(0, 1) in the starting latent."],
  ["In-generation watermark", "A watermark inserted as part of synthesis rather than added to finished pixels."],
  ["Latent", "A compressed or internal numerical representation used by a generative model."],
  ["Open-set identification", "Select a registered key or reject the sample as belonging to none of them."],
  ["Payload", "The message represented by a watermark, such as an owner ID, user ID or signature."],
  ["Robustness", "The ability to retain valid evidence after specified transformations."],
  ["Semantic watermark", "A watermark tied to content or meaning, rather than only a fixed low-level signal."],
  ["Threat model", "An explicit statement of attacker knowledge, access, query budget and allowed transformations."],
  ["Training-free", "A method that does not learn watermark-specific parameters. This is stronger than leaving the base generator unchanged."],
  ["Watermark key", "Secret or public information used to embed, identify or verify a mark."],
] as const;
