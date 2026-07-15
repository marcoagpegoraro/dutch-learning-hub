import { describe, expect, it } from 'vitest';
import { conversationScenarios, findConversationStep } from './conversationData';

describe('conversation scenarios', () => {
  it('includes all planned real-life scenarios', () => {
    expect(conversationScenarios.map((scenario) => scenario.id)).toEqual(
      expect.arrayContaining([
        'supermarket',
        'train-station',
        'restaurant',
        'doctor',
        'municipality',
        'workplace',
        'introductions',
        'directions',
      ]),
    );
    expect(conversationScenarios).toHaveLength(8);
  });

  it('has valid start steps and branch targets', () => {
    for (const scenario of conversationScenarios) {
      expect(findConversationStep(scenario, scenario.startStep).id).toBe(scenario.startStep);
      const ids = new Set(scenario.steps.map((step) => step.id));
      for (const step of scenario.steps) {
        expect(step.choices.some((choice) => choice.outcome === 'best')).toBe(true);
        for (const response of step.choices) {
          if (response.nextStep) expect(ids.has(response.nextStep)).toBe(true);
        }
      }
    }
  });

  it('contains scenarios at all difficulty levels', () => {
    expect(new Set(conversationScenarios.map((scenario) => scenario.difficulty))).toEqual(
      new Set(['easy', 'medium', 'hard']),
    );
  });
});
