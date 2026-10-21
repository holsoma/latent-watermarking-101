export type PaperKind = 'Foundation' | 'Watermark method' | 'Attack' | 'Benchmark';
export type SourceRef = { id: string; title: string; url?: string; locator?: string; basis: 'primary' | 'supplied-summary' | 'local-experiment' };
export type HandbookSection = {
  id: string;
  title: string;
  paragraphs: string[];
  equation?: { expression: string; note: string; format?: 'latex' | 'plain' };
  bullets?: string[];
  sources: string[];
  workedExample?: { title: string; steps: string[]; conclusion: string; visual?: 'angular-variance' };
};
export type HandbookEntry = {
  slug: string; title: string; shortTitle: string; kind: PaperKind;
  year: string; venue: string; authors: string; family: string;
  insertion: string; training: string; summary: string;
  sections: HandbookSection[]; sources: SourceRef[];
  prerequisites: { label: string; to: string }[];
  related: string[];
  selfChecks: { question: string; answer: string }[];
  labSlug?: string;
};
export type RevisionQuestion = { id: string; number: number; topic: string; question: string; answer: string; sourceLocator: string };
