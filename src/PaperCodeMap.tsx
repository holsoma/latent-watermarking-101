import type { CodeMapRow } from "./labs";

const columns = ["Concept", "Paper claim", "Upstream path", "Local path", "Reading note"] as const;

export function PaperCodeMap({ rows }: { rows: CodeMapRow[] }) {
  return (
    <div className="code-map" role="table" aria-label="Paper to code map">
      <div className="code-map-header" role="row">
        {columns.map((column) => <span role="columnheader" key={column}>{column}</span>)}
      </div>
      {rows.map((row) => (
        <div className="code-map-row" role="row" key={row.concept}>
          <div role="cell" data-label="Concept"><strong>{row.concept}</strong></div>
          <div role="cell" data-label="Paper claim"><p>{row.paper}</p></div>
          <div role="cell" data-label="Upstream path"><a className="code-path" href={row.upstreamUrl} target="_blank" rel="noreferrer">{row.upstream} ↗</a></div>
          <div role="cell" data-label="Local path"><code>{row.local}</code></div>
          <div role="cell" data-label="Reading note"><p>{row.note}</p></div>
        </div>
      ))}
    </div>
  );
}
