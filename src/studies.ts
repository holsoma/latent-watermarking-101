import type { Paper } from "./content";

export type StudySection = {
  title: string;
  paragraphs: string[];
  equation?: { expression: string; note: string };
  bullets?: string[];
  takeaway?: string;
};

export type PaperStudy = {
  category:
    | "Foundations and bridges"
    | "Initial-noise and inversion"
    | "Learned and model-integrated"
    | "Semantics, integrity and security";
  thesis: string;
  intervention: string;
  fixedPoint: string;
  verificationAssumption: string;
  sections: StudySection[];
  judgement: string;
  connections: string[];
};

export const additionalPapers: Paper[] = [
  {
    slug: "hidden",
    shortTitle: "HiDDeN",
    title: "HiDDeN: Hiding Data With Deep Networks",
    venue: "ECCV",
    year: "2018",
    authors: "Jiren Zhu, Russell Kaplan, Justin Johnson and Li Fei-Fei",
    family: "Learned latent",
    boundary: "Auxiliary training",
    boundaryDetail:
      "HiDDeN jointly trains an image encoder and message decoder with differentiable attack layers. It predates latent diffusion but defines the learned watermarking pattern reused by later systems.",
    oneLine:
      "The neural encoder-decoder baseline that made the attack channel part of watermark training.",
    problem:
      "Classical watermark pipelines often hand-design a transform and detector. HiDDeN asks whether a neural encoder can learn small image changes that preserve a binary message after known distortions.",
    mechanism: [
      "Concatenate or broadcast a binary message with image features inside an encoder.",
      "Produce a visually similar encoded image.",
      "Apply a sampled noise layer such as crop, blur, dropout or a JPEG approximation.",
      "Train a decoder to recover the bits and an adversary to discourage visible encoded-image artefacts.",
    ],
    detection:
      "A convolutional decoder predicts the message directly from the received image. Detection is blind with respect to the original cover image.",
    contributions: [
      "Jointly learns embedding, attack simulation and extraction.",
      "Shows that differentiable approximations can train for non-differentiable processing such as JPEG.",
      "Provides the neural extractor pattern later reused by generator-integrated methods.",
    ],
    limitations: [
      "Robustness follows the attack distribution represented during training.",
      "The detector can learn dataset or encoder artefacts rather than a portable signal.",
      "The method starts from an existing cover image and does not solve in-generation provenance by itself.",
    ],
    studyQuestions: [
      "Which attack layers are differentiable approximations rather than the actual operation?",
      "Does the extractor retain calibration on unrelated natural images?",
      "How does payload length change image distortion and whole-message failure?",
    ],
    paperUrl:
      "https://openaccess.thecvf.com/content_ECCV_2018/html/Jiren_Zhu_HiDDeN_Hiding_Data_ECCV_2018_paper.html",
  },
  {
    slug: "rosteals",
    shortTitle: "RoSteALS",
    title: "RoSteALS: Robust Steganography Using Autoencoder Latent Space",
    venue: "CVPR Workshops",
    year: "2023",
    authors: "Tu Bui, Shruti Agarwal, Ning Yu and John Collomosse",
    family: "Learned latent",
    boundary: "Auxiliary training",
    boundaryDetail:
      "The pre-trained autoencoder is frozen, but a lightweight secret encoder and an image-space secret decoder are learned.",
    oneLine:
      "A bridge from cover-image watermarking to latent generation, using a frozen autoencoder as the image prior.",
    problem:
      "A watermark encoder otherwise has to learn both natural image structure and message hiding. RoSteALS delegates image reconstruction to a frozen pre-trained autoencoder and learns only a latent offset for the message.",
    mechanism: [
      "Encode the cover image with a frozen autoencoder.",
      "Map the message to a compact latent offset with a lightweight secret encoder.",
      "Add the offset to the cover latent and decode the result.",
      "Train a secret decoder to recover the message from pixels after distortion.",
    ],
    detection:
      "A learned image-space decoder recovers the bits without the original cover. The autoencoder is needed for embedding but not ordinary extraction.",
    contributions: [
      "Separates image modelling from message embedding.",
      "Introduces a compact message-to-latent offset that can be reused across covers.",
      "Shows a path from cover-based steganography to cover-less diffusion generation.",
    ],
    limitations: [
      "The offset and detector remain tied to the chosen autoencoder and training distribution.",
      "Cover-less use does not make the system training-free.",
      "A universal latent offset can create repeatable evidence an attacker may estimate.",
    ],
    studyQuestions: [
      "Is the learned offset content-independent in practice?",
      "How does the frozen autoencoder shape robustness?",
      "What transfers when the decoder or image domain changes?",
    ],
    paperUrl:
      "https://openaccess.thecvf.com/content/CVPR2023W/WMF/papers/Bui_RoSteALS_Robust_Steganography_Using_Autoencoder_Latent_Space_CVPRW_2023_paper.pdf",
    codeUrl: "https://github.com/TuBui/RoSteALS",
  },
  {
    slug: "stable-signature",
    shortTitle: "Stable Signature",
    title: "The Stable Signature: Rooting Watermarks in Latent Diffusion Models",
    venue: "ICCV",
    year: "2023",
    authors: "Pierre Fernandez, Guillaume Couairon, Herve Jegou, Matthijs Douze and Teddy Furon",
    family: "Learned latent",
    boundary: "Base model fine-tuning",
    boundaryDetail:
      "The VAE decoder of a latent diffusion model is fine-tuned so all decoded images carry a chosen signature. A pre-trained extractor remains fixed during this distillation stage.",
    oneLine:
      "Fine-tunes the latent decoder so watermark embedding becomes an unavoidable part of image decoding.",
    problem:
      "A post-processing watermark can be removed from an open generation script. Stable Signature moves the mark into the latent decoder so ordinary generation emits it without a separate final operation.",
    mechanism: [
      "Pre-train or obtain a robust image watermark extractor.",
      "Choose a fixed binary signature for a model or user.",
      "Fine-tune the VAE decoder so images decoded from normal latents yield that signature.",
      "Use a statistical bit-matching test for detection or identification.",
    ],
    detection:
      "The image extractor predicts bits directly from pixels. A binomial-style test converts agreement with the registered signature into a detection decision.",
    contributions: [
      "Makes watermark embedding part of the generative decoder.",
      "Connects message extraction to an explicit statistical test.",
      "Supports model-level detection and registered-user identification.",
    ],
    limitations: [
      "Anyone with full model access can replace or fine-tune the marked decoder.",
      "One fixed signature across many images can aid detector or removal training.",
      "The inherited extractor defines the robustness ceiling.",
    ],
    studyQuestions: [
      "Which decoder parameters move, and what keeps reconstruction quality stable?",
      "How many negative images support the claimed false-positive regime?",
      "Does the signature survive decoder replacement or downstream fine-tuning?",
    ],
    paperUrl:
      "https://openaccess.thecvf.com/content/ICCV2023/html/Fernandez_The_Stable_Signature_Rooting_Watermarks_in_Latent_Diffusion_Models_ICCV_2023_paper.html",
    codeUrl: "https://github.com/facebookresearch/stable_signature",
  },
  {
    slug: "wouaf",
    shortTitle: "WOUAF",
    title: "WOUAF: Weight Modulation for User Attribution and Fingerprinting in Text-to-Image Diffusion Models",
    venue: "CVPR",
    year: "2024",
    authors: "Changhoon Kim, Kyle Min, Maitreya Patel, Sheng Cheng and Yezhou Yang",
    family: "Learned latent",
    boundary: "Base model fine-tuning",
    boundaryDetail:
      "A fingerprint-conditioned hypernetwork modulates generator weights. Training produces a family of user-specific model instances and a decoding network.",
    oneLine:
      "Treats user attribution as conditional weight generation rather than a message added to each image.",
    problem:
      "A model distributor may need to identify which released copy produced a harmful image. WOUAF assigns a user fingerprint to model weights so attribution does not depend on a removable post-processing module.",
    mechanism: [
      "Encode a user fingerprint into modulation parameters.",
      "Apply those parameters to selected Stable Diffusion weights.",
      "Generate normally with the resulting user-specific model.",
      "Decode the user fingerprint from output images.",
    ],
    detection:
      "A learned fingerprint decoder reads the user code from pixels and matches it to the distributor's registry.",
    contributions: [
      "Moves attribution from per-image embedding to model-instance fingerprinting.",
      "Uses one modulation mechanism to generate many user-specific models.",
      "Frames robustness as accountability after model distribution.",
    ],
    limitations: [
      "A white-box user can compare, average or fine-tune distributed model copies.",
      "Attribution needs open-set rejection, not only classification among enrolled users.",
      "Weight modulation and image decoding are both trained components.",
    ],
    studyQuestions: [
      "Can colluding users average or merge their copies to suppress identity?",
      "How does the registry scale without raising false attribution?",
      "Which weight groups actually carry the recoverable fingerprint?",
    ],
    paperUrl:
      "https://openaccess.thecvf.com/content/CVPR2024/html/Kim_WOUAF_Weight_Modulation_for_User_Attribution_and_Fingerprinting_in_Text-to-Image_CVPR_2024_paper.html",
    codeUrl: "https://github.com/kylemin/WOUAF",
  },
  {
    slug: "aqualora",
    shortTitle: "AquaLoRA",
    title: "AquaLoRA: Toward White-box Protection for Customized Stable Diffusion Models via Watermark LoRA",
    venue: "ICML",
    year: "2024",
    authors: "Weitao Feng and collaborators",
    family: "Learned latent",
    boundary: "Base model fine-tuning",
    boundaryDetail:
      "A watermark LoRA is trained and merged into the U-Net. Prior-preserving fine-tuning reduces interference with the original model distribution.",
    oneLine:
      "Entangles a changeable watermark with a customised diffusion model through low-rank weight updates.",
    problem:
      "Decoder-only or detachable watermark modules are weak under white-box access. AquaLoRA targets customised Stable Diffusion models whose owners release or distribute the actual weights.",
    mechanism: [
      "Pre-train a latent watermark representation and extractor.",
      "Insert low-rank watermark adapters into selected U-Net layers.",
      "Use a scaling matrix to update message identity without training a new full adapter.",
      "Apply prior-preserving fine-tuning to limit generation drift.",
    ],
    detection:
      "Generated outputs are analysed by the learned extractor for the message bound to the distributed model.",
    contributions: [
      "Makes the watermark part of U-Net weights rather than a replaceable decoder.",
      "Uses LoRA structure for compact model customisation.",
      "Separates message update from full retraining through a scaling matrix.",
    ],
    limitations: [
      "White-box access also gives the attacker the marked weights and comparison tools.",
      "LoRA merging, pruning and further customisation can alter the signal.",
      "Prior preservation is evaluated on chosen prompts and models, not every downstream use.",
    ],
    studyQuestions: [
      "What does an attacker learn by subtracting the base model from the marked model?",
      "How does watermark evidence survive merging several LoRAs?",
      "Which prior-preservation claim is theoretical and which is empirical?",
    ],
    paperUrl: "https://arxiv.org/abs/2405.11135",
    codeUrl: "https://github.com/Georgefwt/AquaLoRA",
  },
  {
    slug: "sleepermark",
    shortTitle: "SleeperMark",
    title: "SleeperMark: Towards Robust Watermark against Fine-Tuning Text-to-image Diffusion Models",
    venue: "CVPR",
    year: "2025",
    authors: "Zilan Wang, Junfeng Guo, Jiacheng Zhu, Yiming Li, Heng Huang, Muhao Chen and Zhengzhong Tu",
    family: "Learned latent",
    boundary: "Base model fine-tuning",
    boundaryDetail:
      "SleeperMark trains watermark behaviour into the diffusion model and explicitly optimises for retention after downstream fine-tuning.",
    oneLine:
      "A model-ownership watermark designed to remain dormant in ordinary semantics and survive later customisation.",
    problem:
      "Watermark behaviour is easily forgotten when a stolen model is fine-tuned for a new style or subject. SleeperMark separates watermark knowledge from ordinary semantic adaptation so it remains recoverable after customisation.",
    mechanism: [
      "Define watermark-triggering behaviour and ordinary clean generation behaviour.",
      "Guide the model to disentangle watermark information from semantic concepts.",
      "Simulate or account for downstream fine-tuning during watermark training.",
      "Verify ownership through black-box generated outputs.",
    ],
    detection:
      "The owner queries the suspected model under the watermark protocol and extracts evidence from its outputs without inspecting internal features.",
    contributions: [
      "Targets model-level survival under downstream fine-tuning.",
      "Separates image attacks from model attacks.",
      "Evaluates latent and pixel diffusion architectures.",
    ],
    limitations: [
      "Trigger secrecy and query behaviour become part of the threat model.",
      "An adaptive attacker may fine-tune against observed verification queries.",
      "Persistence under tested fine-tuning recipes does not establish persistence under arbitrary model surgery.",
    ],
    studyQuestions: [
      "What exact behaviour is disentangled from semantic knowledge?",
      "Can clean-model queries accidentally activate the watermark?",
      "How does targeted unlearning compare with ordinary fine-tuning?",
    ],
    paperUrl:
      "https://openaccess.thecvf.com/content/CVPR2025/papers/Wang_SleeperMark_Towards_Robust_Watermark_against_Fine-Tuning_Text-to-image_Diffusion_Models_CVPR_2025_paper.pdf",
    codeUrl: "https://github.com/taco-group/SleeperMark",
  },
  {
    slug: "zodiac",
    shortTitle: "ZoDiac",
    title: "Attack-Resilient Image Watermarking Using Stable Diffusion",
    venue: "NeurIPS",
    year: "2024",
    authors: "Lijun Zhang, Xiao Liu, Antoni Viros Martin, Cindy Xiong Bearfield, Yuriy Brun and Hui Guan",
    family: "Latent pattern",
    boundary: "Per-image optimisation",
    boundaryDetail:
      "ZoDiac uses a fixed pre-trained Stable Diffusion model but optimises the latent representation of each cover image to implant the watermark.",
    oneLine:
      "Uses diffusion as a post-generation watermarking prior, optimising a cover image's latent rather than marking the initial noise of synthesis.",
    problem:
      "Generative reconstruction can remove conventional image watermarks. ZoDiac turns the same diffusion prior into the embedder, seeking a mark that remains recoverable after diffusion-based attacks.",
    mechanism: [
      "Invert or encode an existing cover image into a diffusion latent.",
      "Optimise selected latent-frequency coefficients towards a watermark pattern.",
      "Decode the optimised latent and control pixel deviation from the cover.",
      "Invert the received image and test the recovered pattern.",
    ],
    detection:
      "Detection returns to the Stable Diffusion latent and measures agreement with the embedded pattern.",
    contributions: [
      "Uses a pre-trained diffusion model for robust post-generation watermarking.",
      "Connects latent optimisation with cover-image fidelity.",
      "Tests against diffusion-based removal, not only conventional image processing.",
    ],
    limitations: [
      "Per-image optimisation is slower than a single learned encoder pass.",
      "It requires a cover image and should not be conflated with initial-noise in-generation methods.",
      "Its published false-positive operating point is much higher than provenance systems usually require at scale.",
    ],
    studyQuestions: [
      "Which loss keeps the decoded result close to the cover?",
      "How dependent is recovery on the same diffusion model?",
      "What changes when detection is calibrated at a much lower false-positive rate?",
    ],
    paperUrl:
      "https://papers.nips.cc/paper_files/paper/2024/hash/43d33182360378d5c8e69dd706c24f2f-Abstract-Conference.html",
    codeUrl: "https://github.com/zhanglijun95/ZoDiac",
  },
  {
    slug: "semantic-forgery",
    shortTitle: "Black-Box Forgery",
    title: "Black-Box Forgery Attacks on Semantic Watermarks for Diffusion Models",
    venue: "CVPR",
    year: "2025",
    authors: "Andreas Muller, Denis Lukovnikov, Jonas Thietke, Asja Fischer and Erwin Quiring",
    family: "Semantic or task-aware",
    boundary: "Per-image optimisation",
    boundaryDetail:
      "This is an attack study rather than an embedder. It uses optimisation and unrelated diffusion models to forge or remove semantic watermark evidence from images.",
    oneLine:
      "Shows that robust detection is not authenticity: a single marked image can support watermark forgery or removal with an unrelated model.",
    problem:
      "Tree-Rings and Gaussian Shading are robust against many image distortions, but robustness does not prove that only the legitimate generator can create their evidence.",
    mechanism: [
      "Obtain one image carrying the target semantic watermark.",
      "Use an unrelated diffusion model to optimise a real image towards the target watermark representation, or invert and regenerate with another prompt.",
      "Preserve useful visual content while increasing the target detector score.",
      "Test whether the forged or removed image crosses the black-box verification threshold.",
    ],
    detection:
      "The attacked system's ordinary detector is the oracle. The paper studies whether an attacker can cause acceptance or rejection without the original embedding key.",
    contributions: [
      "Separates robustness from unforgeability.",
      "Demonstrates cross-architecture attacks with unrelated latent spaces.",
      "Makes single-reference-image forgery a practical threat model.",
    ],
    limitations: [
      "Attack cost and query assumptions determine deployment relevance.",
      "Results on semantic watermarks do not automatically transfer to signed payload systems.",
      "A detector with content binding or rate-limited access may change the attack.",
    ],
    studyQuestions: [
      "Which part of the target score transfers across unrelated models?",
      "How many detector queries or reference images are needed?",
      "Would a cryptographic signature stop attribution even if low-level evidence is forged?",
    ],
    paperUrl:
      "https://openaccess.thecvf.com/content/CVPR2025/html/Muller_Black-Box_Forgery_Attacks_on_Semantic_Watermarks_for_Diffusion_Models_CVPR_2025_paper.html",
    codeUrl: "https://github.com/and-mill/semantic-forgery",
  },
];

const foundational: PaperStudy["category"] = "Foundations and bridges";
const noise: PaperStudy["category"] = "Initial-noise and inversion";
const learned: PaperStudy["category"] = "Learned and model-integrated";
const security: PaperStudy["category"] = "Semantics, integrity and security";

export const studyContent: Record<string, PaperStudy> = {
  hidden: {
    category: foundational,
    thesis:
      "HiDDeN turns watermarking into supervised communication through a differentiable channel. Later diffusion systems inherit its encoder, decoder and attack-layer logic even when they move embedding elsewhere.",
    intervention: "A learned image encoder writes bits into cover pixels and is trained through sampled distortions.",
    fixedPoint: "The cover-image task and the definition of the payload remain unchanged.",
    verificationAssumption: "The received image resembles the training distribution and its distortions are represented by the noise layers.",
    sections: [
      {
        title: "Why a noise layer changes the learning problem",
        paragraphs: [
          "Without an attack layer, the encoder can hide a brittle code in tiny pixel variations. The decoder succeeds on clean images but fails after ordinary processing. HiDDeN inserts the channel between encoder and decoder during training, so gradients reward features that survive the simulated operation.",
          "JPEG illustrates the difficulty. Exact JPEG quantisation is not differentiable at rounding points, so the training graph uses an approximation. This teaches robustness to a proxy channel, which must later be validated against the real codec.",
        ],
        equation: {
          expression: "min E,D  Lmsg(D(N(E(x, w))), w) + λimg Limg(E(x, w), x)",
          note: "N is a sampled distortion layer; the objective couples message recovery and image fidelity.",
        },
      },
      {
        title: "The detector can learn the wrong regularity",
        paragraphs: [
          "A neural decoder is not forced to recover a human-designed signal. It can exploit any stable correlation produced by the encoder and training data. Strong clean accuracy therefore does not reveal whether the message is carried by texture, colour statistics, edges or a dataset artefact.",
          "This matters when Stable Signature reuses a pre-trained extractor. Fine-tuning the diffusion decoder teaches generated images to satisfy that extractor, so the extractor's biases and blind spots become properties of the generator-level watermark.",
        ],
        takeaway: "HiDDeN is best read as a learned communication framework, not merely an early neural watermark benchmark.",
      },
    ],
    judgement:
      "Look for real attack implementations alongside their differentiable training approximations, negative-image calibration, payload-dependent error and results on images outside the training domain.",
    connections: ["RoSteALS removes the need for the watermark encoder to learn an image prior.", "Stable Signature distils a fixed HiDDeN-style extractor into a diffusion decoder."],
  },
  rosteals: {
    category: foundational,
    thesis:
      "RoSteALS makes the autoencoder latent the meeting point between a fixed image prior and a learned message offset. That separation explains why latent watermarking can be lighter than a full pixel encoder.",
    intervention: "A message encoder produces an offset that is added to a frozen autoencoder latent.",
    fixedPoint: "The autoencoder weights and their learned image manifold remain fixed.",
    verificationAssumption: "The image-space decoder recognises how the fixed autoencoder transports the offset into pixels.",
    sections: [
      {
        title: "Factor the problem into image modelling and message transport",
        paragraphs: [
          "A conventional neural embedder must learn how to alter many kinds of images without damaging them. RoSteALS starts with a pre-trained autoencoder that already reconstructs those images. The trainable secret encoder only learns a displacement in that existing latent geometry.",
          "Because the message offset is produced without re-encoding the whole image distribution, the trainable module is small. The cost is dependence on the frozen autoencoder: its bottleneck determines which changes survive decoding and which image details are already lost.",
        ],
        equation: {
          expression: "zw = EncAE(x) + Es(w),   xw = DecAE(zw)",
          note: "The payload changes the latent additively while the image autoencoder stays frozen.",
        },
      },
      {
        title: "Why this is a bridge to cover-less generation",
        paragraphs: [
          "The same latent offset can be added when the base latent comes from a cover image or from a generative process. That makes RoSteALS conceptually important for LaWa and other in-generation systems, even though its main formulation remains a trained watermark system.",
          "The key question is whether an offset that works across covers becomes a repeatable signature. Universality helps scale embedding but may let an attacker estimate or cancel the common direction from many marked samples.",
        ],
        takeaway: "A frozen generator does not imply a training-free watermark. The secret encoder and detector still define a learned channel.",
      },
    ],
    judgement:
      "Separate reconstruction error from watermark distortion, and test whether the secret offset and decoder transfer across autoencoders, image domains and payloads.",
    connections: ["LaWa extends latent message writing into a coarse-to-fine in-generation system.", "ZoDiac instead optimises the latent of each cover image against an explicit pattern."],
  },
  "stable-signature": {
    category: foundational,
    thesis:
      "Stable Signature removes the detachable post-processing step by teaching the VAE decoder itself to satisfy a robust image watermark extractor.",
    intervention: "Fine-tune the latent decoder for one registered binary signature.",
    fixedPoint: "The diffusion denoiser, text encoder and watermark extractor are held fixed.",
    verificationAssumption: "Generated pixels retain enough extractor evidence after editing, and the registered signature remains secret or controlled.",
    sections: [
      {
        title: "Distillation reverses the ordinary watermark pipeline",
        paragraphs: [
          "Ordinary learned watermarking trains an encoder to serve a decoder. Stable Signature begins with the extractor and changes the image generator instead. Random diffusion latents are decoded, the fixed extractor reads the outputs, and gradients update the VAE decoder until its outputs consistently produce the target bits.",
          "This makes embedding automatic for text-to-image, image-to-image and other tasks that share the decoder. It also localises the modification: the denoising trajectory remains untouched, but every final latent passes through the marked decoder.",
        ],
        equation: {
          expression: "min θDec  Ew,z [Lbits(Extractor(Decθ(z)), w) + λ Lperceptual(Decθ(z), Dec0(z))]",
          note: "The new decoder must satisfy a fixed extractor while remaining close to the original decoder.",
        },
      },
      {
        title: "The statistical test is part of the method",
        paragraphs: [
          "For a k-bit signature, random agreement with a registered key follows a binomial model only under assumptions about independent, balanced extractor bits. The acceptance threshold converts bit agreement into a claimed false-positive rate.",
          "This is stronger than reporting average bit accuracy, but it also creates an audit obligation. Correlated extractor outputs or biased bits make a naive binomial tail optimistic. Negative images must test the model, not merely the mathematical ideal.",
        ],
        takeaway: "Stable Signature is both a decoder fine-tuning method and a hypothesis-testing method.",
      },
      {
        title: "Open weights change the threat model",
        paragraphs: [
          "Embedding cannot be disabled by commenting out one post-processing line, but a user who owns the weights can replace the VAE decoder, compare it with an unmarked decoder or fine-tune it. The method is therefore stronger for controlled model serving than for unrestricted white-box distribution.",
        ],
      },
    ],
    judgement:
      "Check the negative set supporting the false-positive claim, the independence of extracted bits, decoder replacement attacks and whether quality is evaluated on paired reconstructions as well as generated distributions.",
    connections: ["HiDDeN supplies the extractor lineage.", "AquaLoRA and SleeperMark move ownership evidence deeper into model weights."],
  },
  wouaf: {
    category: learned,
    thesis:
      "WOUAF turns user identity into a parameter-generation problem: a fingerprint controls weight modulation, and the released model copy becomes the carrier.",
    intervention: "Generate user-specific modulation for selected diffusion weights.",
    fixedPoint: "The text-to-image interface and base model architecture stay compatible.",
    verificationAssumption: "The user-specific parameter change leaves a decodable image trace after post-processing and later use.",
    sections: [
      {
        title: "From one marked model to a family of marked models",
        paragraphs: [
          "Training a complete Stable Diffusion copy for every user is expensive. WOUAF learns a mapping from a fingerprint to weight modulation, allowing a distributor to instantiate many related copies. The fingerprint is not inserted independently into each image; it changes the model function that produces images.",
          "This changes capacity. The practical unit is the number of reliably distinguishable users, not just the number of decoder bits. Closed-set attribution can look strong while an unknown or unmarked model is still forced into one registered identity.",
        ],
        equation: {
          expression: "θu = Modulate(θ0, H(fu)),   xu = Gθu(prompt, zT)",
          note: "A user fingerprint fu controls a hypernetwork H that changes model weights.",
        },
      },
      {
        title: "Collusion is the natural weight-space attack",
        paragraphs: [
          "If two users receive differently modulated copies, they can compare or average their weights. Shared base parameters cancel conceptually, exposing the directions associated with identity. Fine-tuning and model merging create related attacks even without explicit collusion.",
          "A serious attribution evaluation should therefore include open-set rejection, copy averaging, model merging, pruning and targeted decoder training, not only JPEG or crop applied to final images.",
        ],
        takeaway: "Model fingerprinting needs both image-channel robustness and model-channel robustness.",
      },
    ],
    judgement:
      "Read user-attribution accuracy together with the enrolled population, rejection rule, collusion model, weight access and cost of producing or storing user copies.",
    connections: ["AquaLoRA uses low-rank adapters to bind evidence to customised models.", "RingID studies multi-key identification in the initial-noise family."],
  },
  aqualora: {
    category: learned,
    thesis:
      "AquaLoRA embeds watermark behaviour into low-rank U-Net updates so a customised model carries ownership evidence even when its decoder is replaceable.",
    intervention: "Train and merge a watermark LoRA into U-Net layers.",
    fixedPoint: "Most base weights remain fixed, and the model retains the ordinary sampling interface.",
    verificationAssumption: "The learned latent watermark survives U-Net denoising, VAE decoding and expected downstream customisation.",
    sections: [
      {
        title: "Why the U-Net is a stronger white-box location",
        paragraphs: [
          "A detachable pixel encoder or VAE decoder can be replaced without changing the denoiser. AquaLoRA moves the cause of the watermark into the U-Net trajectory. Every denoising step can reinforce the learned latent evidence before the image reaches the decoder.",
          "Low-rank adaptation constrains the parameter change. Instead of updating a full matrix W, LoRA adds a product BA with small rank. The watermark scaling matrix controls how message information modulates this update.",
        ],
        equation: {
          expression: "Wmarked = W0 + B S(w) A",
          note: "The message-dependent scaling matrix S(w) changes a compact low-rank update.",
        },
      },
      {
        title: "Prior preservation is about function drift",
        paragraphs: [
          "A model can retain FID while changing rare prompts or custom concepts. Prior-preserving fine-tuning tries to keep the marked U-Net close to the original generation behaviour while learning the watermark. The relevant object is a conditional function over prompts and noise, not one reconstruction pair.",
          "The white-box adversary can subtract the public base model from the marked model, inspect low-rank structure, merge unrelated LoRAs or retrain selected layers. These attacks test whether entanglement is real or merely inconvenient to remove.",
        ],
        takeaway: "Parameter efficiency reduces owner cost but also exposes a compact object for the attacker to inspect.",
      },
    ],
    judgement:
      "Check the base-model comparison available to the attacker, LoRA merging and pruning attacks, prompt coverage of quality tests, and whether message updates truly avoid retraining.",
    connections: ["WOUAF maps user identity to broader weight modulation.", "SleeperMark focuses on surviving downstream fine-tuning rather than only white-box removal."],
  },
  sleepermark: {
    category: learned,
    thesis:
      "SleeperMark treats downstream fine-tuning as a second learning process that the watermark must survive, rather than as an ordinary image attack.",
    intervention: "Train watermark knowledge to be disentangled from task semantics and retained through adaptation.",
    fixedPoint: "The owner wants ordinary generation quality and downstream customisability to remain useful.",
    verificationAssumption: "The owner can issue black-box verification queries after the model has been customised.",
    sections: [
      {
        title: "Forgetting is a model-channel failure",
        paragraphs: [
          "Fine-tuning changes the parameters that encode both semantic concepts and watermark behaviour. If the two use the same fragile directions, adapting to a new subject overwrites the mark. SleeperMark explicitly guides the network to separate these roles.",
          "This is different from crop or JPEG. The image channel may be untouched while the generator that should produce the evidence has changed. Evaluation must include several fine-tuning objectives, data sizes, parameter subsets and training durations.",
        ],
      },
      {
        title: "A sleeping behaviour must still be testable",
        paragraphs: [
          "The watermark should not visibly affect ordinary prompts, yet ownership queries must activate reliable evidence. This resembles a controlled backdoor and inherits similar questions: trigger secrecy, accidental activation, transfer to unseen prompts and targeted unlearning.",
          "Black-box verification is operationally attractive because it avoids reading suspect weights. It also exposes a query surface. An attacker who recognises verification prompts can filter outputs or fine-tune specifically against them.",
        ],
        takeaway: "Persistence, stealth and verifiability are three separate objectives.",
      },
    ],
    judgement:
      "Inspect the diversity of downstream fine-tuning recipes, trigger leakage, false activation on clean models, targeted unlearning and whether verification queries are distinguishable from normal use.",
    connections: ["AquaLoRA addresses white-box placement in customised models.", "Stable Signature is easier to remove when the decoder itself is replaced or tuned."],
  },
  zodiac: {
    category: foundational,
    thesis:
      "ZoDiac uses the diffusion latent as a robust editing space for an existing image. It is essential for separating latent watermarking from in-generation watermarking.",
    intervention: "Optimise the latent of a cover image towards a watermark target.",
    fixedPoint: "The pre-trained Stable Diffusion weights remain fixed.",
    verificationAssumption: "A compatible inversion recovers enough of the optimised latent pattern after image attacks.",
    sections: [
      {
        title: "The cover image changes the fidelity objective",
        paragraphs: [
          "Unlike Tree-Rings, ZoDiac begins with a specific image whose visible content should remain stable. The optimiser balances a latent watermark objective against pixel and perceptual reconstruction losses. There is a meaningful paired reference x.",
          "The diffusion prior regularises the edited result towards plausible images. That can improve robustness against reconstruction attacks, but it can also change small semantic details even when global perceptual metrics remain favourable.",
        ],
        equation: {
          expression: "z* = argminz  Lwm(F(z), k) + λp Lperceptual(Dec(z), x) + λ2 ||Dec(z)-x||²",
          note: "The latent is optimised per image; fidelity is measured against the original cover.",
        },
      },
      {
        title: "Detection inherits the embedding model",
        paragraphs: [
          "The same diffusion geometry supports embedding and extraction. This can make the pattern persistent under attacks produced by a similar model, but it also creates model dependence. A verifier using another VAE or scheduler may recover a different latent.",
          "Published detection rates must be read with their false-positive rate. A rate suitable for a laboratory comparison may still produce too many false ownership claims when millions of unrelated images are scanned.",
        ],
        takeaway: "ZoDiac is a diffusion-assisted image watermark, not a watermark of the generator's initial randomness.",
      },
    ],
    judgement:
      "Compare per-image optimisation cost, paired semantic changes, cross-model inversion and low false-positive operating points.",
    connections: ["RoSteALS also starts from a cover latent but learns a reusable offset.", "Tree-Rings marks the initial noise before an image exists."],
  },
  "semantic-forgery": {
    category: security,
    thesis:
      "The forgery study demonstrates that a detector can be robust under image processing and still be insecure as an attribution mechanism.",
    intervention: "Optimise images or regeneration paths against a target black-box detector.",
    fixedPoint: "The target verifier is unchanged and the attacker does not receive its secret embedding key.",
    verificationAssumption: "The attacker can observe at least one marked reference and reproduce or query relevant detector behaviour.",
    sections: [
      {
        title: "Detection evidence is not a cryptographic credential",
        paragraphs: [
          "Tree-Rings and Gaussian Shading verify that an inverted latent resembles key-dependent structure. If an unrelated model can transform an arbitrary image into one that produces the same score, the detector cannot tell legitimate generation from forged evidence.",
          "This is an authenticity failure even when the watermark remains visually invisible and robust to JPEG. Robustness asks whether genuine evidence survives. Unforgeability asks whether an unauthorised party can create evidence.",
        ],
      },
      {
        title: "Why cross-model transfer is the disturbing result",
        paragraphs: [
          "The attack does not require the exact generator or even the same architecture. An unrelated U-Net or diffusion transformer can provide an optimisation space that preserves useful content while moving the image towards the target detector region.",
          "That suggests the detector is responding to a transferable image-level or latent-level property, not an exclusive record of one generation event. A single marked reference can therefore become an attack resource.",
        ],
        takeaway: "A watermark score should be treated as a security decision, not only a signal-processing measurement.",
      },
      {
        title: "What cryptographic binding can and cannot fix",
        paragraphs: [
          "Signing a payload can stop an attacker from inventing a new valid message without the signing key. It does not automatically stop copying a valid signed payload or low-level watermark evidence into another image. Content binding, nonce policy and verification context still matter.",
        ],
      },
    ],
    judgement:
      "Compare attack success at the deployed threshold, record query and reference-image budgets, and test signed, content-bound and rate-limited verification variants.",
    connections: ["SEAL binds keys to semantic content to address transplant attacks.", "Gaussian Shading++ adds public-key signatures but still needs image-message binding."],
  },
  "latent-watermark": {
    category: learned,
    thesis:
      "Latent Watermark moves both message injection and recognition away from raw pixels, using progressive training to reduce the conflict between latent robustness and decoded-image quality.",
    intervention: "Learn latent-space injection and detection modules with a staged objective.",
    fixedPoint: "A pre-trained latent diffusion backbone provides the representation and generation process.",
    verificationAssumption: "The trained latent detector generalises across image content and attacks beyond its curriculum.",
    sections: [
      {
        title: "Why moving both ends matters",
        paragraphs: [
          "Moving only the embedder into latent space while decoding in pixels still asks the signal to survive a learned nonlinear transport. Latent Watermark aligns injection and detection in the same representation, so the decoder can target features preserved by the latent model.",
          "Progressive training controls optimisation difficulty. The system first learns a recoverable message path, then introduces fidelity and attack constraints. This is a training strategy, not an architectural guarantee that the objectives no longer conflict.",
        ],
      },
      {
        title: "A learned latent detector defines a new domain",
        paragraphs: [
          "The detector sees latents produced by a particular encoder and model family. Changing the VAE, image resolution or generator can shift that distribution. A claim of latent-space robustness therefore needs cross-model tests as well as image attacks.",
        ],
        takeaway: "The main contribution is representation alignment plus curriculum, not training-free embedding.",
      },
    ],
    judgement:
      "Separate the effect of latent placement from progressive training, and test unseen attacks, unseen VAEs and negative calibration.",
    connections: ["LaWa writes messages through multi-scale latent modules.", "RoSteALS provides the frozen-autoencoder precursor."],
  },
  "gaussian-shannon": {
    category: noise,
    thesis:
      "Gaussian Shannon treats generation and inversion as a noisy digital channel and optimises for exact message recovery, not merely high average bit accuracy.",
    intervention: "Add cascaded error correction and repeated observations around Gaussian latent mapping.",
    fixedPoint: "The diffusion generator and its sampling distribution are not trained.",
    verificationAssumption: "The channel model and redundancy cover the dominant local and global inversion errors.",
    sections: [
      {
        title: "From bit accuracy to block reliability",
        paragraphs: [
          "An identifier is useful only when the full word is correct. Even a small independent bit-error rate can make long messages fail. Cascaded coding introduces structured redundancy so the decoder can correct errors rather than accepting raw threshold decisions.",
          "Majority voting addresses repeated observations, while error-correcting codes address patterns within the word. Their gains should be reported against the effective application payload after overhead.",
        ],
        equation: {
          expression: "P(word error) = 1 - P(all application bits correct)",
          note: "High marginal bit accuracy can still yield poor exact-message recovery as payload grows.",
        },
      },
      {
        title: "The channel is neither fixed nor memoryless",
        paragraphs: [
          "Generation settings, inversion scheduler and image edits change the residual distribution. Spatially nearby latent coordinates and channels may fail together. A decoder calibrated on independent flips can be overconfident under crop, regeneration or correlated inversion error.",
        ],
        takeaway: "Coding is only as good as the channel assumptions used to allocate redundancy.",
      },
    ],
    judgement:
      "Compare exact-message success, useful rate, attack composition and held-out channel conditions at the same false-positive rate.",
    connections: ["PRC uses pseudorandom coding for security as well as correction.", "Gaussian Shading supplies the distribution-preserving latent mapping."],
  },
  gaussmarker: {
    category: learned,
    thesis:
      "GaussMarker combines complementary spatial and Fourier evidence and learns to restore the inverted noise before scoring it.",
    intervention: "Embed two latent patterns and pass the recovered latent through a trained Gaussian Noise Restorer.",
    fixedPoint: "The underlying diffusion generator can remain unchanged.",
    verificationAssumption: "The restorer removes inversion corruption without hallucinating watermark evidence on negatives.",
    sections: [
      {
        title: "Dual-domain design is an error-diversity argument",
        paragraphs: [
          "A spatial pattern and a Fourier pattern respond differently to compression, crop and geometric transformation. Fusing them is useful only if their errors are not perfectly correlated. Ablations should show which branch contributes under each attack.",
          "The restorer is trained to map corrupted inverted noise towards the expected Gaussian latent. This can increase signal-to-noise ratio, but it can also learn a prior that pulls unmarked inputs towards familiar watermark structures.",
        ],
      },
      {
        title: "Restoration changes the null distribution",
        paragraphs: [
          "Detector calibration must include the restorer. Scores on raw unmarked latents are not the relevant null if every query is first processed by a learned network. Model and attack distribution shifts can change both genuine and false evidence.",
        ],
        takeaway: "The base generator is training-free, but verification is a learned inverse problem.",
      },
    ],
    judgement:
      "Look for branch-specific ablations, negatives passed through the restorer, cross-model tests and calibration after score fusion.",
    connections: ["Tree-Rings relies on direct Fourier matching.", "SERUM avoids inversion by learning an image-space detector."],
  },
  lawa: {
    category: learned,
    thesis:
      "LaWa writes a message across several autoencoder-latent scales so one image-space decoder can recover many user identities.",
    intervention: "Insert learned coarse-to-fine message features into latent decoding.",
    fixedPoint: "The pre-trained latent diffusion denoiser remains unchanged.",
    verificationAssumption: "The learned decoder generalises across messages, content and post-processing.",
    sections: [
      {
        title: "Coarse-to-fine means allocate information by scale",
        paragraphs: [
          "Coarse latent features influence broad structure and survive some resizing, while fine features offer more spatial capacity but are easier to erase. LaWa distributes message evidence across these scales instead of relying on one injection layer.",
          "A single decoder for many messages is operationally attractive. It changes the task from presence detection to communication: payload length, code distance and whole-message accuracy become central.",
        ],
      },
      {
        title: "High payload magnifies small error rates",
        paragraphs: [
          "If each bit has a modest failure probability, a long user identifier can still be wrong somewhere. Error correction, identity matching and rejection rules must be included when translating bit accuracy into user attribution.",
        ],
        takeaway: "LaWa is learned latent communication with a fixed generator, not a no-training sampler modification.",
      },
    ],
    judgement:
      "Track useful payload after coding, exact-message recovery, cross-VAE transfer and the number of users under open-set rejection.",
    connections: ["RoSteALS supplies the latent-offset idea.", "Gaussian Shannon approaches exact recovery through explicit channel coding."],
  },
  "tree-rings": {
    category: noise,
    thesis:
      "Tree-Rings establishes that a structured Fourier pattern in initial Gaussian noise can be transported through diffusion and recovered by inversion without training a watermark network.",
    intervention: "Replace selected Fourier coefficients of zT with a key-dependent ring pattern.",
    fixedPoint: "Model weights and the ordinary denoising loop stay unchanged.",
    verificationAssumption: "Inversion approximately recovers the marked region and the null score is calibrated on unmarked samples.",
    sections: [
      {
        title: "Why the ring lives before the image",
        paragraphs: [
          "The watermark is inserted into the randomness that starts synthesis, not added to finished pixels. The denoiser transports this structured perturbation through many nonlinear steps. There is no canonical cover image whose pixel residual equals the watermark.",
          "A radial Fourier pattern is motivated by geometric behaviour: ideal rotation changes angular position but preserves radius. Real crop, resize and VAE encoding are not ideal rotations, so empirical robustness still matters.",
        ],
      },
      {
        title: "Detection is a hypothesis test on an estimate",
        paragraphs: [
          "The verifier encodes the image, inverts the diffusion path and compares a selected Fourier region with the secret key. Both the latent and the resulting distance are estimates. The threshold must be derived from unmarked inversion scores.",
          "RingID later shows that distribution shift introduced by coefficient replacement contributes to detection. A detector may therefore recognise that the latent is unusual as well as matching the intended ring.",
        ],
        takeaway: "The mechanism has two possible signals: key-pattern agreement and watermark-induced distribution shift.",
      },
    ],
    judgement:
      "Read the pattern ablation, latent-distribution audit, threshold calibration, prompt and model assumptions, and composed geometric attacks.",
    connections: ["RingID audits distribution shift and multi-key identification.", "SFWMark enforces Fourier integrity and crop-aware placement."],
  },
  robin: {
    category: noise,
    thesis:
      "ROBIN separates watermark strength from visible concealment by writing strong evidence at an intermediate state and optimising conditioning to hide its final effect.",
    intervention: "Mark an intermediate latent and optimise a prompt embedding for each watermark instance.",
    fixedPoint: "The diffusion model weights remain fixed.",
    verificationAssumption: "The reverse process can return to the marked intermediate region after tampering.",
    sections: [
      {
        title: "Concealment becomes an active control problem",
        paragraphs: [
          "Most methods limit watermark strength until artefacts are acceptable. ROBIN first allows a strong internal signal, then searches for conditioning that steers later denoising towards a clean-looking output while retaining reversible evidence.",
          "The optimised prompt embedding is not only a hiding variable. It can change prompt alignment and scene composition. Fidelity tests must therefore inspect requested objects and relations, not only generic image quality.",
        ],
      },
      {
        title: "Intermediate-state evidence adds trajectory dependence",
        paragraphs: [
          "Verification needs compatible access to the reverse trajectory and the chosen time step. Scheduler changes, distilled sampling and generative editing can prevent the verifier from reaching the same state.",
        ],
        takeaway: "ROBIN trades training for per-instance optimisation and stronger trajectory assumptions.",
      },
    ],
    judgement:
      "Report optimisation latency, prompt-semantic drift, time-step sensitivity and verification under different samplers.",
    connections: ["Tree-Rings marks only the starting state.", "TAG-WM uses inversion sensitivity for localisation rather than concealment."],
  },
  ringid: {
    category: noise,
    thesis:
      "RingID is both a method and a correction to the field's explanation of Tree-Rings: unintended distribution shift helps binary detection, while better key geometry is needed for identification.",
    intervention: "Use heterogeneous multi-channel patterns with improved imprinting.",
    fixedPoint: "The generator remains training-free and inversion-based.",
    verificationAssumption: "Candidate keys are sufficiently separated after inversion, and the verifier can reject all candidates when appropriate.",
    sections: [
      {
        title: "Presence detection and identification are different tests",
        paragraphs: [
          "Binary detection asks whether one key explains the score better than the null. Identification searches many keys and chooses one. As the registry grows, the chance that some wrong key matches by accident increases.",
          "A closed-set top-one experiment always returns a user. Deployment requires open-set rejection for real images, unregistered users and outputs from other models.",
        ],
        equation: {
          expression: "accept key i only if si > τ and si - maxj≠i sj > margin",
          note: "Identification needs both absolute evidence and separation from competing keys.",
        },
      },
      {
        title: "Mechanism audits prevent accidental progress",
        paragraphs: [
          "If detection gains come from a distribution shift rather than the intended ring, changing the pattern may not behave as predicted. RingID's audit is therefore methodologically important: measure what the detector actually uses before optimising it.",
        ],
        takeaway: "Multi-key work should publish false attribution as a function of registry size.",
      },
    ],
    judgement:
      "Check open-set evaluation, multiple-testing correction, key-count scaling and results after matching the latent distribution.",
    connections: ["Tree-Rings introduces the basic pattern.", "WOUAF addresses user identification through weight modulation instead."],
  },
  "object-watermark": {
    category: learned,
    thesis:
      "The text-encoder controller makes watermark placement part of prompt semantics, allowing an object token to request local rather than whole-image marking.",
    intervention: "Learn new control-token embeddings and a blind payload detector.",
    fixedPoint: "Most generator parameters remain unchanged.",
    verificationAssumption: "Prompt-token control maps consistently to the intended object and the detector can isolate its evidence.",
    sections: [
      {
        title: "A token is a controller, not the watermark itself",
        paragraphs: [
          "The learned token changes cross-attention and denoising features so the generated pixels for a requested object carry evidence. The payload is still read from the image by a trained detector.",
          "Object language is ambiguous. A prompt may contain two dogs, an implied object, overlapping nouns or attributes that do not have a stable segmentation. The control problem is therefore partly one of grounding.",
        ],
      },
      {
        title: "Local protection changes the attack surface",
        paragraphs: [
          "Cropping the marked object may preserve the watermark while removing scene context. Replacing only that object may erase it while the rest of the image stays untouched. Evaluation should report object-level localisation and region-specific attacks.",
        ],
        takeaway: "Parameter-efficient conditioning fine-tuning is still method-specific training.",
      },
    ],
    judgement:
      "Inspect multi-instance prompts, localisation evidence, prompt-token omission and substitution, cropped-object detection and detector training data.",
    connections: ["SEAL binds a key to semantic content after generation.", "TAG-WM separates global copyright evidence from local tamper evidence."],
  },
  serum: {
    category: learned,
    thesis:
      "SERUM keeps initial-noise marking but replaces expensive inversion with a learned image-space detector.",
    intervention: "Add a user-specific noise mark and train a lightweight output classifier.",
    fixedPoint: "The diffusion generator and its sampler stay unchanged.",
    verificationAssumption: "The generated visual trace learned by the detector transfers across prompts, models and untrained attacks.",
    sections: [
      {
        title: "Avoiding inversion changes what the detector learns",
        paragraphs: [
          "An inversion detector explicitly searches for a latent key. SERUM's classifier can use any image feature consistently caused by the marked noise. This makes verification fast, but the causal path becomes harder to interpret.",
          "If the detector learns a generator-specific artefact, it may fail on another model or fire on unrelated synthetic images. Cross-generator negatives and out-of-distribution images are therefore central.",
        ],
      },
      {
        title: "Fast multi-user detection still needs rejection",
        paragraphs: [
          "Distinct noise marks can represent users, but a classifier must reject images from no registered user. Scaling class count can increase false attribution even when top-one accuracy remains high.",
        ],
        takeaway: "SERUM trades model-based inversion assumptions for learned generalisation assumptions.",
      },
    ],
    judgement:
      "Compare end-to-end latency, cross-generator negatives, open-set user identification and adaptive classifier-based removal.",
    connections: ["GaussMarker learns a latent restorer but still inverts.", "WOUAF also uses an image decoder for user attribution from a model fingerprint."],
  },
  seal: {
    category: security,
    thesis:
      "SEAL derives expected watermark evidence from image semantics so copying low-level evidence to unrelated content should fail verification.",
    intervention: "Hash a semantic representation into content-dependent noise keys.",
    fixedPoint: "The base generator can remain unchanged and no key database search is needed.",
    verificationAssumption: "The semantic encoder is stable for benign edits but changes for malicious semantic edits.",
    sections: [
      {
        title: "Locality-sensitive hashing sets the meaning boundary",
        paragraphs: [
          "A semantic embedding maps the image or intended content to a vector. Locality-sensitive hashing turns nearby vectors into related key decisions, allowing modest transformations to retain verification.",
          "The tolerance boundary is also an attack surface. An adversary can search for an edit that changes meaning while remaining in the same hash region, or causes a benign crop to cross the boundary.",
        ],
        equation: {
          expression: "k(x) = LSH(φsemantic(x))",
          note: "The watermark key becomes a function of content representation rather than only owner identity.",
        },
      },
      {
        title: "Content binding is not objective truth",
        paragraphs: [
          "The semantic encoder defines which changes matter. Its biases, adversarial weaknesses and granularity become security properties. Replacing a small object may be important to a human but minor in a global embedding.",
        ],
        takeaway: "SEAL converts watermark security into semantic-representation security.",
      },
    ],
    judgement:
      "Test encoder substitution, partial crops, small but consequential object edits, hash-boundary search and semantic collisions.",
    connections: ["Black-Box Forgery motivates content binding.", "TAG-WM uses spatial localisation rather than only global semantics."],
  },
  sfwmark: {
    category: security,
    thesis:
      "SFWMark treats Fourier validity and spatial alignment as engineering constraints, not incidental details of a ring pattern.",
    intervention: "Construct Hermitian-symmetric, centre-aware Fourier watermark patterns.",
    fixedPoint: "The generator remains training-free.",
    verificationAssumption: "Inversion and geometric correction preserve the prescribed symmetric pattern.",
    sections: [
      {
        title: "Hermitian symmetry is required by real-valued signals",
        paragraphs: [
          "A real spatial tensor has conjugate-symmetric Fourier coefficients. Editing one coefficient without its conjugate pair introduces an imaginary component or forces an inconsistent projection when transformed back.",
          "A symmetric watermark uses both locations coherently. This can improve fidelity and make the mechanism easier to reason about, but it does not make the pattern immune to reconstruction.",
        ],
        equation: {
          expression: "F(-u, -v) = conjugate(F(u, v))",
          note: "The constraint links opposite Fourier coordinates.",
        },
      },
      {
        title: "Crop robustness is an alignment problem",
        paragraphs: [
          "Cropping removes spatial support and changes the Fourier spectrum. Centre-aware placement tries to retain predictable evidence after common crops, but crop plus resize and off-centre composition still alter the recovered geometry.",
        ],
        takeaway: "Fourier integrity improves signal construction; security still depends on verification and threat models.",
      },
    ],
    judgement:
      "Compare crop plus resize compositions, off-centre content, symmetry ablations, key capacity and forgery attacks.",
    connections: ["Tree-Rings introduces radial Fourier structure.", "SynTag, discussed in further reading, learns a geometric synchronisation signal."],
  },
  "tag-wm": {
    category: security,
    thesis:
      "TAG-WM separates source ownership from content integrity by jointly embedding a global message and a localisation signal.",
    intervention: "Jointly sample copyright and localisation marks, then use inversion sensitivity to find edited regions.",
    fixedPoint: "The diffusion generator remains unchanged.",
    verificationAssumption: "Tampering creates local statistical deviation that inversion sensitivity can separate from benign distortion.",
    sections: [
      {
        title: "A surviving owner mark can validate a false image",
        paragraphs: [
          "Robustness is not always desirable for integrity. If an attacker replaces an object but the owner payload survives, a binary verifier may accept the altered image. TAG-WM adds a second signal whose job is to reveal where content no longer follows the original generation.",
          "The two marks must coexist without consuming each other's capacity or producing visible artefacts. Joint sampling defines that allocation in the latent.",
        ],
      },
      {
        title: "Inversion sensitivity becomes a dense statistic",
        paragraphs: [
          "Instead of producing one score, the verifier measures local variation along inversion and estimates a tamper mask. Small regions, boundary blur and benign local edits create thresholding problems at pixel level.",
          "The tamper mask then guides payload decoding so corrupted regions contribute less. This couples localisation quality to message recovery.",
        ],
        takeaway: "TAG-WM produces two outputs with different error costs: a message and a spatial mask.",
      },
    ],
    judgement:
      "Report region-level precision and recall, minimum tamper size, benign-edit false alarms, payload recovery under the same attacks and inversion cost.",
    connections: ["SEAL binds evidence to global semantics.", "ROBIN also relies on intermediate trajectory structure but for concealment."],
  },
  "gaussian-shading": {
    category: noise,
    thesis:
      "Gaussian Shading encodes bits by conditional sampling so the marked initial latent retains the same target Gaussian marginal distribution as ordinary noise.",
    intervention: "Diffuse, randomise and map payload bits into Gaussian coordinate regions.",
    fixedPoint: "Model weights and standard image sampling remain unchanged.",
    verificationAssumption: "Inversion noise does not move too many coordinates across their bit regions, and keys are managed safely.",
    sections: [
      {
        title: "Distribution preservation is a sampling construction",
        paragraphs: [
          "A naive sign code assigns positive values to one bit and negative values to the other. If bits are balanced and secret, the mixture can recover a standard Gaussian marginal, but repeated structure and dependencies can still reveal the mark.",
          "Gaussian Shading diffuses and randomises the payload before distribution-preserving sampling. The quality claim concerns the distribution of starting latents, not equality between a marked image and a hypothetical unmarked image for the same semantic outcome.",
        ],
        equation: {
          expression: "zj ~ N(0,1) conditioned on encrypted bit region bj",
          note: "A balanced mixture of the conditional regions reconstructs the target Gaussian marginal.",
        },
      },
      {
        title: "Hard decisions lose inversion confidence",
        paragraphs: [
          "After inversion, a coordinate near the decision boundary is less reliable than one deep inside its assigned region. Hard bit extraction discards that difference. Gaussian Shading++ later models soft evidence and the generation-inversion channel.",
          "Key reuse and payload randomisation are not implementation details. Repeated latent partitions can expose structure across many outputs.",
        ],
        takeaway: "Performance-lossless is a distributional claim under construction assumptions, not proof of perfect operational security.",
      },
    ],
    judgement:
      "Audit joint as well as marginal statistics, key and nonce reuse, soft versus hard decoding, changed samplers and very low false-positive thresholds.",
    connections: ["Gaussian Shading++ adds operational key transport and signatures.", "PRC replaces simple randomisation with pseudorandom error-correcting structure."],
  },
  t2smark: {
    category: noise,
    thesis:
      "T2SMark allocates reliable watermark evidence to Gaussian tails while preserving central randomness for prompt-conditional diversity.",
    intervention: "Use two-stage tail-truncated sampling with a session key.",
    fixedPoint: "The generator and watermark detector require no learned parameters.",
    verificationAssumption: "Tail membership remains recoverable after generation, inversion and image processing.",
    sections: [
      {
        title: "Reliability and diversity occupy the same Gaussian budget",
        paragraphs: [
          "Coordinates far into a bit-assigned tail have a larger margin from the decoding boundary and are harder for inversion noise to flip. Forcing too many coordinates into fixed tail regions reduces randomness available to produce diverse images for the same prompt.",
          "T2SMark reserves the centre for unconstrained random sampling and uses the tails for robust evidence. The tail threshold becomes an operating parameter controlling both properties.",
        ],
        equation: {
          expression: "sample centre for diversity; sample bit-selected tail for margin",
          note: "Moving the threshold changes evidence strength and the amount of free randomness.",
        },
      },
      {
        title: "Diversity must be conditional",
        paragraphs: [
          "A global FID score can remain stable while images from the same prompt become more similar. The relevant test samples many seeds per prompt and measures semantic and perceptual spread.",
        ],
        takeaway: "A distribution can look plausible globally while losing useful conditional entropy.",
      },
    ],
    judgement:
      "Inspect same-prompt diversity, tail-threshold sweeps, session-key reuse, DiT transfer and attacks that estimate the partition.",
    connections: ["Gaussian Shading focuses on distribution-preserving message mapping.", "PRC targets computational undetectability."],
  },
  "gaussian-shading-plus-plus": {
    category: security,
    thesis:
      "Gaussian Shading++ adds the operational pieces missing from a latent sampling construction: seed transport, soft decoding and public verification.",
    intervention: "Use two coded channels and public-key signatures around Gaussian latent mapping.",
    fixedPoint: "The base generator remains training-free.",
    verificationAssumption: "The generation-inversion error is sufficiently described by the channel model and the signature is bound to the intended claim.",
    sections: [
      {
        title: "The second channel solves a key-management dependency",
        paragraphs: [
          "Gaussian Shading randomises payloads using a seed. If every image needs separate secret state at verification, deployment becomes a database problem. Gaussian Shading++ carries the needed seed information in a protected second channel so a fixed key can serve many images.",
          "Error-correcting codes protect this transport, while soft decisions retain confidence from recovered latent values instead of thresholding immediately.",
        ],
      },
      {
        title: "An AWGN model is useful and incomplete",
        paragraphs: [
          "Treating generation plus inversion as additive white Gaussian noise gives tractable likelihoods. Real residuals can be correlated, heavy-tailed and attack-dependent. A soft decoder can still help, but its confidence may be miscalibrated under model mismatch.",
        ],
        equation: {
          expression: "zHat = z + n,   n ~ N(0, σ²I)",
          note: "The assumed channel enables soft likelihoods; empirical residuals should test independence and Gaussianity.",
        },
      },
      {
        title: "A signature authenticates a message, not every pixel",
        paragraphs: [
          "Public-key verification lets third parties validate a signed payload without receiving the signing secret. If the signed payload or its low-level evidence can be transplanted, the image still needs content binding, nonce policy or tamper detection.",
        ],
        takeaway: "Deployment security is a protocol property built around the watermark signal.",
      },
    ],
    judgement:
      "Test channel-model fit, signature transplant, key revocation, seed-decoding failure and third-party verification with realistic editing.",
    connections: ["PRC supplies pseudorandom coding ideas.", "SEAL and TAG-WM address content binding and integrity."],
  },
  "prc-watermark": {
    category: noise,
    thesis:
      "PRC Watermark uses pseudorandom error-correcting codes so marked latents are computationally indistinguishable from ordinary randomness while remaining decodable with a secret key.",
    intervention: "Select initial latents that satisfy secret pseudorandom code constraints.",
    fixedPoint: "The generator is not trained or architecturally changed.",
    verificationAssumption: "The pseudorandomness and oracle assumptions hold in implementation, and inversion leaves a decodable error pattern.",
    sections: [
      {
        title: "Imperceptibility is weaker than undetectability",
        paragraphs: [
          "A person may not see a watermark while an attacker distinguishes marked and unmarked distributions with a classifier. Computational undetectability asks whether any efficient adversary can do better than chance under a formal access model.",
          "Pseudorandom codes combine a codeword that looks random without the key with enough structure for secret decoding and error correction.",
        ],
      },
      {
        title: "The proof has an interface",
        paragraphs: [
          "Security depends on what the adversary can query, which keys are secret, how randomness is generated and whether outputs leak repeated state. An implementation can violate these assumptions even when the construction is sound.",
          "Payload claims also require separation by attack setting. A large message on clean images does not imply the same useful capacity after removal attacks.",
        ],
        takeaway: "The threat model and implementation randomness are part of the theorem's practical meaning.",
      },
    ],
    judgement:
      "Map each theorem assumption to code, audit random-number generation and key reuse, and report exact-message recovery at calibrated false-positive rates.",
    connections: ["Gaussian Shading preserves a target distribution without the same cryptographic goal.", "Gaussian Shannon emphasises exact communication reliability."],
  },
};

export const additionalReading = [
  {
    title: "A Watermark-Conditioned Diffusion Model for IP Protection",
    note: "WaDiff is useful for understanding watermark-as-conditioning and API-based user identification.",
    url: "https://www.ecva.net/papers/eccv_2024/papers_ECCV/html/8694_ECCV_2024_paper.php",
  },
  {
    title: "SynTag: Enhancing the Geometric Robustness of Inversion-based Generative Image Watermarking",
    note: "SynTag frames geometric robustness as synchronisation and correction rather than invariant-feature design.",
    url: "https://openaccess.thecvf.com/content/ICCV2025/html/Fang_SynTag_Enhancing_the_Geometric_Robustness_of_Inversion-based_Generative_Image_Watermarking_ICCV_2025_paper.html",
  },
  {
    title: "Certifiably Robust Image Watermark",
    note: "This work separates empirical attack testing from certified removal and forgery radii.",
    url: "https://www.ecva.net/papers/eccv_2024/papers_ECCV/html/9971_ECCV_2024_paper.php",
  },
  {
    title: "MarkDiffusion: An Open-Source Toolkit for Generative Watermarking of Latent Diffusion Models",
    note: "The toolkit provides a shared implementation and evaluation surface for reproducing several method families.",
    url: "https://arxiv.org/abs/2509.10569",
  },
];
