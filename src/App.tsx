import { useEffect, useRef, useState } from "react";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function normalPair(random: () => number) {
  const u = Math.max(1e-9, random());
  const v = random();
  const radius = Math.sqrt(-2 * Math.log(u));
  const angle = 2 * Math.PI * v;
  return [radius * Math.cos(angle), radius * Math.sin(angle)] as const;
}

function useCanvasSize(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  draw: (context: CanvasRenderingContext2D, width: number, height: number) => void,
  dependencies: unknown[],
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      const rectangle = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(rectangle.width * ratio);
      canvas.height = Math.round(rectangle.height * ratio);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(context, rectangle.width, rectangle.height);
    };

    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    render();
    return () => observer.disconnect();
  }, dependencies);
}

function DenoiseCanvas({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvasSize(
    canvasRef,
    (context, width, height) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#edf1f5";
      context.fillRect(0, 0, width, height);

      const reveal = progress ** 1.5;
      context.globalAlpha = reveal;
      context.fillStyle = "#2457ff";
      context.beginPath();
      context.arc(width * 0.72, height * 0.28, 34, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#c7d2de";
      context.beginPath();
      context.moveTo(0, height * 0.72);
      context.lineTo(width * 0.28, height * 0.43);
      context.lineTo(width * 0.5, height * 0.7);
      context.lineTo(width * 0.7, height * 0.5);
      context.lineTo(width, height * 0.76);
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.fill();

      context.strokeStyle = "#111827";
      context.lineWidth = 2;
      for (let index = 0; index < 7; index += 1) {
        const y = height * (0.76 + index * 0.035);
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      const random = seededRandom(4821);
      context.globalAlpha = Math.max(0.08, 1 - reveal);
      for (let index = 0; index < 1100; index += 1) {
        const x = random() * width;
        const y = random() * height;
        const size = 1 + random() * 2.4;
        context.fillStyle = random() > 0.82 ? "#2457ff" : "#111827";
        context.fillRect(x, y, size, size);
      }
      context.globalAlpha = 1;
    },
    [progress],
  );

  return <canvas ref={canvasRef} className="denoise-canvas" aria-label="Conceptual denoising visualisation" />;
}

function AngleCanvas({ bit, error }: { bit: 0 | 1; error: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvasSize(
    canvasRef,
    (context, width, height) => {
      context.clearRect(0, 0, width, height);
      const centreX = width / 2;
      const centreY = height / 2;
      const scale = Math.min(width, height) * 0.31;

      context.strokeStyle = "#b9c3cf";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(24, centreY);
      context.lineTo(width - 24, centreY);
      context.moveTo(centreX, 24);
      context.lineTo(centreX, height - 24);
      context.stroke();

      context.beginPath();
      context.arc(centreX, centreY, scale, 0, Math.PI * 2);
      context.stroke();

      const referenceAngle = -0.45;
      const signedQuarterTurn = bit === 1 ? Math.PI / 2 : -Math.PI / 2;
      const encodedAngle = referenceAngle + signedQuarterTurn + (error * Math.PI) / 180;

      const drawVector = (angle: number, colour: string, label: string) => {
        const endX = centreX + Math.cos(angle) * scale;
        const endY = centreY + Math.sin(angle) * scale;
        context.strokeStyle = colour;
        context.fillStyle = colour;
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(centreX, centreY);
        context.lineTo(endX, endY);
        context.stroke();
        context.beginPath();
        context.arc(endX, endY, 6, 0, Math.PI * 2);
        context.fill();
        context.font = "600 12px ui-monospace, monospace";
        context.fillText(label, endX + 9, endY - 9);
      };

      drawVector(referenceAngle, "#111827", "reference");
      drawVector(encodedAngle, "#2457ff", `bit ${bit}`);

      context.fillStyle = "#5d6875";
      context.font = "12px ui-monospace, monospace";
      context.fillText("relative angle", 18, 22);
    },
    [bit, error],
  );

  return <canvas ref={canvasRef} className="angle-canvas" aria-label="Angular watermark coordinate visualisation" />;
}

function DistributionCanvas({ correlated }: { correlated: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvasSize(
    canvasRef,
    (context, width, height) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#f8fafc";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "#c3ccd6";
      context.beginPath();
      context.moveTo(width / 2, 18);
      context.lineTo(width / 2, height - 18);
      context.moveTo(18, height / 2);
      context.lineTo(width - 18, height / 2);
      context.stroke();

      const random = seededRandom(correlated ? 178 : 94);
      context.fillStyle = "#2457ff";
      for (let index = 0; index < 620; index += 1) {
        const [first, second] = normalPair(random);
        const xValue = first;
        const yValue = correlated ? 0.82 * first + Math.sqrt(1 - 0.82 ** 2) * second : second;
        const x = width / 2 + xValue * width * 0.12;
        const y = height / 2 + yValue * height * 0.12;
        context.globalAlpha = 0.38;
        context.beginPath();
        context.arc(x, y, 2, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    },
    [correlated],
  );

  return <canvas ref={canvasRef} className="distribution-canvas" aria-label="Gaussian point cloud visualisation" />;
}

const channelStages = [
  {
    name: "Payload",
    plain: "The information you want the image to carry.",
    technical: "A binary mark, user identifier, cryptographic seed, or structured message.",
  },
  {
    name: "Keyed encoder",
    plain: "A secret rule turns the payload into a latent pattern.",
    technical: "The key determines sampling regions, codewords, frequency structure, or coordinate pairings.",
  },
  {
    name: "Generator",
    plain: "The diffusion model turns the marked latent into an image.",
    technical: "The denoising trajectory transports the signal while text conditioning determines image content.",
  },
  {
    name: "Real-world channel",
    plain: "The image is compressed, resized, edited, or regenerated.",
    technical: "These operations disturb the latent estimate and alter the detector's signal-to-noise ratio.",
  },
  {
    name: "Inversion",
    plain: "The detector estimates the starting latent from the image.",
    technical: "DDIM-style inversion is approximate and depends on the model, sampler, prompt assumptions, and image history.",
  },
  {
    name: "Decision",
    plain: "A decoder returns a message and confidence.",
    technical: "Verification needs a calibrated null distribution, a threshold, and an explicit false-positive operating point.",
  },
];

const methodFamilies = [
  {
    title: "Geometric structure",
    methods: "Tree-Ring, RingID, SFW",
    idea: "Place recognisable geometry in Fourier or latent coordinates.",
    cost: "A strong structure may shift the prior or reveal key relationships.",
  },
  {
    title: "Distribution-aware mapping",
    methods: "Gaussian Shading, PRC, T2SMark",
    idea: "Choose marked noise through keyed sampling or pseudorandom coding.",
    cost: "Robust decoding, cryptographic assumptions, and key reuse become central.",
  },
  {
    title: "Semantic binding",
    methods: "SEAL, TAG-WM",
    idea: "Tie verification to image meaning or local tamper evidence.",
    cost: "The semantic encoder or localisation system becomes part of the trusted pipeline.",
  },
  {
    title: "Learned recovery",
    methods: "GaussMarker, SERUM, LaWa",
    idea: "Train a detector, restorer, or decoder to survive a family of attacks.",
    cost: "Training data and attack coverage can limit transfer to new models and edits.",
  },
];

const attackLessons = {
  Clean: {
    effect: "No extra image transformation is introduced.",
    inversion: "Any recovery error now comes from the inversion procedure, model mismatch, or numerical approximation.",
    report: "Report clean detection first. It separates embedding and inversion errors from robustness failures.",
  },
  JPEG: {
    effect: "Compression changes local pixel values and removes high-frequency detail.",
    inversion: "The detector inverts a nearby image, not the exact image produced by the generator.",
    report: "State the codec, quality setting, colour conversion, and whether compression was applied once or repeatedly.",
  },
  Crop: {
    effect: "Cropping removes content and changes the spatial coordinate system.",
    inversion: "The estimated latent may be misaligned with the coordinates or frequencies used by the key.",
    report: "State crop area, crop location, resizing policy, and whether the detector knows the geometry.",
  },
  Regenerate: {
    effect: "A second generative process creates new pixels that preserve some meaning but not the original generation path.",
    inversion: "The recovered latent belongs to the new generation process, so the original latent signal can be greatly reduced.",
    report: "Name the regeneration model, prompt source, strength, sampler, and number of steps.",
  },
  "Semantic edit": {
    effect: "The image meaning or object layout changes while some visual content remains.",
    inversion: "The detector must distinguish an allowed edit from a content change that invalidates provenance.",
    report: "Define which edits should retain the mark and which should cause verification to fail.",
  },
} as const;

type AttackName = keyof typeof attackLessons;

const glossary = [
  ["Latent", "A compact numerical representation. Diffusion operates here instead of directly changing every pixel."],
  ["zT", "The initial noisy latent, normally sampled from a standard Gaussian distribution."],
  ["z0", "The denoised latent that the VAE decoder turns into pixels."],
  ["Payload", "The information encoded by the watermark, such as a bit string or user identity."],
  ["Key", "Secret or public material that controls embedding, verification, attribution, or signatures."],
  ["Inversion", "An approximate reverse process that estimates an earlier latent from a final image."],
  ["FPR", "False-positive rate. The fraction of genuinely unmarked images incorrectly declared marked."],
  ["TPR", "True-positive rate. The fraction of marked images correctly detected at a stated threshold."],
  ["Robustness", "The probability that the mark remains usable after a declared transformation or attack."],
  ["Undetectability", "A security property stating that an efficient adversary cannot distinguish marked from unmarked outputs."],
];

export default function App() {
  const [denoiseStep, setDenoiseStep] = useState(18);
  const [channelStage, setChannelStage] = useState(0);
  const [attack, setAttack] = useState<AttackName>("Clean");
  const [bit, setBit] = useState<0 | 1>(1);
  const [angularError, setAngularError] = useState(8);
  const [correlated, setCorrelated] = useState(false);
  const detectedBit = Math.sin((bit === 1 ? Math.PI / 2 : -Math.PI / 2) + (angularError * Math.PI) / 180) >= 0 ? 1 : 0;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top">
          <span>LW</span>
          <b>Latent Watermarking 101</b>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#diffusion">Diffusion</a>
          <a href="#channel">Channel</a>
          <a href="#methods">Methods</a>
          <a href="#math">Math lab</a>
          <a href="#reading">Reading</a>
        </nav>
        <a className="header-link" href="https://github.com/holsoma/latent-watermarking-101" target="_blank" rel="noreferrer">
          View source
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">From Gaussian noise to verifiable evidence</p>
          <h1>Follow the signal.</h1>
          <p>Learn how diffusion images carry hidden information without starting from a research paper.</p>
          <div className="hero-actions">
            <a className="button primary" href="#diffusion">Start with the generator</a>
            <a className="button secondary" href="#reading">See primary sources</a>
          </div>
        </div>
        <div className="hero-visual">
          <DenoiseCanvas progress={denoiseStep / 50} />
          <div className="hero-control">
            <label htmlFor="hero-denoise">Denoising step <b>{denoiseStep}/50</b></label>
            <input
              id="hero-denoise"
              type="range"
              min="0"
              max="50"
              value={denoiseStep}
              onChange={(event) => setDenoiseStep(Number(event.target.value))}
            />
          </div>
          <div className="interaction-brief">
            <b>Learning pointer</b>
            <p>Move the step control. Notice that the latent starts as noise, while the image structure emerges through repeated denoising.</p>
          </div>
        </div>
      </section>

      <section className="learning-strip" aria-label="Learning outcomes">
        <p>Understand the latent diffusion pipeline</p>
        <p>Trace embedding and detection end to end</p>
        <p>Explain why inversion can fail</p>
        <p>Read method claims and results critically</p>
      </section>

      <section className="lesson diffusion" id="diffusion">
        <div className="lesson-heading">
          <h2>Stable Diffusion does most of its work in a smaller numerical space.</h2>
          <p className="section-intro">
            A classic latent diffusion pipeline converts text into conditioning, turns random latent noise into a structured latent, then decodes that latent into pixels.
          </p>
        </div>
        <div className="process-rail">
          {[
            ["Prompt", "A caption describes the requested content."],
            ["Text conditioning", "A text encoder produces vectors that guide generation."],
            ["Initial latent zT", "Generation begins with Gaussian random noise."],
            ["Denoising", "A U-Net or transformer predicts how to remove noise step by step."],
            ["Image latent z0", "The result is compact and structured, but is not yet a pixel image."],
            ["VAE decode", "A decoder maps the final latent into RGB pixels."],
          ].map(([title, description], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <aside className="precision-note">
          <b>Precision note</b>
          <p>
            “Stable Diffusion” names a family. Earlier systems commonly use a U-Net denoiser, while newer diffusion systems may use transformer backbones. The latent and VAE ideas remain useful, but implementation details vary.
          </p>
        </aside>
        <details className="knowledge-check">
          <summary>Check your understanding: where can an in-generation watermark enter this pipeline?</summary>
          <p>
            A method can modify the initial latent, influence an intermediate denoising state, alter conditioning, or change the decoder. These choices create different training, compatibility, and detection requirements.
          </p>
        </details>
      </section>

      <section className="lesson comparison" id="watermarking">
        <div className="lesson-heading compact">
          <h2>Traditional watermarking changes an image. Generative watermarking changes how the image is made.</h2>
        </div>
        <div className="comparison-grid">
          <article>
            <div className="comparison-diagram posthoc">
              <span>Generated image</span><i>+</i><span>Pixel watermark</span><i>=</i><strong>Published image</strong>
            </div>
            <h3>Post-hoc watermarking</h3>
            <p>An encoder modifies pixels after generation. A decoder later searches those pixels for the hidden message.</p>
            <ul>
              <li>Works with images from many sources</li>
              <li>Can use mature image-watermark encoders</li>
              <li>Introduces a direct image perturbation</li>
            </ul>
          </article>
          <article>
            <div className="comparison-diagram ingeneration">
              <span>Marked zT</span><i>→</i><span>Diffusion process</span><i>→</i><strong>Published image</strong>
            </div>
            <h3>In-generation watermarking</h3>
            <p>The initial noise or an intermediate latent carries the mark before pixels exist.</p>
            <ul>
              <li>Can leave the standard generation model unchanged</li>
              <li>Can link provenance to generation keys</li>
              <li>Usually needs inversion for detection</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="lesson channel" id="channel">
        <div className="lesson-heading">
          <h2>A watermark is a message sent through a noisy, adversarial channel.</h2>
          <p className="section-intro">
            Click each stage. The plain explanation and research term describe the same system at different levels.
          </p>
        </div>
        <div className="interaction-brief section-brief">
          <b>Question to answer</b>
          <p>At which stage does the method need a secret key, a trained component, model access, or an assumption about image history?</p>
        </div>
        <div className="channel-layout">
          <div className="channel-stages" role="tablist" aria-label="Watermark channel stages">
            {channelStages.map((stage, index) => (
              <button
                key={stage.name}
                className={channelStage === index ? "active" : ""}
                onClick={() => setChannelStage(index)}
                role="tab"
                aria-selected={channelStage === index}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {stage.name}
              </button>
            ))}
          </div>
          <div className="channel-explainer" role="tabpanel">
            <span>Stage {channelStage + 1} of {channelStages.length}</span>
            <h3>{channelStages[channelStage].name}</h3>
            <p className="plain">{channelStages[channelStage].plain}</p>
            <div>
              <b>Research language</b>
              <p>{channelStages[channelStage].technical}</p>
            </div>
          </div>
        </div>
        <details className="knowledge-check">
          <summary>Check your understanding: why is a detector threshold part of the method?</summary>
          <p>
            A score alone does not declare provenance. The threshold sets the trade-off between missed marks and false accusations, so it must be calibrated on an explicit unmarked distribution.
          </p>
        </details>
      </section>

      <section className="lesson inversion">
        <div className="lesson-heading compact">
          <h2>Detection starts with an approximation, not a time machine.</h2>
          <p className="section-intro">
            Diffusion inversion estimates an earlier latent. Every edit changes the quality of that estimate.
          </p>
        </div>
        <div className="attack-lab">
          <div className="attack-controls">
            {(Object.keys(attackLessons) as AttackName[]).map((name) => (
              <button className={attack === name ? "active" : ""} onClick={() => setAttack(name)} key={name}>
                {name}
              </button>
            ))}
          </div>
          <div className="signal-readout">
            <div>
              <span>Observed output</span>
              <div className={`image-sample attack-${attack.toLowerCase().replace(" ", "-")}`}>
                <DenoiseCanvas progress={0.98} />
              </div>
            </div>
            <div className="attack-explainer" aria-live="polite">
              <span>What changed</span>
              <h3>{attackLessons[attack].effect}</h3>
              <dl>
                <div>
                  <dt>Why inversion becomes harder</dt>
                  <dd>{attackLessons[attack].inversion}</dd>
                </div>
                <div>
                  <dt>What an experiment must report</dt>
                  <dd>{attackLessons[attack].report}</dd>
                </div>
              </dl>
            </div>
          </div>
          <p className="simulation-note">
            The image filters illustrate categories of change. They do not reproduce a named attack pipeline or predict detector performance.
          </p>
        </div>
      </section>

      <section className="lesson methods" id="methods">
        <div className="lesson-heading">
          <h2>Different methods spend their robustness budget in different places.</h2>
        </div>
        <div className="family-list">
          {methodFamilies.map((family, index) => (
            <article key={family.title}>
              <div className="family-code">{String.fromCharCode(65 + index)}</div>
              <div>
                <h3>{family.title}</h3>
                <p className="method-names">{family.methods}</p>
              </div>
              <p>{family.idea}</p>
              <p className="family-cost"><b>Trade-off</b>{family.cost}</p>
            </article>
          ))}
        </div>
        <div className="training-boundary">
          <h3>Ask what “training-free” actually excludes.</h3>
          <div>
            <span>Strict training-free</span>
            <span>Test-time optimisation</span>
            <span>Auxiliary detector training</span>
            <span>Model or decoder fine-tuning</span>
          </div>
          <p>
            Keeping the base diffusion weights fixed does not make an entire system training-free. A learned detector, restorer, decoder, or token embedding still creates training requirements.
          </p>
        </div>
      </section>

      <section className="lesson math-lab" id="math">
        <div className="lesson-heading">
          <h2>Two Gaussian coordinates can be read as a point with a magnitude and an angle.</h2>
          <p className="section-intro">
            This coordinate-pair example explains the intuition behind angular encoding. It is not a reproduction of one paper's full algorithm.
          </p>
        </div>
        <div className="interaction-brief section-brief">
          <b>Try to break the bit</b>
          <p>Choose a bit, then increase the inversion error until the recovered vector crosses the angular decision boundary.</p>
        </div>
        <div className="lab-grid">
          <div className="canvas-panel">
            <AngleCanvas bit={bit} error={angularError} />
          </div>
          <div className="lab-controls">
            <div className="segmented">
              <button className={bit === 0 ? "active" : ""} onClick={() => setBit(0)}>Encode bit 0</button>
              <button className={bit === 1 ? "active" : ""} onClick={() => setBit(1)}>Encode bit 1</button>
            </div>
            <label htmlFor="angular-error">
              Inversion angle error
              <b>{angularError}°</b>
            </label>
            <input
              id="angular-error"
              type="range"
              min="-120"
              max="120"
              value={angularError}
              onChange={(event) => setAngularError(Number(event.target.value))}
            />
            <div className={`detector-result ${detectedBit === bit ? "correct" : "incorrect"}`} aria-live="polite">
              <span>Detector reads</span>
              <b>bit {detectedBit}</b>
              <small>{detectedBit === bit ? "Decoded correctly" : "Decision boundary crossed"}</small>
            </div>
            <p>
              Repetition and error-correcting codes can protect several uncertain coordinate decisions, but they consume capacity and require a declared noise model.
            </p>
          </div>
        </div>
        <details className="knowledge-check">
          <summary>Check your understanding: why can a larger payload be harder to protect?</summary>
          <p>
            More message bits require more coordinate decisions. Without additional redundancy, the chance that at least one decision is corrupted increases. Redundancy helps, but uses latent degrees of freedom that could otherwise support diversity or capacity.
          </p>
        </details>
      </section>

      <section className="lesson gaussian">
        <div className="lesson-heading compact">
          <h2>Gaussian-looking coordinates can still depend on one another.</h2>
          <p className="section-intro">
            Matching each coordinate's mean and variance is not enough to prove that the complete latent remains independent Gaussian noise.
          </p>
        </div>
        <div className="interaction-brief section-brief">
          <b>Question to answer</b>
          <p>Can every coordinate look Gaussian while pairs of coordinates still reveal a watermarking rule?</p>
        </div>
        <div className="distribution-lab">
          <DistributionCanvas correlated={correlated} />
          <div className="distribution-copy">
            <div className="segmented">
              <button className={!correlated ? "active" : ""} onClick={() => setCorrelated(false)}>Independent</button>
              <button className={correlated ? "active" : ""} onClick={() => setCorrelated(true)}>Correlated</button>
            </div>
            <h3>{correlated ? "The marginals look normal, but the pair tilts." : "The cloud is circular and has no preferred direction."}</h3>
            <dl>
              <div><dt>Mean of x, y</dt><dd>Approximately 0</dd></div>
              <div><dt>Variance of x, y</dt><dd>Approximately 1</dd></div>
              <div><dt>Pair covariance</dt><dd>{correlated ? "High and positive" : "Approximately 0"}</dd></div>
            </dl>
            <p>
              This distinction matters when a paper claims to preserve the latent prior. Check marginal statistics, covariance, higher-order dependence, and fixed-key detectability.
            </p>
          </div>
        </div>
        <details className="knowledge-check">
          <summary>Check your understanding: what evidence is missing from a marginal histogram?</summary>
          <p>
            A one-dimensional histogram cannot reveal covariance or higher-order dependence between coordinates. A distribution-preservation claim needs tests at the joint level and under repeated use of a fixed key.
          </p>
        </details>
      </section>

      <section className="lesson claims">
        <div className="lesson-heading">
          <h2>A result is only useful when you can reconstruct the experimental claim.</h2>
          <p className="section-intro">
            Use these four questions when a paper reports detection accuracy, robustness, image quality, or distribution preservation.
          </p>
        </div>
        <div className="claim-checklist">
          <article>
            <span>Detection</span>
            <h3>At which false-positive rate?</h3>
            <p>A true-positive rate without its threshold and false-positive operating point cannot support a deployment claim.</p>
          </article>
          <article>
            <span>Robustness</span>
            <h3>Under which exact transformation?</h3>
            <p>“JPEG”, “crop”, and “regeneration” name attack families. Parameters and implementation choices determine the actual test.</p>
          </article>
          <article>
            <span>Quality</span>
            <h3>Compared with which unmarked baseline?</h3>
            <p>Use matched prompts, seeds, samplers, and model settings. A metric alone does not isolate the effect of watermarking.</p>
          </article>
          <article>
            <span>Security</span>
            <h3>What does the attacker know and control?</h3>
            <p>Key access, detector queries, model access, and repeated marked samples can change the threat model completely.</p>
          </article>
        </div>
      </section>

      <section className="lesson glossary" id="glossary">
        <div className="lesson-heading compact">
          <h2>The vocabulary research papers often leave implicit.</h2>
        </div>
        <div className="glossary-grid">
          {glossary.map(([term, definition], index) => (
            <details key={term} open={index < 2}>
              <summary>{term}<span>+</span></summary>
              <p>{definition}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lesson reading" id="reading">
        <div className="lesson-heading">
          <h2>Read the field in the order its assumptions become necessary.</h2>
        </div>
        <ol className="reading-list">
          <li>
            <span>Foundation</span>
            <div><h3>Latent Diffusion Models</h3><p>Learn why generation moves into latent space and how the VAE and denoiser divide the work.</p></div>
            <a href="https://arxiv.org/abs/2112.10752" target="_blank" rel="noreferrer">Paper ↗</a>
          </li>
          <li>
            <span>Inversion</span>
            <div><h3>DDIM</h3><p>Understand deterministic sampling paths and why approximate reversal is possible.</p></div>
            <a href="https://arxiv.org/abs/2010.02502" target="_blank" rel="noreferrer">Paper ↗</a>
          </li>
          <li>
            <span>Geometry</span>
            <div><h3>Tree-Ring Watermarks</h3><p>See how an initial-noise Fourier pattern created the modern training-free line.</p></div>
            <a href="https://arxiv.org/abs/2305.20030" target="_blank" rel="noreferrer">Paper ↗</a>
          </li>
          <li>
            <span>Distribution</span>
            <div><h3>Gaussian Shading</h3><p>Move from visible structure towards distribution-preserving keyed sampling.</p></div>
            <a href="https://openaccess.thecvf.com/content/CVPR2024/html/Yang_Gaussian_Shading_Provable_Performance-Lossless_Image_Watermarking_for_Diffusion_Models_CVPR_2024_paper.html" target="_blank" rel="noreferrer">Paper ↗</a>
          </li>
          <li>
            <span>Security</span>
            <div><h3>PRC Watermark</h3><p>Study computational undetectability and pseudorandom error-correcting codes.</p></div>
            <a href="https://openreview.net/forum?id=jlhBFm7T2J" target="_blank" rel="noreferrer">Paper ↗</a>
          </li>
          <li>
            <span>Forgery</span>
            <div><h3>SEAL</h3><p>See why content binding matters when attackers can copy marks into unrelated images.</p></div>
            <a href="https://openaccess.thecvf.com/content/ICCV2025/html/Arabi_SEAL_Semantic_Aware_Image_Watermarking_ICCV_2025_paper.html" target="_blank" rel="noreferrer">Paper ↗</a>
          </li>
        </ol>
      </section>

      <footer>
        <div>
          <b>Latent Watermarking 101</b>
          <p>
            Public educational reference. Visual simulations are conceptual unless stated otherwise. Teaching format informed by{" "}
            <a href="https://www.arjunvirk.com/writing/ml-guide" target="_blank" rel="noreferrer">Arjun Virk&apos;s ML Bible</a>.
          </p>
        </div>
        <div>
          <a href="#top">Back to top</a>
          <a href="https://github.com/holsoma/latent-watermarking-101" target="_blank" rel="noreferrer">GitHub source</a>
        </div>
      </footer>
    </main>
  );
}
