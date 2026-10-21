export const glossaryCategories = [
  'Diffusion and inversion',
  'Watermark construction',
  'Detection and statistics',
  'Coding and security',
  'Attacks and robustness',
  'Evaluation and practice',
] as const;

export type GlossaryCategory = typeof glossaryCategories[number];
export type GlossaryTerm = {
  id: string;
  term: string;
  aliases: string[];
  category: GlossaryCategory;
  definition: string;
  whyItMatters: string;
  example?: string;
  related: string[];
  links: { label: string; to: string }[];
};

const study = (slug: string, label: string) => ({ label, to: `/papers/${slug}` });
const maths = (id: string, label: string) => ({ label, to: `/revision?section=${id}` });
const diffusion = study('ldm', 'Latent diffusion foundations');
const inversion = study('ddim', 'DDIM and inversion');
const thresholds = maths('detector-threshold', 'Worked detector thresholds');
const bits = maths('bit-error-rate', 'Worked bit and message recovery');
const fourier = maths('fourier-structure', 'Worked Fourier structure');
const evaluation = study('waves', 'WAVES evaluation study');
const prc = study('prc-watermark', 'PRC study and teaching-code limits');
const C = glossaryCategories;

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'autoencoder', term: 'Autoencoder', aliases: ['image codec', 'encoder decoder'], category: C[0],
    definition: 'A pair of learned functions: an encoder maps an image to a smaller representation, and a decoder reconstructs an image from that representation. Compression usually loses information, so decoding an encoded image need not reproduce every original pixel.',
    whyItMatters: 'A watermark may enter the encoded representation or the decoder itself. Those choices expose different components to replacement and reconstruction errors.',
    related: ['variational-autoencoder', 'latent-space', 'inversion-error'], links: [diffusion, study('rosteals', 'RoSteALS latent embedding')],
  },
  {
    id: 'variational-autoencoder', term: 'Variational autoencoder', aliases: ['VAE'], category: C[0],
    definition: 'A probabilistic autoencoder whose encoder describes a distribution over latent values rather than only one value. Training balances reconstruction against a penalty that brings the encoded distribution towards a chosen prior.',
    whyItMatters: 'An encoder mean and a sampled latent are different objects. A watermark experiment must state which is used and whether encoding introduces random variation.',
    example: 'If an encoder gives mean 2 and standard deviation 0.5, the draw 2 + 0.5 × ε depends on the sampled standard-normal value ε. Taking ε = 0 uses the mean rather than a random draw.',
    related: ['autoencoder', 'reparameterisation', 'kl-divergence'], links: [diffusion, maths('vae-sampling', 'Worked VAE sampling')],
  },
  {
    id: 'latent-space', term: 'Latent space', aliases: ['latent representation', 'latent tensor'], category: C[0],
    definition: 'The representation space used inside a model. In latent diffusion it usually means the spatial tensor produced by the image encoder, but a paper may also use latent to mean the initial noise or an intermediate diffusion state.',
    whyItMatters: 'The word alone does not identify the insertion point. Always name the state, its time index and the component that reads it.',
    related: ['initial-noise', 'intermediate-latent', 'insertion-point'], links: [diffusion],
  },
  {
    id: 'latent-diffusion', term: 'Latent diffusion', aliases: ['LDM', 'latent diffusion model'], category: C[0],
    definition: 'Image generation that denoises a compressed image representation instead of denoising RGB pixels directly. A learned image decoder converts the final clean latent into a visible image.',
    whyItMatters: 'A latent watermark must survive the route through denoising and image decoding, then whatever operations the verifier uses to recover evidence.',
    related: ['autoencoder', 'reverse-denoising', 'inversion-error'], links: [diffusion],
  },
  {
    id: 'forward-diffusion', term: 'Forward diffusion', aliases: ['forward noising', 'noising process'], category: C[0],
    definition: 'The training-time process that progressively corrupts clean data with noise according to a specified schedule. In the common Gaussian formulation, a noisy state is a scaled clean signal plus a scaled Gaussian draw.',
    whyItMatters: 'Signal and noise use different scale factors. Confusing a variance with its square root changes both the learning target and any watermark channel calculation.',
    related: ['noise-schedule', 'gaussian-prior', 'reverse-denoising'], links: [maths('diffusion-noising', 'Worked forward diffusion'), inversion],
  },
  {
    id: 'reverse-denoising', term: 'Reverse denoising', aliases: ['reverse diffusion', 'denoising trajectory'], category: C[0],
    definition: 'The generation procedure that applies learned predictions to move from a noisy state towards a clean sample. Its numerical updates depend on the sampler, time steps and any added randomness.',
    whyItMatters: 'A watermark placed in initial or intermediate noise is transformed by the whole trajectory. A mark visible in the input tensor is not yet evidence recoverable from an output image.',
    related: ['forward-diffusion', 'ddim', 'intermediate-latent'], links: [diffusion, inversion],
  },
  {
    id: 'noise-schedule', term: 'Noise schedule', aliases: ['alpha schedule', 'beta schedule', 'signal-to-noise ratio', 'SNR'], category: C[0],
    definition: 'The sequence of noise levels used across diffusion time. It determines how much signal and noise each state contains; papers may describe it using per-step variances, cumulative signal factors or signal-to-noise ratios.',
    whyItMatters: 'The same time index does not necessarily mean the same noise level in two implementations. Record the actual scheduler and selected steps.',
    related: ['forward-diffusion', 'ddim', 'channel-model'], links: [maths('diffusion-noising', 'Signal and noise scales'), inversion],
  },
  {
    id: 'initial-noise', term: 'Initial noise', aliases: ['zT', 'starting latent', 'noise seed latent'], category: C[0],
    definition: 'The random tensor supplied at the beginning of reverse diffusion. Under a common latent-diffusion prior, its coordinates are independent standard-normal draws before any watermark mapping is applied.',
    whyItMatters: 'Many training-free methods encode information here. A numerical random seed selects a draw; it is not the same object as the full tensor or the watermark key.',
    related: ['seed', 'gaussian-prior', 'distribution-preservation'], links: [study('gaussian-shading', 'Gaussian Shading'), study('wind', 'WIND noise identities')],
  },
  {
    id: 'intermediate-latent', term: 'Intermediate latent', aliases: ['zt', 'diffusion state'], category: C[0],
    definition: 'The current representation at a specified point in a diffusion trajectory, between the initial noise and the final clean latent. It contains both evolving image structure and remaining noise.',
    whyItMatters: 'Changing an intermediate state and changing the conditioning that guides later steps are different interventions. Testing one does not establish the other.',
    related: ['initial-noise', 'conditioning', 'insertion-point'], links: [study('robin', 'ROBIN intermediate-state intervention'), inversion],
  },
  {
    id: 'ddim', term: 'DDIM', aliases: ['denoising diffusion implicit model', 'deterministic sampler'], category: C[0],
    definition: 'A family of diffusion sampling procedures that can use the same training objective as DDPM. Its deterministic limit introduces no new random noise during sampling once the initial state and other generation settings are fixed.',
    whyItMatters: 'Deterministic sampling provides a useful trajectory for approximate inversion, but does not make the image codec or numerical reverse procedure exactly invertible.',
    related: ['ddim-inversion', 'inversion-error', 'seed'], links: [inversion],
  },
  {
    id: 'ddim-inversion', term: 'DDIM inversion', aliases: ['diffusion inversion', 'noise recovery'], category: C[0],
    definition: 'A numerical procedure that starts from a clean image latent and follows an approximate reverse of a DDIM generation trajectory towards a noise estimate. The estimate depends on the denoiser, schedule, conditioning and input encoding.',
    whyItMatters: 'The recovered estimate is the verifier\'s evidence. Substituting the original stored noise would bypass the recovery problem.',
    related: ['ddim', 'inversion-error', 'extractor'], links: [inversion, maths('inversion-error', 'Worked inversion error')],
  },
  {
    id: 'inversion-error', term: 'Inversion error', aliases: ['round-trip error', 'reconstruction error'], category: C[0],
    definition: 'The discrepancy between an original state and the estimate obtained after generation and attempted recovery. Lossy image encoding, quantisation, imperfect model predictions, numerical steps and mismatched settings can each contribute.',
    whyItMatters: 'Robustness must be measured from received-image evidence. A mark may be constructed correctly yet fail before any deliberate attack.',
    related: ['ddim-inversion', 'save-reload', 'channel-model'], links: [maths('inversion-error', 'Worked inversion error'), inversion],
  },
  {
    id: 'conditioning', term: 'Conditioning', aliases: ['text conditioning', 'prompt embedding', 'cross-attention'], category: C[0],
    definition: 'Information supplied to guide generation, such as a text representation, class label or image. Cross-attention is one mechanism for letting the denoiser use this information.',
    whyItMatters: 'Changing conditioning can alter the trajectory without changing model weights. Inversion may need matching conditioning or must explicitly handle its absence.',
    related: ['classifier-free-guidance', 'intermediate-latent', 'frozen-weights'], links: [diffusion, study('robin', 'Conditioning in ROBIN')],
  },
  {
    id: 'classifier-free-guidance', term: 'Classifier-free guidance', aliases: ['CFG', 'guidance scale'], category: C[0],
    definition: 'A sampling rule that combines conditional and unconditional model predictions to strengthen the effect of conditioning. The guidance scale controls their combination; implementations must state their convention.',
    whyItMatters: 'Changing the guidance scale changes the generation trajectory and can change inversion error even with the same prompt and initial noise.',
    related: ['conditioning', 'reverse-denoising', 'inversion-error'], links: [diffusion, inversion],
  },
  {
    id: 'seed', term: 'Random seed', aliases: ['PRNG seed', 'generation seed'], category: C[0],
    definition: 'An initial value used by a pseudorandom number generator to select a reproducible sequence. Reproducing an image also requires compatible algorithms, model weights, settings and numerical behaviour.',
    whyItMatters: 'A supplied seed is known input, not a payload recovered from pixels. Key secrecy must not be inferred from the fact that noise was generated using a seed.',
    related: ['initial-noise', 'key', 'save-reload'], links: [study('wind', 'WIND identity search'), study('gaussian-shading-plus-plus', 'Seed handling in Gaussian Shading++')],
  },
  {
    id: 'reparameterisation', term: 'Reparameterisation', aliases: ['reparameterization trick', 'VAE sampling trick'], category: C[0],
    definition: 'Writing a random sample as a deterministic function of learned parameters and a separate noise draw. For a diagonal Gaussian, multiply standard-normal noise by each standard deviation and add the mean.',
    whyItMatters: 'This makes the distinction between a distribution, its mean and a particular draw explicit, while allowing gradients through the distribution parameters.',
    related: ['variational-autoencoder', 'gaussian-prior', 'seed'], links: [maths('vae-sampling', 'Worked VAE sampling')],
  },
  {
    id: 'kl-divergence', term: 'KL divergence', aliases: ['Kullback-Leibler divergence', 'KL loss'], category: C[0],
    definition: 'A measure of how one probability distribution differs from a reference distribution. It is non-negative when defined, generally changes when the distributions are swapped, and is not a distance metric.',
    whyItMatters: 'A VAE regulariser can encourage encoded distributions towards a prior without making every encoded sample an independent draw from that prior.',
    related: ['variational-autoencoder', 'gaussian-prior', 'distribution-preservation'], links: [diffusion, maths('vae-sampling', 'VAE distribution and sampling')],
  },
  {
    id: 'digital-watermark', term: 'Digital watermark', aliases: ['watermark', 'invisible watermark'], category: C[1],
    definition: 'A deliberately embedded signal used to support a later decision about content, a message or a source. A watermark may be visually unobtrusive without being statistically or cryptographically hidden.',
    whyItMatters: 'The claim must identify which decision the signal supports. Presence, ownership, user identity and unchanged content are different conclusions.',
    related: ['detection', 'attribution', 'content-binding'], links: [study('hidden', 'HiDDeN watermark construction'), evaluation],
  },
  {
    id: 'embedding', term: 'Embedding', aliases: ['watermark insertion', 'embedder'], category: C[1],
    definition: 'The operation that introduces watermark information into a representation, model component or output image. The result must travel through the remaining generation and storage steps before a verifier can observe it.',
    whyItMatters: 'Correctly modifying a tensor proves construction, not successful received-image recovery.',
    related: ['insertion-point', 'payload', 'extractor'], links: [study('tree-rings', 'Tree-Ring embedding and recovery'), study('stable-signature', 'Decoder-rooted embedding')],
  },
  {
    id: 'insertion-point', term: 'Insertion point', aliases: ['insertion location', 'embedding location'], category: C[1],
    definition: 'The exact object altered to introduce the mark: for example, output pixels, a clean image latent, initial noise, an intermediate state or learned weights. It also includes when that alteration happens.',
    whyItMatters: 'It determines what must remain available and which component replacement can remove the evidence.',
    related: ['latent-space', 'intermediate-latent', 'frozen-weights'], links: [study('stable-signature', 'VAE decoder insertion'), study('gaussian-shading', 'Initial-noise insertion')],
  },
  {
    id: 'payload', term: 'Payload', aliases: ['message', 'watermark bits', 'identifier'], category: C[1],
    definition: 'The useful information intended for recovery, such as a user identifier. Encoded bits may also contain redundancy, random padding, synchronisation or signatures, so their total length can exceed the useful payload.',
    whyItMatters: 'Comparisons must state whether a reported bit count means useful message bits or the entire embedded codeword.',
    related: ['capacity', 'code-rate', 'message-recovery'], links: [bits, prc],
  },
  {
    id: 'key', term: 'Watermark key', aliases: ['secret key', 'detection key', 'embedding key'], category: C[1],
    definition: 'Information that parameterises watermark embedding or verification, such as a pattern, secret mapping or cryptographic key. Different protocols may use separate embedding, detection and public verification keys.',
    whyItMatters: 'A key supplied to a detector is an input assumption. Printing that key in the output does not mean it was extracted from the received image.',
    related: ['seed', 'payload', 'key-reuse'], links: [study('tree-rings', 'Keyed Fourier detection'), prc],
  },
  {
    id: 'detector', term: 'Detector', aliases: ['verifier', 'watermark detector'], category: C[1],
    definition: 'A procedure that turns observed evidence into a decision, often by comparing a score with a threshold. It may use a known key and may include preprocessing, inversion or a learned network.',
    whyItMatters: 'Calibration must cover the full procedure. A restorer or key search added before the decision can change false positives.',
    related: ['statistic', 'threshold', 'extractor'], links: [thresholds, study('gaussmarker', 'Restoration and detector fusion')],
  },
  {
    id: 'extractor', term: 'Extractor', aliases: ['watermark decoder', 'bit extractor'], category: C[1],
    definition: 'A procedure that estimates watermark evidence or encoded symbols from received content. Its output may be real-valued scores, hard bits or a candidate message, which need different evaluation rules.',
    whyItMatters: 'An extractor can always emit bits, including on unmarked images. A separate acceptance or rejection decision may still be required.',
    related: ['decoding', 'detection', 'open-set-rejection'], links: [study('hidden', 'Learned extraction in HiDDeN'), prc],
  },
  {
    id: 'detection', term: 'Detection', aliases: ['presence test', 'binary verification'], category: C[1],
    definition: 'Deciding whether the received evidence is consistent with a specified watermark under a stated decision rule. Detection can be a binary presence test without recovering a useful message.',
    whyItMatters: 'A positive decision does not by itself identify a user, decode a payload or establish that the image has never been edited.',
    related: ['decoding', 'attribution', 'false-positive-rate'], links: [thresholds, prc],
  },
  {
    id: 'decoding', term: 'Decoding', aliases: ['message decoding', 'payload extraction', 'recovery'], category: C[1],
    definition: 'Estimating a message from received symbols, possibly using an error-correcting code. A decoder may return a candidate even when the evidence is unreliable, unless its protocol includes failure detection or rejection.',
    whyItMatters: 'Report the recovered candidate and its errors separately from whether the detector accepted the image.',
    related: ['detection', 'message-recovery', 'error-correcting-code'], links: [bits, prc],
  },
  {
    id: 'attribution', term: 'Attribution', aliases: ['user identification', 'source identification', 'traceability'], category: C[1],
    definition: 'Assigning received content to a particular registered source or identifier using watermark evidence. Reliable attribution needs a rule for rejecting unmarked content and unknown sources.',
    whyItMatters: 'Choosing the closest key among known users is only a closed-set answer. It can assign an unrelated image to someone unless rejection is tested.',
    related: ['open-set-rejection', 'multiple-testing', 'forgery'], links: [study('ringid', 'RingID identity decisions'), study('wind', 'WIND two-stage identification')],
  },
  {
    id: 'content-binding', term: 'Content binding', aliases: ['semantic binding', 'image binding', 'integrity binding'], category: C[1],
    definition: 'A protocol relationship that ties valid watermark evidence to specified properties of the received content. The binding can concern exact pixels or a chosen semantic representation, with different tolerance to edits.',
    whyItMatters: 'A valid ownership signal can survive a harmful content change. A signature over a message authenticates that message, not every pixel unless the protocol binds them.',
    related: ['digital-signature', 'semantic-hash', 'transplant'], links: [study('seal', 'SEAL content-dependent keys'), study('tag-wm', 'TAG-WM ownership and integrity')],
  },
  {
    id: 'fourier-transform', term: 'Fourier transform', aliases: ['FFT', 'DFT', 'frequency domain'], category: C[1],
    definition: 'A change of representation that expresses a signal as weighted frequency components. For an image or latent grid, each complex coefficient represents the strength and phase of one spatial frequency.',
    whyItMatters: 'Frequency-domain watermarks alter a structured representation of the same signal. Their real-valued inverse must respect conjugate symmetry.',
    related: ['fourier-magnitude', 'fourier-phase', 'conjugate-symmetry'], links: [fourier, study('tree-rings', 'Tree-Ring Fourier patterns')],
  },
  {
    id: 'fourier-magnitude', term: 'Fourier magnitude', aliases: ['amplitude spectrum', 'spectral magnitude'], category: C[1],
    definition: 'The non-negative size of a complex Fourier coefficient, separate from its phase. A ring pattern in magnitude groups frequencies by distance from the frequency origin.',
    whyItMatters: 'Magnitude, phase and complex coefficients are different embedding choices. Reporting only a ring-shaped plot does not specify the full construction or detector.',
    related: ['fourier-transform', 'fourier-phase', 'statistic'], links: [fourier, study('ringid', 'RingID frequency construction')],
  },
  {
    id: 'fourier-phase', term: 'Phase', aliases: ['angular phase', 'Fourier phase', 'relative angle', 'atan2'], category: C[1],
    definition: 'The angular component of a complex value or coordinate pair. Angles wrap around a circle, so comparing their numerical values directly can fail at the chosen branch cut.',
    whyItMatters: 'Angular watermark decoders need a consistent circular difference and ordering convention. A phase near the end of one interval can be close to the start of the next.',
    example: 'Angles 179 degrees and −179 degrees are 2 degrees apart on the circle, not 358 degrees apart. The applicable bit rule must specify how this wrapping is handled.',
    related: ['fourier-transform', 'fourier-magnitude', 'inversion-error'], links: [study('law', 'LAW angular construction and branch-cut caution'), fourier],
  },
  {
    id: 'conjugate-symmetry', term: 'Conjugate symmetry', aliases: ['Hermitian symmetry', 'real inverse transform'], category: C[1],
    definition: 'The relationship between opposite Fourier coefficients required by a real-valued signal: each is the complex conjugate of its opposite, with the appropriate modular indices. Self-conjugate frequencies must be real.',
    whyItMatters: 'Editing only one coefficient and discarding the imaginary part after inversion changes the effective pattern. Both construction and recovery should check the intended symmetry.',
    related: ['fourier-transform', 'fourier-phase', 'embedding'], links: [fourier, study('sfwmark', 'SFW frequency constraints')],
  },
  {
    id: 'gaussian-prior', term: 'Gaussian prior', aliases: ['standard normal', 'normal distribution', 'isotropic Gaussian'], category: C[1],
    definition: 'A chosen normal distribution for a model\'s starting representation. A standard isotropic Gaussian has zero mean and identity covariance; its coordinates are independent standard normals because the full joint law is Gaussian.',
    whyItMatters: 'Checking individual means and variances does not establish that a modified tensor still follows this joint distribution.',
    related: ['marginal-distribution', 'independence', 'distribution-preservation'], links: [study('gaussian-shading', 'Gaussian Shading prior construction'), diffusion],
  },
  {
    id: 'distribution-preservation', term: 'Distribution preservation', aliases: ['performance lossless', 'lossless watermarking', 'prior preservation', 'Gaussianity'], category: C[1],
    definition: 'Preserving a specified probability law after embedding, under the construction\'s stated randomness and conditioning assumptions. It is a distributional statement, not a claim that each marked image matches an unmarked image pixel for pixel.',
    whyItMatters: 'The message, key and random padding that are fixed or averaged over matter. Matching marginal histograms or a few quality metrics is weaker than proving the claimed full law.',
    related: ['marginal-distribution', 'independence', 'indistinguishability'], links: [study('gaussian-shading', 'Gaussian Shading assumptions'), study('spherical-watermark', 'Spherical distribution and moment scope'), study('law', 'LAW dependence qualifications')],
  },
  {
    id: 'chi-distribution', term: 'Chi distribution', aliases: ['chi radius', 'chi-squared distribution', 'Gaussian radius'], category: C[1],
    definition: 'The distribution of the length of a vector of independent standard-normal coordinates. Its square follows a chi-squared distribution with degrees of freedom equal to the number of coordinates.',
    whyItMatters: 'To construct an isotropic Gaussian from a radius and direction, the direction must be uniform on the sphere and independent of the correctly distributed radius.',
    related: ['gaussian-prior', 'independence', 'distribution-preservation'], links: [study('spherical-watermark', 'Spherical Watermark radius and direction')],
  },
  {
    id: 'statistic', term: 'Detection statistic', aliases: ['score', 'test statistic', 'watermark score'], category: C[2],
    definition: 'A measured summary of the evidence used for a decision, such as key correlation, a distance or a bit-match count. Whether larger or smaller values favour a watermark depends on the detector.',
    whyItMatters: 'A large score is not a probability, a recovered key or a successful payload unless the protocol explicitly establishes that interpretation.',
    related: ['threshold', 'null-hypothesis', 'correlation'], links: [thresholds, study('tree-rings', 'Fourier evidence and decision rules')],
  },
  {
    id: 'threshold', term: 'Decision threshold', aliases: ['acceptance threshold', 'operating point', 'tau'], category: C[2],
    definition: 'The boundary that converts detector evidence into an accept or reject decision. It is chosen to meet a desired trade-off between missed marks and false positives for a specified evaluation population.',
    whyItMatters: 'A threshold cannot be compared across arbitrary score scales. Select it using calibration data, then evaluate it without retuning on the test set.',
    related: ['calibration', 'false-positive-rate', 'true-positive-rate'], links: [thresholds],
  },
  {
    id: 'null-hypothesis', term: 'Null hypothesis', aliases: ['H0', 'unmarked hypothesis', 'negative distribution'], category: C[2],
    definition: 'The reference explanation against which a statistical test evaluates evidence. For watermark detection it is often that the candidate does not carry the specified key, which can include both unmarked images and images carrying other keys.',
    whyItMatters: 'Different negative populations can yield different false-positive behaviour. Natural photographs alone may not represent unmarked outputs of the same generator.',
    related: ['false-positive-rate', 'p-value', 'held-out-test'], links: [thresholds, evaluation],
  },
  {
    id: 'false-positive-rate', term: 'False-positive rate', aliases: ['FPR', 'false alarm rate', 'type I error'], category: C[2],
    definition: 'The probability that a fixed decision rule accepts a negative example from a specified population. An empirical estimate divides accepted negatives by the number of tested negatives.',
    whyItMatters: 'Zero false positives in a small fixture cannot establish an extremely low deployment FPR. The sample size and uncertainty must accompany the estimate.',
    example: 'If 2 of 1,000 held-out unmarked images are accepted, the observed FPR is 0.002. This is an estimate for that population and protocol, with sampling uncertainty.',
    related: ['p-value', 'confidence-interval', 'false-discovery-rate'], links: [thresholds, evaluation],
  },
  {
    id: 'true-positive-rate', term: 'True-positive rate', aliases: ['TPR', 'recall', 'sensitivity', 'detection rate'], category: C[2],
    definition: 'The proportion of positive examples accepted by a specified detector. In a watermark experiment the positive population must state the keys, images, generation settings and attacks being tested.',
    whyItMatters: 'Report TPR at a stated FPR or threshold. Accepting everything gives perfect TPR while making the detector useless.',
    related: ['false-negative-rate', 'false-positive-rate', 'roc-curve'], links: [thresholds, evaluation],
  },
  {
    id: 'false-negative-rate', term: 'False-negative rate', aliases: ['FNR', 'miss rate', 'type II error'], category: C[2],
    definition: 'The proportion of positive examples rejected by a specified detector. For the same positive set and binary rule it equals one minus the true-positive rate.',
    whyItMatters: 'A missed mark can result from inversion failure, attack damage or an unsuitable threshold. The decision alone does not identify which cause occurred.',
    related: ['true-positive-rate', 'threshold', 'inversion-error'], links: [thresholds, evaluation],
  },
  {
    id: 'p-value', term: 'p-value', aliases: ['significance probability', 'null tail probability'], category: C[2],
    definition: 'Under a specified null model, the probability of a test statistic at least as extreme as the observed one, using the chosen tail rule. It is not the probability that the null hypothesis is true.',
    whyItMatters: 'A valid p-value supports a decision only to the extent that the null model and selection procedure apply. Trying many keys changes the overall test.',
    related: ['null-hypothesis', 'false-positive-rate', 'multiple-testing'], links: [thresholds, study('ringid', 'Multi-key decision cautions')],
  },
  {
    id: 'roc-curve', term: 'ROC curve', aliases: ['receiver operating characteristic', 'AUC', 'AUROC'], category: C[2],
    definition: 'A plot of true-positive rate against false-positive rate as the threshold varies. The area under this curve summarises ranking across operating points, rather than accuracy at one deployment threshold.',
    whyItMatters: 'A strong overall area can hide poor behaviour in the very low-FPR region needed for large-scale attribution.',
    related: ['threshold', 'true-positive-rate', 'false-positive-rate'], links: [evaluation, thresholds],
  },
  {
    id: 'calibration', term: 'Calibration', aliases: ['threshold calibration', 'validation set'], category: C[2],
    definition: 'Using a designated reference set to choose a decision rule or relate scores to a target error rate. For thresholds, this requires negatives that reflect the intended setting and are separate from the final test set.',
    whyItMatters: 'Retuning after seeing test errors makes the reported test result optimistic. Changing preprocessing or the searched key population can require fresh calibration.',
    related: ['held-out-test', 'threshold', 'multiple-testing'], links: [thresholds, evaluation],
  },
  {
    id: 'held-out-test', term: 'Held-out test set', aliases: ['test split', 'independent negatives', 'clean negatives'], category: C[2],
    definition: 'Examples reserved for evaluating the final procedure after training and threshold choices are fixed. Independence requires controlling relevant overlap, including source images, prompts, seeds or near-duplicate content.',
    whyItMatters: 'A clean split by filename can still leak image content or attack settings. The split should match the generalisation claim.',
    related: ['calibration', 'null-hypothesis', 'reproduction'], links: [evaluation, study('markdiffusion', 'Shared evaluation protocols')],
  },
  {
    id: 'multiple-testing', term: 'Multiple testing', aliases: ['multi-key search', 'family-wise error', 'key population'], category: C[2],
    definition: 'Performing several tests and acting on one or more favourable results. Searching many watermark keys creates more chances for an accidental match than testing one prespecified key.',
    whyItMatters: 'Calibrate the complete identity-search rule, including rejection. Single-key FPR does not automatically describe the whole search.',
    example: 'For 1,000 independent tests each with false-match probability 0.001, the chance of at least one false match is 1 − 0.999¹⁰⁰⁰, about 63.2%. Real scores may be dependent, so this calculation is illustrative.',
    related: ['attribution', 'false-positive-rate', 'open-set-rejection'], links: [study('ringid', 'RingID multi-key decisions'), study('wind', 'WIND group and identity stages')],
  },
  {
    id: 'correlation', term: 'Correlation', aliases: ['normalised correlation', 'Pearson correlation', 'similarity score'], category: C[2],
    definition: 'A measure of statistical association. Pearson correlation uses centred values and normalises their covariance by both standard deviations; other watermark scores may use an uncentred normalised inner product instead.',
    whyItMatters: 'Specify the formula and handling of zero-length or zero-variance inputs. Different normalisations produce different scores and thresholds.',
    related: ['covariance', 'statistic', 'independence'], links: [study('push-it-away', 'Push It Away summary and score qualifications'), thresholds],
  },
  {
    id: 'covariance', term: 'Covariance', aliases: ['covariance matrix', 'cross-coordinate dependence'], category: C[2],
    definition: 'The expected product of two centred random variables, measuring their linear co-variation. A covariance matrix collects these quantities across coordinates; its diagonal contains the coordinate variances.',
    whyItMatters: 'Zero off-diagonal covariance means uncorrelated coordinates, but does not generally prove independence unless additional conditions, such as a joint Gaussian law, hold.',
    related: ['correlation', 'independence', 'gaussian-prior'], links: [study('law', 'LAW covariance analysis'), study('spherical-watermark', 'Moment-preservation scope')],
  },
  {
    id: 'marginal-distribution', term: 'Marginal distribution', aliases: ['marginal Gaussianity', 'coordinate histogram', 'marginals'], category: C[2],
    definition: 'The probability distribution of a subset of variables when the remaining variables are not observed. A one-coordinate histogram describes a marginal, not the whole tensor\'s joint distribution.',
    whyItMatters: 'Every coordinate can have a standard-normal marginal while coordinates remain dependent. Marginal checks alone cannot establish an independent Gaussian prior.',
    example: 'Let X be standard normal and set Y = X. Both marginals are standard normal, but knowing X determines Y exactly.',
    related: ['independence', 'covariance', 'distribution-preservation'], links: [study('law', 'Marginals and dependence in LAW'), study('gaussian-shading', 'Prior-preservation assumptions')],
  },
  {
    id: 'independence', term: 'Independence', aliases: ['independent coordinates', 'joint distribution', 'IID', 'i.i.d.'], category: C[2],
    definition: 'Variables are independent when their joint law factors into their individual laws. Identically distributed means they share the same marginal law; it does not, by itself, mean they are independent.',
    whyItMatters: 'Gaussian-prior and message-success calculations often rely on independence. Correlated inversion errors can invalidate a convenient binomial or product formula.',
    related: ['marginal-distribution', 'covariance', 'binomial-null'], links: [study('spherical-watermark', 'Radius and direction independence'), bits],
  },
  {
    id: 'binomial-null', term: 'Binomial null model', aliases: ['bit-match test', 'binomial test'], category: C[2],
    definition: 'A model for a count of independent binary matches with one common match probability. Under an illustrative random-bit null, the number of matches to a fixed message has binomial parameters equal to message length and one half.',
    whyItMatters: 'Learned extractors may produce biased or dependent bits on unmarked images. The convenient null model must be checked rather than inferred from the bit count.',
    related: ['independence', 'null-hypothesis', 'p-value'], links: [thresholds, study('stable-signature', 'Signature detection and null assumptions')],
  },
  {
    id: 'confidence-interval', term: 'Confidence interval', aliases: ['uncertainty interval', 'sampling uncertainty'], category: C[2],
    definition: 'An interval produced by a procedure designed to cover a fixed population quantity at a stated long-run frequency under its assumptions. For an observed error rate, its width depends strongly on sample size.',
    whyItMatters: 'A zero-error result still has uncertainty. Tiny fixtures test code behaviour, while large and appropriate negative populations are needed to estimate rare false positives.',
    related: ['false-positive-rate', 'held-out-test', 'reproduction'], links: [evaluation, thresholds],
  },
  {
    id: 'open-set-rejection', term: 'Open-set rejection', aliases: ['unknown user', 'reject option', 'closed-set classification'], category: C[2],
    definition: 'The ability to reject a candidate that does not belong to any registered source. A closed-set classifier instead assumes one of its known classes must be the answer.',
    whyItMatters: 'High identity accuracy on known users does not measure the risk of assigning an unrelated image to a registered user.',
    related: ['attribution', 'multiple-testing', 'false-positive-rate'], links: [study('wouaf', 'WOUAF user attribution'), study('serum', 'SERUM image-space identification')],
  },
  {
    id: 'false-discovery-rate', term: 'False discovery rate', aliases: ['FDR', 'base-rate effect', 'precision'], category: C[2],
    definition: 'The expected fraction of accepted decisions that are false, with zero assigned when there are no acceptances. In binary classification, empirical precision measures the fraction of accepted examples that are truly positive.',
    whyItMatters: 'This differs from FPR, whose denominator is negatives. Even a low FPR can produce many wrong accusations when genuine marked images are rare.',
    example: 'Among 10 marked and 9,990 unmarked images, 10 true detections and 10 false alarms give 50% empirical precision despite an observed FPR of only about 0.1%.',
    related: ['false-positive-rate', 'true-positive-rate', 'attribution'], links: [thresholds, evaluation],
  },
  {
    id: 'bit-accuracy', term: 'Bit accuracy', aliases: ['bit recovery accuracy', 'BA'], category: C[3],
    definition: 'The proportion of compared message bits that agree with their targets, after alignment and a stated decoding stage. Averaging this value across images does not tell you how many complete messages are correct.',
    whyItMatters: 'A useful identifier may require every bit to be right. Report useful message recovery alongside bit accuracy and coding overhead.',
    related: ['bit-error-rate', 'message-recovery', 'payload'], links: [bits],
  },
  {
    id: 'bit-error-rate', term: 'Bit error rate', aliases: ['BER', 'bit error probability'], category: C[3],
    definition: 'The fraction of compared bits that are wrong at a specified stage, such as before or after error correction. With binary bits and identical comparison rules, it is one minus bit accuracy.',
    whyItMatters: 'Pre-decoder BER, decoded payload BER and failures to return a message are different outcomes. A denominator that omits failed images can hide poor recovery.',
    example: 'Two wrong bits in an aligned 16-bit output give BER 2/16 = 0.125. That message is not exactly recovered even though its bit accuracy is 87.5%.',
    related: ['bit-accuracy', 'message-recovery', 'soft-decoding'], links: [bits],
  },
  {
    id: 'message-recovery', term: 'Exact-message recovery', aliases: ['whole-message recovery', 'complete-message success', 'message accuracy'], category: C[3],
    definition: 'The fraction of tested messages for which every required payload bit is recovered correctly, under a stated rule for failures and rejection. It is a stricter outcome than high average bit accuracy.',
    whyItMatters: 'Long messages offer more opportunities for error. Under independent equal-probability bit errors p, a length-L message succeeds with probability (1 − p) raised to L.',
    example: 'With independent 1% bit errors, a 256-bit message succeeds with probability 0.99²⁵⁶, about 7.63%. This model is illustrative; measured errors can be correlated.',
    related: ['bit-error-rate', 'independence', 'error-correcting-code'], links: [bits],
  },
  {
    id: 'error-correcting-code', term: 'Error-correcting code', aliases: ['ECC', 'channel coding', 'redundancy'], category: C[3],
    definition: 'A construction that maps a useful message to a longer structured codeword so a decoder can recover it after specified channel errors. Its correction ability depends on the code, decoder and error pattern.',
    whyItMatters: 'Redundancy trades useful payload for recovery tolerance. It does not automatically provide secrecy, authentication or resistance to a knowledgeable adversary.',
    related: ['code-rate', 'repetition-code', 'pseudorandom-code'], links: [prc, bits],
  },
  {
    id: 'code-rate', term: 'Code rate', aliases: ['coding rate', 'coding overhead'], category: C[3],
    definition: 'The number of useful message bits divided by the number of encoded bits for a specified code. Extra protocol fields, such as signatures or random padding, can reduce the useful rate further.',
    whyItMatters: 'Comparing embedded codeword length with another method\'s useful payload gives a misleading capacity comparison.',
    example: 'Repeating each of 32 message bits three times produces 96 code bits and rate 1/3 before any additional metadata.',
    related: ['payload', 'capacity', 'repetition-code'], links: [bits, prc],
  },
  {
    id: 'repetition-code', term: 'Repetition code', aliases: ['majority vote', 'toy code', 'teaching PRC'], category: C[3],
    definition: 'An elementary code that repeats each message bit and decodes it using a voting rule. Repetition can reduce independent random bit errors but is inefficient and exposes clear structure unless a separate construction hides it.',
    whyItMatters: 'The local repetition-and-XOR exercise illustrates an embedding and decoding path. It is not the paper\'s cryptographic pseudorandom code and establishes no cryptographic guarantee.',
    example: 'A tripled bit decoded by majority is wrong after two or three independent flips. At flip probability 0.01, its error probability is 3 × 0.01² × 0.99 + 0.01³ = 0.000298.',
    related: ['pseudorandom-code', 'error-correcting-code', 'prerequisite-exercise'], links: [prc, bits],
  },
  {
    id: 'soft-decoding', term: 'Soft-decision decoding', aliases: ['soft bits', 'log-likelihood ratio', 'LLR', 'hard decision'], category: C[3],
    definition: 'Decoding that uses the confidence or likelihood carried by received values, rather than first reducing each value to a hard zero or one. A likelihood ratio compares how compatible a measurement is with the alternative transmitted bits.',
    whyItMatters: 'It can retain useful evidence near uncertain boundaries, but its reliability depends on the assumed channel and the decoder\'s use of that evidence.',
    related: ['channel-model', 'error-correcting-code', 'bit-error-rate'], links: [study('gaussian-shading-plus-plus', 'Soft decoding in Gaussian Shading++'), prc],
  },
  {
    id: 'pseudorandom-code', term: 'Pseudorandom code', aliases: ['PRC', 'pseudorandom error-correcting code'], category: C[3],
    definition: 'An error-correcting construction whose codewords are computationally indistinguishable from random strings to an adversary without the relevant secret information, under stated cryptographic assumptions. The permitted sample and query access is part of the guarantee.',
    whyItMatters: 'Robust decoding and hidden code structure are separate requirements. A seeded repetition code or an XOR mask is not, by itself, the PRC construction or its proof.',
    related: ['pseudorandomness', 'indistinguishability', 'repetition-code'], links: [prc],
  },
  {
    id: 'pseudorandomness', term: 'Pseudorandomness', aliases: ['cryptographic pseudorandomness', 'random-looking'], category: C[3],
    definition: 'The property that an efficient observer cannot distinguish a generated distribution from the specified random distribution with meaningful advantage in the stated security setting. It is stronger than passing selected visual or statistical checks.',
    whyItMatters: 'A deterministic generator can be cryptographically pseudorandom, while a statistically plausible histogram can conceal an easily detectable pattern.',
    related: ['indistinguishability', 'pseudorandom-code', 'seed'], links: [prc],
  },
  {
    id: 'indistinguishability', term: 'Computational indistinguishability', aliases: ['undetectability', 'cryptographic undetectability'], category: C[3],
    definition: 'A security claim that permitted efficient adversaries cannot reliably tell two specified distributions apart. The distributions, resource bounds, secret information and access to samples or oracles must all be stated.',
    whyItMatters: 'This concerns an observer without the verification secret. It is compatible with successful authorised watermark detection and is different from visual imperceptibility.',
    related: ['pseudorandomness', 'distribution-preservation', 'threat-model'], links: [prc, study('law', 'Limits of finite classifier tests')],
  },
  {
    id: 'encryption', term: 'Encryption', aliases: ['confidentiality', 'ciphertext', 'XOR mask'], category: C[3],
    definition: 'A keyed transformation designed to hide message contents from an unauthorised observer under a specified security model. Encryption alone does not prove who created the message or protect it from every modification.',
    whyItMatters: 'Randomising a watermark payload may help its sampling construction, but confidentiality, distribution preservation and authentication need distinct arguments.',
    related: ['authentication', 'key-reuse', 'pseudorandomness'], links: [study('gaussian-shading', 'Payload randomisation in Gaussian Shading'), prc],
  },
  {
    id: 'authentication', term: 'Authentication', aliases: ['message authenticity', 'authenticity'], category: C[3],
    definition: 'Assurance that data was produced by an authorised party and has not been modified in a way the verification protocol should reject. The assurance applies to the exact data or representation covered by that protocol.',
    whyItMatters: 'An authentic identifier does not automatically authenticate the image carrying it. Content binding must be checked separately.',
    related: ['digital-signature', 'content-binding', 'forgery'], links: [study('gaussian-shading-plus-plus', 'Signature-based verification'), study('tag-wm', 'Ownership and integrity evidence')],
  },
  {
    id: 'digital-signature', term: 'Digital signature', aliases: ['public-key signature', 'signed payload', 'public verification'], category: C[3],
    definition: 'A cryptographic value created with a signing key and checked using a corresponding public verification key. A valid signature authenticates the signed message under the signature scheme\'s assumptions.',
    whyItMatters: 'It does not encrypt the message or prove that arbitrary received pixels are original. Replay or transplant resistance needs protocol-level binding and checks.',
    related: ['authentication', 'content-binding', 'transplant'], links: [study('gaussian-shading-plus-plus', 'Public verification and binding limits')],
  },
  {
    id: 'hash', term: 'Cryptographic hash', aliases: ['digest', 'collision resistance', 'hash function'], category: C[3],
    definition: 'A deterministic function mapping data to a fixed-length digest, designed to make tasks such as finding collisions computationally difficult. A tiny input change normally changes the digest substantially.',
    whyItMatters: 'Exact hashing is useful for identifying saved artefacts but is not naturally tolerant of JPEG or benign edits. A hash alone also provides no sender authentication.',
    related: ['semantic-hash', 'digital-signature', 'save-reload'], links: [study('seal', 'Content hashing and tolerance'), study('markdiffusion', 'Reproducible experiment records')],
  },
  {
    id: 'semantic-hash', term: 'Semantic hash', aliases: ['perceptual hash', 'locality-sensitive hash', 'LSH'], category: C[3],
    definition: 'A compact representation intended to remain similar for content judged similar by a selected feature system. Semantic, perceptual and locality-sensitive hashes are related families, not interchangeable guarantees.',
    whyItMatters: 'Tolerance creates a binding boundary: some changes retain the code while others alter it. Test meaningful edits and possible collisions, rather than treating a stable hash as pixel integrity.',
    related: ['content-binding', 'hash', 'forgery'], links: [study('seal', 'SEAL semantic features and hashing')],
  },
  {
    id: 'key-reuse', term: 'Key reuse', aliases: ['reused mask', 'multi-sample attack', 'fixed key'], category: C[3],
    definition: 'Using the same secret information across several embeddings or verification events. Whether reuse is safe depends on the construction, fresh randomness and adversarial observations allowed by its security model.',
    whyItMatters: 'An argument for one randomised sample does not automatically cover many samples. Reusing a one-time XOR mask, for example, exposes relationships between messages.',
    related: ['key', 'pseudorandom-code', 'encryption'], links: [study('gaussian-shading-plus-plus', 'Fixed-key and seed-channel design'), prc],
  },
  {
    id: 'channel-model', term: 'Channel model', aliases: ['communication channel', 'AWGN', 'additive white Gaussian noise'], category: C[3],
    definition: 'A mathematical description of how an embedded signal becomes the received evidence. An additive white Gaussian noise model treats the error as independent equal-variance Gaussian noise, which is an assumption rather than a property of every inversion.',
    whyItMatters: 'Decoder likelihoods and coding predictions can fail when attacks introduce structured, biased or dependent errors outside the model.',
    related: ['soft-decoding', 'inversion-error', 'independence'], links: [study('gaussian-shading-plus-plus', 'Gaussian channel approximation'), study('gaussian-shannon', 'Communication perspective')],
  },
  {
    id: 'threat-model', term: 'Threat model', aliases: ['attacker access', 'adversary model', 'security setting'], category: C[4],
    definition: 'The explicit description of what an attacker knows, can query, can modify and is trying to achieve. It includes resource limits, quality constraints and which components or secrets remain protected.',
    whyItMatters: 'A result against compression does not establish security against detector queries, key compromise or model replacement.',
    related: ['white-box', 'black-box', 'attack-budget'], links: [evaluation, study('watermark-attacker', 'Regeneration attack access')],
  },
  {
    id: 'white-box', term: 'White-box access', aliases: ['white box', 'gradient access'], category: C[4],
    definition: 'Access to relevant internal information, such as model weights, detector architecture or gradients. The term must specify which component is exposed; it does not necessarily imply that a watermark key is known.',
    whyItMatters: 'An attack on a public generator and an attack with the secret detector are different experiments, even if both are called white-box.',
    related: ['threat-model', 'black-box', 'grey-box'], links: [study('semantic-forgery', 'Detector-guided forgery'), evaluation],
  },
  {
    id: 'black-box', term: 'Black-box access', aliases: ['black box', 'query access', 'box-free'], category: C[4],
    definition: 'Interaction through specified inputs and outputs without the relevant internals. A detector may expose only a decision or may reveal a numerical score; a box-free setting may remove even those queries.',
    whyItMatters: 'State the interface and query budget explicitly. A single term cannot tell the reader whether adaptive optimisation was possible.',
    related: ['white-box', 'grey-box', 'attack-budget'], links: [study('push-it-away', 'Supplied Push It Away summary'), evaluation],
  },
  {
    id: 'grey-box', term: 'Grey-box access', aliases: ['gray-box', 'partial knowledge', 'surrogate detector'], category: C[4],
    definition: 'Partial knowledge of a system, such as its method family or public generator while the target key or detector remains hidden. Some attacks optimise a substitute model and test transfer to the target.',
    whyItMatters: 'Report what is shared between the substitute and target. Transfer from an identical model may overstate performance under a different deployment.',
    related: ['white-box', 'black-box', 'threat-model'], links: [evaluation, study('watermark-attacker', 'Attacker capability assumptions')],
  },
  {
    id: 'removal', term: 'Watermark removal', aliases: ['evasion', 'erasure', 'removal attack'], category: C[4],
    definition: 'An attempt to make legitimate marked content fail its intended verification while retaining acceptable content quality. The target can be binary detection, identifier recovery or a local integrity signal.',
    whyItMatters: 'Destroying the entire image can remove evidence without being a useful attack. Define quality and task constraints beside the success rate.',
    related: ['forgery', 'regeneration', 'attack-budget'], links: [study('watermark-attacker', 'Generative removal attacks'), evaluation],
  },
  {
    id: 'forgery', term: 'Watermark forgery', aliases: ['false attribution', 'spoofing', 'forgery attack'], category: C[4],
    definition: 'Creating or modifying content so that a verifier accepts evidence it should not authorise, such as assigning an unrelated image to a target owner. This is different from making a genuine mark disappear.',
    whyItMatters: 'Removal robustness can coexist with forgery vulnerability. Test attack-generated positives as well as ordinary unmarked negatives.',
    related: ['removal', 'transplant', 'authentication'], links: [study('semantic-forgery', 'Semantic watermark forgery'), study('seal', 'Content binding against misuse')],
  },
  {
    id: 'transplant', term: 'Watermark transplant', aliases: ['copy attack', 'replay attack', 'payload copying'], category: C[4],
    definition: 'Moving or recreating accepted evidence from one piece of content in another. The verifier may recognise a valid message even though the new carrier was not authorised by the original source.',
    whyItMatters: 'A digital signature can remain valid after copying. The protocol needs an appropriate link between the signed data and the received image to resist false attribution.',
    related: ['content-binding', 'digital-signature', 'forgery'], links: [study('seal', 'SEAL binding boundary'), study('gaussian-shading-plus-plus', 'Signature and transplant limitations')],
  },
  {
    id: 'regeneration', term: 'Regeneration attack', aliases: ['diffusion purification', 'generative reconstruction', 'reconstruction attack'], category: C[4],
    definition: 'An attack that corrupts or compresses an image and reconstructs plausible content using a generative model. It aims to retain useful visual structure while discarding evidence the reconstruction does not preserve.',
    whyItMatters: 'The strength, reconstruction model and allowed content change determine the result. A theorem or experiment for one class of marks does not establish removal of every watermark.',
    related: ['removal', 'distortion', 'threat-model'], links: [study('watermark-attacker', 'WatermarkAttacker mechanism and scope'), evaluation],
  },
  {
    id: 'geometric-attack', term: 'Geometric attack', aliases: ['crop', 'resize', 'rotation', 'synchronisation error'], category: C[4],
    definition: 'A transformation that changes the spatial arrangement or extent of an image, such as cropping, resizing or rotating it. It can disrupt the coordinate alignment expected by an extractor or inversion procedure.',
    whyItMatters: 'Recovery may fail through lost synchronisation rather than simple signal attenuation. Record interpolation, crop fraction and any alignment search.',
    related: ['inversion-error', 'fourier-transform', 'attack-budget'], links: [evaluation, study('tree-rings', 'Frequency evidence after transformations')],
  },
  {
    id: 'jpeg', term: 'JPEG compression', aliases: ['JPEG attack', 'quality factor', 'lossy codec'], category: C[4],
    definition: 'A lossy image codec that usually transforms image blocks and quantises their coefficients, often with chroma subsampling. Its quality setting controls an implementation-specific compression trade-off rather than a universal distortion level.',
    whyItMatters: 'A JPEG test must actually encode and decode pixels. Identity operations or only differentiable approximations do not establish survival through the real codec.',
    related: ['save-reload', 'distortion', 'prerequisite-exercise'], links: [study('hidden', 'Training approximations and actual attacks'), evaluation],
  },
  {
    id: 'robustness', term: 'Robustness', aliases: ['attack robustness', 'persistence'], category: C[4],
    definition: 'Preservation of a specified task outcome under a specified set of perturbations. For watermarking, the outcome might be presence detection, exact-message recovery or reliable attribution.',
    whyItMatters: 'The word requires an attack family, strength, quality constraint and operating point. A successful JPEG test does not establish robustness to model fine-tuning or forgery.',
    related: ['security', 'removal', 'attack-budget'], links: [evaluation, study('sleepermark', 'Persistence after fine-tuning')],
  },
  {
    id: 'security', term: 'Security', aliases: ['adversarial security', 'watermark security'], category: C[4],
    definition: 'Resistance to an explicitly defined adversary achieving an unwanted goal within specified resources and assumptions. It can concern removal, forgery, key recovery or distinguishing marked from unmarked content.',
    whyItMatters: 'Performance on a fixed list of benign distortions is robustness evidence. A security claim needs the adversary\'s objective and access, and any theorem\'s assumptions.',
    related: ['robustness', 'threat-model', 'indistinguishability'], links: [prc, evaluation],
  },
  {
    id: 'attack-budget', term: 'Attack budget', aliases: ['query budget', 'distortion budget', 'attack strength', 'compute budget'], category: C[4],
    definition: 'A limit on resources or allowed changes, such as detector queries, optimisation steps, elapsed computation or perceptual distortion. Different budgets constrain different attack capabilities.',
    whyItMatters: 'A stronger-looking attack may simply spend more resources or change more content. Record the budget to make comparisons interpretable.',
    related: ['threat-model', 'distortion', 'robustness'], links: [evaluation, study('watermark-attacker', 'Removal and quality trade-offs')],
  },
  {
    id: 'distortion', term: 'Distortion', aliases: ['image quality cost', 'imperceptibility', 'perceptual similarity'], category: C[5],
    definition: 'A change between content representations, measured using a specified criterion or human judgement. Pixel error, perceptual similarity and semantic preservation describe different aspects of that change.',
    whyItMatters: 'High visual quality does not establish watermark recovery, and high detector scores do not establish acceptable content quality.',
    related: ['psnr', 'lpips', 'regeneration'], links: [evaluation, study('zodiac', 'Cover preservation during optimisation')],
  },
  {
    id: 'psnr', term: 'PSNR', aliases: ['peak signal-to-noise ratio', 'MSE', 'mean squared error'], category: C[5],
    definition: 'A logarithmic summary derived from mean squared pixel error and a specified maximum pixel value. Larger values indicate smaller squared error for the same image range and comparison convention.',
    whyItMatters: 'State pixel scaling, colour space and alignment. PSNR can penalise tiny shifts heavily while missing the importance of a small semantic change.',
    related: ['distortion', 'ssim', 'lpips'], links: [evaluation, study('zodiac', 'Paired-cover quality limits')],
  },
  {
    id: 'ssim', term: 'SSIM', aliases: ['structural similarity index'], category: C[5],
    definition: 'A full-reference image similarity measure based on local luminance, contrast and structural comparisons. Its result depends on implementation details such as window size, channel handling and data range.',
    whyItMatters: 'It complements pixel error but is not proof of unchanged meaning or human imperceptibility.',
    related: ['psnr', 'lpips', 'distortion'], links: [evaluation],
  },
  {
    id: 'lpips', term: 'LPIPS', aliases: ['learned perceptual image patch similarity', 'perceptual distance'], category: C[5],
    definition: 'A learned full-reference perceptual distance based on differences between image features from a specified network. Lower values usually indicate greater similarity under that implementation and preprocessing.',
    whyItMatters: 'Record the feature backbone and version. A low score does not establish that small text, identity or other consequential details remain unchanged.',
    related: ['distortion', 'psnr', 'clip-score'], links: [evaluation, study('zodiac', 'Perceptual optimisation and local changes')],
  },
  {
    id: 'fid', term: 'FID', aliases: ['Fréchet Inception distance', 'Frechet Inception distance'], category: C[5],
    definition: 'A dataset-level distance between Gaussian approximations to image-feature distributions, conventionally using an Inception network. It compares feature means and covariances rather than paired images.',
    whyItMatters: 'Sample count, reference set, feature extractor and preprocessing affect the estimate. Similar FID does not prove that a watermark leaves the full output distribution unchanged.',
    related: ['distribution-preservation', 'covariance', 'held-out-test'], links: [evaluation, study('gaussian-shading', 'Distributional and empirical quality claims')],
  },
  {
    id: 'clip-score', term: 'CLIP score', aliases: ['text-image alignment', 'CLIP similarity'], category: C[5],
    definition: 'A score based on the relationship between text and image representations from a CLIP model, often using normalised similarity with a specified scaling rule. It measures one model\'s alignment, not complete image quality.',
    whyItMatters: 'State the CLIP model and formula. Strong prompt alignment can coexist with visible artefacts, changed small objects or failed watermark extraction.',
    related: ['distortion', 'fid', 'semantic-hash'], links: [evaluation, diffusion],
  },
  {
    id: 'capacity', term: 'Payload capacity', aliases: ['embedding capacity', 'bits per image', 'payload length'], category: C[5],
    definition: 'The useful information a specified watermark system can carry under stated recovery, quality and error-rate requirements. A nominal embedded bit count alone does not establish a usable communication rate.',
    whyItMatters: 'Count coding overhead and measure exact useful-message recovery. Capacity at no attack differs from reliable payload after an attack.',
    related: ['payload', 'code-rate', 'message-recovery'], links: [bits, prc],
  },
  {
    id: 'training-free', term: 'Training-free watermarking', aliases: ['no fine-tuning', 'training free', 'plug-and-play'], category: C[5],
    definition: 'A method requiring no watermark-specific parameter training under its stated definition. It may still use a large pretrained generator, image-specific optimisation, secret state or expensive inversion.',
    whyItMatters: 'Separate generator training, auxiliary detector training, per-user adaptation and per-image optimisation. Frozen generator weights alone do not make the whole method training-free.',
    related: ['frozen-weights', 'insertion-point', 'attack-budget'], links: [study('rosteals', 'Frozen autoencoder and learned secret pathway'), study('gaussian-shading', 'Training-free initial-noise mapping')],
  },
  {
    id: 'frozen-weights', term: 'Frozen weights', aliases: ['fixed parameters', 'trainable parameters', 'gradient flow'], category: C[5],
    definition: 'Parameters held unchanged during an optimisation. Gradients can still pass through a frozen component to update its input or an earlier trainable component.',
    whyItMatters: 'State which tensors change, rather than only which model is frozen. Tests should confirm fixed marked states or frozen renderers remain unchanged when the mechanism requires it.',
    related: ['training-free', 'conditioning', 'lora'], links: [study('robin', 'Fixed state and optimised conditioning'), study('stable-signature', 'Decoder fine-tuning boundary')],
  },
  {
    id: 'lora', term: 'LoRA', aliases: ['low-rank adaptation', 'low rank update', 'adapter'], category: C[5],
    definition: 'A parameter-efficient adaptation that represents a weight update using a product of smaller low-rank matrices. Additional method-specific mappings or scaling can condition the update on a watermark message.',
    whyItMatters: 'The watermark lives in a learned model modification. Merging, replacing or cancelling that update can affect extraction while leaving images plausible.',
    related: ['frozen-weights', 'insertion-point', 'robustness'], links: [study('aqualora', 'AquaLoRA message-conditioned adaptation'), study('wouaf', 'WOUAF user-specific weights')],
  },
  {
    id: 'prerequisite-exercise', term: 'Prerequisite exercise', aliases: ['CPU exercise', 'teaching exercise', 'smoke check'], category: C[5],
    definition: 'A bounded implementation that teaches supporting operations, such as Fourier manipulation, coding or saved-image detection. It does not claim to execute the paper\'s complete method-specific mechanism.',
    whyItMatters: 'A passing command check means the stated operation executed and its assertions passed. It does not imply payload success, diffusion-model robustness or paper reproduction.',
    related: ['mechanism-demonstration', 'reproduction', 'save-reload'], links: [study('gaussmarker', 'GaussMarker study and exercise boundary'), prc],
  },
  {
    id: 'mechanism-demonstration', term: 'Mechanism demonstration', aliases: ['mechanism demo', 'method-specific demonstration'], category: C[5],
    definition: 'An implementation that executes and tests the method-specific steps it claims to demonstrate. It may simplify scale or models, but must state what is changed and show evidence from the actual executable path.',
    whyItMatters: 'Naming a generic operation after a paper does not make it a mechanism demonstration. The paper\'s defining intervention and recovery must actually occur.',
    related: ['prerequisite-exercise', 'reproduction', 'insertion-point'], links: [study('markdiffusion', 'Implementation fidelity and evaluation'), study('robin', 'Mechanism-specific optimisation boundary')],
  },
  {
    id: 'reproduction', term: 'Paper reproduction', aliases: ['replication', 'reproduction evidence', 'official implementation'], category: C[5],
    definition: 'An attempt to obtain comparable experimental findings using a specified paper protocol, implementation, model, data and evaluation conditions. An author repository establishes provenance, while successful reproduction requires matched experimental evidence.',
    whyItMatters: 'A local CPU fixture and a successful import cannot validate published robustness numbers. Record versions, commands, outputs, conditions and deviations.',
    related: ['mechanism-demonstration', 'held-out-test', 'save-reload'], links: [study('markdiffusion', 'Toolkit use and method fidelity'), evaluation],
  },
  {
    id: 'save-reload', term: 'Saved-image round trip', aliases: ['save and reload', 'PNG reload', 'received evidence', 'manifest', 'artefact hash'], category: C[5],
    definition: 'Saving the generated or marked image, loading that file again, and running recovery from the reloaded pixels. The experiment record links measured results to the exact saved artefact and run settings.',
    whyItMatters: 'Quantisation and codec behaviour can change recovery. Pre-save training scores must not be presented as measurements of the saved image.',
    related: ['inversion-error', 'jpeg', 'prerequisite-exercise'], links: [study('tree-rings', 'Received-image recovery boundary'), study('markdiffusion', 'Experiment records and reproducibility')],
  },
];

export const glossaryById = new Map(glossaryTerms.map(term => [term.id, term]));

export function searchGlossary(query: string, category: GlossaryCategory | 'All topics' = 'All topics') {
  const words = query.trim().toLocaleLowerCase('en-GB').split(/\s+/).filter(Boolean);
  return glossaryTerms.filter(term => {
    if (category !== 'All topics' && term.category !== category) return false;
    const text = [term.term, ...term.aliases, term.definition, term.whyItMatters, term.example ?? ''].join(' ').toLocaleLowerCase('en-GB');
    return words.every(word => text.includes(word));
  }).sort((a, b) => a.term.localeCompare(b.term, 'en-GB'));
}
