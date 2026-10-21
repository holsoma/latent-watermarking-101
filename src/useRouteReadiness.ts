import { useEffect } from 'react';

/** Lazy routes focus only after their article has replaced the loading state. */
export function useRouteReadiness(path: string) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const currentRoute = window.location.hash.replace(/^#/, '').split('?')[0];
      if (currentRoute !== path) return;
      const section = new URLSearchParams(window.location.hash.split('?')[1]).get('section');
      const target = section ? document.getElementById(section) : document.querySelector('main h1');
      if (target instanceof HTMLElement) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
      if (section && target) target.scrollIntoView();
      window.dispatchEvent(new Event('handbook:route-ready'));
    });
    return () => cancelAnimationFrame(frame);
  }, [path]);
}
