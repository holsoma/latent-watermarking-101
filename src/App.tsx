import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { glossary, papers as originalPapers, type Paper, type TrainingBoundary } from "./content";
import { additionalPapers, additionalReading, studyContent, type PaperStudy } from "./studies";

const studyCategories: PaperStudy["category"][] = [
  "Foundations and bridges",
  "Initial-noise and inversion",
  "Learned and model-integrated",
  "Semantics, integrity and security",
];
const papers = [...originalPapers, ...additionalPapers].sort((left, right) => {
  const categoryDifference =
    studyCategories.indexOf(studyContent[left.slug].category) -
    studyCategories.indexOf(studyContent[right.slug].category);
  if (categoryDifference !== 0) return categoryDifference;
  return Number(left.year) - Number(right.year);
});
const paperBySlug = new Map(papers.map((paper) => [paper.slug, paper]));

type NavItem = { label: string; path: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Orientation",
    items: [
      { label: "Start here", path: "/" },
      { label: "How to read a paper", path: "/reading" },
    ],
  },
  {
    label: "Foundations",
    items: [
      { label: "Image watermarking", path: "/foundations/watermarking" },
      { label: "Neural networks", path: "/foundations/networks" },
      { label: "Latent diffusion", path: "/foundations/diffusion" },
      { label: "Image frequency", path: "/foundations/frequency" },
      { label: "Evaluation", path: "/foundations/evaluation" },
    ],
  },
  {
    label: "Research",
    items: [
      { label: "Paper studies", path: "/papers" },
      { label: "Threats and gaps", path: "/research/gaps" },
      { label: "Glossary", path: "/glossary" },
    ],
  },
];

function getRoute() {
  const route = window.location.hash.replace(/^#/, "") || "/";
  return route.startsWith("/") ? route : `/${route}`;
}

function useHashRoute() {
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const update = () => setRoute(getRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route]);
  return route;
}

function Link({
  to,
  children,
  className = "",
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a href={`#${to}`} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="external-link">
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="article-section">
      {number && <p className="section-number">{number}</p>}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Callout({
  label,
  children,
  tone = "blue",
}: {
  label: string;
  children: ReactNode;
  tone?: "blue" | "plain" | "warning";
}) {
  return (
    <aside className={`callout ${tone}`}>
      <strong>{label}</strong>
      <div>{children}</div>
    </aside>
  );
}

function Equation({ children }: { children: ReactNode }) {
  return <div className="equation">{children}</div>;
}

function Article({
  eyebrow,
  title,
  lead,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <article className="article">
      <header className="article-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        {meta && <p className="article-meta">{meta}</p>}
      </header>
      {children}
    </article>
  );
}

function ConceptGrid({
  items,
}: {
  items: { title: string; text: string; tag?: string }[];
}) {
  return (
    <div className="concept-grid">
      {items.map((item) => (
        <div className="concept-card" key={item.title}>
          {item.tag && <span>{item.tag}</span>}
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function Pipeline({
  steps,
}: {
  steps: { label: string; title: string; text: string }[];
}) {
  return (
    <ol className="pipeline">
      {steps.map((step) => (
        <li key={step.label}>
          <span>{step.label}</span>
          <div>
            <strong>{step.title}</strong>
            <p>{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function BoundaryBadge({ value }: { value: TrainingBoundary }) {
  const tone =
    value === "No method-specific training"
      ? "green"
      : value === "Per-image optimisation"
        ? "orange"
        : "purple";
  return <span className={`boundary-badge ${tone}`}>{value}</span>;
}

function Table({
  headings,
  rows,
}: {
  headings: string[];
  rows: (string | ReactNode)[][];
}) {
  return (
    <div className="table-wrap" tabIndex={0}>
      <table>
        <thead>
          <tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HomePage() {
  return (
    <Article
      eyebrow="Open technical guide"
      title="Latent watermarking, from pixels to provenance."
      lead="A chapter-based introduction to image watermarking, latent diffusion, frequency-domain design, inversion, security and the research literature."
      meta="Built for a careful first reading, then repeated use as a paper companion."
    >
      <div className="home-actions">
        <Link to="/foundations/watermarking" className="button primary">Begin the guide</Link>
        <Link to="/papers" className="button secondary">Open the paper studies</Link>
      </div>

      <div className="home-chapters" aria-label="Core chapters">
        <Link to="/foundations/watermarking" className="home-chapter">
          <div className="home-chapter-head"><span>01 · signal</span><b>→</b></div>
          <h2>Image watermarking</h2>
          <p>Start with the communication system: embed, attack, extract and decide.</p>
          <ul><li>visible vs invisible</li><li>payload and fidelity</li><li>attack channels</li></ul>
          <strong>Open foundation →</strong>
        </Link>
        <Link to="/foundations/diffusion" className="home-chapter">
          <div className="home-chapter-head"><span>02 · generator</span><b>→</b></div>
          <h2>Latent diffusion</h2>
          <p>Follow a sample from iid Gaussian noise to a decoded image.</p>
          <ul><li>VAE and latent space</li><li>denoising trajectory</li><li>inversion limits</li></ul>
          <strong>Open foundation →</strong>
        </Link>
        <Link to="/foundations/frequency" className="home-chapter">
          <div className="home-chapter-head"><span>03 · representation</span><b>→</b></div>
          <h2>Image frequency</h2>
          <p>See why spatial change, Fourier structure and alignment affect robustness.</p>
          <ul><li>low and high frequency</li><li>DFT coordinates</li><li>ring patterns</li></ul>
          <strong>Open foundation →</strong>
        </Link>
        <Link to="/foundations/evaluation" className="home-chapter">
          <div className="home-chapter-head"><span>04 · evidence</span><b>→</b></div>
          <h2>Evaluation</h2>
          <p>Translate a detector score into a claim about a real deployment.</p>
          <ul><li>fidelity and payload</li><li>calibration</li><li>threat models</li></ul>
          <strong>Open foundation →</strong>
        </Link>
      </div>

      <Section id="route" number="01" title="A three-pass reading route">
        <div className="route-list">
          <div><b>Pass 1</b><h3>Build the mechanism</h3><p>Learn what an embedder, attack channel and detector do. Then follow a latent diffusion sample from Gaussian noise to pixels.</p></div>
          <div><b>Pass 2</b><h3>Learn the trade-offs</h3><p>Connect spatial frequency, inversion error and payload coding to fidelity, robustness, security and cost.</p></div>
          <div><b>Pass 3</b><h3>Interrogate the papers</h3><p>Read each method as a claim under a threat model, not as a method name and a headline number.</p></div>
        </div>
      </Section>

      <Section id="map" number="02" title="The field in one map">
        <div className="field-map" aria-label="Map of latent watermarking method families">
          <div className="map-source">
            <span>Starting latent</span>
            <strong>z<sub>T</sub> ∼ N(0, I)</strong>
          </div>
          <div className="map-branches">
            <div><b>Pattern design</b><p>Fourier rings, channel patterns or angular regions.</p><small>Tree-Rings · RingID · SFWMark</small></div>
            <div><b>Gaussian mapping</b><p>Map payload bits into samples while preserving a target distribution.</p><small>Gaussian Shading · T2SMark · PRC</small></div>
            <div><b>Learned systems</b><p>Train injectors, restorers or image-space detectors around a fixed generator.</p><small>LaWa · GaussMarker · SERUM</small></div>
            <div><b>Task-aware marks</b><p>Bind evidence to objects, semantics or local content integrity.</p><small>SEAL · TAG-WM · Text Encoder</small></div>
          </div>
          <div className="map-output">
            <span>Generated image</span>
            <strong>x<sub>w</sub></strong>
          </div>
        </div>
        <Callout label="The central distinction">
          A method can keep the base diffusion model fixed and still train an auxiliary decoder, restorer or classifier. This guide reserves <em>training-free</em> for systems with no watermark-specific learned parameters.
        </Callout>
      </Section>

      <Section id="questions" number="03" title="Questions this guide teaches you to ask">
        <ConceptGrid items={[
          { title: "Where is information written?", text: "Finished pixels, autoencoder latent, initial Gaussian noise, an intermediate denoising state or the prompt representation." },
          { title: "What makes it recoverable?", text: "Redundancy, Fourier structure, coding, a learned decoder, inversion geometry or a semantic binding." },
          { title: "What is the null hypothesis?", text: "The distribution of evidence expected from unwatermarked generated images and unrelated real images." },
          { title: "What does the attacker know?", text: "The algorithm, model, detector, public key, query interface, some marked samples or the full secret key." },
          { title: "What is the real unit of success?", text: "A bit, a full message, a correct user identity, a valid signature, or a correctly localised tamper region." },
          { title: "What does deployment cost?", text: "Training, extra denoising steps, per-image optimisation, inversion, key search, storage and threshold calibration." },
        ]} />
      </Section>
      <NextPage path="/reading" label="Next: how to read a watermarking paper" />
    </Article>
  );
}

function ReadingPage() {
  return (
    <Article
      eyebrow="Orientation · 02"
      title="Read the claim, not the acronym."
      lead="Every paper can be reduced to an information path, an operating point and a threat model. This template keeps comparisons honest."
    >
      <Section id="system" number="01" title="Draw the full system before reading results">
        <Pipeline steps={[
          { label: "E", title: "Embed or select", text: "What receives the payload, and what parameters or keys does this operation require?" },
          { label: "G", title: "Generate", text: "Which model, sampler, guidance scale and number of steps transport the latent evidence to pixels?" },
          { label: "A", title: "Attack", text: "Which transformations are permitted, and are they tested alone or in composition?" },
          { label: "I", title: "Invert or observe", text: "Does verification require the generator, an inverse trajectory, an encoder or only the image?" },
          { label: "D", title: "Decide", text: "Is the output a bit string, a presence score, a user identity, a signature result or a tamper mask?" },
        ]} />
      </Section>
      <Section id="claims" number="02" title="Translate broad claims into testable statements">
        <Table
          headings={["Paper phrase", "Question to write in the margin"]}
          rows={[
            ["Imperceptible", "Measured against what paired reference, with which perceptual metric and human protocol?"],
            ["Robust", "Against which attack, at what strength, and at what false-positive rate?"],
            ["Training-free", "Are any detector, restorer, token embedding or auxiliary network parameters learned?"],
            ["Performance-lossless", "Is this a distribution theorem, an empirical average or a claim about each prompt and seed?"],
            ["Secure", "Removal, forgery, key recovery, statistical detectability or public verification?"],
            ["High capacity", "Raw bits or useful bits after error correction, and is the whole message recovered exactly?"],
          ]}
        />
      </Section>
      <Section id="numbers" number="03" title="Do not compare isolated headline numbers">
        <p>Bit accuracy at one JPEG quality cannot be compared with message recovery under crop plus resize. FID from 5,000 samples cannot establish that paired images preserve prompt details. A result becomes comparable only when these conditions match:</p>
        <ul className="check-list">
          <li>model and model version;</li>
          <li>sampler, number of steps and guidance;</li>
          <li>prompt and image dataset;</li>
          <li>payload and error-correction overhead;</li>
          <li>attack implementation and intensity;</li>
          <li>false-positive operating point;</li>
          <li>single-key, closed-set identification or open-set identification.</li>
        </ul>
        <Callout label="Replication rule" tone="warning">
          Record complete configurations, not only method names. Inversion-based results can change when the scheduler, VAE, precision or prompt conditioning changes.
        </Callout>
      </Section>
      <Section id="evidence" number="04" title="Use source layers deliberately">
        <p>The paper is the claim. The official code is an executable interpretation of that claim. An independent reproduction tests whether the interpretation transfers. A survey helps locate the work, but should not replace the primary source when recording mechanisms or results.</p>
      </Section>
      <NextPage path="/foundations/watermarking" label="Next: image watermarking" />
    </Article>
  );
}

function WatermarkingPage() {
  return (
    <Article
      eyebrow="Foundations · 01"
      title="Image watermarking is a communication system."
      lead="A watermark carries evidence through a visual signal and an uncertain transformation channel. The image must still serve its original purpose."
    >
      <Section id="visible" number="01" title="Visible and invisible watermarks solve different problems">
        <div className="comparison">
          <div className="comparison-panel visible-mark">
            <span className="sample-label">VISIBLE</span>
            <div className="sample-image"><b>OWNER</b></div>
            <h3>Deterrence through observation</h3>
            <p>A logo or text overlay is intended to be noticed. It can communicate ownership immediately, but can also be cropped, covered or reconstructed.</p>
          </div>
          <div className="comparison-panel invisible-mark">
            <span className="sample-label">INVISIBLE</span>
            <div className="sample-image"><b>101101</b></div>
            <h3>Evidence through detection</h3>
            <p>The marked image should look unchanged. Ownership or provenance is established by a detector with a key or learned model.</p>
          </div>
        </div>
        <p>Visibility is not binary in a physical sense. Invisible means that changes are below a stated perceptual threshold in a stated viewing condition. A difference can be difficult for a person to see yet easy for a statistical classifier to detect.</p>
      </Section>

      <Section id="pipeline" number="02" title="Embed, transmit, extract">
        <Equation>
          <span>x<sub>w</sub> = E(x, w; k)</span>
          <small>embed payload w in cover image x using key k</small>
        </Equation>
        <Equation>
          <span>x<sub>w</sub> ≈ x</span>
          <small>fidelity objective</small>
        </Equation>
        <Equation>
          <span>x′<sub>w</sub> = A(x<sub>w</sub>)</span>
          <small>the received image after an attack or ordinary processing</small>
        </Equation>
        <Equation>
          <span>ŵ = D(x′<sub>w</sub>; k) ≈ w</span>
          <small>robust extraction objective</small>
        </Equation>
        <p>The prime in x′<sub>w</sub> does not imply an adversary. Uploading to a platform can resize and recompress an image without malicious intent. A useful evaluation separates benign processing, deliberate removal and forgery.</p>
        <ConceptGrid items={[
          { title: "Blind", text: "The detector receives the questioned image and a key or model, but not the original cover image." },
          { title: "Non-blind", text: "The detector can compare with the original image. This usually improves sensitivity but is harder to deploy at scale." },
          { title: "Zero-bit", text: "The system answers whether one key is present. The payload is effectively a presence claim." },
          { title: "Multi-bit", text: "The system recovers a message, such as a creator ID, user ID, timestamp or signed statement." },
        ]} />
      </Section>

      <Section id="attacks" number="03" title="The attack channel">
        <Table
          headings={["Attack family", "What changes", "Why evidence is lost"]}
          rows={[
            ["JPEG compression", "Quantises block-frequency coefficients", "Weak high-frequency values can be rounded away and blocking changes local statistics."],
            ["Noise addition", "Adds random pixel variation", "The detector must distinguish watermark energy from new noise."],
            ["Contrast or colour", "Changes intensity mapping or channels", "Amplitude and channel relationships shift."],
            ["RST", "Rotates, scales or translates coordinates", "The detector no longer observes the expected spatial alignment."],
            ["Crop and resize", "Removes content then resamples it", "Part of the payload disappears and the remaining grid is warped."],
            ["Inpainting", "Replaces a selected region with generated content", "Local evidence is removed while most image semantics may remain."],
            ["Reconstruction", "Encodes and regenerates the image", "Low-level signals are discarded while semantic content is rebuilt."],
            ["Combined attack", "Applies several operations in sequence", "Small errors compound and defeat assumptions calibrated for one transform."],
          ]}
        />
        <Callout label="RST means a group of geometric transforms">
          Rotation, scaling and translation alter coordinates. A robust system can synchronise before decoding, use an invariant representation, spread information widely, or learn transformed examples. Each option has a cost.
        </Callout>
      </Section>

      <Section id="residual" number="04" title="Residual subtraction and reverse engineering">
        <p>If an analyst has a paired cover and watermarked image, the direct residual is:</p>
        <Equation>
          <span>r = x<sub>w</sub> - x</span>
          <small>visible or amplified evidence of what embedding changed</small>
        </Equation>
        <div className="residual-demo">
          <div><span>cover x</span><div className="residual-base" /></div>
          <b>−</b>
          <div><span>marked x<sub>w</sub></span><div className="residual-marked" /></div>
          <b>=</b>
          <div><span>amplified residual</span><div className="residual-signal" /></div>
        </div>
        <p>This is useful for auditing additive pixel methods. It can reveal repeated texture, edge adaptation or a fixed key. It is not automatically available to an attacker. In generative watermarking there may be no natural cover x: the image is synthesised from a marked noise sample, and an unmarked run with another sample is a different image.</p>
        <Callout label="A precise correction" tone="plain">
          Using the same prompt and seed can create a paired experimental baseline if the method permits it, but the generator can transport a latent change into semantic and geometric differences. The result is not necessarily a fixed additive signal in pixel space.
        </Callout>
      </Section>

      <Section id="generation" number="05" title="What changes when there is no cover image">
        <p>Traditional notation starts with an existing image x. In-generation watermarking starts earlier. A system selects or modifies the random latent z<sub>T</sub>, then the generator maps it to an image:</p>
        <Equation>
          <span>z′<sub>T</sub> = E<sub>z</sub>(z<sub>T</sub>, w; k), &nbsp; x<sub>w</sub> = G(z′<sub>T</sub>, c)</span>
          <small>c is conditioning such as a text prompt</small>
        </Equation>
        <p>The fidelity question is therefore counterfactual. Does the marked sampling process preserve the expected image distribution, prompt alignment and diversity? Pixel distance from an unmarked generation is often inappropriate because different valid random samples should produce different images.</p>
      </Section>
      <NextPage path="/foundations/networks" label="Next: neural networks" />
    </Article>
  );
}

function NetworksPage() {
  return (
    <Article
      eyebrow="Foundations · 02"
      title="The model families behind the watermark."
      lead="Classification, regression and generation answer different questions. Watermark papers often combine them in one system."
    >
      <Section id="taxonomy" number="01" title="Discriminative and generative models">
        <div className="taxonomy">
          <div className="taxonomy-root"><b>Neural network</b><span>learned function</span></div>
          <div className="taxonomy-branch">
            <div>
              <b>Discriminative</b>
              <p>Models a target from observed input.</p>
              <ul><li><strong>Classification:</strong> watermark present, absent, or key identity</li><li><strong>Regression:</strong> bit confidence, distortion level, or tamper score</li></ul>
            </div>
            <div>
              <b>Generative</b>
              <p>Models how data can be produced.</p>
              <ul><li>GAN</li><li>Autoencoder and VAE</li><li>Diffusion and latent diffusion</li></ul>
            </div>
          </div>
        </div>
        <p>A watermark detector can be discriminative even when the image generator is generative. A paper that leaves Stable Diffusion fixed but trains a binary detector still has a trained component and an associated generalisation problem.</p>
      </Section>

      <Section id="architectures" number="02" title="Four architectures and their roles">
        <Table
          headings={["Architecture", "Core mechanism", "Watermarking relevance"]}
          rows={[
            ["GAN", "A generator synthesises samples while a discriminator distinguishes generated from real data.", "Watermark objectives can be added to the generator, and an adversarial discriminator can penalise visible artefacts."],
            ["Autoencoder", "An encoder compresses x to z and a decoder reconstructs x̂ from z.", "A message can be inserted into z or feature maps, then recovered from the decoded image."],
            ["Variational autoencoder", "The encoder predicts a distribution over z and regularises it towards a prior.", "Latent structure supports sampling and compression, but reconstruction is lossy."],
            ["Latent diffusion", "A diffusion process learns to denoise in the autoencoder latent space.", "The initial noise, denoising trajectory, conditioning and VAE latent are all possible embedding locations."],
          ]}
        />
      </Section>

      <Section id="gan" number="03" title="GAN: generator plus discriminator">
        <div className="mini-flow">
          <div><small>random input</small><b>z</b></div><span>→</span><div><small>generator</small><b>G(z)</b></div><span>→</span><div><small>candidate image</small><b>x̂</b></div><span>→</span><div><small>discriminator</small><b>real?</b></div>
        </div>
        <p>The discriminator supplies a training signal that asks generated outputs to resemble the training distribution. In watermarking, a separate watermark decoder can ask the output to retain w. These objectives can conflict: an easy-to-decode signal may also be easy for a discriminator or attacker to notice.</p>
      </Section>

      <Section id="autoencoder" number="04" title="AE and VAE: compression is not diffusion">
        <div className="mini-flow">
          <div><small>pixels</small><b>x</b></div><span>→</span><div><small>encoder</small><b>q(z|x)</b></div><span>→</span><div><small>compact code</small><b>z</b></div><span>→</span><div><small>decoder</small><b>x̂</b></div>
        </div>
        <p>An ordinary autoencoder can learn any convenient latent code. A VAE constrains the code distribution, usually with a Kullback-Leibler term, so it can be sampled. Stable Diffusion uses an autoencoder to move between pixels and lower-dimensional latents, but the diffusion model itself is the denoising model operating in that latent space.</p>
        <Callout label="Common confusion">
          The VAE decoder produces pixels. The U-Net or diffusion transformer predicts denoising information in latent space. Calling the U-Net an image decoder collapses two distinct components.
        </Callout>
      </Section>

      <Section id="modality" number="05" title="Modality describes inputs and outputs, not one architecture">
        <Table
          headings={["Modality", "Input", "Output", "Typical watermark question"]}
          rows={[
            ["T2I", "Text", "Image", "Can every generated image carry a source or user payload?"],
            ["I2I", "Image", "Image", "Does editing preserve, remove or update the original provenance mark?"],
            ["TI2I", "Text and image", "Image", "Can an instruction edit retain provenance while marking changed content?"],
            ["T2T", "Text", "Text", "Requires text-watermarking mechanisms, not image-frequency or latent-image assumptions."],
          ]}
        />
        <p>Latent diffusion is used for T2I, I2I and text-guided image editing. It is not synonymous with TI2I. The modality determines which inputs an attacker can modify and what continuity of provenance should mean.</p>
      </Section>
      <NextPage path="/foundations/diffusion" label="Next: latent diffusion" />
    </Article>
  );
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
      const box = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(box.width * ratio);
      canvas.height = Math.round(box.height * ratio);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(context, box.width, box.height);
    };
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    render();
    return () => observer.disconnect();
  }, dependencies);
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeGaussianField(size: number, seed: number) {
  const random = seededRandom(seed);
  const field = new Float32Array(size);
  for (let index = 0; index < size; index += 2) {
    const radius = Math.sqrt(-2 * Math.log(Math.max(random(), 1e-8)));
    const angle = Math.PI * 2 * random();
    field[index] = radius * Math.cos(angle);
    if (index + 1 < size) field[index + 1] = radius * Math.sin(angle);
  }
  return field;
}

function createReferenceImage(width: number, height: number) {
  const pixels = new Float32Array(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / width;
      const ny = y / height;
      const horizon = 0.63;
      let red = 0.17 + 0.22 * (1 - ny);
      let green = 0.42 + 0.26 * (1 - ny);
      let blue = 0.72 + 0.2 * (1 - ny);
      const sunDistance = Math.hypot(nx - 0.72, ny - 0.27);
      const sun = Math.max(0, 1 - sunDistance / 0.12);
      red += sun * 0.8; green += sun * 0.62; blue += sun * 0.15;
      const mountain = ny > 0.42 + 0.16 * Math.abs(Math.sin(nx * 8.8)) ? 1 : 0;
      const foreground = ny > horizon + 0.04 * Math.sin(nx * 18) ? 1 : 0;
      if (mountain) { red = 0.20; green = 0.28; blue = 0.39; }
      if (foreground) { red = 0.07; green = 0.16; blue = 0.15; }
      const tree = Math.abs(nx - 0.16) < 0.035 && ny > 0.53 || Math.abs(nx - 0.88) < 0.026 && ny > 0.51;
      if (tree) { red = 0.035; green = 0.11; blue = 0.10; }
      const pixel = (y * width + x) * 3;
      pixels[pixel] = red * 2 - 1;
      pixels[pixel + 1] = green * 2 - 1;
      pixels[pixel + 2] = blue * 2 - 1;
    }
  }
  return pixels;
}

function DenoiseLab() {
  const [progress, setProgress] = useState(58);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulation = useMemo(() => {
    const width = 240;
    const height = 150;
    return { width, height, reference: createReferenceImage(width, height), noise: makeGaussianField(width * height * 3, 731) };
  }, []);
  useCanvasSize(
    canvasRef,
    (context, width, height) => {
      const alphaBar = Math.max(0.001, progress / 100);
      const sigmaBar = Math.sqrt(1 - alphaBar);
      const image = context.createImageData(simulation.width, simulation.height);
      for (let index = 0; index < simulation.reference.length; index += 1) {
        const noised = Math.sqrt(alphaBar) * simulation.reference[index] + sigmaBar * simulation.noise[index];
        image.data[Math.floor(index / 3) * 4 + (index % 3)] = Math.max(0, Math.min(255, Math.round((noised + 1) * 127.5)));
      }
      for (let index = 3; index < image.data.length; index += 4) image.data[index] = 255;
      const bitmapCanvas = document.createElement("canvas");
      bitmapCanvas.width = simulation.width;
      bitmapCanvas.height = simulation.height;
      bitmapCanvas.getContext("2d")?.putImageData(image, 0, 0);
      context.imageSmoothingEnabled = false;
      context.fillStyle = "#eef2f6";
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmapCanvas, 0, 0, width, height);
    },
    [progress, simulation],
  );
  const stage = progress < 15 ? "t = 100 · iid Gaussian noise" : progress < 45 ? "t = 70 · weak structure" : progress < 80 ? "t = 35 · denoising" : "t = 0 · reconstructed image";
  const sigma = Math.sqrt(1 - Math.max(0.001, progress / 100));
  return (
    <div className="lab denoise-lab">
      <div className="lab-head"><span>Real diffusion equation</span><b>{stage}</b></div>
      <canvas ref={canvasRef} aria-label={`Pixel-level diffusion simulation at ${progress} per cent reconstruction`} />
      <div className="lab-stats">
        <div><small>signal weight √ᾱ</small><b>{Math.sqrt(progress / 100).toFixed(2)}</b></div>
        <div><small>noise weight σ</small><b>{sigma.toFixed(2)}</b></div>
      </div>
      <label>
        <span>Reverse denoising step</span><output>{progress}%</output>
        <input type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
      </label>
      <p><strong>Learning pointer:</strong> this uses a fixed iid Gaussian field and the real forward equation <em>x<sub>t</sub> = √ᾱ x<sub>0</sub> + σ ε</em>. The clean scene is the known target, so the slider acts as an oracle denoiser. Stable Diffusion learns this denoising direction with a U-Net or diffusion transformer in VAE latent space.</p>
    </div>
  );
}

function DiffusionPage() {
  return (
    <Article
      eyebrow="Foundations · 03"
      title="Latent diffusion learns a reverse path."
      lead="Training corrupts encoded images with known noise. Generation starts from independent Gaussian noise and repeatedly predicts how to move towards a plausible latent."
    >
      <Section id="components" number="01" title="Keep the components separate">
        <div className="component-strip">
          <div><span>1</span><b>VAE encoder</b><p>pixels x → latent z<sub>0</sub></p></div>
          <div><span>2</span><b>Noise predictor</b><p>z<sub>t</sub>, t, conditioning → noise estimate</p></div>
          <div><span>3</span><b>Text encoder</b><p>prompt → conditioning tokens c</p></div>
          <div><span>4</span><b>Sampler</b><p>turns predictions into z<sub>t-1</sub></p></div>
          <div><span>5</span><b>VAE decoder</b><p>latent z<sub>0</sub> → pixels x̂</p></div>
        </div>
        <p>Earlier Stable Diffusion systems use a U-Net as the noise predictor. Newer systems can use a diffusion transformer. The architecture can change while the forward-noise and reverse-generation concepts remain.</p>
      </Section>

      <Section id="training" number="02" title="Training: image to latent to noisy latent">
        <Pipeline steps={[
          { label: "1", title: "Encode a training image", text: "The VAE encoder maps pixels x to a lower-dimensional latent z₀." },
          { label: "2", title: "Choose a time step", text: "Sample t and construct zₜ by mixing z₀ with known iid Gaussian noise ε." },
          { label: "3", title: "Encode the text", text: "A transformer-based text encoder maps the caption or prompt to conditioning c." },
          { label: "4", title: "Predict the added noise", text: "The U-Net or diffusion transformer receives zₜ, t and c, then predicts ε or an equivalent parameterisation." },
          { label: "5", title: "Optimise the error", text: "The loss compares the prediction with the known target used to create zₜ." },
        ]} />
        <Equation>
          <span>z<sub>t</sub> = √ᾱ<sub>t</sub> z<sub>0</sub> + √(1 - ᾱ<sub>t</sub>) ε, &nbsp; ε ∼ N(0, I)</span>
          <small>closed-form forward noising for a selected time step</small>
        </Equation>
        <p>iid means each noise entry is independently sampled from the same distribution. At sufficiently large t, the latent approaches a standard Gaussian under the modelling assumptions.</p>
      </Section>

      <Section id="generation" number="03" title="Generation: Gaussian latent to image">
        <DenoiseLab />
        <Pipeline steps={[
          { label: "T", title: "Sample the starting latent", text: "Draw zT from an iid standard Gaussian. Latent watermark methods modify or select this draw." },
          { label: "T−1", title: "Predict and step", text: "Use the noise predictor, time embedding and text conditioning to estimate a cleaner latent." },
          { label: "…", title: "Repeat", text: "The sampler applies a sequence of reverse updates. Guidance can strengthen prompt conditioning." },
          { label: "0", title: "Decode once", text: "After the final latent is obtained, the VAE decoder maps it back to image pixels." },
        ]} />
        <Callout label="No reference image">
          Ordinary text-to-image generation does not begin with a cover image. It begins with noise. Therefore in-generation fidelity is about preserving the intended output distribution, prompt alignment and sample diversity, not minimising pixel distance to one canonical unwatermarked image.
        </Callout>
      </Section>

      <Section id="locations" number="04" title="Five embedding locations">
        <Table
          headings={["Location", "Advantage", "Main liability"]}
          rows={[
            ["Model weights", "Every generated image can be marked automatically.", "Fine-tuning cost and possible model-performance change."],
            ["Text conditioning", "Can control which object or prompt element receives a mark.", "Prompt manipulation and learned-token dependence."],
            ["Initial noise zT", "Training-free insertion and direct key control are possible.", "Detection often needs approximate inversion."],
            ["Intermediate state zt", "Can place strong evidence where the trajectory still has flexibility.", "Requires trajectory access and may add optimisation."],
            ["VAE latent or features", "Compact, multi-scale representations can carry larger payloads.", "Often needs trained modules tied to the autoencoder."],
          ]}
        />
      </Section>

      <Section id="inversion" number="05" title="Inversion is an estimator, not a rewind button">
        <p>Many latent methods verify an image by estimating the latent that could have generated it. DDIM inversion runs a deterministic-style reverse mapping under a chosen model, scheduler, prompt and numerical configuration. Reconstruction error arises because the real generation path may be unknown and the image may have been edited.</p>
        <Equation>
          <span>x′<sub>w</sub> → VAE encoder → ẑ<sub>0</sub> → inverse trajectory → ẑ<sub>T</sub></span>
          <small>the hat marks an estimate, not the exact original latent</small>
        </Equation>
        <p>A robust detector therefore needs a watermark representation whose decision survives structured inversion error. It should also report what model access and prompt knowledge verification assumes.</p>
        <div className="sources">
          <strong>Foundational reading</strong>
          <ExternalLink href="https://arxiv.org/abs/2112.10752">Latent Diffusion Models</ExternalLink>
          <ExternalLink href="https://arxiv.org/abs/2006.11239">Denoising Diffusion Probabilistic Models</ExternalLink>
          <ExternalLink href="https://arxiv.org/abs/2010.02502">Denoising Diffusion Implicit Models</ExternalLink>
        </div>
      </Section>
      <NextPage path="/foundations/frequency" label="Next: image frequency" />
    </Article>
  );
}

function FrequencyLab() {
  const [frequency, setFrequency] = useState(8);
  const period = Math.max(3, 42 - frequency * 1.8);
  return (
    <div className="lab frequency-lab">
      <div className="lab-head"><span>Spatial frequency</span><b>{frequency < 8 ? "low" : frequency < 16 ? "mid" : "high"}</b></div>
      <div className="frequency-sample" style={{ backgroundSize: `${period}px ${period}px` }} aria-label={`Stripe pattern with frequency setting ${frequency}`} />
      <label>
        <span>Cycles across space</span><output>{frequency}</output>
        <input type="range" min="1" max="22" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} />
      </label>
      <p><strong>Learning pointer:</strong> raising frequency makes intensity change more often across distance. Compression and resizing tend to suppress fine changes first, while strong low-frequency changes are more likely to alter visible structure.</p>
    </div>
  );
}

function FrequencyPage() {
  return (
    <Article
      eyebrow="Foundations · 04"
      title="Frequency describes change across space."
      lead="The frequency domain reorganises an image into patterns of spatial variation. It helps explain invisibility, compression, geometric attacks and Fourier watermark design."
    >
      <Section id="spatial" number="01" title="High and low spatial frequency">
        <FrequencyLab />
        <ConceptGrid items={[
          { title: "Low frequency", text: "Slow variation across the image, such as broad illumination, colour regions and large shapes." },
          { title: "High frequency", text: "Rapid variation across nearby pixels, such as edges, fine texture, sensor noise and compression artefacts." },
        ]} />
        <p>Time signals are measured in cycles per second, or hertz, because their independent variable is time. Digital image frequency is normally expressed in cycles per pixel, cycles per image, or normalised frequency. It is only expressed in hertz if a physical sampling process with a time rate has been defined.</p>
      </Section>

      <Section id="transform" number="02" title="Spatial domain to frequency domain">
        <div className="domain-pair">
          <div><span>Spatial domain</span><div className="pixel-grid" /><p>Each coordinate stores intensity or colour.</p></div>
          <b>DFT →</b>
          <div><span>Frequency domain</span><div className="spectrum" /><p>Each coordinate stores a sinusoidal component with amplitude and phase.</p></div>
        </div>
        <p>The two-dimensional discrete Fourier transform represents an image as horizontal and vertical spatial frequencies. The centre often displays low frequencies after a visualisation shift, while distance from the centre corresponds to higher frequency magnitude.</p>
        <Equation>
          <span>F(u, v) = Σ<sub>x</sub> Σ<sub>y</sub> f(x, y)e<sup>-i2π(ux/M + vy/N)</sup></span>
          <small>each coefficient measures a spatial sinusoid, not an object category</small>
        </Equation>
      </Section>

      <Section id="tradeoff" number="03" title="Why frequency creates a trade-off">
        <Table
          headings={["Band", "Potential advantage", "Typical failure"]}
          rows={[
            ["Very low", "Survives compression and modest resizing.", "Can create visible colour, brightness or shape change."],
            ["Mid", "Can balance visibility and persistence.", "Still vulnerable to geometric misalignment and reconstruction."],
            ["Very high", "Small changes can be hard to see in textured areas.", "JPEG, blur, resize and denoising remove or alter the signal."],
          ]}
        />
        <p>No frequency band is universally robust. Rotation changes Fourier orientation, scaling changes radial position, translation changes phase, and cropping convolves the spectrum with the crop window. Ring patterns are useful because rotation preserves radius in an idealised setting, not because rings are immune to all geometric processing.</p>
      </Section>

      <Section id="integrity" number="04" title="Hermitian symmetry and real images">
        <p>The Fourier transform of a real-valued spatial signal has conjugate symmetry. If a watermark edits only one side of the spectrum without its conjugate partner, the inverse transform can become complex or require discarding an imaginary component. SFWMark makes this integrity condition explicit.</p>
        <Equation>
          <span>F(-u, -v) = F(u, v)<sup>*</sup></span>
          <small>conjugate symmetry for a real-valued spatial signal</small>
        </Equation>
      </Section>

      <Section id="semantic" number="05" title="Frequency is not semantics">
        <p>A low-frequency component can influence broad structure, but it does not encode the concept “dog” by itself. Semantic watermarking binds evidence to meaning using a semantic representation, a prompt controller, an object region or a model feature. The semantic representation can still be transported through frequency-domain or latent signals, but the terms describe different design axes.</p>
        <Callout label="Useful separation" tone="plain">
          Ask two independent questions: what does the key represent, and in which numerical representation is it embedded? A semantic key can be embedded through a Fourier pattern. A Fourier pattern can also carry a content-agnostic owner ID.
        </Callout>
      </Section>
      <NextPage path="/foundations/evaluation" label="Next: evaluation" />
    </Article>
  );
}

function ThresholdLab() {
  const [threshold, setThreshold] = useState(68);
  const falseAccept = Math.max(0.01, 12 * Math.exp(-threshold / 16));
  const detection = Math.max(0, Math.min(100, 99 - Math.max(0, threshold - 48) * 0.78));
  return (
    <div className="lab threshold-lab">
      <div className="lab-head"><span>Decision threshold</span><b>operating point</b></div>
      <div className="score-track">
        <div className="null-scores"><span>unmarked scores</span></div>
        <div className="marked-scores"><span>marked scores</span></div>
        <i style={{ left: `${threshold}%` }}><span>τ</span></i>
      </div>
      <label>
        <span>Acceptance threshold τ</span><output>{threshold}</output>
        <input type="range" min="20" max="92" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
      </label>
      <div className="lab-stats">
        <div><small>illustrative false accept</small><b>{falseAccept.toFixed(2)}%</b></div>
        <div><small>illustrative detection</small><b>{detection.toFixed(1)}%</b></div>
      </div>
      <p><strong>Learning pointer:</strong> these values are illustrative, not paper results. Raising a threshold generally reduces false positives and also rejects more damaged watermarks. A method has no single accuracy independent of its threshold.</p>
    </div>
  );
}

function EvaluationPage() {
  return (
    <Article
      eyebrow="Foundations · 05"
      title="Five criteria, one operating point."
      lead="Fidelity, robustness, security, payload and computation interact. Reporting one without the others hides the actual design choice."
    >
      <Section id="criteria" number="01" title="The five criteria">
        <ConceptGrid items={[
          { tag: "01", title: "Fidelity", text: "Preserve the intended image, distribution, prompt alignment and diversity." },
          { tag: "02", title: "Robustness", text: "Recover evidence after specified benign or hostile transformations." },
          { tag: "03", title: "Security", text: "Resist detection, removal, forgery, key recovery and false attribution under a stated adversary." },
          { tag: "04", title: "Payload", text: "Recover useful message bits at a stated whole-message error rate." },
          { tag: "05", title: "Complexity", text: "Account for training, generation overhead, inversion, memory, key search and calibration." },
        ]} />
      </Section>

      <Section id="fidelity" number="02" title="Fidelity needs more than one metric">
        <Table
          headings={["Measure", "What it asks", "What it misses"]}
          rows={[
            ["PSNR", "How large is paired pixel error?", "Perceptual importance and unpaired generative quality."],
            ["SSIM", "Are local luminance, contrast and structure similar?", "Semantic correctness and subtle patterned artefacts."],
            ["LPIPS", "Are deep perceptual features similar for a pair?", "Population diversity and security."],
            ["FID", "Are generated feature distributions close to a reference set?", "Paired prompt details and reliable results at small sample sizes."],
            ["CLIP score", "Does the image align with text in a joint embedding?", "Fine visual fidelity and watermark visibility."],
            ["Human study", "Can people see or prefer a difference under a protocol?", "Statistical detectability and conditions outside the protocol."],
          ]}
        />
        <p>For a latent sampler, compare distributions and prompt-conditional diversity. For a learned image embedder with a natural paired cover, include paired metrics. Do not use a distribution metric as a substitute for a paired one or vice versa.</p>
      </Section>

      <Section id="robustness" number="03" title="Robustness is an attack curve">
        <p>Report performance across attack intensity, not only a chosen point. Include clean performance, individual attacks, realistic compositions and at least one attack not used for training or parameter selection.</p>
        <Equation>
          <span>R(A, s, τ) = P[D(A<sub>s</sub>(x<sub>w</sub>)) accepts | marked]</span>
          <small>robustness depends on attack A, strength s and threshold τ</small>
        </Equation>
        <p>For multi-bit methods, publish bit-error rate and whole-message success. A 99 per cent bit accuracy over a 256-bit message does not imply that 99 per cent of messages are exactly correct.</p>
      </Section>

      <Section id="threshold" number="04" title="Security starts with the null distribution">
        <ThresholdLab />
        <p>A detector threshold must be chosen from scores on unmarked data. At internet scale, even a small false-positive rate can produce many incorrect ownership claims. Confidence intervals matter when the requested rate is lower than the reciprocal of the number of negative samples tested.</p>
        <ConceptGrid items={[
          { title: "Removal", text: "Make a marked image fail verification while preserving useful content." },
          { title: "Forgery", text: "Make an unmarked or altered image pass verification." },
          { title: "Detection", text: "Decide whether a sample comes from the marked distribution without knowing the key." },
          { title: "Key recovery", text: "Infer secret structure from code, queries or many marked outputs." },
        ]} />
      </Section>

      <Section id="payload" number="05" title="Payload and capacity">
        <p>Raw payload is the number of message bits before redundancy. Effective payload subtracts error-correction, repetition, signatures, nonces and protocol metadata. Capacity is meaningful only with a target error probability, attack channel and false-positive rule.</p>
        <Equation>
          <span>useful rate = application bits / total embedded symbols</span>
          <small>coding improves reliability by spending symbols</small>
        </Equation>
      </Section>

      <Section id="cost" number="06" title="Computational complexity">
        <Table
          headings={["Stage", "Costs to report"]}
          rows={[
            ["Preparation", "Training hours, data, trainable parameters and model-specific calibration."],
            ["Embedding", "Extra sampler steps, latent transforms, optimisation iterations and cryptographic operations."],
            ["Detection", "Image encoder passes, full diffusion inversions, decoder calls and key comparisons."],
            ["Operation", "Key storage, revocation, detector updates, audit logs and threshold recalibration."],
          ]}
        />
        <Callout label="A fair latency comparison">
          Measure on the same hardware, image size, model, precision and batch size. Count inversion steps separately from a single neural detector pass.
        </Callout>
      </Section>
      <NextPage path="/papers" label="Next: paper studies" />
    </Article>
  );
}

function PapersPage() {
  const [boundary, setBoundary] = useState<"All" | TrainingBoundary>("All");
  const filtered = papers.filter((paper) => boundary === "All" || paper.boundary === boundary);
  return (
    <Article
      eyebrow="Literature guide"
      title="Read the methods as arguments, not entries in a catalogue."
      lead="Start with the field-level differences, then open a paper study for the mechanism, mathematics, detector assumptions, evidence and unresolved failure modes."
      meta="The reading path includes neural watermarking foundations, generator-integrated methods, initial-noise methods, model ownership, semantic binding and adversarial counter-evidence."
    >
      <div className="filter-bar" aria-label="Filter papers by training boundary">
        {(["All", "No method-specific training", "Auxiliary training", "Base model fine-tuning", "Conditioning fine-tuning", "Per-image optimisation"] as const).map((value) => (
          <button key={value} className={boundary === value ? "active" : ""} onClick={() => setBoundary(value)}>{value}</button>
        ))}
      </div>
      {studyCategories.map((category) => {
        const group = filtered.filter((paper) => studyContent[paper.slug]?.category === category);
        if (!group.length) return null;
        return (
          <Section id={category.toLowerCase().replaceAll(" ", "-")} title={category} key={category}>
            <div className="study-index">
              {group.map((paper) => (
                <Link to={`/papers/${paper.slug}`} className="study-row" key={paper.slug}>
                  <div className="study-row-meta">
                    <span>{paper.venue} · {paper.year}</span>
                    <BoundaryBadge value={paper.boundary} />
                  </div>
                  <div>
                    <h3>{paper.shortTitle}</h3>
                    <p>{paper.oneLine}</p>
                  </div>
                  <b>Study the paper →</b>
                </Link>
              ))}
            </div>
          </Section>
        );
      })}
      <Section id="further-reading" title="Further reading that completes specific concepts">
        <p>These works are not given full studies yet, but each answers a precise question missing from the main reading path.</p>
        <div className="further-reading">
          {additionalReading.map((item) => (
            <a href={item.url} target="_blank" rel="noreferrer" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
              <b>Open primary source ↗</b>
            </a>
          ))}
        </div>
      </Section>
      <NextPage path="/research/gaps" label="Next: threats and gaps" />
    </Article>
  );
}

function PaperPage({ paper }: { paper: Paper }) {
  const currentIndex = papers.findIndex((item) => item.slug === paper.slug);
  const next = papers[(currentIndex + 1) % papers.length];
  const study = studyContent[paper.slug];
  if (!study) return <NotFoundPage />;
  return (
    <Article
      eyebrow={`${study.category} · ${paper.venue} ${paper.year}`}
      title={paper.shortTitle}
      lead={paper.oneLine}
      meta={paper.title}
    >
      <div className="study-meta">
        <p><span>Authors</span>{paper.authors}</p>
        <p><span>Training boundary</span><BoundaryBadge value={paper.boundary} /></p>
        <p><span>Sources</span><ExternalLink href={paper.paperUrl}>Paper</ExternalLink>{paper.codeUrl && <> · <ExternalLink href={paper.codeUrl}>Code</ExternalLink></>}</p>
      </div>

      <Section id="argument" number="01" title="The argument">
        <p>{paper.problem}</p>
        <p className="thesis">{study.thesis}</p>
        <div className="orientation-lines">
          <div><span>What changes</span><p>{study.intervention}</p></div>
          <div><span>What stays fixed</span><p>{study.fixedPoint}</p></div>
          <div><span>Verification depends on</span><p>{study.verificationAssumption}</p></div>
        </div>
        <p className="boundary-note"><strong>{paper.boundary}:</strong> {paper.boundaryDetail}</p>
      </Section>

      <Section id="information-path" number="02" title="The information path">
        <ol className="reading-trace">
          {paper.mechanism.map((text, index) => (
            <li key={text}><span>{String(index + 1).padStart(2, "0")}</span><p>{text}</p></li>
          ))}
        </ol>
        <p><strong>Verification:</strong> {paper.detection}</p>
      </Section>

      {study.sections.map((item, index) => (
        <Section
          id={`deep-reading-${index + 1}`}
          number={String(index + 3).padStart(2, "0")}
          title={item.title}
          key={item.title}
        >
          {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {item.equation && <Equation><span>{item.equation.expression}</span><small>{item.equation.note}</small></Equation>}
          {item.bullets && <ul className="check-list">{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
          {item.takeaway && <p className="takeaway"><strong>Reading conclusion:</strong> {item.takeaway}</p>}
        </Section>
      ))}

      <Section id="evidence" title="How to judge the evidence">
        <p>{study.judgement}</p>
        <div className="evidence-reading">
          <div>
            <h3>Claims to locate in the paper</h3>
            <ul>{paper.contributions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>Boundaries to test</h3>
            <ul>{paper.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </Section>

      <Section id="connections" title="Place it beside neighbouring work">
        <ul className="connection-list">{study.connections.map((item) => <li key={item}>{item}</li>)}</ul>
      </Section>

      <Section id="questions" title="Questions to carry into a close reading">
        <ol className="study-questions">{paper.studyQuestions.map((item) => <li key={item}>{item}</li>)}</ol>
      </Section>

      <p className="source-line">This study interprets the public primary paper and official implementation. Use the linked paper for experimental tables, theorem assumptions and exact configurations.</p>
      <NextPage path={`/papers/${next.slug}`} label={`Next paper: ${next.shortTitle}`} />
    </Article>
  );
}

function GapsPage() {
  return (
    <Article
      eyebrow="Research gaps"
      title="Eight gaps that recur across the literature"
      lead="These are recurring measurement and deployment weaknesses, separated from the private ideation work that follows from them."
    >
      <Section id="gaps" number="01" title="Eight gaps that recur across the literature">
        <div className="gap-list">
          <div><b>01</b><h3>Composed attack channels</h3><p>Most evaluations sweep one attack at a time. Real images are cropped, resized, compressed and then regenerated. The order matters and errors are not independent.</p></div>
          <div><b>02</b><h3>Open-set multi-key calibration</h3><p>Top-one key accuracy assumes the true key is registered. Deployment must also reject real images, outputs from other models and unregistered keys while the database grows.</p></div>
          <div><b>03</b><h3>Correlated inversion error</h3><p>Several coding methods treat recovered latent errors as independent or Gaussian. Denoising trajectories can create channel, spatial and frequency correlations that invalidate those decoders.</p></div>
          <div><b>04</b><h3>Security against forgery</h3><p>Removal robustness does not stop an attacker from transplanting, synthesising or eliciting watermark evidence. Public verification needs explicit anti-forgery reasoning.</p></div>
          <div><b>05</b><h3>Cross-architecture transfer</h3><p>Results across Stable Diffusion 1.x and 2.x do not establish transfer to diffusion transformers, different VAEs, distilled samplers or proprietary reconstruction systems.</p></div>
          <div><b>06</b><h3>Useful capacity</h3><p>Raw bit counts hide repetition, error correction, signatures and message failures. Protocol-level payload should be reported with exact-message recovery.</p></div>
          <div><b>07</b><h3>Semantic continuity</h3><p>Ownership can survive an edit while content integrity fails. Methods need rules for whether crop, inpainting, object replacement and style transfer should retain, update or invalidate evidence.</p></div>
          <div><b>08</b><h3>Full-system cost</h3><p>Training-free embedding can still require costly inversion, key search or per-image optimisation. End-to-end latency and energy are rarely compared under matched hardware.</p></div>
        </div>
      </Section>

      <NextPage path="/glossary" label="Next: glossary" />
    </Article>
  );
}

function Gaps2Page() {
  return (
    <Article
      eyebrow="Research ideation"
      title="A measurement programme for a short paper"
      lead="This working space turns the recurring gaps into one testable direction. It is kept separate from the literature summary so readers can distinguish evidence from proposal."
    >

      <Section id="candidate" number="02" title="A focused, thesis-quality short-paper direction">
        <div className="research-proposal">
          <p className="eyebrow">Candidate programme</p>
          <h3>Correlation-aware decoding under composed edits</h3>
          <p><strong>Research question:</strong> Can a training-free latent watermark decoder improve exact-message recovery and calibrated false-positive control by modelling the structured covariance of inversion errors after realistic attack sequences?</p>
          <div className="proposal-grid">
            <div><span>Hypothesis</span><p>Recovered latent errors are correlated across channels and frequencies. A decoder that estimates this covariance should outperform coordinate-wise hard decisions at equal false-positive rate.</p></div>
            <div><span>Minimal contribution</span><p>An empirical error model, a correlation-aware decoder and a reproducible benchmark of ordered attack compositions.</p></div>
            <div><span>Baselines</span><p>Tree-Rings or RingID for pattern detection; Gaussian Shading for hard bit mapping; Gaussian Shannon or PRC for coded recovery where compatible.</p></div>
            <div><span>Falsification</span><p>The idea fails if covariance estimates do not transfer across prompts, models and attacks, or if a simple soft scalar decoder matches performance.</p></div>
          </div>
        </div>
      </Section>

      <Section id="experiment" number="03" title="A compact experimental design">
        <Pipeline steps={[
          { label: "1", title: "Measure the channel", text: "Generate paired marked samples and record recovered initial latents under clean, single and ordered composed attacks." },
          { label: "2", title: "Test the assumption", text: "Quantify channel, spatial and frequency covariance. Compare Gaussian, heavy-tailed and mixture residual models." },
          { label: "3", title: "Build the smallest decoder", text: "Start with whitening plus soft likelihoods. Add complexity only when held-out evidence justifies it." },
          { label: "4", title: "Calibrate on negatives", text: "Set thresholds using generated unmarked images, real photographs and outputs from unrelated generators." },
          { label: "5", title: "Evaluate transfer", text: "Hold out prompts, attack compositions, sampler settings and at least one model architecture." },
        ]} />
        <Table
          headings={["Claim", "Required evidence"]}
          rows={[
            ["Better robustness", "Attack curves and exact-message recovery at matched false-positive rates."],
            ["Better modelling", "Held-out likelihood or calibration, plus covariance visualisation and goodness-of-fit tests."],
            ["Generalisation", "Unseen prompt, attack order, scheduler and model results."],
            ["Practicality", "Detection latency, memory and any calibration-set cost."],
            ["No fidelity loss", "State only if embedding is unchanged; otherwise provide distribution and prompt-alignment evaluation."],
          ]}
        />
      </Section>

      <Section id="threat" number="04" title="Threat model to state before experiments">
        <ul className="check-list">
          <li>The attacker knows the algorithm and model family but not the secret key.</li>
          <li>The attacker may collect marked and unmarked outputs and make a bounded number of detector queries.</li>
          <li>The attacker wants to remove evidence or cause false attribution while retaining semantic utility.</li>
          <li>The verifier may know the generator and key, but should not assume access to the original image.</li>
          <li>Public-key and secret-key verification are evaluated as different deployment settings.</li>
        </ul>
        <div className="sources">
          <strong>Adjacent security reading</strong>
          <ExternalLink href="https://openaccess.thecvf.com/content/CVPR2025/papers/Muller_Black-Box_Forgery_Attacks_on_Semantic_Watermarks_for_Diffusion_Models_CVPR_2025_paper.pdf">Black-Box Forgery Attacks on Semantic Watermarks</ExternalLink>
          <ExternalLink href="https://openaccess.thecvf.com/content/CVPR2025/papers/An_Decoder_Gradient_Shield_Provable_and_High-Fidelity_Prevention_of_Gradient-Based_Box-Free_CVPR_2025_paper.pdf">Decoder Gradient Shield</ExternalLink>
        </div>
      </Section>

      <Section id="avoid" number="05" title="Claims to avoid">
        <div className="avoid-list">
          <p><del>Robust against all attacks.</del><br />Robust under the specified attack families and intensity range.</p>
          <p><del>Provably secure.</del><br />Secure under the theorem's stated adversary, oracle and randomness assumptions.</p>
          <p><del>No quality loss.</del><br />No detected loss under the named distribution, paired and prompt-alignment tests.</p>
          <p><del>Works across models.</del><br />Evaluated on the named architectures, with all model-specific calibration disclosed.</p>
        </div>
      </Section>
      <NextPage path="/glossary" label="Next: glossary" />
    </Article>
  );
}

function GlossaryPage() {
  const [query, setQuery] = useState("");
  const terms = glossary.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <Article
      eyebrow="Reference"
      title="Glossary"
      lead="Short definitions for terms used throughout the guide. Search by mechanism, metric or security concept."
    >
      <label className="search-box">
        <span>Search terms</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try inversion, capacity, open-set…" />
      </label>
      <dl className="glossary">
        {terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
      </dl>
      {!terms.length && <p className="empty">No matching term. Try a broader word.</p>}
      <NextPage path="/" label="Return to start" />
    </Article>
  );
}

function NotFoundPage() {
  return (
    <Article eyebrow="404" title="Chapter not found." lead="The route does not match a current chapter or paper study.">
      <Link to="/" className="button primary">Return to start</Link>
    </Article>
  );
}

function NextPage({ path, label }: { path: string; label: string }) {
  return <Link to={path} className="next-page"><span>Continue reading</span><b>{label} →</b></Link>;
}

function App() {
  const route = useHashRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const page = useMemo(() => {
    if (route === "/") return <HomePage />;
    if (route === "/reading") return <ReadingPage />;
    if (route === "/foundations/watermarking") return <WatermarkingPage />;
    if (route === "/foundations/networks") return <NetworksPage />;
    if (route === "/foundations/diffusion") return <DiffusionPage />;
    if (route === "/foundations/frequency") return <FrequencyPage />;
    if (route === "/foundations/evaluation") return <EvaluationPage />;
    if (route === "/papers") return <PapersPage />;
    if (route === "/research/gaps") return <GapsPage />;
    if (route === "/research/gaps2") return <Gaps2Page />;
    if (route === "/glossary") return <GlossaryPage />;
    if (route.startsWith("/papers/")) {
      const paper = paperBySlug.get(route.slice("/papers/".length));
      return paper ? <PaperPage paper={paper} /> : <NotFoundPage />;
    }
    return <NotFoundPage />;
  }, [route]);

  useEffect(() => {
    setMenuOpen(false);
    document.title = route === "/" ? "Latent Watermarking 101" : `${route.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ")} | Latent Watermarking 101`;
  }, [route]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand"><span>LW</span><b>Latent Watermarking 101</b></Link>
        <p>Technical field guide</p>
        <button className="menu-button" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>Contents</button>
        <a href="https://github.com/holsoma/latent-watermarking-101" target="_blank" rel="noreferrer" className="github-link">GitHub ↗</a>
      </header>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`} aria-label="Guide chapters">
        {navGroups.map((group) => (
          <nav key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => (
              <Link key={item.path} to={item.path} className={route === item.path ? "active" : ""} onClick={() => setMenuOpen(false)}>{item.label}</Link>
            ))}
          </nav>
        ))}
        <nav>
          <p>Paper studies</p>
          {papers.map((paper) => (
            <Link key={paper.slug} to={`/papers/${paper.slug}`} className={route === `/papers/${paper.slug}` ? "active" : ""} onClick={() => setMenuOpen(false)}>{paper.shortTitle}</Link>
          ))}
        </nav>
      </aside>
      {menuOpen && <button className="menu-scrim" aria-label="Close contents" onClick={() => setMenuOpen(false)} />}
      <main>{page}</main>
      <footer>
        <p>Latent Watermarking 101 · A public, source-backed learning project</p>
        <p>Last reviewed July 2026 · <a href="https://github.com/holsoma/latent-watermarking-101">Contribute on GitHub</a></p>
      </footer>
    </div>
  );
}

export default App;
