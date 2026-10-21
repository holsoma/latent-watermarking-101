import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../src/App';
import { embedSigns, HomePage, recoverSigns } from '../src/HomePage';
import { GlossaryPage } from '../src/GlossaryPage';

describe('computed sign example', () => {
  it('retains word spacing when responsive styles hide heading line breaks', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent?.replace(/\s+/g, ' ').trim()).toBe('A signal inside the noise.');
  });
  it('reads each message from the encoded coordinate values', () => {
    for (const message of ['00000000', '11111111', '10110010', '01001101']) {
      const values = embedSigns(message);
      expect(values).toHaveLength(256);
      expect(recoverSigns(values)).toBe(message);
    }
  });
  it('recomputes received evidence after editing a message bit', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Reveal the signal' }));
    expect(screen.getByLabelText('Recovered example bits')).toHaveTextContent('10110010');
    fireEvent.click(screen.getByRole('button', { name: 'Bit 1: 1. Change to 0' }));
    expect(screen.getByLabelText('Recovered example bits')).toHaveTextContent('00110010');
    expect(screen.getByText(/it includes no diffusion or attack/)).toBeInTheDocument();
  });
});

describe('handbook navigation', () => {
  it('keeps focus in the glossary search field as results update', () => {
    render(<GlossaryPage />);
    const input = screen.getByRole('searchbox', { name: 'Search terms' });
    input.focus();
    fireEvent.change(input, { target: { value: 'BER' } });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: 'BER recovery' } });
    expect(input).toHaveFocus();
  });
  it('reveals a filtered related term even when its URL is already selected', () => {
    window.history.replaceState(null, '', '/#/glossary?section=conditioning');
    render(<GlossaryPage />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'CFG' } });
    expect(document.getElementById('conditioning')).toBeNull();
    const related = document.querySelector<HTMLAnchorElement>('.glossary-related a[href="#/glossary?section=conditioning"]');
    expect(related).not.toBeNull();
    fireEvent.click(related!);
    expect(document.getElementById('conditioning')).toHaveFocus();
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
  it('removes Threats and gaps from the visible chapter navigation', () => {
    window.history.replaceState(null, '', '/#/');
    render(<App />);
    expect(screen.queryByRole('link', { name: 'Threats and gaps' })).toBeNull();
    expect(document.querySelector('.sidebar a[href="#/research/gaps"]')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'A signal inside the noise.' })).toBeInTheDocument();
  });
});
