/** Only explicit insertion locations are mapped; other mechanisms retain their prose description. */
export function insertionStage(insertion: string) {
  const location = insertion.toLowerCase();
  if (location.startsWith('initial noise')) return 0;
  if (location === 'denoiser weights' || location === 'intermediate diffusion state') return 1;
  if (location.startsWith('vae decoder')) return 2;
  if (location === 'rgb pixels' || location === 'rgb model output') return 3;
  return null;
}

export function InsertionFlow({ insertion }: { insertion: string }) {
  const selected = insertionStage(insertion);
  if (selected === null) return null;
  const stages = ['Initial noise', 'Denoising', 'Image decoder', 'Pixels'];
  return <figure className="insertion-flow">
    <figcaption><span>Locate the inserted information</span><strong>{insertion}</strong></figcaption>
    <ol aria-label={`Conceptual generation path. Watermark insertion: ${insertion}`}>
      {stages.map((stage, index) => <li key={stage} className={selected === index ? 'is-insertion' : ''}>
        <span className="flow-symbol" aria-hidden="true">{Array.from({ length: 9 }, (_, dot) => <i key={dot} />)}</span>
        <span>{stage}</span>{selected === index && <small>Insertion</small>}
      </li>)}
    </ol>
    <p>A conceptual location in the pipeline. The method section specifies the changed variables and fixed components.</p>
  </figure>;
}
