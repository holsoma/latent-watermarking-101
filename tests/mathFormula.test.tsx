import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MathFormula from '../src/MathFormula';

const originalObserver = globalThis.ResizeObserver;
const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts');
let contentWidth = 200;
let onResize: () => void;
let disconnect: ReturnType<typeof vi.fn>;

beforeEach(() => {
  contentWidth = 200;
  disconnect = vi.fn();
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => contentWidth);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { onResize = callback; }
    observe() {}
    disconnect = disconnect;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.stubGlobal('ResizeObserver', originalObserver);
  if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts);
  else Reflect.deleteProperty(document, 'fonts');
});

describe('equation overflow access', () => {
  it('keeps short equations out of the tab sequence and preserves both KaTeX outputs', () => {
    const { container } = render(<MathFormula expression="x^2" />);
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByText(/Scroll horizontally/)).toBeNull();
    expect(container.querySelector('.equation')).not.toHaveAttribute('tabindex');
    expect(container.querySelector('.katex-html')).toBeInTheDocument();
    expect(container.querySelector('.katex-mathml math')).not.toBeNull();
  });

  it('provides a named keyboard focus target and linked visible instructions only while overflowing', () => {
    contentWidth = 700;
    const { unmount } = render(<MathFormula expression="x^2+y^2" />);
    const region = screen.getByRole('region', { name: 'Scrollable equation' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveAccessibleDescription(/Scroll horizontally.*Left and Right arrow keys/);
    region.focus();
    expect(region).toHaveFocus();

    contentWidth = 300;
    act(() => onResize());
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByText(/Scroll horizontally/)).toBeNull();
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('remeasures after font readiness and subsequent font loading', async () => {
    let resolveFonts!: () => void;
    const fonts = Object.assign(new EventTarget(), { ready: new Promise<void>(resolve => { resolveFonts = resolve; }) });
    Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
    render(<MathFormula expression="x" />);
    contentWidth = 700;
    await act(async () => resolveFonts());
    expect(screen.getByRole('region', { name: 'Scrollable equation' })).toBeInTheDocument();
    contentWidth = 200;
    act(() => fonts.dispatchEvent(new Event('loadingdone')));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('uses window resizing when ResizeObserver is unavailable and removes the fallback on unmount', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<MathFormula expression="x" />);
    contentWidth = 700;
    fireEvent.resize(window);
    expect(screen.getByRole('region', { name: 'Scrollable equation' })).toBeInTheDocument();
    unmount();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
