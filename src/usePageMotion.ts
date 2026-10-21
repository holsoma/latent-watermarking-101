import { useEffect, useRef, type RefObject } from 'react';

/** Native scrolling keeps direct section links and technical reading predictable. */
export function usePageMotion(root: RefObject<HTMLElement | null>, route: string) {
  const previousRoute = useRef(route);
  useEffect(() => {
    if (previousRoute.current === route) return;
    previousRoute.current = route;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    const animate = () => {
      void import('gsap').then(({ gsap }) => {
        if (cancelled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const context = gsap.context(() => {
          const heading = root.current?.querySelector('.article-header, .home-hero, .not-found-header');
          if (heading) gsap.fromTo(heading, { y: 8 }, { y: 0, duration: .28, ease: 'power3.out', clearProps: 'transform' });
        }, root);
        revert = () => context.revert();
      });
    };
    const isLazyRoute = route === '/papers' || route === '/revision' || route === '/mathematics' || route === '/glossary' || route.startsWith('/papers/');
    if (isLazyRoute) window.addEventListener('handbook:route-ready', animate, { once: true });
    else animate();
    return () => { cancelled = true; window.removeEventListener('handbook:route-ready', animate); revert?.(); };
  }, [root, route]);
}
