export interface A2Recording {
  id: string;
  taskId: string;
  createdAt: string;
  blob: Blob;
}
const DB = 'dutch-hub-a2-recordings-v1';
const STORE = 'recordings';
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Armazenamento de gravações indisponível neste navegador.'));
      return;
    }
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error('Não foi possível abrir o armazenamento das gravações.'));
    request.onblocked = () =>
      reject(new Error('Feche outras abas do site para atualizar as gravações.'));
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = operation(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onerror = () => {
      db.close();
      reject(
        new Error('Não foi possível salvar ou ler a gravação. Exporte o áudio antes de sair.'),
      );
    };
    tx.onabort = () => {
      db.close();
      reject(new Error('A gravação não foi salva. Verifique o espaço disponível.'));
    };
  });
}
export const saveA2Recording = (recording: A2Recording) =>
  transaction('readwrite', (store) => store.put(recording));
export const getA2Recording = (id: string): Promise<A2Recording | undefined> =>
  transaction('readonly', (store) => store.get(id));
export const listA2Recordings = (): Promise<A2Recording[]> =>
  transaction('readonly', (store) => store.getAll());
export const deleteA2Recording = (id: string) =>
  transaction('readwrite', (store) => store.delete(id));
export const clearA2Recordings = () => transaction('readwrite', (store) => store.clear());
export const recordingExtension = (type: string) =>
  type.includes('mp4')
    ? 'm4a'
    : type.includes('ogg')
      ? 'ogg'
      : type.includes('wav')
        ? 'wav'
        : 'webm';
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
