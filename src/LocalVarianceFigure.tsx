const sigma = .1;
const examples = [1, 2].map(radius => ({ radius, variance: sigma ** 2 / radius ** 2 }));

export function LocalVarianceFigure() {
  return <figure className="local-variance-figure">
    <div className="variance-comparison">
      {examples.map(({ radius, variance }, index) => <svg key={radius} viewBox="0 0 250 170" role="img" aria-label={`Pair norm ${radius}. Local angular variance approximately ${variance.toFixed(4)} radians squared.`}>
        <circle className="variance-orbit" cx="52" cy="58" r={radius * 22} />
        <line className="variance-radius" x1="52" y1="58" x2={52 + radius * 22} y2="58" />
        <circle className="variance-point" cx={52 + radius * 22} cy="58" r="3" />
        <text x="115" y="49">ρ = {radius}</text>
        <text className="variance-number" x="115" y="74">{variance.toFixed(4).replace(/0+$/, '')} rad²</text>
        <rect className="variance-track" x="8" y="124" width="234" height="5" rx="2.5" />
        <rect className="variance-bar" x="8" y="124" width={234 * variance / examples[0].variance} height="5" rx="2.5" />
        <text className="variance-caption" x="8" y="159">{index === 0 ? 'Reference variance' : 'One quarter of the variance'}</text>
      </svg>)}
    </div>
    <figcaption>Computed from σ² / ρ² with σ = {sigma}. This is a local angular approximation; it assumes a small perturbation relative to the pair norm.</figcaption>
  </figure>;
}
