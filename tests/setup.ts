import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
// Animation timing is checked in production-browser QA. Keep DOM contract tests deterministic.
vi.mock('../src/usePageMotion', () => ({ usePageMotion: () => {} }));
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
Object.defineProperty(Element.prototype, 'scrollIntoView', { value: vi.fn(), writable: true });
Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation((query: string) => ({
  matches: false, media: query, onchange: null,
  addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
})) });
class Observer {
  observe() {} unobserve() {} disconnect() {}
}
vi.stubGlobal('IntersectionObserver', Observer);
vi.stubGlobal('ResizeObserver', Observer);
