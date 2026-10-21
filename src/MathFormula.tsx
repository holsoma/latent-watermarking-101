import katex from 'katex';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export default function MathFormula({ expression }: { expression: string }) {
  const equationRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [overflows, setOverflows] = useState(false);
  const html = useMemo(() => katex.renderToString(expression, {
    displayMode: true,
    output: 'htmlAndMathml',
    throwOnError: false,
    trust: false,
    strict: 'warn',
  }), [expression]);

  useEffect(() => {
    const equation = equationRef.current;
    if (!equation) return;
    let active = true;
    const measure = () => {
      if (active) setOverflows(equation.scrollWidth > equation.clientWidth);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(equation);
    if (equation.firstElementChild) observer?.observe(equation.firstElementChild);
    if (!observer) window.addEventListener('resize', measure);

    const fonts = document.fonts;
    void fonts?.ready.then(measure);
    fonts?.addEventListener?.('loadingdone', measure);
    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      fonts?.removeEventListener?.('loadingdone', measure);
    };
  }, [html]);

  return <div className={`equation-container${overflows ? ' equation-container--scrollable' : ''}`}>
    <div
      ref={equationRef}
      className={`equation${overflows ? ' equation--scrollable' : ''}`}
      role={overflows ? 'region' : undefined}
      aria-label={overflows ? 'Scrollable equation' : undefined}
      aria-describedby={overflows ? hintId : undefined}
      tabIndex={overflows ? 0 : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
    {overflows && <p className="equation-scroll-hint" id={hintId}>
      Scroll horizontally to read the full equation. Use the Left and Right arrow keys when focused.
    </p>}
  </div>;
}
