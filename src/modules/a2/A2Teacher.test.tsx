// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../../app/AppStateContext';
import { SpeechSynthesisProvider } from '../../app/SpeechSynthesisProvider';
import { A2TeacherPage } from './A2PortfolioPage';
import { createA2State, type A2Evidence } from './types';
import { importTeacherReviews, skillStatus } from './a2Progress';
import * as recordings from './a2Recordings';
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('manual teacher review round trip', () => {
  it('opens a portfolio, records a named rubric, exports it and applies it to the original response', async () => {
    vi.stubGlobal('Blob', NodeBlob);
    window.localStorage.clear();
    const evidence: A2Evidence = {
      id: 'writing-1',
      taskId: 'a2:transport:check:writing:0',
      unitId: 'transport',
      skill: 'writing',
      mode: 'check',
      sessionId: 'student',
      response: 'Hoi Noor, mijn trein is te laat. Ik kom later naar Delft.',
      supports: [],
      recordings: [],
      answeredAt: '2026-11-12T10:00:00Z',
      source: 'self',
      rubric: [3, 3, 3, 3],
    };
    const a2 = { ...createA2State(), evidence: [evidence] };
    const file = new File(['portfolio'], 'portfolio.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', {
      value: async () =>
        JSON.stringify({
          kind: 'dutch-hub-a2-portfolio',
          version: 1,
          displayName: 'Aluno',
          a2,
          recordings: [],
        }),
    });
    const download = vi.spyOn(recordings, 'downloadBlob').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <AppStateProvider>
          <SpeechSynthesisProvider>
            <A2TeacherPage />
          </SpeechSynthesisProvider>
        </AppStateProvider>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('Portfólio do aluno (.json)'), {
      target: { files: [file] },
    });
    await waitFor(() => expect(screen.getByText('Aluno', { exact: true })).toBeTruthy());
    fireEvent.change(screen.getByLabelText('Nome do avaliador'), {
      target: { value: 'Docent Maria' },
    });
    for (let i = 0; i < 4; i++)
      fireEvent.change(document.getElementById(`teacherScore${i}`)!, { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Feedback para o aluno'), {
      target: { value: 'Mensagem compreensível e adequada à situação.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Exportar avaliações completas' }));
    expect(download).toHaveBeenCalledOnce();
    const result = JSON.parse(await download.mock.calls[0][0].text());
    expect(result.reviews[0]).toMatchObject({
      evidenceId: 'writing-1',
      reviewer: 'Docent Maria',
      scores: [2, 2, 2, 2],
    });
    const reviewed = importTeacherReviews(a2, result);
    expect(skillStatus(reviewed, 'writing', 'transport', new Date('2026-11-16T12:00:00Z'))).toBe(
      'demonstrated',
    );
  });
});
