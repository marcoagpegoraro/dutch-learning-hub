import { describe, expect, it } from 'vitest';
import { learningModules } from '../data/modules';

const phase4Ids = ['listening', 'conversations', 'picture-description', 'pronunciation'];

describe('Phase 4 module registry', () => {
  it('marks every Phase 4 module as available at a practice route', () => {
    for (const moduleId of phase4Ids) {
      expect(learningModules.find((module) => module.id === moduleId)).toMatchObject({
        status: 'available',
        route: `/practice/${moduleId}`,
      });
    }
  });
});
