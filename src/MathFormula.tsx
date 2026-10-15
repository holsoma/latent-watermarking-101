import katex from 'katex';

export default function MathFormula({ expression }: { expression: string }) {
  return <div className="equation" dangerouslySetInnerHTML={{ __html: katex.renderToString(expression, {
    displayMode: true,
    output: 'htmlAndMathml',
    throwOnError: false,
    trust: false,
    strict: 'warn',
  }) }} />;
}
