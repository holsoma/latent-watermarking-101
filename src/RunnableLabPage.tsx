import type { Paper } from "./content";
import type { PaperLab } from "./labs";

function CopyButton({ value }: { value: string }) {
  return <button className="copy-button" onClick={() => navigator.clipboard?.writeText(value)}>Copy</button>;
}

export function RunnableLabPage({ paper, lab, next }: { paper: Paper; lab: PaperLab; next: Paper }) {
  return <article className="article lab-article">
    <header className="article-header">
      <p className="eyebrow">Runnable implementation lab · {paper.venue} {paper.year}</p>
      <h1>{paper.shortTitle}</h1>
      <p className="lead">Follow the paper's information path, inspect the upstream implementation, and run a small local experiment with its limits visible.</p>
      <p className="article-meta">{paper.title}</p>
    </header>
    <section className="lab-status-bar"><div><span>Status</span><strong>{lab.status}</strong></div><div><span>Training boundary</span><strong>{paper.boundary}</strong></div><div><span>Runtime</span><strong>{lab.runtime}</strong></div></section>
    <section className="article-section" id="generation-process"><p className="section-number">01</p><h2>Generation process</h2><p>{paper.problem}</p><ol className="implementation-flow">{paper.mechanism.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>Stage {index + 1}</strong><p>{step}</p></div></li>)}</ol></section>
    <section className="article-section" id="run"><p className="section-number">02</p><h2>Run it in Git Bash</h2><p>{lab.training}</p><div className="command-stack">{lab.commands.map((item) => <div className="command-card" key={item.label}><div className="command-card-head"><h3>{item.label}</h3><CopyButton value={item.command} /></div><pre><code>{item.command}</code></pre><p><strong>Purpose:</strong> {item.purpose}</p><details><summary>How to read the output</summary><p>{item.interpretation}</p><pre className="example-output"><code>{item.output}</code></pre></details></div>)}</div></section>
    <section className="article-section" id="outputs"><p className="section-number">03</p><h2>Outputs from the recorded run</h2><div className="output-gallery">{lab.visuals.map((visual) => <figure key={visual.src}><img src={visual.src} alt={visual.label} /><figcaption><strong>{visual.label}</strong><span>{visual.description}</span></figcaption></figure>)}</div></section>
    <section className="article-section" id="methodology"><p className="section-number">04</p><h2>Ideation and methodology</h2><div className="methodology-list">{lab.methodology.map((step) => <div key={step.title}><span>{step.title}</span><h3>{step.question}</h3><p>{step.method}</p><small>Evidence: {step.evidence}</small></div>)}</div></section>
    <section className="article-section" id="paper-to-code"><p className="section-number">05</p><h2>Paper to code map</h2><p><a href={paper.paperUrl} target="_blank" rel="noreferrer">Read the primary paper ↗</a> for the method claim, then use the upstream links below to inspect the implementation file by file.</p><div className="code-map">{lab.codeMap.map((row) => <div className="code-map-row" key={row.concept}><div><span>{row.concept}</span><strong>{row.paper}</strong></div><div><span>Upstream</span><a href={row.upstreamUrl} target="_blank" rel="noreferrer">{row.upstream} ↗</a><p><strong>Local:</strong> {row.local}. {row.note}</p></div></div>)}</div></section>
    <section className="article-section" id="decisions"><p className="section-number">06</p><h2>Design decisions</h2><div className="decision-table">{lab.decisions.map((item) => <div className="decision-row" key={item.decision}><strong>{item.decision}</strong><p>{item.rationale}</p><p><b>Consequence:</b> {item.consequence}</p></div>)}</div></section>
    <section className="article-section" id="limits"><p className="section-number">07</p><h2>What this run does not prove</h2><ul className="check-list">{lab.limitations.map((item) => <li key={item}>{item}</li>)}</ul><div className="upstream-list">{lab.upstream.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.label} ↗</span><strong>{source.url.replace("https://github.com/", "")}</strong><p>{source.note}</p></a>)}</div></section>
    <a href={`#/papers/${next.slug}`} className="next-page"><span>Continue through the labs</span><b>Next: {next.shortTitle} →</b></a>
  </article>;
}
