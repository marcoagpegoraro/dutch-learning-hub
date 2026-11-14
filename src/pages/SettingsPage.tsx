import { DutchVoiceSettings } from '../components/DutchVoiceSettings';
import { useRef, useState, type ChangeEvent } from 'react';
import { useAppState } from '../app/AppStateContext';
import type { Difficulty } from '../types/exercise';
import type { ClockType } from '../types/settings';

export function SettingsPage() {
  const { state, updateSettings, updateDisplayName, exportState, importState, resetState } =
    useAppState();
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  function downloadProgress() {
    const blob = new Blob([exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dutch-learning-hub-progress-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Progress exported.');
  }

  async function importProgress(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      importState(await file.text());
      setMessage('Progress imported successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Progress could not be imported.');
    } finally {
      event.target.value = '';
    }
  }

  async function confirmReset() {
    if (
      !window.confirm('Reset all Dutch Learning Hub progress and settings? This cannot be undone.')
    )
      return;
    try {
      await resetState();
      setMessage('All progress, recordings, and settings were reset.');
    } catch {
      setMessage(
        'Não foi possível excluir as gravações. Nenhum progresso foi apagado. Tente novamente.',
      );
    }
  }

  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Make it yours</span>
      <h1 className="display-6 fw-bold">Settings</h1>
      <p className="text-secondary mb-4">Changes are saved automatically in this browser.</p>
      {message && (
        <div className="alert alert-info" role="status" aria-live="polite">
          {message}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <DutchVoiceSettings />
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold mb-4">Learning preferences</h2>
              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="displayName">
                  Display name
                </label>
                <input
                  id="displayName"
                  className="form-control"
                  value={state.profile.displayName}
                  onChange={(event) => updateDisplayName(event.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="defaultDifficulty">
                    Default difficulty
                  </label>
                  <select
                    id="defaultDifficulty"
                    className="form-select"
                    value={state.settings.defaultDifficulty}
                    onChange={(event) =>
                      updateSettings({ defaultDifficulty: event.target.value as Difficulty })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="defaultClock">
                    Default clock
                  </label>
                  <select
                    id="defaultClock"
                    className="form-select"
                    value={state.settings.clockType}
                    onChange={(event) =>
                      updateSettings({ clockType: event.target.value as ClockType })
                    }
                  >
                    <option value="analog">Analog</option>
                    <option value="digital">Digital</option>
                    <option value="random">Random</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="dailyGoal">
                    Daily XP goal
                  </label>
                  <select
                    id="dailyGoal"
                    className="form-select"
                    value={state.settings.dailyGoal}
                    onChange={(event) => updateSettings({ dailyGoal: Number(event.target.value) })}
                  >
                    {[10, 20, 30, 50, 75, 100].map((goal) => (
                      <option key={goal} value={goal}>
                        {goal} XP
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <hr className="my-4" />
              <div className="form-check form-switch mb-3">
                <input
                  id="showHints"
                  className="form-check-input"
                  type="checkbox"
                  checked={state.settings.showHints}
                  onChange={(event) => updateSettings({ showHints: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="showHints">
                  <strong>Show hints by default</strong>
                  <span className="d-block small text-secondary">
                    You can still toggle a hint during an exercise.
                  </span>
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  id="soundEnabled"
                  className="form-check-input"
                  type="checkbox"
                  checked={state.settings.soundEnabled}
                  onChange={(event) => updateSettings({ soundEnabled: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="soundEnabled">
                  <strong>Enable sound</strong>
                  <span className="d-block small text-secondary">
                    Enables Dutch pronunciation throughout the app, including words, sentences,
                    listening, and conversations.
                  </span>
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  id="reducedMotion"
                  className="form-check-input"
                  type="checkbox"
                  checked={state.settings.reducedMotion}
                  onChange={(event) => updateSettings({ reducedMotion: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="reducedMotion">
                  <strong>Reduce motion</strong>
                  <span className="d-block small text-secondary">
                    Disables non-essential interface transitions.
                  </span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-5">
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold">Your data</h2>
              <p className="text-secondary small">
                Export a backup or move your progress to another browser. Imported files are
                validated before use. Gravações de voz são exportadas separadamente pelo portfólio
                da trilha A2.
              </p>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={downloadProgress}
                >
                  <i className="bi bi-download me-2" aria-hidden="true" />
                  Export progress
                </button>
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={() => fileInput.current?.click()}
                >
                  <i className="bi bi-upload me-2" aria-hidden="true" />
                  Import progress
                </button>
                <input
                  ref={fileInput}
                  className="visually-hidden"
                  type="file"
                  accept="application/json,.json"
                  onChange={importProgress}
                  aria-label="Choose a progress JSON file"
                />
              </div>
            </div>
          </section>
          <section className="card border-danger-subtle shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold text-danger">Reset all data</h2>
              <p className="text-secondary small">
                Deletes progress, mistakes, scores, and saved settings after confirmation.
              </p>
              <button className="btn btn-outline-danger" type="button" onClick={confirmReset}>
                Reset Dutch Learning Hub
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
