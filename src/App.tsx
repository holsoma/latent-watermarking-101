import { useEffect, useMemo, useRef, useState } from "react";

const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.min(maximum, Math.max(minimum, value));

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
  const [attack, setAttack] = useState("Clean");
  const [bit, setBit] = useState<0 | 1>(1);
  const [angularError, setAngularError] = useState(8);
  const [correlated, setCorrelated] = useState(false);
  const [redundancy, setRedundancy] = useState(36);
  const [attackStrength, setAttackStrength] = useState(28);
  const [payload, setPayload] = useState(42);

  const attackHealth: Record<string, number> = {
    Clean: 96,
    JPEG: 78,
    Crop: 61,
    Regenerate: 43,
    "Semantic edit": 35,
  };

  const conceptualScores = useMemo(
    () => ({
      robustness: Math.round(clamp(58 + redundancy * 0.48 - attackStrength * 0.55 - payload * 0.2)),
      diversity: Math.round(clamp(96 - redundancy * 0.42 - payload * 0.12)),
      capacity: Math.round(clamp(payload)),
    }),
    [redundancy, attackStrength, payload],
  );

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top">
          <span>LW</span>
          <b>Latent Watermarking 101</b>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#diffusion">Diffusion</a>
          <a href="#watermarking">Watermarking</a>
          <a href="#methods">Methods</a>
          <a href="#math">Math lab</a>
          <a href="#glossary">Glossary</a>
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
        </div>
      </section>

      <section className="learning-strip" aria-label="Learning outcomes">
        <p><b>01</b> Understand latent diffusion</p>
        <p><b>02</b> Trace a watermark channel</p>
        <p><b>03</b> Read method claims critically</p>
        <p><b>04</b> Enter the research atlas prepared</p>
      </section>

      <section className="lesson diffusion" id="diffusion">
        <div className="lesson-heading">
          <p>Foundation</p>
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

      <section className="lesson channel">
        <div className="lesson-heading">
          <p>Core mental model</p>
          <h2>A watermark is a message sent through a noisy, adversarial channel.</h2>
          <p className="section-intro">
            Click each stage. The plain explanation and research term describe the same system at different levels.
          </p>
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
            {Object.keys(attackHealth).map((name) => (
              <button className={attack === name ? "active" : ""} onClick={() => setAttack(name)} key={name}>
                {name}
              </button>
            ))}
          </div>
          <div className="signal-readout">
            <span>Observed image</span>
            <div className={`image-sample attack-${attack.toLowerCase().replace(" ", "-")}`}>
              <DenoiseCanvas progress={0.98} />
            </div>
            <span>Approximate inversion</span>
            <div className="noise-sample" style={{ "--health": `${attackHealth[attack]}%` } as React.CSSProperties}>
              <b>{attackHealth[attack]}%</b>
              <small>conceptual signal health</small>
            </div>
          </div>
          <p className="simulation-note">
            This interaction is explanatory, not a benchmark. Real robustness depends on the model, scheduler, detector, payload, key, and attack parameters.
          </p>
        </div>
      </section>

      <section className="lesson methods" id="methods">
        <div className="lesson-heading">
          <p>Method landscape</p>
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
          <p>Preparing for angular methods</p>
          <h2>Two Gaussian coordinates can be read as a point with a magnitude and an angle.</h2>
          <p className="section-intro">
            Angular schemes use relationships between coordinates. The detector can read a relative angle even when absolute values move.
          </p>
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
              min="-35"
              max="35"
              value={angularError}
              onChange={(event) => setAngularError(Number(event.target.value))}
            />
            <p>
              A larger recovered magnitude can make an angular decision less sensitive to small coordinate errors. Repetition and error-correcting codes can add protection, but they consume capacity or diversity.
            </p>
          </div>
        </div>
      </section>

      <section className="lesson gaussian">
        <div className="lesson-heading compact">
          <h2>Gaussian-looking coordinates can still depend on one another.</h2>
          <p className="section-intro">
            Matching each coordinate's mean and variance is not enough to prove that the complete latent remains independent Gaussian noise.
          </p>
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
      </section>

      <section className="lesson tradeoff">
        <div className="lesson-heading">
          <p>Conceptual design lab</p>
          <h2>Robustness, payload, diversity, and attack strength cannot all move freely.</h2>
        </div>
        <div className="tradeoff-layout">
          <div className="tradeoff-controls">
            <label>
              Redundancy <b>{redundancy}</b>
              <input type="range" min="0" max="100" value={redundancy} onChange={(event) => setRedundancy(Number(event.target.value))} />
            </label>
            <label>
              Attack strength <b>{attackStrength}</b>
              <input type="range" min="0" max="100" value={attackStrength} onChange={(event) => setAttackStrength(Number(event.target.value))} />
            </label>
            <label>
              Payload pressure <b>{payload}</b>
              <input type="range" min="0" max="100" value={payload} onChange={(event) => setPayload(Number(event.target.value))} />
            </label>
          </div>
          <div className="score-field">
            {Object.entries(conceptualScores).map(([name, score]) => (
              <div key={name}>
                <span>{name}</span>
                <b>{score}</b>
                <i style={{ width: `${score}%` }} />
              </div>
            ))}
          </div>
        </div>
        <p className="simulation-note">
          Conceptual relationship only. These scores are deliberately not presented as experimental results.
        </p>
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
          <p>Primary reading path</p>
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

      <section className="next-step">
        <div>
          <span>You now have the frame of reference.</span>
          <h2>Continue into the gap analysis.</h2>
          <p>
            The companion atlas compares current methods, exposes training boundaries, and develops a focused research-paper programme.
          </p>
        </div>
        <a className="button primary" href="https://holsoma.github.io/watermarking-gap-analysis/" target="_blank" rel="noreferrer">
          Open the research atlas
        </a>
      </section>

      <footer>
        <div>
          <b>Latent Watermarking 101</b>
          <p>Public educational reference. Visual simulations are conceptual unless stated otherwise.</p>
        </div>
        <div>
          <a href="#top">Back to top</a>
          <a href="https://github.com/holsoma/latent-watermarking-101" target="_blank" rel="noreferrer">GitHub source</a>
        </div>
      </footer>
    </main>
  );
}
