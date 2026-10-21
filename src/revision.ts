import type { RevisionQuestion, HandbookSection } from "./handbookTypes";

export const revisionQuestions: RevisionQuestion[] = [
  {
    "id": "question-1",
    "number": 1,
    "topic": "Autoencoders, VAEs, and Latent Representations",
    "question": "What is an autoencoder?",
    "answer": "A neural network with an encoder and decoder. The encoder compresses an input x into a latent representation z; the decoder reconstructs an approximation of x from z. Training encourages the latent to preserve information useful for reconstruction. Encoder = compress; decoder = reconstruct.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 20 (zero-based, including table cells)"
  },
  {
    "id": "question-2",
    "number": 2,
    "topic": "Autoencoders, VAEs, and Latent Representations",
    "question": "What makes a conventional autoencoder deterministic?",
    "answer": "For fixed model weights and the same input, the encoder normally computes the same latent values each time. The mapping is approximately z = E(x). Randomness can be added deliberately, but it is not intrinsic to the basic autoencoder. Same x + same weights -> same z.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 23 (zero-based, including table cells)"
  },
  {
    "id": "question-3",
    "number": 3,
    "topic": "Autoencoders, VAEs, and Latent Representations",
    "question": "What does VAE stand for, and how is its encoder different?",
    "answer": "VAE means Variational Autoencoder. Instead of outputting only one fixed latent, the encoder outputs parameters of a distribution, typically a mean mu and spread/variance. A latent z is then sampled from that distribution. A VAE represents an input as a distribution over plausible latents.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 26 (zero-based, including table cells)"
  },
  {
    "id": "question-4",
    "number": 4,
    "topic": "Autoencoders, VAEs, and Latent Representations",
    "question": "Can a VAE produce a different latent for the same image each time?",
    "answer": "Yes, if sampling is enabled. The encoder gives the same distribution parameters for the same image, but a fresh random epsilon can produce a different z. At inference, using the mean directly instead of sampling makes the mapping deterministic. The shape stays fixed; the sampled values can change.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 29 (zero-based, including table cells)"
  },
  {
    "id": "question-5",
    "number": 5,
    "topic": "Autoencoders, VAEs, and Latent Representations",
    "question": "Why encourage a smooth, structured latent space?",
    "answer": "Generative models need to operate on latent points that were not produced by one exact training image. A smooth latent space makes nearby points decode to plausible, related outputs, reducing empty or erratic regions where the decoder has little experience. A useful latent space should behave sensibly between training examples.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 32 (zero-based, including table cells)"
  },
  {
    "id": "question-6",
    "number": 6,
    "topic": "Autoencoders, VAEs, and Latent Representations",
    "question": "Why is a VAE-like autoencoder useful for latent diffusion?",
    "answer": "It gives diffusion a compressed continuous space that is much cheaper to process than pixels while still being decodable into high-quality images. The regularised latent distribution is also easier for a diffusion model to learn than an arbitrary, highly irregular code space. Latent diffusion needs a good codec and a well-behaved latent space; a VAE-like model is a common solution.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 35 (zero-based, including table cells)"
  },
  {
    "id": "question-7",
    "number": 7,
    "topic": "Autoencoders, VAEs, and Latent Representations",
    "question": "Can latent diffusion use an autoencoder other than a VAE?",
    "answer": "Yes. A VAE is not mathematically mandatory. Other learned codecs, including deterministic or vector-quantised autoencoders, can be used if their representations are compact, stable, decodable, and suitable for the generative process. VAE is common, not compulsory.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 38 (zero-based, including table cells)"
  },
  {
    "id": "question-8",
    "number": 8,
    "topic": "Diffusion and Latent Diffusion",
    "question": "What is the core idea of a diffusion model?",
    "answer": "Training corrupts data with known noise and learns how to reverse that corruption. At generation time, the model starts from noise and repeatedly predicts how to move toward a clean sample. Forward process adds noise; reverse process removes it.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 42 (zero-based, including table cells)"
  },
  {
    "id": "question-9",
    "number": 9,
    "topic": "Diffusion and Latent Diffusion",
    "question": "What are x0, xt, and xT conceptually?",
    "answer": "x0 is the clean sample at timestep 0. xt is a partially noised version at an intermediate timestep. xT is the heavily noised endpoint, designed to be close to a simple distribution such as Gaussian noise. Small t = more signal; large t = more noise.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 45 (zero-based, including table cells)"
  },
  {
    "id": "question-10",
    "number": 10,
    "topic": "Diffusion and Latent Diffusion",
    "question": "What does the denoising model learn to predict?",
    "answer": "Depending on the formulation, it may predict the added noise epsilon, the clean sample x0, or a related velocity-like quantity v. These are alternative parameterisations of the reverse process. Different prediction targets can implement the same broad denoising objective.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 48 (zero-based, including table cells)"
  },
  {
    "id": "question-11",
    "number": 11,
    "topic": "Diffusion and Latent Diffusion",
    "question": "What does it mean to start from random noise \"shaped like the latent space\"?",
    "answer": "The initial tensor has the dimensions and numerical distribution expected by the latent diffusion model. For classic 512 x 512 Stable Diffusion, one image is often represented internally as a tensor with shape (1, 4, 64, 64): batch, channels, height, width. Correct shape is necessary, but the expected noise distribution also matters.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 51 (zero-based, including table cells)"
  },
  {
    "id": "question-12",
    "number": 12,
    "topic": "Diffusion and Latent Diffusion",
    "question": "What is a \"clean latent\"?",
    "answer": "It is the final denoised latent representation, often denoted z0, before conversion back to pixels. \"Clean\" means the artificial diffusion noise has been removed; it does not mean the values are human-readable. Clean latent = image representation before the VAE decoder.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 54 (zero-based, including table cells)"
  },
  {
    "id": "question-13",
    "number": 13,
    "topic": "Diffusion and Latent Diffusion",
    "question": "How does pixel-space diffusion differ from latent diffusion?",
    "answer": "Pixel diffusion performs the diffusion process directly on image-sized pixel tensors. Latent diffusion first learns a compressed representation and performs diffusion there. Latent diffusion is generally cheaper in memory and compute, while pixel diffusion avoids compression losses introduced by a codec. The key distinction is where denoising happens.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 57 (zero-based, including table cells)"
  },
  {
    "id": "question-14",
    "number": 14,
    "topic": "Diffusion and Latent Diffusion",
    "question": "Is Stable Diffusion latent diffusion?",
    "answer": "Yes. Stable Diffusion is a well-known family of latent diffusion models: the generative denoising occurs in a compressed latent space and a VAE-like decoder converts the final latent into RGB pixels. Latent diffusion is the category; Stable Diffusion is a specific family.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 60 (zero-based, including table cells)"
  },
  {
    "id": "question-15",
    "number": 15,
    "topic": "Diffusion and Latent Diffusion",
    "question": "Why is the VAE encoder absent from pure text-to-image inference?",
    "answer": "There is no source image to compress. Generation begins directly from random latent noise. The encoder is used during autoencoder training, diffusion training, and image-conditioned tasks such as image-to-image or inpainting. Text-to-image needs the decoder at the end; image-conditioned workflows also need the encoder at the start.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 63 (zero-based, including table cells)"
  },
  {
    "id": "question-16",
    "number": 16,
    "topic": "Stable Diffusion Pipeline and Conditioning",
    "question": "Explain the Stable Diffusion text-to-image pipeline end to end.",
    "answer": "A text encoder converts the prompt into conditioning features. A denoising network repeatedly updates random latent noise while using the text conditioning. The resulting clean latent is passed through the VAE decoder to produce the RGB image. Prompt -> conditioning; noise -> denoising -> clean latent -> VAE decoder -> pixels.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 83 (zero-based, including table cells)"
  },
  {
    "id": "question-17",
    "number": 17,
    "topic": "Stable Diffusion Pipeline and Conditioning",
    "question": "What is text conditioning?",
    "answer": "It is information derived from the prompt that guides the denoiser toward images consistent with the requested semantics. The model is not merely removing noise; it is removing noise in a prompt-dependent direction. Conditioning biases the reverse process toward desired content.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 86 (zero-based, including table cells)"
  },
  {
    "id": "question-18",
    "number": 18,
    "topic": "Stable Diffusion Pipeline and Conditioning",
    "question": "What is classifier-free guidance conceptually?",
    "answer": "The model combines conditional and less-conditioned/unconditional predictions so that prompt-relevant features are emphasised. Higher guidance can increase prompt adherence, but too much can reduce naturalness, diversity, or stability. Guidance is a strength knob, not free quality.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 89 (zero-based, including table cells)"
  },
  {
    "id": "question-19",
    "number": 19,
    "topic": "Stable Diffusion Pipeline and Conditioning",
    "question": "Why does the random seed matter?",
    "answer": "The seed determines the initial pseudorandom latent noise and therefore strongly influences the generated composition. Fixing the seed helps reproducibility, but identical output can still depend on model version, sampler, precision, scheduler, and implementation details. Seed controls starting randomness, not the entire software stack.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 92 (zero-based, including table cells)"
  },
  {
    "id": "question-20",
    "number": 20,
    "topic": "Stable Diffusion Pipeline and Conditioning",
    "question": "Why could changing the sampler, number of steps, guidance, or VAE matter to a watermark?",
    "answer": "A watermark may depend on a specific trajectory, latent statistics, frequency structure, or decoder behaviour. Changing these components can shift or destroy the signal even when image quality remains acceptable. A robust watermark should be tested across realistic pipeline variation.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 95 (zero-based, including table cells)"
  },
  {
    "id": "question-21",
    "number": 21,
    "topic": "Watermarking Fundamentals",
    "question": "What is a digital watermark?",
    "answer": "Information intentionally embedded into media so that a detector can later establish a property such as provenance, ownership, model attribution, or payload identity. It may be visible or invisible. Embedding changes the media or generation process; detection tries to recover or verify the signal.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 99 (zero-based, including table cells)"
  },
  {
    "id": "question-22",
    "number": 22,
    "topic": "Watermarking Fundamentals",
    "question": "How is watermarking different from metadata and cryptographic signatures?",
    "answer": "Metadata sits alongside the media and can often be stripped without changing the pixels. A watermark is embedded into the media or generator output itself. A cryptographic signature authenticates data using keys but normally does not survive arbitrary content modifications unless paired with a robust media representation. These mechanisms solve overlapping but different problems and can be combined.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 102 (zero-based, including table cells)"
  },
  {
    "id": "question-23",
    "number": 23,
    "topic": "Watermarking Fundamentals",
    "question": "What are imperceptibility, robustness, and capacity?",
    "answer": "Imperceptibility asks whether the watermark degrades the content. Robustness asks whether it survives transformations or attacks. Capacity asks how much information can be embedded. Increasing one often harms another, creating a three-way trade-off. A watermark should be judged by a trade-off curve, not one isolated metric.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 105 (zero-based, including table cells)"
  },
  {
    "id": "question-24",
    "number": 24,
    "topic": "Watermarking Fundamentals",
    "question": "What is a zero-bit versus multi-bit watermark?",
    "answer": "A zero-bit watermark only answers a presence question: is this watermark present? A multi-bit watermark encodes a message such as an identifier. Multi-bit systems are generally harder because every bit must survive. Presence detection is easier than reliable payload recovery.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 108 (zero-based, including table cells)"
  },
  {
    "id": "question-25",
    "number": 25,
    "topic": "Watermarking Fundamentals",
    "question": "What is blind watermark detection?",
    "answer": "Blind detection works from the candidate media plus any key/model required by the scheme, without needing the exact original unwatermarked image. This is usually more practical for large-scale verification. Requiring the original image limits deployment.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 111 (zero-based, including table cells)"
  },
  {
    "id": "question-26",
    "number": 26,
    "topic": "Watermarking Fundamentals",
    "question": "How does watermarking differ from steganography?",
    "answer": "Both hide information, but watermarking typically prioritises persistence and attribution under transformations, whereas steganography typically prioritises concealing the very existence of a message. Many learned methods overlap technically, so paper terminology can blur the boundary. Ask what property the system is designed to preserve: secrecy, persistence, provenance, or payload.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 114 (zero-based, including table cells)"
  },
  {
    "id": "question-27",
    "number": 27,
    "topic": "Where a Watermark Can Enter a Latent-Diffusion Pipeline",
    "question": "What makes a method \"latent-space watermarking\"?",
    "answer": "The watermark is inserted into or represented through an internal latent code rather than being added only to final RGB pixels. It does not automatically imply diffusion. Latent describes representation; diffusion describes the generation process.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 118 (zero-based, including table cells)"
  },
  {
    "id": "question-28",
    "number": 28,
    "topic": "Where a Watermark Can Enter a Latent-Diffusion Pipeline",
    "question": "What is the difference between ordinary latent watermarking and latent-diffusion watermarking?",
    "answer": "Ordinary latent watermarking can use any encoder-decoder latent representation. Latent-diffusion watermarking specifically exploits a latent diffusion generator or its internal noise/trajectory/decoder as part of embedding or detection. A method can be latent without being diffusion-based.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 121 (zero-based, including table cells)"
  },
  {
    "id": "question-29",
    "number": 29,
    "topic": "Where a Watermark Can Enter a Latent-Diffusion Pipeline",
    "question": "At which locations can a diffusion watermark be embedded?",
    "answer": "Common choices include the initial noise zT, intermediate denoising states, the final clean latent z0, the VAE decoder/model weights, or the final pixels. Each location changes what access is required and which transformations are likely to damage the signal. Always locate the watermark in the generation pipeline before comparing papers.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 124 (zero-based, including table cells)"
  },
  {
    "id": "question-30",
    "number": 30,
    "topic": "Where a Watermark Can Enter a Latent-Diffusion Pipeline",
    "question": "Why might embedding in initial noise be attractive?",
    "answer": "Every generated image begins from this noise, so a structured signal can potentially propagate through generation. It can also enable detection by inversion if enough of the original noise structure can be recovered. The risk is that denoising may erase or distort the signal. Persistence through the whole trajectory is the central challenge.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 127 (zero-based, including table cells)"
  },
  {
    "id": "question-31",
    "number": 31,
    "topic": "Where a Watermark Can Enter a Latent-Diffusion Pipeline",
    "question": "Why might embedding in the clean latent be attractive?",
    "answer": "The latent is close to the final image representation, so a controlled perturbation can be decoded into a distributed pixel signal. It avoids having to survive every earlier denoising step, but it may be vulnerable to decoder changes, re-encoding, or image regeneration. Closer to output can simplify embedding but may reduce model-level persistence.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 130 (zero-based, including table cells)"
  },
  {
    "id": "question-32",
    "number": 32,
    "topic": "Where a Watermark Can Enter a Latent-Diffusion Pipeline",
    "question": "What is model-level or decoder-level watermarking?",
    "answer": "Instead of perturbing each image after generation, the model itself is trained or modified so its outputs systematically carry a detectable signal. This may make embedding automatic, but model fine-tuning, checkpoint changes, distillation, or decoder replacement can become attack surfaces. Model modification trades post-processing simplicity for model-dependence.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 133 (zero-based, including table cells)"
  },
  {
    "id": "question-33",
    "number": 33,
    "topic": "Where a Watermark Can Enter a Latent-Diffusion Pipeline",
    "question": "How should you classify HiDDeN, RoSteALS, and Stable Signature at a high level?",
    "answer": "HiDDeN is learned image-space watermarking/steganography. RoSteALS hides information through an autoencoder latent space and is not inherently a latent-diffusion method. Stable Signature is tied to latent-diffusion generation by modifying/fine-tuning the decoder so generated images carry a signature. Do not equate \"learned\", \"latent\", and \"latent diffusion\".",
    "sourceLocator": "ldw_study_guide.docx, paragraph 136 (zero-based, including table cells)"
  },
  {
    "id": "question-34",
    "number": 34,
    "topic": "Robustness, Threat Models, and Security",
    "question": "What does \"robust watermark\" actually mean?",
    "answer": "It means the detector or payload remains reliable under a stated set of transformations and attack strengths. The phrase is incomplete unless the paper specifies what attacks, what quality degradation, what false-positive rate, and what payload are involved. Always ask: robust against what, at what cost?",
    "sourceLocator": "ldw_study_guide.docx, paragraph 140 (zero-based, including table cells)"
  },
  {
    "id": "question-35",
    "number": 35,
    "topic": "Robustness, Threat Models, and Security",
    "question": "What is the difference between benign transformations and adversarial attacks?",
    "answer": "Benign transformations happen for ordinary processing, such as JPEG compression, resizing, or social-media recompression. Adversarial attacks are intentionally chosen to make detection fail or produce false claims while preserving useful image content. JPEG robustness is not the same as adversarial security.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 143 (zero-based, including table cells)"
  },
  {
    "id": "question-36",
    "number": 36,
    "topic": "Robustness, Threat Models, and Security",
    "question": "Why does robustness not imply security?",
    "answer": "A watermark may survive random distortions yet be easy to remove once an attacker knows the detector or embedding rule. Security requires evaluating knowledgeable and adaptive attackers, not only generic image operations. A strong benchmark attacks the method, not just the image.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 146 (zero-based, including table cells)"
  },
  {
    "id": "question-37",
    "number": 37,
    "topic": "Robustness, Threat Models, and Security",
    "question": "What is a threat model?",
    "answer": "A threat model states the attacker's goal, knowledge, access, and constraints: for example, whether they know the algorithm, model weights, detector, or key; can query the detector; and how much image distortion they are allowed to introduce. Without a threat model, security claims are hard to interpret.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 149 (zero-based, including table cells)"
  },
  {
    "id": "question-38",
    "number": 38,
    "topic": "Robustness, Threat Models, and Security",
    "question": "What is the difference between watermark removal and watermark forgery?",
    "answer": "Removal makes a genuinely watermarked image appear unwatermarked. Forgery makes an unwatermarked or differently watermarked image appear to carry a target watermark. Forgery can be more damaging for attribution because it can frame the wrong source. A secure scheme should consider both false negatives caused by removal and false positives caused by forgery.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 152 (zero-based, including table cells)"
  },
  {
    "id": "question-39",
    "number": 39,
    "topic": "Robustness, Threat Models, and Security",
    "question": "Why are copy/transplant attacks important?",
    "answer": "If a watermark can be extracted or imitated from one image and added to another, detection may no longer prove provenance. This exposes the distinction between merely detecting a signal and cryptographically binding that signal to a specific image or identity. Watermark presence alone does not automatically prove authorship.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 155 (zero-based, including table cells)"
  },
  {
    "id": "question-40",
    "number": 40,
    "topic": "Robustness, Threat Models, and Security",
    "question": "Why is diffusion regeneration a strong modern attack?",
    "answer": "A second generative process can reconstruct the semantics of an image while replacing fine pixel and latent details where a watermark lives. A meaningful evaluation should measure both watermark removal and preservation of image content. An attack that destroys the whole image is not an interesting success.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 158 (zero-based, including table cells)"
  },
  {
    "id": "question-41",
    "number": 41,
    "topic": "Robustness, Threat Models, and Security",
    "question": "What makes an adaptive evaluation stronger?",
    "answer": "The attack is designed with knowledge of the defence, detector, or training procedure rather than being a fixed generic distortion. Adaptive evaluation tests whether the claimed robustness survives when the adversary optimises specifically against it. Security research should assume the method is known; secrecy should reside in keys, not obscurity.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 161 (zero-based, including table cells)"
  },
  {
    "id": "question-42",
    "number": 42,
    "topic": "Detection and Evaluation Math",
    "question": "What is a detection threshold?",
    "answer": "A detector often produces a score s(x). A threshold tau converts that continuous score into a yes/no decision. For a similarity score where larger values mean stronger evidence, lowering the threshold accepts more images, usually increasing both true and false positives. For a distance score where smaller values mean stronger evidence, the comparison and threshold direction reverse. There is no meaningful detector performance without an operating threshold or curve.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 165 (zero-based, including table cells)"
  },
  {
    "id": "question-43",
    "number": 43,
    "topic": "Detection and Evaluation Math",
    "question": "Define true positive, false positive, true negative, and false negative.",
    "answer": "True positive: watermarked image correctly detected. False positive: unwatermarked image incorrectly detected as watermarked. True negative: unwatermarked image correctly rejected. False negative: watermarked image missed. For provenance systems, false positives can be especially damaging.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 168 (zero-based, including table cells)"
  },
  {
    "id": "question-44",
    "number": 44,
    "topic": "Detection and Evaluation Math",
    "question": "Why is false-positive rate critical at Internet scale?",
    "answer": "Even a seemingly small false-positive rate can generate huge numbers of incorrect accusations when scanning millions or billions of images. For large-scale attribution, evaluation should often focus on performance at very low FPR. Scale turns small percentages into large absolute error counts.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 171 (zero-based, including table cells)"
  },
  {
    "id": "question-45",
    "number": 45,
    "topic": "Detection and Evaluation Math",
    "question": "Why can overall accuracy be misleading?",
    "answer": "If most test images are unwatermarked, a detector can appear accurate by mostly saying \"not watermarked\". Accuracy also hides the trade-off between false positives and false negatives. A receiver operating characteristic (ROC) curve plots the true-positive rate against the false-positive rate as the threshold changes. Its area (AUC) summarises that curve, but can hide poor behaviour at the very low false-positive rates required in deployment. Reporting true-positive rate at a fixed false-positive rate makes that operating requirement explicit. Class balance and operating point matter.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 174 (zero-based, including table cells)"
  },
  {
    "id": "question-46",
    "number": 46,
    "topic": "Detection and Evaluation Math",
    "question": "What is bit error rate and why is it not the same as message accuracy?",
    "answer": "BER is the fraction of payload bits decoded incorrectly. A long message can contain at least one bad bit even when BER is low, so the probability of recovering the entire message can be substantially worse than per-bit accuracy suggests. Report both per-bit and full-message performance when payload recovery matters.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 177 (zero-based, including table cells)"
  },
  {
    "id": "question-47",
    "number": 47,
    "topic": "Detection and Evaluation Math",
    "question": "Why are error-correcting codes useful?",
    "answer": "They add redundancy so some incorrect bits can be corrected. This improves message recovery under noise, but reduces the amount of useful payload available for a given embedded bit budget. ECC shifts the robustness-capacity trade-off; papers should disclose it.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 180 (zero-based, including table cells)"
  },
  {
    "id": "question-48",
    "number": 48,
    "topic": "Image Quality and Trade-offs",
    "question": "What do PSNR and SSIM roughly measure?",
    "answer": "PSNR is based on pixel-wise reconstruction error and is useful for measuring signal fidelity. SSIM compares local structure, luminance, and contrast. Both are useful but can miss perceptual effects that humans notice. Pixel similarity is not identical to perceptual quality.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 184 (zero-based, including table cells)"
  },
  {
    "id": "question-49",
    "number": 49,
    "topic": "Image Quality and Trade-offs",
    "question": "What does LPIPS measure conceptually?",
    "answer": "LPIPS compares deep visual features and is intended to align more closely with perceptual similarity than raw pixel error. Lower LPIPS generally means two images look more similar in learned feature space. Use perceptual metrics when tiny pixel differences are not visually meaningful.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 187 (zero-based, including table cells)"
  },
  {
    "id": "question-50",
    "number": 50,
    "topic": "Image Quality and Trade-offs",
    "question": "What does FID measure, and why is it different?",
    "answer": "FID compares distributions of features across sets of generated and reference images. It is a dataset-level generative-quality metric, not a direct measure of whether one watermarked image looks like its unwatermarked counterpart. FID evaluates population-level image realism/distribution shift.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 190 (zero-based, including table cells)"
  },
  {
    "id": "question-51",
    "number": 51,
    "topic": "Image Quality and Trade-offs",
    "question": "Why does watermark strength create a trade-off?",
    "answer": "A stronger signal is easier to detect after distortions but can become visually noticeable or interfere with generation. A weaker signal preserves quality but becomes easier to erase or miss. Compare methods at matched quality or matched robustness, not arbitrary strengths.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 193 (zero-based, including table cells)"
  },
  {
    "id": "question-52",
    "number": 52,
    "topic": "Image Quality and Trade-offs",
    "question": "What is a Pareto-style comparison?",
    "answer": "Instead of reporting one operating point, plot one objective against another - for example robustness versus LPIPS or payload versus BER. A method is more compelling if it achieves better trade-offs across a range, not only at one hand-picked setting. Trade-off curves reduce cherry-picking.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 196 (zero-based, including table cells)"
  },
  {
    "id": "question-53",
    "number": 53,
    "topic": "Generalisation and Experimental Design",
    "question": "What should a watermark generalise across?",
    "answer": "At minimum: unseen prompts/content, random seeds, image categories, resolutions, attack strengths, and relevant sampler/settings. Stronger claims may require different checkpoints, VAEs, model families, or datasets. The broader the claim, the broader the test matrix should be.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 200 (zero-based, including table cells)"
  },
  {
    "id": "question-54",
    "number": 54,
    "topic": "Generalisation and Experimental Design",
    "question": "Why can a method overfit to its training attacks?",
    "answer": "If robustness training uses only a narrow set of differentiable distortions, the model can learn features that survive those exact attacks but fail under unseen transforms or real-world processing. Robustness generalisation must be tested, not assumed.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 203 (zero-based, including table cells)"
  },
  {
    "id": "question-55",
    "number": 55,
    "topic": "Generalisation and Experimental Design",
    "question": "What makes a baseline comparison fair?",
    "answer": "Match the conditions that materially affect difficulty: payload length, image resolution, image quality/distortion, attack strength, FPR, generator access, detector assumptions, and computational budget. Otherwise a better number may reflect an easier task. Normalise the problem before comparing the score.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 206 (zero-based, including table cells)"
  },
  {
    "id": "question-56",
    "number": 56,
    "topic": "Generalisation and Experimental Design",
    "question": "Why are ablation studies important?",
    "answer": "They remove or alter individual components to show which part of a proposed method actually causes the improvement. Without ablations, a multi-component method can hide the fact that the claimed innovation contributes little. Ablation answers: what really matters?",
    "sourceLocator": "ldw_study_guide.docx, paragraph 209 (zero-based, including table cells)"
  },
  {
    "id": "question-57",
    "number": 57,
    "topic": "Generalisation and Experimental Design",
    "question": "What should reproducibility reporting include?",
    "answer": "Code or precise algorithms, checkpoints/model versions, training settings, data splits, payload/key generation, attack parameters, evaluation thresholds, seeds, and hardware/runtime details where relevant. If another lab cannot recreate the conditions, the claim is harder to trust.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 212 (zero-based, including table cells)"
  },
  {
    "id": "question-58",
    "number": 58,
    "topic": "Generalisation and Experimental Design",
    "question": "Why should detection cost be part of evaluation?",
    "answer": "Some schemes require one lightweight detector pass; others require expensive diffusion inversion. A method that is accurate but takes seconds or many GPU steps per image may not be practical for large-scale screening. Security, quality, and compute are all deployment constraints.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 215 (zero-based, including table cells)"
  },
  {
    "id": "question-59",
    "number": 59,
    "topic": "Diffusion-Specific Failure Modes to Probe",
    "question": "Why might changing the sampler break a watermark?",
    "answer": "A sampler changes the numerical reverse trajectory. If the watermark relies on exact trajectory structure or invertibility assumptions, a different sampler can alter the signal even if the final image looks similar. Test across samplers if the method claims general latent-diffusion robustness.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 219 (zero-based, including table cells)"
  },
  {
    "id": "question-60",
    "number": 60,
    "topic": "Diffusion-Specific Failure Modes to Probe",
    "question": "Why might replacing or fine-tuning the VAE break a watermark?",
    "answer": "The decoder determines how latent perturbations become pixels. A different decoder can remap or suppress the embedded structure. Decoder-based signatures are especially tied to the decoder weights. Model component changes are distinct from ordinary image attacks.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 222 (zero-based, including table cells)"
  },
  {
    "id": "question-61",
    "number": 61,
    "topic": "Diffusion-Specific Failure Modes to Probe",
    "question": "Why does diffusion inversion matter to some watermark methods?",
    "answer": "Inversion attempts to map a generated image back toward an earlier latent/noise representation. If the watermark was embedded there, detection can search for its structure. Imperfect inversion, edits, or mismatched models can reduce recovery. Inversion-based detection trades access and compute for recovering hidden generation state.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 225 (zero-based, including table cells)"
  },
  {
    "id": "question-62",
    "number": 62,
    "topic": "Diffusion-Specific Failure Modes to Probe",
    "question": "Should a watermark survive arbitrary semantic editing?",
    "answer": "Not necessarily. If the image is changed so much that it becomes different content, preserving the original attribution can become misleading. Good research should define which transformations are expected to preserve provenance and where validity should end. \"More robust\" is not always semantically better.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 228 (zero-based, including table cells)"
  },
  {
    "id": "question-63",
    "number": 63,
    "topic": "Diffusion-Specific Failure Modes to Probe",
    "question": "How can fine-tuning, LoRA, checkpoint merging, pruning, or distillation affect model watermarks?",
    "answer": "These operations alter model parameters or internal representations. A model-level watermark may weaken, migrate, or disappear even if the model still generates similar images. Evaluating such transformations tests persistence of attribution through model modification. Model attacks belong in the threat model for model ownership/provenance claims.",
    "sourceLocator": "ldw_study_guide.docx, paragraph 231 (zero-based, including table cells)"
  }
];

export const oralQuestions: RevisionQuestion[] = [
  {
    "id": "oral-1",
    "number": 1,
    "topic": "Oral examination",
    "question": "What is latent diffusion?",
    "answer": "Diffusion performed in a learned compressed representation rather than directly in RGB pixel space. Pixel diffusion performs the diffusion process directly on image-sized pixel tensors. Latent diffusion first learns a compressed representation and performs diffusion there. Latent diffusion is generally cheaper in memory and compute, while pixel diffusion avoids compression losses introduced by a codec. The key distinction is where denoising happens.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 237 (zero-based)"
  },
  {
    "id": "oral-2",
    "number": 2,
    "topic": "Oral examination",
    "question": "Why use a VAE-like codec?",
    "answer": "To map images to a compact, reasonably smooth latent and decode generated latents back to pixels. It gives diffusion a compressed continuous space that is much cheaper to process than pixels while still being decodable into high-quality images. The regularised latent distribution is also easier for a diffusion model to learn than an arbitrary, highly irregular code space. Latent diffusion needs a good codec and a well-behaved latent space; a VAE-like model is a common solution.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 239 (zero-based)"
  },
  {
    "id": "oral-3",
    "number": 3,
    "topic": "Oral examination",
    "question": "What is z0?",
    "answer": "The clean latent/data representation at timestep zero. It is the final denoised latent representation, often denoted z0, before conversion back to pixels. \"Clean\" means the artificial diffusion noise has been removed; it does not mean the values are human-readable. Clean latent = image representation before the VAE decoder.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 241 (zero-based)"
  },
  {
    "id": "oral-4",
    "number": 4,
    "topic": "Oral examination",
    "question": "What is zT?",
    "answer": "The highly noised latent at the start of generation, approximately Gaussian noise. The initial tensor has the dimensions and numerical distribution expected by the latent diffusion model. For classic 512 x 512 Stable Diffusion, one image is often represented internally as a tensor with shape (1, 4, 64, 64): batch, channels, height, width. Correct shape is necessary, but the expected noise distribution also matters.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 243 (zero-based)"
  },
  {
    "id": "oral-5",
    "number": 5,
    "topic": "Oral examination",
    "question": "Why start from Gaussian noise?",
    "answer": "Training defines a forward process whose endpoint is close to a simple Gaussian, so generation can sample from that known distribution. Training corrupts data with known noise and learns how to reverse that corruption. At generation time, the model starts from noise and repeatedly predicts how to move toward a clean sample. Forward process adds noise; reverse process removes it.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 245 (zero-based)"
  },
  {
    "id": "oral-6",
    "number": 6,
    "topic": "Oral examination",
    "question": "What is diffusion inversion?",
    "answer": "An approximate reverse mapping from a generated/edited image back toward earlier latent or noise states. Inversion attempts to map a generated image back toward an earlier latent/noise representation. If the watermark was embedded there, detection can search for its structure. Imperfect inversion, edits, or mismatched models can reduce recovery. Inversion-based detection trades access and compute for recovering hidden generation state.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 247 (zero-based)"
  },
  {
    "id": "oral-7",
    "number": 7,
    "topic": "Oral examination",
    "question": "What is latent-space watermarking?",
    "answer": "Embedding a watermark into an internal latent representation rather than only final pixels. Ordinary latent watermarking can use any encoder-decoder latent representation. Latent-diffusion watermarking specifically exploits a latent diffusion generator or its internal noise/trajectory/decoder as part of embedding or detection. A method can be latent without being diffusion-based.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 249 (zero-based)"
  },
  {
    "id": "oral-8",
    "number": 8,
    "topic": "Oral examination",
    "question": "What is a zero-bit watermark?",
    "answer": "A zero-bit watermark answers whether a specified mark is present, without recovering an arbitrary message. The verifier compares evidence against a threshold chosen on unmarked examples. A positive result can identify a registered mark, but does not mean payload bits were extracted.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 251 (zero-based)"
  },
  {
    "id": "oral-9",
    "number": 9,
    "topic": "Oral examination",
    "question": "What is capacity?",
    "answer": "Capacity is the amount of useful information that can be recovered at a stated error rate, image quality and attack setting. Count application bits after removing repetition and error-correction overhead. For example, 256 useful bits sent as 768 repeated bits still carry 256 bits of application information.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 253 (zero-based)"
  },
  {
    "id": "oral-10",
    "number": 10,
    "topic": "Oral examination",
    "question": "Why do capacity, robustness, and imperceptibility conflict?",
    "answer": "More signal or more bits usually require stronger perturbations, which can hurt quality or become easier to disrupt. A stronger signal is easier to detect after distortions but can become visually noticeable or interfere with generation. A weaker signal preserves quality but becomes easier to erase or miss. Compare methods at matched quality or matched robustness, not arbitrary strengths.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 255 (zero-based)"
  },
  {
    "id": "oral-11",
    "number": 11,
    "topic": "Oral examination",
    "question": "What is BER?",
    "answer": "The fraction of payload bits decoded incorrectly. BER is the fraction of payload bits decoded incorrectly. A long message can contain at least one bad bit even when BER is low, so the probability of recovering the entire message can be substantially worse than per-bit accuracy suggests. Report both per-bit and full-message performance when payload recovery matters.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 257 (zero-based)"
  },
  {
    "id": "oral-12",
    "number": 12,
    "topic": "Oral examination",
    "question": "What is FPR?",
    "answer": "The fraction of genuinely unwatermarked examples incorrectly flagged as watermarked. True positive: watermarked image correctly detected. False positive: unwatermarked image incorrectly detected as watermarked. True negative: unwatermarked image correctly rejected. False negative: watermarked image missed. For provenance systems, false positives can be especially damaging.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 259 (zero-based)"
  },
  {
    "id": "oral-13",
    "number": 13,
    "topic": "Oral examination",
    "question": "Why is low FPR critical?",
    "answer": "At scale, even a tiny FPR creates many false accusations. Even a seemingly small false-positive rate can generate huge numbers of incorrect accusations when scanning millions or billions of images. For large-scale attribution, evaluation should often focus on performance at very low FPR. Scale turns small percentages into large absolute error counts.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 261 (zero-based)"
  },
  {
    "id": "oral-14",
    "number": 14,
    "topic": "Oral examination",
    "question": "Robustness vs security?",
    "answer": "Robustness survives stated distortions; security survives knowledgeable/adaptive adversaries. A watermark may survive random distortions yet be easy to remove once an attacker knows the detector or embedding rule. Security requires evaluating knowledgeable and adaptive attackers, not only generic image operations. A strong benchmark attacks the method, not just the image.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 263 (zero-based)"
  },
  {
    "id": "oral-15",
    "number": 15,
    "topic": "Oral examination",
    "question": "Removal vs forgery?",
    "answer": "Removal hides a real watermark; forgery creates a false watermark claim. Removal makes a genuinely watermarked image appear unwatermarked. Forgery makes an unwatermarked or differently watermarked image appear to carry a target watermark. Forgery can be more damaging for attribution because it can frame the wrong source. A secure scheme should consider both false negatives caused by removal and false positives caused by forgery.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 265 (zero-based)"
  },
  {
    "id": "oral-16",
    "number": 16,
    "topic": "Oral examination",
    "question": "What makes a fair baseline?",
    "answer": "Matched payload, quality, attacks, operating point, access assumptions, and compute. Match the conditions that materially affect difficulty: payload length, image resolution, image quality/distortion, attack strength, FPR, generator access, detector assumptions, and computational budget. Otherwise a better number may reflect an easier task. Normalise the problem before comparing the score.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 267 (zero-based)"
  },
  {
    "id": "oral-17",
    "number": 17,
    "topic": "Oral examination",
    "question": "Why use ablations?",
    "answer": "To isolate which component of a proposed method produces the gain. They remove or alter individual components to show which part of a proposed method actually causes the improvement. Without ablations, a multi-component method can hide the fact that the claimed innovation contributes little. Ablation answers: what really matters?",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 269 (zero-based)"
  },
  {
    "id": "oral-18",
    "number": 18,
    "topic": "Oral examination",
    "question": "Why does sampler choice matter?",
    "answer": "It changes the diffusion trajectory and can disrupt trajectory-dependent signals or inversion. A sampler changes the numerical reverse trajectory. If the watermark relies on exact trajectory structure or invertibility assumptions, a different sampler can alter the signal even if the final image looks similar. Test across samplers if the method claims general latent-diffusion robustness.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 271 (zero-based)"
  },
  {
    "id": "oral-19",
    "number": 19,
    "topic": "Oral examination",
    "question": "Why can VAE replacement matter?",
    "answer": "Latent-to-pixel mapping changes, potentially destroying latent/decoder-linked watermark structure. The decoder determines how latent perturbations become pixels. A different decoder can remap or suppress the embedded structure. Decoder-based signatures are especially tied to the decoder weights. Model component changes are distinct from ordinary image attacks.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 273 (zero-based)"
  },
  {
    "id": "oral-20",
    "number": 20,
    "topic": "Oral examination",
    "question": "What is the first question in gap analysis?",
    "answer": "First identify where the information enters, which assumptions make recovery possible, and what changes when those assumptions fail. Then turn one failure into a measurable comparison. For example, replace the VAE while keeping prompts and detector settings fixed, and measure recovery and false positives before claiming a new research gap.",
    "sourceLocator": "ldw_study_guide.docx, table paragraph 275 (zero-based)"
  }
];

export const mathExamples: HandbookSection[] = [
  {
    id: 'vae-sampling', title: 'VAE sampling: the distribution and the draw',
    paragraphs: ['Let x denote an input image. A variational autoencoder encoder predicts a mean vector μ(x) and a vector σ(x) of positive standard deviations. The latent z has the same number of coordinates as these vectors. ε is fresh independent standard Gaussian noise; I is the identity covariance matrix. The multiplication below is coordinate-wise.', 'Sampling makes two encodings of the same image differ even when the weights and distribution parameters are fixed. Using μ directly removes this randomness. Neither choice makes encoding followed by decoding an exact inverse: the codec is lossy.'],
    equation: {expression: String.raw`z=\mu(x)+\sigma(x)\odot\epsilon,\qquad\epsilon\sim\mathcal N(0,I)`,note: 'The random draw is separated from the differentiable mean and scale, allowing gradients through the encoder.',format: 'latex'},
    workedExample: {title: 'Two encodings of one coordinate',steps: ['Set μ = 0.4 and σ = 0.2. With ε = 1.5, z = 0.4 + 0.2 × 1.5 = 0.7.', 'With the same image but ε = −0.5, z = 0.3. Using the posterior mean gives z = 0.4 every time.', 'For watermark verification, record whether the image encoder samples or uses its mean. Otherwise repeated verification can change before diffusion inversion even starts.'],conclusion: 'Random latent sampling and numerical inversion error are separate sources of detector variation.'},sources: ['study-guide'],
  },
  {
    id: 'diffusion-noising',title: 'Forward diffusion: signal and noise have different scales',
    paragraphs: ['Let z₀ be the clean latent, zₜ its noised version at timestep t, and ε an independent standard Gaussian tensor. The cumulative signal-retention coefficient ᾱₜ lies between zero and one. The square roots make the variances add correctly when signal and noise are independent and have unit variance.', 'This forward corruption formula is known during training. Generation instead estimates how to reverse corruption using a learned denoiser. The unknown clean latent is not available to the model at inference.'],
    equation: {expression: String.raw`z_t=\sqrt{\bar\alpha_t}\,z_0+\sqrt{1-\bar\alpha_t}\,\epsilon`,note: 'A smaller ᾱₜ means less original signal and more noise. This equation describes a forward marginal, not a complete sampling algorithm.',format: 'latex'},
    workedExample: {title: 'A scalar forward step',steps: ['Take z₀ = 2, ε = −1 and ᾱₜ = 0.64.', 'The signal contribution is 0.8 × 2 = 1.6. The noise contribution is 0.6 × (−1) = −0.6. Thus zₜ = 1.', 'If the predicted noise is −0.8 instead of −1, the estimated clean value is (1 − 0.6 × (−0.8))/0.8 = 1.85.'],conclusion: 'A noise-prediction error becomes a clean-latent error. At smaller ᾱₜ this reconstruction can amplify error more strongly.'},sources: ['study-guide'],
  },
  {
    id: 'training-objectives',title: 'Training objectives: weights do not have universal units',
    paragraphs: ['Lquality measures image damage; Lwatermark measures message or detection error; Lrobustness measures failure after a specified transformation. The non-negative coefficients λ₁, λ₂ and λ₃ set their relative contribution. These terms describe a teaching objective, not the exact loss of every paper.', 'A coefficient is interpretable only with the scale and reduction of its loss. Averaging over pixels and summing over bits changes the relative gradient even if the coefficients stay fixed.'],
    equation: {expression: String.raw`L=\lambda_1L_{\mathrm{quality}}+\lambda_2L_{\mathrm{watermark}}+\lambda_3L_{\mathrm{robustness}}`,note: 'The optimiser minimises a weighted objective. Reporting a smaller total loss does not establish better visual quality or security.',format: 'latex'},
    workedExample: {title: 'One candidate update',steps: ['Let the three losses be 0.02, 0.10 and 0.20, with weights 1, 2 and 0.5. Total loss is 0.02 + 0.20 + 0.10 = 0.32.', 'A candidate update gives losses 0.04, 0.06 and 0.18. Its total is 0.04 + 0.12 + 0.09 = 0.25.', 'The objective improves while image-quality loss doubles. Inspect each term and actual image quality before accepting the operating point.'],conclusion: 'Optimisation implements the chosen trade-off; it does not decide which trade-off is acceptable.'},sources: ['study-guide'],
  },
  {
    id: 'bit-error-rate',title: 'Bit accuracy does not equal complete-message recovery',
    paragraphs: ['Let L be the message length, mᵢ the true bit and m̂ᵢ the decoded bit. The index i selects a bit; the indicator 1[condition] is one when the condition is true and zero otherwise. BER counts incorrect bits divided by L. If each bit fails independently with probability p, a complete message succeeds with probability (1 − p)ᴸ. Independence is a simplifying assumption, not a measured property of inversion errors.', 'An error-correcting code adds redundant transmitted bits. Report useful message length separately from the codeword length, and report exact recovery after decoding. A code can fail abruptly when an attack produces correlated errors beyond its correction capability.'],
    equation: {expression: String.raw`\mathrm{BER}=\frac1L\sum_{i=1}^{L}\mathbf1[\hat m_i\ne m_i],\qquad P(\hat m=m)=(1-p)^L`,note: 'The probability formula assumes independent, equally likely bit errors; the BER definition does not.',format: 'latex'},
    workedExample: {title: '99% per-bit accuracy on a 256-bit message',steps: ['Set p = 0.01 and L = 256. Expected incorrect bits are 2.56.', 'Complete-message recovery is 0.99²⁵⁶ ≈ 0.0763, or 7.63%, under the independence model.', 'A hypothetical repetition-three code sends 768 bits for 256 useful bits. Its independent majority error probability is 3p²(1 − p) + p³ = 0.000298. Complete-message recovery becomes about 92.65%, at three times the transmitted length.'],conclusion: 'Both coding overhead and error dependence must be disclosed. High bit accuracy alone cannot support an exact-payload claim.'},sources: ['study-guide'],
  },
  {
    id: 'detector-threshold',title: 'Thresholds: select on calibration data, test on held-out data',
    paragraphs: ['Let s(x) be a score whose larger values mean stronger watermark evidence for candidate image x. A threshold τ produces the decision. Some methods use a distance where smaller values are stronger evidence; reverse the comparison in that case.', 'FPR is the fraction of unmarked candidates accepted; TPR is the fraction of marked candidates accepted. Choose τ using separate unmarked calibration data, then evaluate it on held-out marked and unmarked images. Searching many keys changes the false-positive event and needs its own calibration.'],
    equation: {expression: String.raw`\mathrm{accept}(x)=\mathbf1[s(x)>\tau],\quad\mathrm{FPR}=\frac{FP}{FP+TN},\quad\mathrm{TPR}=\frac{TP}{TP+FN}`,note: 'TP counts marked images accepted; FN counts marked images rejected; FP counts unmarked images accepted; TN counts unmarked images rejected. The indicator 1[condition] equals one when its condition is true and zero otherwise. Counts must use the same decision rule.',format: 'latex'},
    workedExample: {title: 'A useful rate needs a sample count',steps: ['At a fixed threshold, 950 of 1,000 marked test images are accepted, giving TPR = 95%. Two of 10,000 unmarked images are accepted, giving observed FPR = 0.02%.', 'If that rate transferred unchanged to one million unmarked images, the expected false-positive count would be 200. Transfer must be tested because deployment content can differ.', 'Even zero false positives in 10,000 independent trials only gives an approximate 95% upper bound near 3/10,000 by the rule of three. It cannot demonstrate FPR below one in a billion.'],conclusion: 'A small toy test can check the decision code but cannot calibrate an Internet-scale attribution system.'},sources: ['study-guide'],
  },
  {
    id: 'fourier-structure',title: 'Fourier structure: preserve the constraints of a real latent',
    paragraphs: ['For a real one-dimensional latent z with N entries, Zₖ is its discrete Fourier coefficient at frequency k. The complex conjugate, written with a star, negates the imaginary part. Real input requires conjugate symmetry: the coefficient at −k modulo N is Zₖ*. The same relation applies across both axes of a two-dimensional transform.', 'Amplitude sets how much of a frequency is present; phase sets its alignment. Changing a Fourier pattern can distribute evidence over spatial coordinates, but cropping or translation can change alignment. Frequency-domain placement alone is not a robustness proof.'],
    equation: {expression: String.raw`Z_k=\sum_{n=0}^{N-1}z_n e^{-2\pi i kn/N},\qquad Z_{(-k)\bmod N}=Z_k^*`,note: 'Here i is the imaginary unit, n the spatial index, and N the transform length. Normalisation conventions must match between embedding and extraction.',format: 'latex'},
    workedExample: {title: 'A four-coordinate real signal',steps: ['For z = [1, 0, −1, 0], the unnormalised DFT is [0, 2, 0, 2].', 'Changing frequency 1 to 2 + i requires changing frequency 3 to 2 − i. Their paired imaginary components cancel when taking the inverse transform.', 'If only frequency 1 is changed and the imaginary part of the inverse is discarded, the intended frequency evidence changes. Taking the real part is not a harmless substitute for enforcing symmetry.'],conclusion: 'SFW addresses a representation constraint that a Fourier watermark must respect before any attack evaluation.'},sources: ['study-guide'],
  },
  {
    id: 'inversion-error',title: 'DDIM inversion: deterministic does not mean exact',
    paragraphs: ['Let εθ(zₜ,t,c) be the denoiser prediction at latent zₜ, timestep t and conditioning c. Let ᾱₜ and ᾱₛ be cumulative schedule coefficients at t and an earlier timestep s. In deterministic DDIM, estimate the clean latent and combine it with the predicted noise at s. Inversion attempts to traverse this mapping in the opposite direction using predictions at available states.', 'The model prediction changes with its input. Reusing it at a different state is an approximation. Image encoding, compression, a different prompt, guidance strength and timestep discretisation add further errors. A detector must measure the recovered state, not substitute the original seed.'],
    equation: {expression: String.raw`\hat z_0=\frac{z_t-\sqrt{1-\bar\alpha_t}\,\epsilon_\theta(z_t,t,c)}{\sqrt{\bar\alpha_t}},\qquad z_s=\sqrt{\bar\alpha_s}\,\hat z_0+\sqrt{1-\bar\alpha_s}\,\epsilon_\theta(z_t,t,c)`,note: 'This is the deterministic, zero-stochasticity update. It is a teaching form of the DDIM relationship, not a promise of exact RGB-to-noise inversion.',format: 'latex'},
    workedExample: {title: 'Where a perfect round trip can conceal an error',steps: ['In the preceding noising example, zₜ = 1, ᾱₜ = 0.64 and the true ε = −1. Using this oracle noise gives z₀ = 2 exactly.', 'A detector does not know the true ε. With prediction −0.8 it recovers 1.85, before any image codec error.', 'Record error against stored generation noise for an experimental diagnostic. Do not give that stored noise to the detector as its recovered answer.'],conclusion: 'A deterministic toy inverse can test algebra; only image-based recovery tests the inversion assumption of a watermark method.'},sources: ['study-guide'],
  },
];
