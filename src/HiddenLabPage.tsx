import { useState } from "react";
import type { Paper } from "./content";
import type { PaperLab } from "./labs";

function LabCommand({ label, command, purpose }: PaperLab["commands"][number]) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="lab-command">
      <div className="lab-command-head"><span>{label}</span><button onClick={copy}>{copied ? "Copied" : "Copy"}</button></div>
      <pre><code>{command}</code></pre>
      <p>{purpose}</p>
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
        <p>This lab runs locally. The browser page documents and visualises the experiment; Python performs model training and inference.</p>
        <div className="command-list">{lab.commands.map((command) => <LabCommand key={command.label} {...command} />)}</div>
      </section>

      <section className="article-section" id="generation-pipeline">
        <p className="section-number">02</p><h2>The generation process</h2>
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
        <p className="section-number">03</p><h2>Paper to code</h2>
        <p>The upstream links are evidence sources, not an assertion that either repository is a perfect reproduction. The local implementation keeps each stage inspectable and testable.</p>
        <div className="code-map">
          {lab.codeMap.map((row) => <div className="code-map-row" key={row.concept}>
            <div><span>Concept</span><strong>{row.concept}</strong></div>
            <div><span>Paper</span><p>{row.paper}</p></div>
            <div><span>Upstream path</span><code>{row.upstream}</code></div>
            <div><span>Local path</span><code>{row.local}</code></div>
            <div><span>Reading note</span><p>{row.note}</p></div>
          </div>)}
        </div>
      </section>

      <section className="article-section" id="upstream">
        <p className="section-number">04</p><h2>Upstream implementations</h2>
        <div className="upstream-list">{lab.upstream.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.label}>
          <span>{source.label} ↗</span><strong>{source.url.replace("https://github.com/", "")}</strong><p>{source.note}</p>
        </a>)}</div>
      </section>

      <section className="article-section" id="evidence">
        <p className="section-number">05</p><h2>What the results mean</h2>
        <p>Every run should record its configuration, random seed, checkpoint, distortion parameters, bit error rate, exact-message recovery, PSNR, and hardware. A low error on the smoke test is a pipeline check, not a paper-level result.</p>
        <div className="callout warning"><strong>Known limits</strong><div><ul>{lab.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
      </section>
    </article>
  );
}
