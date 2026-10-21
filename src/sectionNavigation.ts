import type { MouseEvent } from 'react';

/** A repeated hash produces no navigation event, so restore its reading position explicitly. */
export function revisitSection(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = event.currentTarget.getAttribute('href');
  if (!hash?.startsWith('#/') || hash !== window.location.hash) return;
  const id = new URLSearchParams(hash.split('?')[1]).get('section');
  const target = id ? document.getElementById(id) : null;
  if (!(target instanceof HTMLElement)) return;
  event.preventDefault();
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  target.scrollIntoView();
}
