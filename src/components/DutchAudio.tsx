import { Link } from 'react-router-dom';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export function DutchAudio({ text, compact = false }: { text: string; compact?: boolean }) {
  const speech = useSpeechSynthesis();
  if (!text.trim()) return null;
  const disabled = !speech.supported || !speech.enabled;
  const reason = !speech.supported
    ? 'Speech is unavailable in this browser.'
    : !speech.enabled
      ? 'Enable sound in Settings to hear Dutch.'
      : undefined;
  const active = speech.speaking && speech.activeText === text.trim();
  return (
    <span
      className="d-inline-flex flex-wrap align-items-center gap-1 dutch-audio"
      role="group"
      lang="en"
      aria-label={`Dutch pronunciation: ${text}`}
      title={reason}
    >
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        disabled={disabled}
        aria-label={`Hear Dutch: ${text}`}
        title={reason ?? 'Hear Dutch'}
        onClick={() => speech.speak(text)}
      >
        <i className={`bi ${active ? 'bi-soundwave' : 'bi-volume-up'}`} aria-hidden="true" />
        {!compact && <span className="ms-1">Hear Dutch</span>}
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        disabled={disabled}
        aria-label={`Hear Dutch slowly: ${text}`}
        title={reason ?? 'Hear slowly'}
        onClick={() => speech.speak(text, 0.68)}
      >
        <i className="bi bi-speedometer" aria-hidden="true" />
        {!compact && <span className="ms-1">Slower</span>}
      </button>
      {active && (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          aria-label="Stop Dutch audio"
          onClick={speech.stop}
        >
          <i className="bi bi-stop-fill" aria-hidden="true" />
          {!compact && <span className="ms-1">Stop</span>}
        </button>
      )}
    </span>
  );
}

export function SpeechStatus() {
  const speech = useSpeechSynthesis();
  if (!speech.error && speech.supported && speech.enabled && !speech.speaking) return null;
  return (
    <div className="container mt-3">
      <div
        className="alert alert-info d-flex flex-wrap gap-2 align-items-center mb-0"
        role="status"
      >
        <span>
          {speech.error ||
            (!speech.supported
              ? 'Dutch audio is unavailable in this browser.'
              : !speech.enabled
                ? 'Dutch audio is turned off.'
                : `Playing Dutch: ${speech.activeText}`)}
        </span>
        {speech.speaking && (
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={speech.stop}>
            Stop audio
          </button>
        )}
        {!speech.enabled && <Link to="/settings">Enable sound in Settings</Link>}
        {speech.error && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={speech.clearError}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
