import { describe, expect, it } from 'vitest';
import { handbookEntries } from '../src/handbook';
import { paperCatalog } from '../src/paperCatalog.generated';

describe('derived navigation metadata', () => {
  it('matches the canonical handbook and preserves optional lab routes', () => {
    const fields = ['slug', 'shortTitle', 'title', 'kind', 'year', 'summary', 'insertion', 'training', 'labSlug'] as const;
    expect(paperCatalog).toEqual(handbookEntries.map(entry => Object.fromEntries(fields.filter(field => entry[field] !== undefined).map(field => [field, entry[field]]))));
    expect(paperCatalog.filter(entry => entry.labSlug)).toHaveLength(24);
  });
});
