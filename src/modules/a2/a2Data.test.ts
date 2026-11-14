import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { a2Units, caseAudioFiles, tasksForCase } from './a2Data';
import { A2_SKILLS } from './types';
import { findModule } from '../../data/modules';
describe('complete A2 course materials', () => {
  it('has 12 complete units and three distinct cases in each unit', () => {
    expect(a2Units).toHaveLength(12);
    expect(new Set(a2Units.map((u) => u.id)).size).toBe(12);
    for (const unit of a2Units) {
      expect(unit.reviewStatus).toBe('draft');
      expect(unit.cases.map((c) => c.id)).toEqual(['practice', 'check', 'review']);
      expect(new Set(unit.cases.map((c) => c.documents[0].text)).size).toBe(3);
      expect(new Set(unit.cases.map((c) => c.audios[1].text)).size).toBe(3);
      for (const material of unit.cases) {
        expect(material.documents).toHaveLength(2);
        expect(material.audios).toHaveLength(2);
        expect(material.dialogue).toHaveLength(3);
        const tasks = tasksForCase(unit.id, material);
        expect(tasks).toHaveLength(8);
        expect(new Set(tasks.map((t) => t.skill))).toEqual(new Set(A2_SKILLS));
        for (const source of [...material.documents, ...material.audios])
          for (const q of source.questions) {
            expect(new Set(q.options).size).toBe(q.options.length);
            expect(q.options[q.correct]).toBeTruthy();
            expect(q.explanation).toContain(q.options[q.correct]);
          }
        for (const task of [material.writing, material.speaking, material.mediation]) {
          expect(task.points.length).toBeGreaterThanOrEqual(3);
          expect(task.samples.length).toBeGreaterThan(0);
        }
      }
    }
    expect(findModule('a2-course')).toMatchObject({ status: 'available', route: '/a2' });
  });
  it('ships all 180 real audio assets and explicitly labels synthetic voices and pending review', () => {
    const manifest = JSON.parse(readFileSync('public/audio/a2/manifest.json', 'utf8'));
    expect(manifest.linguisticReview).toBe('pending');
    expect(manifest.voices).toEqual({ Xander: 'nl-NL', Ellen: 'nl-BE' });
    const files = a2Units.flatMap((u) => u.cases.flatMap(caseAudioFiles));
    expect(new Set(files).size).toBe(180);
    for (const file of files) {
      expect(statSync(`public/${file}`).size).toBeGreaterThan(1000);
      expect(manifest.assets[file].durationSeconds).toBeGreaterThan(1);
    }
    for (const unit of a2Units)
      for (const material of unit.cases) {
        const scripts = [
          ...material.audios.map((audio) => ({ file: audio.file, segments: audio.segments })),
          ...material.dialogue.map((turn) => ({
            file: turn.file,
            segments: [{ voice: 'Xander', text: turn.prompt }],
          })),
        ];
        for (const asset of scripts) {
          const serialized =
            '[' +
            asset.segments
              .map(
                (segment) =>
                  `{"voice": ${JSON.stringify(segment.voice)}, "text": ${JSON.stringify(segment.text)}}`,
              )
              .join(', ') +
            ']';
          expect(manifest.assets[asset.file].scriptHash).toBe(
            createHash('sha256').update(serialized).digest('hex'),
          );
        }
      }
  });
});
