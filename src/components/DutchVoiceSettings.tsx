import { useAppState } from '../app/AppStateContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { DutchAudio } from './DutchAudio';

export function DutchVoiceSettings() {
  const { state, updateSettings } = useAppState();
  const speech = useSpeechSynthesis();
  const preference = state.settings.dutchVoiceURI;
  const missing = preference && !speech.voices.some((voice) => voice.voiceURI === preference);
  return (
    <section className="card border-0 shadow-sm mb-4" aria-labelledby="dutchVoiceHeading">
      <div className="card-body p-4">
        <h2 id="dutchVoiceHeading" className="h4 fw-bold">
          Voz e pronúncia em holandês
        </h2>
        <p className="small text-secondary">
          O sistema só reproduz com uma voz identificada como holandesa. A opção automática prioriza
          Nederlands (Nederland), nl-NL. A voz selecionada vale para todas as telas.
        </p>
        <label htmlFor="dutchVoice" className="form-label fw-semibold">
          Escolher voz holandesa
        </label>
        <select
          id="dutchVoice"
          className="form-select mb-2"
          disabled={!speech.supported}
          value={preference}
          onChange={(event) => updateSettings({ dutchVoiceURI: event.target.value })}
        >
          <option value="">Automática · priorizar nl-NL</option>
          {missing && <option value={preference}>Voz salva indisponível · escolha outra</option>}
          {speech.voices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} · {voice.lang}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mb-3"
          disabled={!speech.supported}
          onClick={speech.refreshVoices}
        >
          Atualizar lista de vozes
        </button>
        {speech.voice && (
          <p className="small" role="status">
            Voz em uso: <strong>{speech.voice.name}</strong> · {speech.voice.lang}
          </p>
        )}
        {!speech.enabled && (
          <p className="small text-secondary">Ative Enable sound para ouvir o teste.</p>
        )}
        <div className="alert alert-light border">
          <p lang="nl" className="mb-2">
            Ik heb die film gezien. Goedemorgen. Graag gedaan.
          </p>
          <DutchAudio text="Ik heb die film gezien. Goedemorgen. Graag gedaan." />
        </div>
        <p className="small text-secondary">
          O som do g varia por região: pode ser mais forte ou mais suave. Experimente as vozes nl-NL
          disponíveis e escolha a que você prefere.{' '}
          <a
            href="https://taaladvies.net/uitspraak-harde-of-zachte-g/"
            target="_blank"
            rel="noreferrer"
          >
            Sobre o g holandês
          </a>
          .
        </p>
        {(!speech.supported || !speech.voices.length || missing) && (
          <div className="alert alert-info small mb-0" role="status">
            <p>
              {!speech.supported
                ? 'Este navegador não disponibiliza síntese de fala.'
                : missing
                  ? 'A voz salva não está disponível neste navegador. Selecione Automática ou outra voz holandesa.'
                  : 'Ainda não há uma voz holandesa disponível. A lista pode levar alguns instantes para carregar. Atualize a lista; se continuar vazia, instale uma voz Nederlands no dispositivo e reabra o navegador.'}
            </p>
            <p className="mb-1">Instruções oficiais para adicionar vozes:</p>
            <a
              href="https://support.apple.com/guide/mac-help/mchlp2290/mac"
              target="_blank"
              rel="noreferrer"
            >
              macOS
            </a>
            {' · '}
            <a
              href="https://support.microsoft.com/en-us/accessibility/windows/narrator/appendix-a-supported-languages-and-voices"
              target="_blank"
              rel="noreferrer"
            >
              Windows
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
