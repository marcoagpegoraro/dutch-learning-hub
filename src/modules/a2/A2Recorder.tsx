import { useEffect, useRef, useState } from 'react';
import {
  deleteA2Recording,
  downloadBlob,
  getA2Recording,
  recordingExtension,
  saveA2Recording,
} from './a2Recordings';
import { makeA2Id } from './types';
export function A2Recorder({
  taskId,
  ids,
  onSave,
  onDelete,
}: {
  taskId: string;
  ids: string[];
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [clips, setClips] = useState<{ id: string; url: string; blob: Blob }[]>([]);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);
  const key = ids.join('|');
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    void Promise.all(ids.map((id) => getA2Recording(id)))
      .then((items) => {
        if (cancelled) return;
        setClips(
          items
            .filter((item) => !!item)
            .map((item) => {
              const url = URL.createObjectURL(item!.blob);
              urls.push(url);
              return { id: item!.id, url, blob: item!.blob };
            }),
        );
      })
      .catch(() => {
        if (!cancelled && ids.length)
          setError(
            'Alguns áudios não estão neste dispositivo. Importe um portfólio com gravações.',
          );
      });
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
    // ids has the same contents when the parent edits a response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  function stop() {
    if (recorder.current?.state === 'recording') recorder.current.stop();
  }
  async function start() {
    if (!supported || pending || recording) return;
    setError('');
    setPending(true);
    try {
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) {
        input.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = input;
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const media = new MediaRecorder(input, mimeType ? { mimeType } : undefined);
      recorder.current = media;
      const chunks: BlobPart[] = [];
      let failed = false;
      media.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      media.onerror = () => {
        failed = true;
        if (alive.current) setRecording(false);
        if (timeout.current) clearTimeout(timeout.current);
        if (alive.current) setError('A gravação foi interrompida. Tente novamente.');
        input.getTracks().forEach((track) => track.stop());
      };
      media.onstop = async () => {
        input.getTracks().forEach((track) => track.stop());
        if (timeout.current) clearTimeout(timeout.current);
        if (!alive.current || failed) return;
        setRecording(false);
        const blob = new Blob(chunks, { type: media.mimeType || 'audio/webm' });
        if (!blob.size) {
          setError('O áudio ficou vazio. Confira o microfone e tente novamente.');
          return;
        }
        const id = makeA2Id();
        try {
          await saveA2Recording({ id, taskId, createdAt: new Date().toISOString(), blob });
          if (alive.current) onSaveRef.current(id);
        } catch {
          if (alive.current)
            setError(
              'Não foi possível guardar o áudio. Ele foi baixado para você não perder a gravação.',
            );
          downloadBlob(blob, `resposta-${id}.${recordingExtension(blob.type)}`);
        }
      };
      media.start();
      setRecording(true);
      timeout.current = setTimeout(stop, 120000);
    } catch {
      stream.current?.getTracks().forEach((track) => track.stop());
      setRecording(false);
      setError(
        'Não foi possível acessar o microfone. Permita o acesso no navegador ou envie um áudio gravado no seu dispositivo.',
      );
    } finally {
      if (alive.current) setPending(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('audio/') || !file.size || file.size > 20 * 1024 * 1024) {
      setError('Escolha um arquivo de áudio de até 20 MB.');
      return;
    }
    try {
      const id = makeA2Id();
      await saveA2Recording({ id, taskId, createdAt: new Date().toISOString(), blob: file });
      onSave(id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o áudio.');
    }
  }
  return (
    <div className="a2-recorder p-3 border rounded-3 my-3">
      <p className="small text-secondary">
        Sua voz fica neste dispositivo. Você pode ouvir, refazer, baixar e incluir no portfólio para
        o professor. Limite de gravação: 2 minutos por clipe.
      </p>
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <button
          type="button"
          className={`btn ${recording ? 'btn-danger' : 'btn-outline-primary'}`}
          disabled={!supported || pending}
          onClick={recording ? stop : () => void start()}
        >
          {recording ? 'Parar gravação' : pending ? 'Abrindo microfone…' : 'Gravar resposta'}
        </button>
        {!supported && (
          <span className="small">Gravação indisponível aqui. Você pode enviar um arquivo.</span>
        )}
        <label className="btn btn-outline-secondary mb-0">
          Enviar áudio
          <input
            className="visually-hidden"
            type="file"
            disabled={recording || pending}
            accept="audio/*"
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
      </div>
      {recording && (
        <p className="text-danger mt-2" role="status">
          ● Gravando. Pare para guardar sua resposta.
        </p>
      )}
      {error && (
        <p className="text-danger small mt-2" role="alert">
          {error}
        </p>
      )}
      {clips.map((clip, index) => (
        <div className="d-flex flex-wrap gap-2 align-items-center mt-3" key={clip.id}>
          <span className="small">Áudio {index + 1}</span>
          <audio controls src={clip.url} aria-label={`Sua gravação ${index + 1}`} />
          <button
            className="btn btn-sm btn-outline-primary"
            type="button"
            onClick={() =>
              downloadBlob(clip.blob, `resposta-${clip.id}.${recordingExtension(clip.blob.type)}`)
            }
          >
            Baixar
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            type="button"
            onClick={() => {
              if (window.confirm('Excluir esta gravação do dispositivo?'))
                void deleteA2Recording(clip.id)
                  .then(() => onDelete(clip.id))
                  .catch(() => setError('Não foi possível excluir o áudio.'));
            }}
          >
            Excluir
          </button>
        </div>
      ))}
      {ids.length > clips.length && (
        <p className="small text-secondary mt-2">
          Uma gravação referenciada pode não estar neste dispositivo. O backup de progresso simples
          não inclui arquivos; use o portfólio com áudio.
        </p>
      )}
    </div>
  );
}
