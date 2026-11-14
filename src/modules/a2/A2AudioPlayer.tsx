import { useRef, useState } from 'react';
import { useAppState } from '../../app/AppStateContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { a2AssetUrl } from './a2Data';
export function A2AudioPlayer({
  file,
  label,
  onPlay,
  onSlow,
}: {
  file: string;
  label: string;
  onPlay?: () => void;
  onSlow?: () => void;
}) {
  const { state } = useAppState();
  const speech = useSpeechSynthesis();
  const audio = useRef<HTMLAudioElement>(null);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="a2-player mb-3">
      <audio
        ref={audio}
        controls
        preload="none"
        src={a2AssetUrl(file)}
        aria-label={label}
        onPlay={(event) => {
          if (!state.settings.soundEnabled) {
            event.currentTarget.pause();
            setError('Ative Enable sound em Settings para ouvir.');
            return;
          }
          speech.stop();
          setError('');
          onPlay?.();
        }}
        onError={() =>
          setError(
            'Não foi possível carregar este áudio. Conecte-se e tente novamente, ou consulte a transcrição.',
          )
        }
        onRateChange={(event) => {
          if (event.currentTarget.playbackRate !== 1) onSlow?.();
        }}
      />
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary ms-2"
        onClick={() => {
          const next = !slow;
          setSlow(next);
          if (audio.current) audio.current.playbackRate = next ? 0.75 : 1;
          if (next) onSlow?.();
        }}
      >
        {slow ? 'Velocidade normal' : 'Ouvir mais devagar'}
      </button>
      {error && (
        <p className="small text-danger mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
