import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { handbookEntries } from '../src/handbook';
import { HandbookIndex, HandbookStudy } from '../src/HandbookPages';
import { RunnableLabPage } from '../src/RunnableLabPage';
import { getLab } from '../src/labs';
import { papers } from '../src/content';
import { additionalPapers } from '../src/studies';
import { mathExamples } from '../src/revision';

function enter(path: string) {
  window.history.replaceState(null, '', `/#${path}`);
  return render(<App />);
}
async function navigate(path: string) {
  await act(async () => {
    window.location.hash = path;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}
beforeEach(() => window.history.replaceState(null, '', '/'));

describe('paper routes expose the actual study', () => {
  for (const entry of handbookEntries) it(`${entry.slug} renders every technical section`, async () => {
    enter(`/papers/${entry.slug}`);
    expect(await screen.findByRole('heading', { level: 1, name: entry.shortTitle }, { timeout: 5000 })).toBeInTheDocument();
    const article = document.querySelector('article')!;
    for (const section of entry.sections) {
      expect(article.querySelector(`[id="${section.id}"]`), `${entry.slug}/${section.id}`).not.toBeNull();
      expect(within(article as HTMLElement).getByText(section.paragraphs[0], { exact: true })).toBeInTheDocument();
    }
    expect(screen.getByRole('heading', { name: 'Sources and evidence' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Run the CPU exercise' })).not.toBeInTheDocument();
  });

  it('renders accessible mathematics and resolves prerequisite section targets', async () => {
    enter('/papers/law');
    await waitFor(() => expect(document.querySelector('math')).not.toBeNull(), { timeout: 5000 });
    expect(document.querySelector('.katex-error')).toBeNull();
    for (const entry of handbookEntries) for (const prerequisite of entry.prerequisites) {
      expect(prerequisite.to.startsWith('/')).toBe(true);
      const [path, query] = prerequisite.to.split('?');
      const section = new URLSearchParams(query).get('section');
      if (path === '/mathematics' || path === '/revision') {
        if (section) expect(mathExamples.some(s => s.id === section)).toBe(true);
      } else {
        const target = handbookEntries.find(e => path === `/papers/${e.slug}`);
        expect(target, prerequisite.to).toBeDefined();
        if (section) expect(target!.sections.some(s => s.id === section)).toBe(true);
      }
    }
  });

  it('opens a section directly and moves keyboard focus to it', async () => {
    const entry = handbookEntries[0];
    const section = entry.sections[1];
    enter(`/papers/${entry.slug}?section=${section.id}`);
    await waitFor(() => expect(document.activeElement?.id).toBe(section.id));
  });

  it('refreshes local contents after the lazy study opens and follows section links', async () => {
    const entry = handbookEntries[0];
    enter(`/papers/${entry.slug}`);
    await screen.findByRole('heading', { level: 1, name: entry.shortTitle });
    const contents = await screen.findByRole('navigation', { name: 'On this page' });
    expect(within(contents).getByRole('link', { name: entry.sections[0].title })).toHaveAttribute('href', `#/papers/${entry.slug}?section=${entry.sections[0].id}`);
    for (const section of entry.sections.slice(0, 2)) {
      await navigate(`/papers/${entry.slug}?section=${section.id}`);
      await waitFor(() => expect(document.activeElement?.id).toBe(section.id));
    }
  });

  it('responds to hash history changes without falling back to lab pages', async () => {
    enter('/papers');
    await navigate(`/papers/${handbookEntries[0].slug}`);
    expect(await screen.findByRole('heading', { level: 1, name: handbookEntries[0].shortTitle })).toBeInTheDocument();
    await navigate('/papers');
    expect(await screen.findByRole('searchbox', { name: 'Search studies' })).toBeInTheDocument();
  });

  it('rejects an invalid route and preserves the unlisted proposal route', async () => {
    enter('/papers/not-a-paper');
    expect(screen.getByRole('heading', { name: 'Chapter not found.' })).toBeInTheDocument();
    await navigate('/research/gaps2');
    expect(screen.getByRole('heading', { level: 1, name: 'A measurement programme for a short paper' })).toBeInTheDocument();
    expect(document.querySelector('.sidebar a[href="#/research/gaps2"]')).toBeNull();
  });
});

describe('research index', () => {
  it('searches body content and combines type, insertion and training filters', () => {
    render(<HandbookIndex />);
    const entry = handbookEntries.find(candidate => candidate.kind === 'Watermark method')!;
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: entry.shortTitle } });
    fireEvent.change(screen.getByLabelText('Paper type'), { target: { value: entry.kind } });
    fireEvent.change(screen.getByLabelText('Insertion location'), { target: { value: entry.insertion } });
    fireEvent.change(screen.getByLabelText('Training requirement'), { target: { value: entry.training } });
    expect(screen.getByRole('status')).toHaveTextContent('1 of 33 studies');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no-such-study-xyz' } });
    expect(screen.getByText('No studies match these filters.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(screen.getByRole('status')).toHaveTextContent('33 of 33 studies');
    const phrase = entry.sections[1].paragraphs[0].slice(0, 70);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: phrase } });
    expect(document.querySelector(`.study-index a[href="#/papers/${entry.slug}"]`)).not.toBeNull();
  });

  it('does not index the unlisted proposal', () => {
    render(<HandbookIndex />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '/research/gaps2' } });
    expect(screen.getByRole('status')).toHaveTextContent('0 of 33 studies');
  });
});

describe('accessible reading controls', () => {
  it('returns to an already selected section through either contents layout', async () => {
    enter('/papers/law?section=equation');
    await screen.findByRole('heading', { level: 1, name: 'LAW / LAW-M' }, { timeout: 5000 });
    const section = document.getElementById('equation')!;
    await waitFor(() => expect(section).toHaveFocus());
    await waitFor(() => expect(document.querySelector('.local-contents a[href="#/papers/law?section=equation"]')).not.toBeNull());
    const scroll = vi.spyOn(section, 'scrollIntoView');
    for (const selector of ['.study-section-navigation', '.local-contents']) {
      const heading = screen.getByRole('heading', { level: 1 });
      heading.tabIndex = -1;
      heading.focus();
      expect(heading).toHaveFocus();
      scroll.mockClear();
      fireEvent.click(document.querySelector(`${selector} a[href="#/papers/law?section=equation"]`)!);
      expect(section).toHaveFocus();
      expect(scroll).toHaveBeenCalledOnce();
    }
  });
  it('provides study section links for the compact contents disclosure', () => {
    const entry = handbookEntries.find(study => study.slug === 'law')!;
    render(<HandbookStudy entry={entry} />);
    const links = document.querySelectorAll<HTMLAnchorElement>('.study-section-navigation a');
    expect(links.length).toBe(entry.sections.length + 3);
    for (const link of links) {
      const id = new URLSearchParams(link.hash.split('?')[1]).get('section');
      expect(id).not.toBeNull();
      expect(document.getElementById(id!)).not.toBeNull();
    }
  });
  it('clears a study contents list when a lazy glossary replaces the study', async () => {
    enter('/papers/law');
    await screen.findByRole('heading', { level: 1, name: 'LAW / LAW-M' }, { timeout: 5000 });
    await waitFor(() => expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument());
    await navigate('/glossary');
    await screen.findByRole('heading', { level: 1, name: 'Glossary' }, { timeout: 5000 });
    await waitFor(() => expect(screen.queryByRole('navigation', { name: 'On this page' })).toBeNull());
  });
  it('opens the chapter drawer, traps boundary focus and restores focus on Escape', () => {
    enter('/papers');
    const trigger = screen.getByRole('button', { name: 'Contents', exact: true });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Guide chapters' });
    const close = within(dialog).getByRole('button', { name: 'Close contents' });
    expect(close).toHaveFocus();
    const boundaries = Array.from(dialog.querySelectorAll<HTMLElement>('a, button, summary')).filter(node => !node.closest('details:not([open])') || node.tagName === 'SUMMARY');
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(boundaries.at(-1)).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('provides a functional skip link and active navigation state', () => {
    enter('/papers');
    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(document.querySelector('a[href="#/papers"][aria-current="page"]')).not.toBeNull();
  });

  it('exposes self-check answers through native disclosure controls', () => {
    const entry = handbookEntries[0];
    render(<HandbookStudy entry={entry} />);
    const summary = screen.getByText(entry.selfChecks[0].question, { exact: true });
    expect(summary.tagName).toBe('SUMMARY');
    expect(summary.parentElement?.tagName).toBe('DETAILS');
    expect(summary.parentElement).toHaveTextContent(entry.selfChecks[0].answer);
  });
});

describe('lab display boundaries', () => {
  const originals = [...papers, ...additionalPapers];
  it('uses a separate lab route', async () => {
    enter('/papers/hidden/lab');
    expect(await screen.findByRole('heading', { name: 'Run the CPU exercise' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Read the technical study/ })).toHaveAttribute('href', '#/papers/hidden');
  });

  it('rejects a lab route for a study without an exercise', () => {
    enter('/papers/law/lab');
    expect(screen.getByRole('heading', { name: 'Chapter not found.' })).toBeInTheDocument();
  });

  it('does not display an empty recorded-output gallery', () => {
    const paper = originals.find(candidate => getLab(candidate.slug)?.visuals.length === 0)!;
    render(<RunnableLabPage paper={paper} lab={getLab(paper.slug)!} next={paper} />);
    expect(screen.queryByRole('heading', { name: 'Outputs from the recorded run' })).not.toBeInTheDocument();
  });

  it('reports clipboard success and failure truthfully', async () => {
    const paper = originals[0];
    const lab = getLab(paper.slug)!;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<RunnableLabPage paper={paper} lab={lab} next={paper} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Copy', exact: true })[0]);
    expect(await screen.findByRole('button', { name: 'Copied', exact: true })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(lab.commands[0].command);
    writeText.mockRejectedValueOnce(new Error('denied'));
    fireEvent.click(screen.getByRole('button', { name: 'Copied', exact: true }));
    expect(await screen.findByRole('button', { name: 'Copy failed: select the command' })).toBeInTheDocument();
  });
});
