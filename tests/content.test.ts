import { describe, expect, it } from 'vitest';
import { renderToString } from 'katex';
import { handbookEntries } from '../src/handbook';
import { revisionQuestions, oralQuestions, mathExamples } from '../src/revision';
import { papers } from '../src/content';
import { additionalPapers } from '../src/studies';
import coverage from '../docs/content-coverage.json';

describe('handbook content contracts', () => {
  it('retains every existing paper and covers nine additional document entries', () => {
    expect(handbookEntries).toHaveLength(33);
    const slugs = new Set(handbookEntries.map(entry => entry.slug));
    expect(slugs.size).toBe(handbookEntries.length);
    for (const paper of [...papers, ...additionalPapers]) expect(slugs.has(paper.slug)).toBe(true);
  });

  for (const entry of handbookEntries) {
    it(`${entry.slug}: exposes supported explanations and resolvable sources`, () => {
      expect(entry.sections.length).toBeGreaterThanOrEqual(4);
      expect(new Set(entry.sections.map(section => section.id)).size).toBe(entry.sections.length);
      expect(entry.selfChecks.length).toBeGreaterThan(0);
      const sources = new Set(entry.sources.map(source => source.id));
      expect(sources.size).toBeGreaterThan(0);
      for (const section of entry.sections) {
        expect(section.paragraphs.join(' ').trim().length).toBeGreaterThan(25);
        expect(section.sources.length).toBeGreaterThan(0);
        for (const source of section.sources) expect(sources.has(source), `${entry.slug}/${section.id}: ${source}`).toBe(true);
        if (section.equation?.format === 'latex') {
          expect(() => renderToString(section.equation!.expression, { throwOnError: true, output: 'htmlAndMathml' })).not.toThrow();
          expect(section.equation.note.trim().length).toBeGreaterThan(0);
        }
      }
      for (const related of entry.related) expect(handbookEntries.some(candidate => candidate.slug === related)).toBe(true);
      for (const check of entry.selfChecks) expect(check.answer.trim().length).toBeGreaterThan(30);
      for (const source of entry.sources) {
        if (source.url) expect(new URL(source.url).protocol).toBe('https:');
        expect(source.title.trim()).not.toBe('');
      }
    });
  }

  it('includes every supplied question and worked mathematical topic', () => {
    expect(revisionQuestions).toHaveLength(63);
    expect(oralQuestions).toHaveLength(20);
    expect(mathExamples.length).toBeGreaterThanOrEqual(5);
    const all = [...revisionQuestions, ...oralQuestions];
    expect(new Set(all.map(question => question.id)).size).toBe(83);
    for (const question of all) {
      expect(question.answer.length).toBeGreaterThan(20);
      expect(question.sourceLocator.length).toBeGreaterThan(0);
    }
    for (const example of mathExamples) if (example.equation?.format === 'latex') {
      expect(() => renderToString(example.equation!.expression, { throwOnError: true })).not.toThrow();
    }
  });

  it('maps every source requirement to an existing handbook section', () => {
    expect(coverage.papers).toHaveLength(19);
    expect(coverage.concepts).toHaveLength(63);
    expect(coverage.mathematics).toHaveLength(5);
    expect(coverage.oral).toHaveLength(20);
    for (const item of [...coverage.papers, ...coverage.concepts, ...coverage.mathematics, ...coverage.oral]) {
      expect(item.locator.length).toBeGreaterThan(0);
      const target = item.route.replace(/^#/, '');
      const [path, query = ''] = target.split('?');
      const section = new URLSearchParams(query).get('section');
      if (path.startsWith('/papers/')) {
        const entry = handbookEntries.find(candidate => candidate.slug === path.slice(8));
        expect(entry, item.route).toBeDefined();
        if (section) expect(entry!.sections.some(candidate => candidate.id === section), item.route).toBe(true);
      } else if (path === '/revision' || path === '/mathematics') {
        expect([...revisionQuestions, ...oralQuestions, ...mathExamples].some(candidate => candidate.id === section), item.route).toBe(true);
      } else throw new Error(`Unverified coverage destination: ${item.route}`);
    }
  });

  it('uses the requested punctuation throughout the new handbook records', () => {
    expect(JSON.stringify([handbookEntries, revisionQuestions, oralQuestions, mathExamples])).not.toContain('\u2014');
  });
});
