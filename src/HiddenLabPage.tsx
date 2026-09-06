import { useState } from "react";
import type { Paper } from "./content";
import type { PaperLab } from "./labs";

function LabCommand({ label, command, output, purpose, interpretation }: PaperLab["commands"][number]) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="lab-command">
      <div className="lab-command-head"><span>{label}</span><button onClick={copy}>{copied ? "Copied" : "Copy"}</button></div>
      <span className="terminal-label">Git Bash</span>
      <pre><code>{command}</code></pre>
      <p>{purpose}</p>
      <span className="terminal-label output-label">Example output</span>
      <pre className="command-output"><code>{output}</code></pre>
      <p className="command-interpretation"><strong>How to read this:</strong> {interpretation}</p>
    </div>
  );
}

export function HiddenLabPage({ paper, lab }: { paper: Paper; lab: PaperLab }) {
  return (
    <article className="article lab-article">
      <header className="article-header">
        <p className="eyebrow">Implementation lab · {paper.venue} {paper.year}</p>
        <h1>{paper.shortTitle}</h1>
        <p className="lead">Train the encoder, distort the image, recover the message, and inspect exactly where this implementation follows or departs from the paper.</p>
        <p className="article-meta">{paper.title}</p>
      </header>

      <section className="lab-status-bar" aria-label="Implementation status">
        <div><span>Status</span><strong>{lab.status}</strong></div>
        <div><span>Runtime</span><strong>{lab.runtime}</strong></div>
        <div><span>Training</span><strong>{lab.training}</strong></div>
      </section>

      <section className="article-section" id="run-it">
        <p className="section-number">01</p><h2>Run it</h2>
        <p>Run these blocks in Git Bash on Windows. Start with the tiny-set learning demo. The 12-step smoke test is kept as an optional plumbing check because it is not trained long enough to recover a message.</p>
        <div className="command-list">{lab.commands.map((command) => <LabCommand key={command.label} {...command} />)}</div>
      </section>

      <section className="article-section" id="visual-output">
        <p className="section-number">02</p><h2>See the generated artefacts</h2>
        <p>These files are produced by the learning demo, copied into the site's public assets, and shown here as a visual check. If you retrain, copy your new <code>cover.png</code> and <code>encoded.png</code> into <code>public/experiments/hidden/</code> to replace them.</p>
        <div className="output-gallery">
          {lab.visuals.map((visual) => <figure key={visual.src}>
            <img src={visual.src} alt={visual.label} />
            <figcaption><strong>{visual.label}</strong><span>{visual.description}</span></figcaption>
          </figure>)}
        </div>
        <div className="callout warning"><strong>Read this correctly</strong><div><p>The images are evidence that the encoder emitted an artefact. Message accuracy still comes from the extraction and evaluation commands below. A smoke checkpoint can produce an image while failing to learn the payload.</p></div></div>
      </section>

      <section className="article-section" id="methodology">
        <p className="section-number">03</p><h2>From research question to implementation</h2>
        <p>The implementation starts by deciding what evidence would count, then works backwards to modules and tests. This prevents a runnable repository from being mistaken for a reproduced result.</p>
        <ol className="methodology-list">
          {lab.methodology.map((step, index) => <li key={step.title}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <div className="methodology-title"><span>Methodological step</span><strong>{step.title}</strong><p>{step.question}</p></div>
            <div><span>Method</span><p>{step.method}</p></div>
            <div><span>Evidence needed</span><p>{step.evidence}</p></div>
          </li>)}
        </ol>
      </section>

      <section className="article-section" id="decisions">
        <p className="section-number">04</p><h2>Decision log</h2>
        <p>These choices make the lab practical, but each choice changes what can be inferred from the result.</p>
        <div className="decision-table">
          <div className="decision-heading"><span>Decision</span><span>Reason</span><span>Consequence</span></div>
          {lab.decisions.map((item) => <div className="decision-row" key={item.decision}><strong>{item.decision}</strong><p>{item.rationale}</p><p>{item.consequence}</p></div>)}
        </div>
      </section>

      <section className="article-section" id="generation-pipeline">
        <p className="section-number">05</p><h2>The generation process</h2>
        <p>HiDDeN does not generate an image from text. It generates a watermarked version of an existing cover image. The message travels through the encoder and must survive the sampled channel.</p>
        <ol className="implementation-flow">
          <li><b>01</b><div><strong>Cover + message</strong><p>Load an image and a binary payload of the configured length.</p></div></li>
          <li><b>02</b><div><strong>Encoder</strong><p>Broadcast the message over the spatial grid and combine it with image features.</p></div></li>
          <li><b>03</b><div><strong>Encoded image</strong><p>Produce a visually similar image that carries the payload.</p></div></li>
          <li><b>04</b><div><strong>Distortion layer</strong><p>Apply identity, crop, blur, dropout, resize, or differentiable JPEG during training.</p></div></li>
          <li><b>05</b><div><strong>Decoder</strong><p>Predict the message from the received image without seeing the original cover.</p></div></li>
        </ol>
      </section>

      <section className="article-section" id="code-map">
        <p className="section-number">06</p><h2>Paper to code</h2>
        <p>The upstream links are evidence sources, not an assertion that either repository is a perfect reproduction. The local implementation keeps each stage inspectable and testable.</p>
        <div className="code-map">
          {lab.codeMap.map((row) => <div className="code-map-row" key={row.concept}>
            <div><span>Concept</span><strong>{row.concept}</strong></div>
            <div><span>Paper</span><p>{row.paper}</p></div>
            <div><span>Upstream path</span><a className="code-path" href={row.upstreamUrl} target="_blank" rel="noreferrer">{row.upstream} ↗</a></div>
            <div><span>Local path</span><code>{row.local}</code></div>
            <div><span>Reading note</span><p>{row.note}</p></div>
          </div>)}
        </div>
      </section>

      <section className="article-section" id="upstream">
        <p className="section-number">07</p><h2>Upstream implementations</h2>
        <div className="upstream-list">{lab.upstream.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.label}>
          <span>{source.label} ↗</span><strong>{source.url.replace("https://github.com/", "")}</strong><p>{source.note}</p>
        </a>)}</div>
      </section>

      <section className="article-section" id="reproduction-ladder">
        <p className="section-number">08</p><h2>Reproduction ladder</h2>
        <p>Do not jump from a smoke run to full COCO training. Each stage answers a different question and supplies the evidence needed for the next one.</p>
        <ol className="reproduction-ladder">
          <li><b>01</b><div><strong>Mechanical smoke test</strong><p>Does every module execute, save, reload and emit inspectable outputs?</p><span>Current status: complete</span></div></li>
          <li><b>02</b><div><strong>Tiny-set overfit</strong><p>Can the model reach exact recovery on a few fixed covers without distortion?</p><span>Pass gate: zero clean bit error</span></div></li>
          <li><b>03</b><div><strong>Single-channel training</strong><p>What does each crop, blur, dropout or JPEG proxy teach independently?</p><span>Pass gate: attack curves beat identity-only training</span></div></li>
          <li><b>04</b><div><strong>Real-operation validation</strong><p>Does robustness transfer from differentiable proxies to Pillow or codec operations?</p><span>Pass gate: report the proxy-to-real gap</span></div></li>
          <li><b>05</b><div><strong>Paper-matched reproduction</strong><p>Match dataset, payload, image size, schedule, metrics and baselines.</p><span>Pass gate: explain every remaining difference</span></div></li>
        </ol>
      </section>

      <section className="article-section" id="evidence">
        <p className="section-number">09</p><h2>What the results mean</h2>
        <p>Every run should record its configuration, random seed, checkpoint, distortion parameters, bit error rate, exact-message recovery, PSNR, and hardware. A low error on the smoke test is a pipeline check, not a paper-level result.</p>
        <div className="callout warning"><strong>Known limits</strong><div><ul>{lab.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
      </section>
    </article>
  );
}
