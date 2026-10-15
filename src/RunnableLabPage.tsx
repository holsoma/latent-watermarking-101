import { useState } from "react";
import type { Paper } from "./content";
import type { PaperLab } from "./labs";
import { PaperCodeMap } from "./PaperCodeMap";

function CopyButton({ value }: { value: string }) {
  const [state, setState] = useState('Copy');
  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value); setState('Copied');
    } catch { setState('Copy failed: select the command'); }
  }
  return <button className="copy-button" aria-live="polite" onClick={copy}>{state}</button>;
}

export function RunnableLabPage({ paper, lab, next }: { paper: Paper; lab: PaperLab; next: Paper }) {
  return <article className="article lab-article">
    <header className="article-header">
      <p className="eyebrow">CPU teaching exercise · {paper.venue} {paper.year}</p>
      <h1>{paper.shortTitle}</h1>
      <p className="lead">Run a bounded CPU exercise, inspect the generated files and compare its operations with the paper. Successful execution does not establish published robustness.</p>
      <p className="article-meta">{paper.title}</p>
    </header>
    <p className="lab-link"><a href={`#/papers/${paper.slug}`}>← Read the technical study</a></p>
    <section className="lab-status-bar"><div><span>Demonstration type</span><strong>{lab.labKind?.replaceAll("-", " ") ?? "Teaching exercise"}</strong></div><div><span>Verification</span><strong>{lab.verificationStatus ?? "Not verified"}</strong></div><div><span>Status</span><strong>{lab.status}</strong></div><div><span>Training boundary</span><strong>{paper.boundary}</strong></div><div><span>Runtime</span><strong>{lab.runtime}</strong><p>{lab.runtimeStatus}</p></div></section><aside className="worked-example"><h2>What this exercise implements</h2><p>{lab.verificationScope}</p><p>{lab.resultKind}</p></aside>
    <section className="article-section" id="generation-process"><p className="section-number">01</p><h2>Paper mechanism for comparison</h2><p>These stages describe the paper. The exercise scope above identifies which operations the local code actually performs.</p><p>{paper.problem}</p><ol className="implementation-flow">{paper.mechanism.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>Stage {index + 1}</strong><p>{step}</p></div></li>)}</ol></section>
    <section className="article-section" id="run"><p className="section-number">02</p><h2>Run the CPU exercise</h2><p>{lab.training}</p><div className="command-stack">{lab.commands.map((item) => <div className="command-card" key={item.label}><div className="command-card-head"><h3>{item.label}</h3><CopyButton value={item.command} /></div><pre><code>{item.command}</code></pre><p><strong>Purpose:</strong> {item.purpose}</p><details><summary>How to read the output</summary><p>{item.interpretation}</p>{item.output && <pre className="example-output"><code>{item.output}</code></pre>}</details></div>)}</div></section>
    {lab.visuals.length > 0 && <section className="article-section" id="outputs"><p className="section-number">03</p><h2>Outputs from the recorded run</h2><div className="output-gallery">{lab.visuals.map((visual) => <figure key={visual.src}><img src={visual.src} alt={visual.label} /><figcaption><strong>{visual.label}</strong><span>{visual.description}</span>{visual.evidenceUrl && <a href={visual.evidenceUrl} target="_blank" rel="noreferrer">Run configuration and measured results ↗</a>}</figcaption></figure>)}</div></section>}
    <section className="article-section" id="methodology"><p className="section-number">04</p><h2>Ideation and methodology</h2><div className="methodology-list">{lab.methodology.map((step) => <div key={step.title}><span>{step.title}</span><h3>{step.question}</h3><p>{step.method}</p><small>Evidence: {step.evidence}</small></div>)}</div></section>
    <section className="article-section" id="paper-to-code"><p className="section-number">05</p><h2>Paper to code map</h2><p><a href={paper.paperUrl} target="_blank" rel="noreferrer">Read the primary paper ↗</a> for the method claim, then use the upstream links below to inspect the implementation file by file.</p><PaperCodeMap rows={lab.codeMap} /></section>
    <section className="article-section" id="decisions"><p className="section-number">06</p><h2>Design decisions</h2><div className="decision-table">{lab.decisions.map((item) => <div className="decision-row" key={item.decision}><strong>{item.decision}</strong><p>{item.rationale}</p><p><b>Consequence:</b> {item.consequence}</p></div>)}</div></section>
    <section className="article-section" id="limits"><p className="section-number">07</p><h2>What this run does not prove</h2><ul className="check-list">{lab.limitations.map((item) => <li key={item}>{item}</li>)}</ul><div className="upstream-list">{lab.upstream.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.label} ↗</span><strong>{source.url.replace("https://github.com/", "")}</strong><p>{source.note}</p></a>)}</div></section>
    <a href={`#/papers/${next.slug}`} className="next-page"><span>Continue reading</span><b>Next: {next.shortTitle} →</b></a>
  </article>;
}
