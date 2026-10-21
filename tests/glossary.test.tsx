import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlossaryPage, glossaryPageSize } from '../src/GlossaryPage';
import { glossaryById, glossaryCategories, glossaryTerms, searchGlossary } from '../src/glossary';
import { handbookEntries } from '../src/handbook';
import { mathExamples } from '../src/revision';

beforeEach(() => window.history.replaceState(null, '', '/#/glossary'));

describe('glossary content contracts', () => {
  it('provides a substantial reference across every required field', () => {
    expect(glossaryTerms.length).toBeGreaterThanOrEqual(70);
    expect(glossaryTerms.length).toBeLessThanOrEqual(100);
    expect(new Set(glossaryTerms.map(term => term.id)).size).toBe(glossaryTerms.length);
    expect(new Set(glossaryTerms.map(term => term.term)).size).toBe(glossaryTerms.length);
    for (const category of glossaryCategories) expect(glossaryTerms.filter(term => term.category === category).length, category).toBeGreaterThanOrEqual(10);
    for (const term of glossaryTerms) {
      expect(term.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
      expect(term.definition.length, term.id).toBeGreaterThan(80);
      expect(term.whyItMatters.length, term.id).toBeGreaterThan(40);
      expect(term.links.length, term.id).toBeGreaterThan(0);
      expect(term.related.length, term.id).toBeGreaterThan(1);
      expect(JSON.stringify(term), term.id).not.toMatch(/[\u2013\u2014]/);
    }
  });

  it('resolves every related term and linked study or mathematical section', () => {
    for (const term of glossaryTerms) {
      for (const related of term.related) {
        expect(glossaryById.has(related), `${term.id} -> ${related}`).toBe(true);
        expect(related).not.toBe(term.id);
      }
      for (const link of term.links) {
        expect(link.to.startsWith('/'), `${term.id}: ${link.to}`).toBe(true);
        expect(link.to).not.toContain('#');
        if (link.to.startsWith('/papers/')) {
          expect(handbookEntries.some(entry => entry.slug === link.to.slice(8)), link.to).toBe(true);
        } else {
          const [path, params] = link.to.split('?');
          expect(path).toBe('/revision');
          expect(mathExamples.some(section => section.id === new URLSearchParams(params).get('section')), link.to).toBe(true);
        }
      }
    }
  });

  it('explains distinctions that commonly produce misleading watermark claims', () => {
    expect(glossaryById.get('detection')?.definition).toContain('without recovering a useful message');
    expect(glossaryById.get('decoding')?.definition).toContain('failure detection or rejection');
    expect(glossaryById.get('p-value')?.definition).toContain('not the probability that the null hypothesis is true');
    expect(glossaryById.get('marginal-distribution')?.whyItMatters).toContain('dependent');
    expect(glossaryById.get('repetition-code')?.whyItMatters).toContain('not the paper\'s cryptographic pseudorandom code');
    expect(glossaryById.get('digital-signature')?.whyItMatters).toContain('not encrypt');
    expect(glossaryById.get('robustness')?.whyItMatters).toContain('forgery');
    expect(glossaryById.get('security')?.definition).toContain('explicitly defined adversary');
    expect(glossaryById.get('message-recovery')?.example).toContain('7.63%');
    expect(glossaryById.get('chi-distribution')?.definition).toContain('Its square follows a chi-squared distribution');
  });

  it('finds aliases and multiple search words without changing the source records', () => {
    expect(searchGlossary('CFG').map(term => term.id)).toContain('classifier-free-guidance');
    expect(searchGlossary('reparameterization trick').map(term => term.id)).toEqual(['reparameterisation']);
    expect(searchGlossary('  NOISE   SCHEDULE  ').map(term => term.id)).toContain('noise-schedule');
    expect(searchGlossary('bit error', 'Coding and security').map(term => term.id)).toContain('bit-error-rate');
    expect(searchGlossary('Gaussianity', 'Attacks and robustness')).toHaveLength(0);
    expect(searchGlossary('  ').length).toBe(glossaryTerms.length);
  });
});

describe('glossary reading and navigation', () => {
  it('renders the first 24 definitions visibly with stable term permalinks', () => {
    const { container } = render(<GlossaryPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Glossary' })).toBeVisible();
    const definitions = container.querySelectorAll('dl.glossary-list > div > dd');
    expect(definitions).toHaveLength(glossaryPageSize);
    for (const term of searchGlossary('').slice(0, glossaryPageSize)) {
      const entry = document.getElementById(term.id)!;
      expect(entry).toHaveAttribute('tabindex', '-1');
      expect(entry.querySelector('dt > a')).toHaveAttribute('href', `#/glossary?section=${term.id}`);
      expect(entry.querySelector('dt > a')).toHaveTextContent(term.term);
      expect(entry.querySelector('dd')).toHaveTextContent(term.definition);
      expect(entry.querySelector('dd')).not.toHaveAttribute('hidden');
    }
    for (const index of [0, Math.floor(definitions.length / 2), definitions.length - 1]) expect(definitions[index]).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 to 24 of 98 terms');
  });

  it('allows every term to be read once through pagination without forcing heading focus', () => {
    const { container } = render(<GlossaryPage />);
    const navigation = screen.getByRole('navigation', { name: 'Glossary pages', exact: true });
    const next = within(navigation).getByRole('button', { name: 'Next terms' });
    const previous = within(navigation).getByRole('button', { name: 'Previous terms' });
    expect(previous).toBeDisabled();
    const seen: string[] = [];
    for (let page = 0; page < Math.ceil(glossaryTerms.length / glossaryPageSize); page += 1) {
      const entries = Array.from(container.querySelectorAll('.glossary-entry'));
      expect(entries.length).toBeLessThanOrEqual(glossaryPageSize);
      seen.push(...entries.map(entry => entry.id));
      expect(navigation).toHaveTextContent(`Page ${page + 1} of 5`);
      if (page < 4) { next.focus(); fireEvent.click(next); }
    }
    expect(seen).toEqual(searchGlossary('').map(term => term.id));
    expect(new Set(seen).size).toBe(glossaryTerms.length);
    expect(next).toBeDisabled();
    expect(previous).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 97 to 98 of 98 terms');
    fireEvent.click(previous);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 73 to 96 of 98 terms');
    expect(previous).toHaveFocus();
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveFocus();
  });

  it('returns bottom Next terms to the visible top control and scrolls the new page start into view', () => {
    render(<GlossaryPage />);
    const topNavigation = screen.getByRole('navigation', { name: 'Glossary pages', exact: true });
    const bottomNavigation = screen.getByRole('navigation', { name: 'Glossary pages, end of terms', exact: true });
    const topNext = within(topNavigation).getByRole('button', { name: 'Next terms' });
    const bottomNext = within(bottomNavigation).getByRole('button', { name: 'Next terms' });
    const scroll = vi.mocked(topNavigation.scrollIntoView);
    scroll.mockClear();
    bottomNext.focus();
    fireEvent.click(bottomNext);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 25 to 48 of 98 terms');
    expect(topNext).toHaveFocus();
    expect(bottomNext).not.toHaveFocus();
    expect(scroll).toHaveBeenLastCalledWith({ block: 'start' });
    expect(scroll.mock.contexts.at(-1)).toBe(topNavigation);
  });

  it('returns bottom Previous terms from the last page to the visible top control', () => {
    const last = searchGlossary('').at(-1)!;
    window.history.replaceState(null, '', `/#/glossary?section=${last.id}`);
    render(<GlossaryPage />);
    const topNavigation = screen.getByRole('navigation', { name: 'Glossary pages', exact: true });
    const bottomNavigation = screen.getByRole('navigation', { name: 'Glossary pages, end of terms', exact: true });
    const topPrevious = within(topNavigation).getByRole('button', { name: 'Previous terms' });
    const bottomPrevious = within(bottomNavigation).getByRole('button', { name: 'Previous terms' });
    const scroll = vi.mocked(topNavigation.scrollIntoView);
    scroll.mockClear();
    bottomPrevious.focus();
    fireEvent.click(bottomPrevious);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 73 to 96 of 98 terms');
    expect(topPrevious).toHaveFocus();
    expect(bottomPrevious).not.toHaveFocus();
    expect(scroll).toHaveBeenLastCalledWith({ block: 'start' });
    expect(scroll.mock.contexts.at(-1)).toBe(topNavigation);
  });

  it('retains top-origin pagination focus without scrolling away from its control', () => {
    render(<GlossaryPage />);
    const topNavigation = screen.getByRole('navigation', { name: 'Glossary pages', exact: true });
    const next = within(topNavigation).getByRole('button', { name: 'Next terms' });
    const scroll = vi.mocked(topNavigation.scrollIntoView);
    scroll.mockClear();
    next.focus();
    fireEvent.click(next);
    expect(next).toHaveFocus();
    expect(scroll).not.toHaveBeenCalled();
  });

  it('filters by alias and topic, and communicates the resulting count', () => {
    render(<GlossaryPage />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search terms' }), { target: { value: 'CFG' } });
    expect(screen.getByRole('link', { name: 'Classifier-free guidance', exact: true })).toBeVisible();
    expect(screen.getAllByRole('definition')).toHaveLength(1);
    fireEvent.change(screen.getByRole('combobox', { name: 'Topic' }), { target: { value: 'Coding and security' } });
    expect(screen.getByRole('heading', { name: 'No matching terms' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(`0 of ${glossaryTerms.length} terms`);
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getAllByRole('definition')).toHaveLength(glossaryPageSize);
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveValue('All topics');
  });

  it('offers named cross-references and restores filtered-out targets on a section link', async () => {
    render(<GlossaryPage />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search terms' }), { target: { value: 'CFG' } });
    const related = screen.getByRole('navigation', { name: 'Related to Classifier-free guidance' });
    expect(within(related).getByRole('link', { name: 'Conditioning' })).toHaveAttribute('href', '#/glossary?section=conditioning');
    await act(async () => {
      window.location.hash = '/glossary?section=conditioning';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(document.getElementById('conditioning')).toBeInTheDocument();
    expect(screen.getAllByRole('definition')).toHaveLength(glossaryPageSize);
  });

  it('keeps search focus and resets pagination after changing a query or topic', () => {
    render(<GlossaryPage />);
    const navigation = screen.getByRole('navigation', { name: 'Glossary pages', exact: true });
    fireEvent.click(within(navigation).getByRole('button', { name: 'Next terms' }));
    const search = screen.getByRole('searchbox');
    search.focus();
    fireEvent.change(search, { target: { value: 'CFG' } });
    expect(search).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 to 1 of 1 terms');
    fireEvent.change(search, { target: { value: '' } });
    expect(search).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 to 24 of 98 terms');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Detection and statistics' } });
    expect(screen.getAllByRole('definition')).toHaveLength(19);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 to 19 of 19 terms');
  });

  it('loads and focuses a deep-linked term on the final page before user interaction', () => {
    const last = searchGlossary('').at(-1)!;
    window.history.replaceState(null, '', `/#/glossary?section=${last.id}`);
    render(<main><GlossaryPage /></main>);
    expect(document.getElementById(last.id)).toHaveFocus();
    expect(screen.getAllByRole('definition')).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 97 to 98 of 98 terms');
  });

  it('reveals a target on another page after an external hash change', async () => {
    render(<GlossaryPage />);
    const last = searchGlossary('').at(-1)!;
    expect(document.getElementById(last.id)).not.toBeInTheDocument();
    await act(async () => {
      window.location.hash = `/glossary?section=${last.id}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(document.getElementById(last.id)).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Showing 97 to 98 of 98 terms');
  });

  it('reveals and focuses related terms even when the URL hash is unchanged', () => {
    window.history.replaceState(null, '', '/#/glossary?section=conditioning');
    render(<GlossaryPage />);
    const search = screen.getByRole('searchbox');
    search.focus();
    fireEvent.change(search, { target: { value: 'CFG' } });
    expect(search).toHaveFocus();
    const related = screen.getByRole('navigation', { name: 'Related to Classifier-free guidance' });
    fireEvent.click(within(related).getByRole('link', { name: 'Conditioning', exact: true }));
    expect(search).toHaveValue('');
    expect(document.getElementById('conditioning')).toHaveFocus();
    expect(window.location.hash).toBe('#/glossary?section=conditioning');
  });

  it('keeps alphabet jumps available for terms beyond the current page', () => {
    render(<GlossaryPage />);
    const letters = screen.getByRole('navigation', { name: 'Jump to letter' });
    fireEvent.click(within(letters).getByRole('link', { name: 'Jump to W', exact: true }));
    const firstW = searchGlossary('').find(term => term.term.startsWith('W'))!;
    expect(document.getElementById(firstW.id)).toHaveFocus();
  });

  it('keeps worked examples optional while the core explanation remains visible', () => {
    render(<GlossaryPage />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'complete-message success' } });
    const entry = document.getElementById('message-recovery')!;
    expect(within(entry).getByText(glossaryById.get('message-recovery')!.definition)).toBeVisible();
    expect(within(entry).getByText('Worked example').closest('details')).not.toHaveAttribute('open');
    fireEvent.click(within(entry).getByText('Worked example'));
    expect(within(entry).getByText(glossaryById.get('message-recovery')!.example!)).toBeVisible();
  });
});
