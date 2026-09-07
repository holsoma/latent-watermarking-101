import type { Paper } from "./content";
import type { PaperLab } from "./labs";
import { PaperCodeMap } from "./PaperCodeMap";

export function PlannedLabPage({ paper, next, lab }: { paper: Paper; next: Paper; lab?: PaperLab }) {
  return (
    <article className="article lab-article">
      <header className="article-header">
        <p className="eyebrow">Implementation plan · {paper.venue} {paper.year}</p>
        <h1>{paper.shortTitle}</h1>
        <p className="lead">This paper is queued for a runnable implementation lab. The page records the build surface and the evidence required before it is marked reproducible.</p>
        <p className="article-meta">{paper.title}</p>
      </header>

      <section className="lab-status-bar" aria-label="Implementation status">
        <div><span>Status</span><strong>{lab?.status ?? "Implementation planned"}</strong></div>
        <div><span>Training boundary</span><strong>{paper.boundary}</strong></div>
        <div><span>Build constraint</span><strong>{paper.boundaryDetail}</strong></div>
      </section>

      <section className="article-section" id="build-surface">
        <p className="section-number">01</p><h2>Build surface</h2>
        <p>The implementation will expose each stage of the paper's information path as a module, configuration, or evaluation command.</p>
        <ol className="implementation-flow planned-flow">
          {paper.mechanism.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>Stage {index + 1}</strong><p>{step}</p></div></li>)}
        </ol>
      </section>

      <section className="article-section" id="sources">
        <p className="section-number">02</p><h2>Sources to inspect</h2>
        <div className="upstream-list">
          <a href={paper.paperUrl} target="_blank" rel="noreferrer"><span>Primary paper ↗</span><strong>{paper.shortTitle}</strong><p>Use the paper for equations, training settings, evaluation protocol, and threat-model assumptions.</p></a>
          {paper.codeUrl ? <a href={paper.codeUrl} target="_blank" rel="noreferrer"><span>Implementation ↗</span><strong>{paper.codeUrl.replace("https://github.com/", "")}</strong><p>Trace the public implementation and record any mismatch with the paper before adapting it.</p></a> : <div className="upstream-placeholder"><span>Implementation</span><strong>No public code link recorded yet</strong><p>Add an official or author-provided repository before starting reproduction work.</p></div>}
        </div>
      </section>

      <section className="article-section" id="paper-to-code">
        <p className="section-number">03</p><h2>Paper to code map</h2>
        <p>Record the method claim, source implementation path, local module, and known deviation before coding.</p>
        {lab?.codeMap?.length ? <PaperCodeMap rows={lab.codeMap} /> : <div className="code-map-empty"><p>No local code map exists yet. Start with the primary paper and public implementation above.</p></div>}
      </section>

      <section className="article-section" id="evidence-contract">
        <p className="section-number">04</p><h2>Evidence contract</h2>
        <div className="code-map">
          <div className="code-map-row evidence-row"><div><span>Claim</span><strong>What the method improves</strong></div><div><span>Required result</span><p>Matched baseline, attack, payload, operating point, and fidelity measurement.</p></div></div>
          <div className="code-map-row evidence-row"><div><span>Generalisation</span><strong>Where it should transfer</strong></div><div><span>Required result</span><p>Held-out prompts or images, attack compositions, and an explicitly named model or decoder.</p></div></div>
          <div className="code-map-row evidence-row"><div><span>Security</span><strong>What an attacker can do</strong></div><div><span>Required result</span><p>Removal, forgery, open-set false positives, and the access assumptions for each test.</p></div></div>
        </div>
        <div className="callout plain"><strong>Current paper notes</strong><div><ul>{paper.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
      </section>

      <a href={`#/papers/${next.slug}`} className="next-page"><span>Continue through the labs</span><b>Next: {next.shortTitle} →</b></a>
    </article>
  );
}
