import { papers as originalPapers } from './content';
import { additionalPapers, studyContent, type PaperStudy } from './studies';
import { getLab } from './labs';
import { PlannedLabPage } from './PlannedLabPage';
import { RunnableLabPage } from './RunnableLabPage';
import { useRouteReadiness } from './useRouteReadiness';

const categories: PaperStudy['category'][] = ['Foundations and bridges', 'Initial-noise and inversion', 'Learned and model-integrated', 'Semantics, integrity and security'];
const papers = [...originalPapers, ...additionalPapers].sort((left, right) => {
  const difference = categories.indexOf(studyContent[left.slug].category) - categories.indexOf(studyContent[right.slug].category);
  return difference || Number(left.year) - Number(right.year);
});

export default function NewLabRoute({ slug }: { slug: string }) {
  useRouteReadiness(`/papers/${slug}/lab`);
  const index = papers.findIndex(paper => paper.slug === slug);
  if (index < 0 || !studyContent[slug]) return null;
  const paper = papers[index];
  const next = papers[(index + 1) % papers.length];
  const lab = getLab(slug);
  return lab?.status === 'Runnable locally' ? <RunnableLabPage paper={paper} lab={lab} next={next} /> : <PlannedLabPage paper={paper} next={next} lab={lab} />;
}
