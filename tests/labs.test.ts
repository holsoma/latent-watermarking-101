import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import report from '../docs/lab-verification.json';
import { paperLabs } from '../src/labs';

describe('recorded CPU evidence', () => {
  it('records four successful command stages for each advertised exercise', () => {
    expect(Object.keys(report.labs).sort()).toEqual(Object.keys(paperLabs).sort());
    expect(Object.keys(report.labs)).toHaveLength(24);
    for (const [slug, lab] of Object.entries(report.labs)) {
      expect(lab.classification).toBe('prerequisite-exercise');
      expect(lab.status).toBe('passed');
      expect(lab.commands).toHaveLength(4);
      expect(lab.commands.map(c => c.command.split(' ').at(-1))).toEqual(['create', 'detect', 'evaluate', 'controls']);
      for (const command of lab.commands) expect(command.exit_code, `${slug}: ${command.command}`).toBe(0);
      const controls = JSON.parse(lab.commands[3].stdout);
      expect(controls.passed).toBe(controls.checks.length);
      expect(controls.passed).toBeGreaterThan(0);
      expect(controls.observations).toBeDefined();
    }
  });

  it('ties each published image to a dated run and the exact image hash', () => {
    for (const [slug, lab] of Object.entries(paperLabs)) {
      if (!lab.visuals.length) continue;
      const directory = resolve('public/experiments/handbook', slug);
      const run = JSON.parse(readFileSync(resolve(directory, 'run.json'), 'utf8'));
      expect(run.slug).toBe(slug);
      expect(Number.isFinite(Date.parse(run.run_at))).toBe(true);
      expect(run.classification).toBe('prerequisite-exercise');
      expect(run.saved_image_detection).toBeDefined();
      for (const visual of lab.visuals) {
        const filename = visual.src.split('/').at(-1)!;
        const artifact = run.artifacts.find((item: { file: string }) => item.file === filename);
        expect(artifact, visual.src).toBeDefined();
        expect(createHash('sha256').update(readFileSync(resolve(directory, filename))).digest('hex')).toBe(artifact.sha256);
      }
    }
  });
});
