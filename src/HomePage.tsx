import { useState } from 'react';
import { paperCatalog } from './paperCatalog.generated';

const keyPositions = [20, 42, 67, 94, 137, 175, 208, 236];
function sampleNoise() {
  let state = 2749;
  const uniform = () => { state = (1664525 * state + 1013904223) >>> 0; return (state + 1) / 4294967297; };
  return Array.from({ length: 256 }, () => Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform()));
}
const noise = sampleNoise();
// Batch the unchanged background coordinates into paths to keep first paint light.
const backgroundPaths = (() => {
  const groups = new Map<string, { fill: string; opacity: number; path: string }>();
  noise.forEach((value, index) => {
    if (keyPositions.includes(index)) return;
    const x = 11 + (index % 16) * 22;
    const y = 11 + Math.floor(index / 16) * 22;
    const radius = Math.min(3.5, .8 + Math.abs(value) * 1.2);
    const fill = value >= 0 ? '#e4eceb' : '#657376';
    const opacity = Math.round((.28 + Math.min(Math.abs(value) / 3, .65)) * 10) / 10;
    const key = `${fill}:${opacity}`;
    const group = groups.get(key) ?? { fill, opacity, path: '' };
    group.path += `M${x - radius} ${y}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
    groups.set(key, group);
  });
  return [...groups.values()];
})();
export function embedSigns(bits: string) {
  return noise.map((value, index) => {
    const position = keyPositions.indexOf(index);
    return position < 0 ? value : Math.abs(value) * (bits[position] === '1' ? 1 : -1);
  });
}
export function recoverSigns(values: number[]) {
  return keyPositions.map(position => values[position] >= 0 ? '1' : '0').join('');
}

function SignalSample() {
  const [bits, setBits] = useState('10110010');
  const [revealed, setRevealed] = useState(false);
  const values = embedSigns(bits);
  const changed = values.filter((value, index) => value !== noise[index]).length;
  const decoded = recoverSigns(values);
  return <figure className={`signal-sample ${revealed ? 'is-revealed' : ''}`}>
    <div className="sample-heading"><span>Initial latent</span><span>16 × 16 coordinates</span></div>
    <svg className="sample-field" data-values={JSON.stringify(values)} viewBox="0 0 352 352" role="img" aria-labelledby="sample-title sample-description">
      <title id="sample-title">A synthetic noise field with eight encoded bits</title>
      <desc id="sample-description">Selected coordinates store one bit in their sign. Reveal highlights those positions. The remaining coordinates are fixed.</desc>
      {backgroundPaths.map((group, index) => <path key={index} d={group.path} fill={group.fill} opacity={group.opacity} />)}
      {keyPositions.map(index => {
        const value = values[index];
        const x = 11 + (index % 16) * 22;
        const y = 11 + Math.floor(index / 16) * 22;
        return <g key={index} className="sample-coordinate selected">
          <rect className="coordinate-key" x={x - 9} y={y - 9} width="18" height="18" rx="3" />
          <circle cx={x} cy={y} r={Math.min(3.5, .8 + Math.abs(value) * 1.2)} opacity={.28 + Math.min(Math.abs(value) / 3, .65)} fill={value >= 0 ? '#e4eceb' : '#657376'} />
          <text className="coordinate-bit" x={x} y={y + 3.7} textAnchor="middle">{value >= 0 ? '1' : '0'}</text>
        </g>;
      })}
    </svg>
    <div className="sample-message"><span>Message <small>Change a bit</small></span><div className="bit-controls">{bits.split('').map((bit, index) => <button key={index} aria-label={`Bit ${index + 1}: ${bit}. Change to ${bit === '1' ? '0' : '1'}`} onClick={() => setBits(bits.slice(0, index) + (bit === '1' ? '0' : '1') + bits.slice(index + 1))}>{bit}</button>)}</div></div>
    <button className="sample-reveal" aria-pressed={revealed} onClick={() => setRevealed(!revealed)}><span>{revealed ? 'Hide the coordinate key' : 'Reveal the signal'}</span><span aria-hidden="true">{revealed ? '−' : '+'}</span></button>
    <div className="sample-readout" aria-live="polite"><span>Read from selected signs</span><output aria-label="Recovered example bits">{revealed ? decoded : '········'}</output></div>
    <figcaption>{changed} of 256 coordinates changed sign. This teaching example reads signs directly; it includes no diffusion or attack. <a href="#/revision?section=bit-error-rate">Study message recovery</a></figcaption>
  </figure>;
}

const readingPath = [
  { title: 'Build the foundations', to: '/foundations/watermarking', text: 'Follow the message from embedding through the image channel to a detector.', meta: 'Watermarking, diffusion, frequency' },
  { title: 'Read a mechanism', to: '/papers', text: 'Locate the inserted information, the fixed components and the evidence used to recover it.', meta: '33 source-linked paper studies' },
  { title: 'Test your reasoning', to: '/revision', text: 'Work through the mathematics, then explain where an assumption or a recovery step can fail.', meta: 'Worked examples and self-checks' },
];
const selectedStudies = ['tree-rings', 'gaussian-shading', 'stable-signature', 'law'];

export function HomePage() {
  return <article className="article home-page">
    <header className="home-hero">
      <div className="hero-copy"><p className="home-kicker"><span className="signal-dot" aria-hidden="true" /> A research handbook for applied AI</p><h1 aria-label="A signal inside the noise.">A signal <br />inside the <br /><span>noise.</span></h1><p className="hero-description">Understand how images carry hidden information. Follow the mathematics, read the methods and examine the evidence.</p><div className="hero-actions"><a className="button primary" href="#/foundations/watermarking">Start reading <span aria-hidden="true">↗</span></a><a className="text-action" href="#/papers">Browse the studies <span aria-hidden="true">↗</span></a></div><dl className="hero-facts"><div><dt>Paper studies</dt><dd>{paperCatalog.length}</dd></div><div><dt>CPU exercises</dt><dd>24</dd></div><div><dt>Reading level</dt><dd>Applied AI</dd></div></dl></div>
      <SignalSample />
    </header>
    <section id="reading-path" className="home-reading-path"><div className="home-section-heading"><h2>Follow the information.</h2><p>Begin with the system. Then question the claim.</p></div><ol>{readingPath.map((step, index) => <li key={step.to}><a href={`#${step.to}`}><span className="path-step">Step {index + 1}<span aria-hidden="true">↗</span></span><h3>{step.title}</h3><p>{step.text}</p><small>{step.meta}</small></a></li>)}</ol></section>
    <section id="selected-studies" className="home-study-section"><div className="home-section-heading"><div><p className="home-kicker">Different places to write a mark</p><h2>One question.<br />Several mechanisms.</h2></div><a className="text-action" href="#/papers">All paper studies <span aria-hidden="true">↗</span></a></div><div className="selected-study-list">{selectedStudies.map(slug => { const study = paperCatalog.find(entry => entry.slug === slug)!; return <a key={slug} href={`#/papers/${slug}`}><div><h3>{study.shortTitle}</h3><p>{study.insertion}</p></div><span>{study.year}</span><span className="study-arrow" aria-hidden="true">↗</span></a>; })}</div><p className="section-footnote">Compare insertion points and assumptions. Reported robustness depends on each paper’s experimental conditions.</p></section>
    <section id="reference" className="home-reference"><div><p className="home-kicker">Keep the definitions close</p><h2>Read with<br />a reference.</h2></div><div><p>Inversion, payload, false positives, pseudorandomness. Find the definition, see why it matters and return to the relevant study.</p><a className="button secondary" href="#/glossary">Open the glossary <span aria-hidden="true">↗</span></a></div></section>
  </article>;
}
