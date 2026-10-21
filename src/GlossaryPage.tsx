import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { glossaryById, glossaryCategories, glossaryTerms, searchGlossary, type GlossaryCategory } from './glossary';
import { useRouteReadiness } from './useRouteReadiness';

export const glossaryPageSize = 24;

function routeTerm() {
  const [path, params] = window.location.hash.slice(1).split('?');
  const target = new URLSearchParams(params).get('section');
  return path === '/glossary' && target && glossaryById.has(target) ? target : null;
}

export function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GlossaryCategory | 'All topics'>('All topics');
  const [page, setPage] = useState(() => Math.max(0, Math.floor(searchGlossary('').findIndex(term => term.id === routeTerm()) / glossaryPageSize)));
  const [pendingTerm, setPendingTerm] = useState<string | null>(routeTerm);
  const topPagination = useRef<HTMLElement | null>(null);
  const paginationFocus = useRef<{ button: HTMLButtonElement; scrollTarget?: HTMLElement } | null>(null);
  const filtered = useMemo(() => searchGlossary(query, category), [query, category]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / glossaryPageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = useMemo(() => filtered.slice(currentPage * glossaryPageSize, (currentPage + 1) * glossaryPageSize), [filtered, currentPage]);
  const letterStarts = filtered.filter((term, index) => index === 0 || term.term[0].toLocaleUpperCase('en-GB') !== filtered[index - 1].term[0].toLocaleUpperCase('en-GB'));
  const resetPage = () => { setPage(0); setPendingTerm(null); paginationFocus.current = null; };
  const clearFilters = () => { setQuery(''); setCategory('All topics'); resetPage(); };
  const revealTerm = useCallback((id: string) => {
    if (!glossaryById.has(id)) return;
    let matches = filtered;
    if (!matches.some(term => term.id === id)) {
      setQuery('');
      setCategory('All topics');
      matches = searchGlossary('');
    }
    paginationFocus.current = null;
    setPage(Math.floor(matches.findIndex(term => term.id === id) / glossaryPageSize));
    setPendingTerm(id);
  }, [filtered]);

  useRouteReadiness('/glossary');

  useEffect(() => {
    if (!pendingTerm) return;
    const target = document.getElementById(pendingTerm);
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView();
      setPendingTerm(null);
    }
  }, [pendingTerm, visible]);

  useEffect(() => {
    const destination = paginationFocus.current;
    destination?.button.focus({ preventScroll: true });
    destination?.scrollTarget?.scrollIntoView({ block: 'start' });
    paginationFocus.current = null;
  }, [page]);

  useEffect(() => {
    const revealLinkedTerm = () => {
      const target = routeTerm();
      if (target) revealTerm(target);
    };
    window.addEventListener('hashchange', revealLinkedTerm);
    return () => window.removeEventListener('hashchange', revealLinkedTerm);
  }, [revealTerm]);

  const changePage = (nextPage: number, event: MouseEvent<HTMLButtonElement>) => {
    const origin = event.currentTarget.closest('nav');
    const fromEnd = origin !== topPagination.current;
    const nav = fromEnd ? topPagination.current : origin;
    const direction = nextPage === 0 ? 'next' : nextPage === totalPages - 1 ? 'previous' : event.currentTarget.dataset.direction;
    const button = nav?.querySelector<HTMLButtonElement>(`button[data-direction="${direction}"]`);
    paginationFocus.current = button ? { button, scrollTarget: fromEnd ? nav ?? undefined : undefined } : null;
    setPendingTerm(null);
    setPage(nextPage);
  };
  const pageNavigation = (atEnd = false) => <nav ref={atEnd ? undefined : topPagination} className="glossary-pagination" aria-label={atEnd ? 'Glossary pages, end of terms' : 'Glossary pages'}>
    <button type="button" data-direction="previous" disabled={currentPage === 0} onClick={event => changePage(currentPage - 1, event)}>Previous terms</button>
    <p className="glossary-page-info">Page {currentPage + 1} of {totalPages}</p>
    <button type="button" data-direction="next" disabled={currentPage === totalPages - 1} onClick={event => changePage(currentPage + 1, event)}>Next terms</button>
  </nav>;

  return <article className="article glossary-page">
    <header className="article-header">
      <p className="eyebrow">Technical reference</p>
      <h1>Glossary</h1>
      <p className="lead">{glossaryTerms.length} definitions for diffusion, watermarking and reliable evaluation.</p>
      <p className="article-meta">Worked examples, related concepts and links to the studies.</p>
    </header>
    <div className="glossary-controls" role="search" aria-label="Glossary search">
      <label className="search-box">Search terms<input type="search" value={query} onChange={event => { setQuery(event.target.value); resetPage(); }} placeholder="Try BER, Gaussianity or forgery" /></label>
      <label>Topic<select value={category} onChange={event => { setCategory(event.target.value as GlossaryCategory | 'All topics'); resetPage(); }}><option>All topics</option>{glossaryCategories.map(topic => <option key={topic}>{topic}</option>)}</select></label>
      {(query || category !== 'All topics') && <button type="button" onClick={clearFilters}>Clear filters</button>}
    </div>
    <p className="result-count" role="status">{filtered.length ? `Showing ${currentPage * glossaryPageSize + 1} to ${currentPage * glossaryPageSize + visible.length} of ${filtered.length} terms${filtered.length !== glossaryTerms.length ? ` (${glossaryTerms.length} total)` : ''}` : `0 of ${glossaryTerms.length} terms`} · alphabetical order</p>
    {!!filtered.length && <nav className="glossary-alphabet" aria-label="Jump to letter">{letterStarts.map(term => <a key={term.id} onClick={() => revealTerm(term.id)} href={`#/glossary?section=${term.id}`} aria-label={`Jump to ${term.term[0].toLocaleUpperCase('en-GB')}`}>{term.term[0].toLocaleUpperCase('en-GB')}</a>)}</nav>}
    {!!filtered.length && totalPages > 1 && pageNavigation()}
    {!!filtered.length && <dl className="glossary-list">{visible.map(term => <div className="glossary-entry" id={term.id} tabIndex={-1} key={term.id}>
      <dt><a className="section-link" onClick={() => revealTerm(term.id)} href={`#/glossary?section=${term.id}`}>{term.term}<span aria-hidden="true"> ↗</span></a></dt>
      <dd>
        <p className="glossary-category">{term.category}</p>
        {!!term.aliases.length && <p className="glossary-aliases"><span>Related search terms:</span> {term.aliases.join(', ')}</p>}
        <p>{term.definition}</p>
        <p className="glossary-importance"><strong>Why it matters:</strong> {term.whyItMatters}</p>
        {term.example && <details className="glossary-example"><summary>Worked example</summary><p>{term.example}</p></details>}
        <nav className="glossary-related" aria-label={`Related to ${term.term}`}><span>Connect:</span> {term.related.map(id => <a key={id} onClick={() => revealTerm(id)} href={`#/glossary?section=${id}`}>{glossaryById.get(id)?.term ?? id}</a>)}</nav>
        <p className="glossary-study-links">Read in context: {term.links.map((link, index) => <span key={link.to}>{index > 0 && ' · '}<a href={`#${link.to}`}>{link.label}</a></span>)}</p>
      </dd>
    </div>)}</dl>}
    {!!filtered.length && totalPages > 1 && pageNavigation(true)}
    {!filtered.length && <div className="empty glossary-empty"><h2>No matching terms</h2><p>Try a shorter term, an abbreviation such as DDIM, or another topic.</p></div>}
  </article>;
}
