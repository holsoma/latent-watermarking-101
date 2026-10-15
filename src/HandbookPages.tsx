import { lazy, Suspense, useState } from 'react';
import 'katex/dist/katex.min.css';
import { handbookEntries } from './handbook';
import { mathExamples, revisionQuestions, oralQuestions } from './revision';
import type { HandbookEntry, HandbookSection, RevisionQuestion, SourceRef } from './handbookTypes';

const MathFormula = lazy(() => import('./MathFormula'));

export function HandbookBlock({ section, path, sources = [] }: { section: HandbookSection; path: string; sources?: SourceRef[] }) {
  return <section className="article-section" id={section.id} tabIndex={-1}>
    <h2><a className="section-link" href={`#${path}?section=${section.id}`}>{section.title}<span aria-hidden="true"> #</span></a></h2>
    {section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    {section.equation && <figure className="equation-block">
      {section.equation.format === 'latex' ? <Suspense fallback={<p className="equation" role="status">Loading equation…</p>}><MathFormula expression={section.equation.expression} /></Suspense> : <pre className="equation">{section.equation.expression}</pre>}
      <figcaption>{section.equation.note}</figcaption>
    </figure>}
    {section.bullets && <ul>{section.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>}
    {section.workedExample && <aside className="worked-example"><h3>{section.workedExample.title}</h3><ol>{section.workedExample.steps.map((s, i) => <li key={i}>{s}</li>)}</ol><p><strong>What this establishes:</strong> {section.workedExample.conclusion}</p></aside>}
    {!!section.sources.length && <p className="source-notes">Sources: {section.sources.map((s, i) => <a key={s} href={`#${path}?section=source-${s}`}>{i > 0 ? ' · ' : ''}{sources.find(source => source.id === s)?.title ?? 'Study guide'}</a>)}</p>}
  </section>;
}

export function HandbookStudy({ entry }: { entry: HandbookEntry }) {
  const path = `/papers/${entry.slug}`;
  return <article className="article handbook-study">
    <header className="article-header"><p className="eyebrow">{entry.kind} · {entry.year}</p><h1>{entry.shortTitle}</h1><p className="lead">{entry.summary}</p><p className="article-meta">{entry.title}<br />{entry.authors} · {entry.venue}</p></header>
    <dl className="study-facts"><div><dt>Insertion location</dt><dd>{entry.insertion}</dd></div><div><dt>Training requirement</dt><dd>{entry.training}</dd></div><div><dt>Method family</dt><dd>{entry.family}</dd></div></dl>
    <nav className="prerequisites" aria-label="Prerequisites"><strong>Before reading</strong>{entry.prerequisites.map(p => <a key={p.to} href={`#${p.to}`}>{p.label}</a>)}</nav>
    {entry.labSlug && <p className="lab-link"><a href={`#/papers/${entry.labSlug}/lab`}>Open the CPU teaching exercise →</a><br /><small>The exercise states what it implements and what it cannot establish.</small></p>}
    {entry.sections.map(section => <HandbookBlock key={section.id} section={section} path={path} sources={entry.sources} />)}
    <section className="article-section" id="self-check" tabIndex={-1}><h2>Check your understanding</h2>{entry.selfChecks.map((s, i) => <details key={i}><summary>{s.question}</summary><p>{s.answer}</p></details>)}</section>
    <section className="article-section" id="sources" tabIndex={-1}><h2>Sources and evidence</h2><ol className="reference-list">{entry.sources.map(s => <li key={s.id} id={`source-${s.id}`} tabIndex={-1}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a> : <strong>{s.title}</strong>}<p>{s.locator} <span className="source-basis">{s.basis.replaceAll('-', ' ')}</span></p></li>)}</ol></section>
    {!!entry.related.length && <section className="article-section" id="related" tabIndex={-1}><h2>Compare with</h2><ul>{entry.related.map(slug => <li key={slug}><a href={`#/papers/${slug}`}>{handbookEntries.find(e => e.slug === slug)?.shortTitle ?? slug}</a></li>)}</ul></section>}
  </article>;
}

export function HandbookIndex() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('All');
  const [insertion, setInsertion] = useState('All');
  const [training, setTraining] = useState('All');
  const filtered = handbookEntries.filter(e => (kind === 'All' || e.kind === kind) && (insertion === 'All' || e.insertion === insertion) && (training === 'All' || e.training === training) && JSON.stringify(e).toLowerCase().includes(query.toLowerCase()));
  return <article className="article"><header className="article-header"><p className="eyebrow">Literature reference</p><h1>Paper studies</h1><p className="lead">Read the mechanism, follow its evidence and identify where its claims stop. Search across the complete study text.</p></header>
    <div className="index-controls"><label className="search-box">Search studies<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try inversion, forgery or Gaussian…" /></label><div className="filter-grid">{([{label:'Paper type', value:kind, setter:setKind, options:handbookEntries.map(e => e.kind)}, {label:'Insertion location', value:insertion, setter:setInsertion, options:handbookEntries.map(e => e.insertion)}, {label:'Training requirement', value:training, setter:setTraining, options:handbookEntries.map(e => e.training)}]).map(f => <label key={f.label}>{f.label}<select value={f.value} onChange={e => f.setter(e.target.value)}>{['All', ...new Set(f.options)].map(o => <option key={o}>{o}</option>)}</select></label>)}</div></div>
    <p className="result-count" role="status">{filtered.length} of {handbookEntries.length} studies</p>
    <div className="study-index">{filtered.map(e => <a className="study-row" key={e.slug} href={`#/papers/${e.slug}`}><div className="study-row-meta"><span>{e.kind}</span><span>{e.year} · {e.venue}</span></div><h2>{e.shortTitle}<span aria-hidden="true"> ↗</span></h2><p>{e.summary}</p><small>{e.insertion} · {e.training}</small></a>)}</div>
    {!filtered.length && <div className="empty"><p>No studies match these filters.</p><button onClick={() => {setQuery(''); setKind('All'); setInsertion('All'); setTraining('All');}}>Clear all filters</button></div>}
    <section className="article-section" id="comparison"><h2>Compare the method boundaries</h2><p>These describe operations, not a ranking of robustness. See each study for experimental conditions and limitations.</p><div className="table-wrap" tabIndex={0}><table><thead><tr><th>Study</th><th>Insertion</th><th>Training</th></tr></thead><tbody>{filtered.map(e => <tr key={e.slug}><th><a href={`#/papers/${e.slug}`}>{e.shortTitle}</a></th><td>{e.insertion}</td><td>{e.training}</td></tr>)}</tbody></table></div></section>
  </article>;
}

function QuestionList({ questions }: { questions: RevisionQuestion[] }) {
  return <div className="revision-list">{questions.map(q => <details key={q.id} id={q.id} tabIndex={-1}><summary><span className="question-number">{q.number.toString().padStart(2, '0')}</span>{q.question}</summary><p>{q.answer}</p><p className="source-notes">{q.topic} · {q.sourceLocator} · <a href={`#/revision?section=${q.id}`}>Link to question</a></p></details>)}</div>;
}

export function RevisionPage() {
  const topics = [...new Set(revisionQuestions.map(q => q.topic))];
  return <article className="article"><header className="article-header"><p className="eyebrow">Study guide</p><h1>Work through the reasoning</h1><p className="lead">{mathExamples.length} mathematical examples, {revisionQuestions.length} conceptual questions and {oralQuestions.length} oral questions. Attempt each answer before opening the explanation.</p></header>
    {mathExamples.map(s => <HandbookBlock key={s.id} section={s} path="/revision" />)}
    <section className="article-section" id="conceptual" tabIndex={-1}><h2>Conceptual questions</h2><nav className="revision-topics" aria-label="Question topics">{topics.map((topic, i) => <a key={topic} href={`#/revision?section=topic-${i + 1}`}>{topic}</a>)}</nav></section>
    {topics.map((topic, i) => <section className="article-section" id={`topic-${i + 1}`} key={topic} tabIndex={-1}><h2>{topic}</h2><QuestionList questions={revisionQuestions.filter(q => q.topic === topic)} /></section>)}
    <section className="article-section" id="oral" tabIndex={-1}><h2>Oral questions</h2><p>Explain the mechanism aloud, then compare your reasoning with the answer.</p><QuestionList questions={oralQuestions} /></section>
    <section className="article-section" id="sources" tabIndex={-1}><h2>Source basis</h2><p id="source-study-guide" tabIndex={-1}>Supplied latent diffusion watermarking study guide, mathematical explanations and conceptual and oral questions. Worked numerical examples explain the assumptions used in each calculation. The supplied document determines the learning sequence; each paper study links to the evidence for its specific method.</p></section>
  </article>;
}

