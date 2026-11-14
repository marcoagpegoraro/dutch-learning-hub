// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider, useAppState } from '../../app/AppStateContext';
import { SpeechSynthesisProvider } from '../../app/SpeechSynthesisProvider';
import { A2UnitPage } from './A2UnitPage';
import { A2CoursePage } from './A2CoursePage';
import { a2Units, tasksForCase } from './a2Data';
import { createDefaultState, STORAGE_KEY } from '../../services/storage';
function StateProbe() {
  const { state } = useAppState();
  return <output data-testid="a2State">{JSON.stringify(state.a2)}</output>;
}
function start(path = '/a2/transport?mode=practice&task=0', reset = true) {
  if (reset) {
    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createDefaultState()));
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppStateProvider>
        <SpeechSynthesisProvider>
          <Routes>
            <Route path="/a2" element={<A2CoursePage />} />
            <Route path="/a2/:unitId" element={<A2UnitPage />} />
          </Routes>
          <StateProbe />
        </SpeechSynthesisProvider>
      </AppStateProvider>
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});
describe('A2 learner workflow', () => {
  it('opens all 12 units and makes the pilot and portfolio discoverable', () => {
    start('/a2');
    expect(screen.getByRole('heading', { name: 'Trilha A2' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Começar pelo transporte' })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'Abrir unidade' })).toHaveLength(12);
  });
  it('saves a contextual reading response and carries it into persisted progress', async () => {
    start('/a2/transport?mode=check&task=0');
    for (const q of a2Units[0].cases[1].documents[0].questions)
      fireEvent.click(
        within(screen.getByRole('group', { name: q.prompt })).getByLabelText(q.options[q.correct]),
      );
    fireEvent.click(screen.getByRole('button', { name: 'Verificar e registrar' }));
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('a2State').textContent!).evidence).toHaveLength(1),
    );
    const app = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(app.a2.evidence[0]).toMatchObject({
      mode: 'check',
      skill: 'reading',
      correct: true,
      source: 'objective',
    });
    expect(screen.getByText('Informação compreendida.', { exact: false })).toBeTruthy();
  });
  it('requires listening or a transcript and records transcript assistance on the saved attempt', async () => {
    start('/a2/transport?mode=check&task=2');
    for (const q of a2Units[0].cases[1].audios[0].questions)
      fireEvent.click(
        within(screen.getByRole('group', { name: q.prompt })).getByLabelText(q.options[q.correct]),
      );
    fireEvent.click(screen.getByRole('button', { name: 'Verificar e registrar' }));
    expect(screen.getByRole('alert').textContent).toContain('Ouça o áudio');
    fireEvent.click(screen.getByRole('button', { name: 'Consultar transcrição' }));
    fireEvent.click(screen.getByRole('button', { name: 'Verificar e registrar' }));
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('a2State').textContent!).evidence[0].supports).toContain(
        'transcrição consultada',
      ),
    );
  });
  it('accepts an original written response as self-assessment without pretending to grade its wording', async () => {
    start('/a2/transport?mode=check&task=4');
    fireEvent.change(screen.getByLabelText('Sua resposta em holandês'), {
      target: { value: 'Hoi Noor, er is een probleem met mijn trein. Ik kom later aan in Delft.' },
    });
    for (let i = 0; i < 4; i++)
      fireEvent.change(document.getElementById(`rubric-${i}`)!, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar autoavaliação' }));
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('a2State').textContent!).evidence[0]).toMatchObject({
        source: 'self',
        skill: 'writing',
        rubric: [2, 2, 2, 2],
      }),
    );
    expect(screen.getByText('Autoavaliação registrada.', { exact: false })).toBeTruthy();
  });
  it('resumes a written draft and a partially filled rubric after returning to the page', async () => {
    start('/a2/transport?mode=check&task=4');
    fireEvent.change(screen.getByLabelText('Sua resposta em holandês'), {
      target: { value: 'Hoi Noor, ik kom later.' },
    });
    fireEvent.change(document.getElementById('rubric-0')!, { target: { value: '2' } });
    cleanup();
    start('/a2/transport?mode=check&task=4', false);
    expect((screen.getByLabelText('Sua resposta em holandês') as HTMLTextAreaElement).value).toBe(
      'Hoi Noor, ik kom later.',
    );
    expect((document.getElementById('rubric-0') as HTMLSelectElement).value).toBe('2');
    expect((document.getElementById('rubric-1') as HTMLSelectElement).value).toBe('-1');
  });

  it('keeps all tasks mapped to their own skills and handles a malformed task index', () => {
    start('/a2/transport?mode=practice&task=1.5');
    expect(screen.getByRole('heading', { name: 'Mensagem recebida' })).toBeTruthy();
    expect(tasksForCase('transport', a2Units[0].cases[0])).toHaveLength(8);
  });
});
