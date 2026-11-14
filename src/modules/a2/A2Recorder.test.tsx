// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Blob as NodeBlob } from 'node:buffer';
import { indexedDB } from 'fake-indexeddb';
import { A2Recorder } from './A2Recorder';
import { clearA2Recordings, getA2Recording } from './a2Recordings';
class FakeRecorder {
  static isTypeSupported = (type: string) => type === 'audio/webm;codecs=opus';
  state = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  start() {
    this.state = 'recording';
  }
  stop() {
    if (this.state !== 'recording') throw new Error('invalid state');
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['audio'], { type: this.mimeType }) });
    this.onstop?.();
  }
}
beforeEach(async () => {
  vi.stubGlobal('indexedDB', indexedDB);
  vi.stubGlobal('Blob', NodeBlob);
  await clearA2Recordings();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe('A2 microphone lifecycle', () => {
  it('records, stops all microphone tracks and persists a playable clip', async () => {
    const stop = vi.fn();
    vi.stubGlobal('MediaRecorder', FakeRecorder);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }) },
    });
    const saved = vi.fn();
    const { unmount } = render(
      <A2Recorder
        taskId="a2:transport:practice:speaking:0"
        ids={[]}
        onSave={saved}
        onDelete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Gravar resposta' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Parar gravação' })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Parar gravação' }));
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
    expect(stop).toHaveBeenCalled();
    const clip = await getA2Recording(saved.mock.calls[0][0]);
    expect(await clip?.blob.text()).toBe('audio');
    expect(() => unmount()).not.toThrow();
  });
  it('releases the microphone if recorder construction fails', async () => {
    const stop = vi.fn();
    class Broken extends FakeRecorder {
      constructor() {
        super();
        throw new Error('unsupported');
      }
    }
    vi.stubGlobal('MediaRecorder', Broken);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }) },
    });
    render(
      <A2Recorder
        taskId="a2:transport:practice:speaking:0"
        ids={[]}
        onSave={() => {}}
        onDelete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Gravar resposta' }));
    await waitFor(() => expect(stop).toHaveBeenCalled());
    expect(screen.getByRole('alert').textContent).toContain('microfone');
  });
  it('releases a permission request resolved after the component has unmounted', async () => {
    const stop = vi.fn();
    let resolve!: (value: unknown) => void;
    vi.stubGlobal('MediaRecorder', FakeRecorder);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn(
          () =>
            new Promise((done) => {
              resolve = done;
            }),
        ),
      },
    });
    const { unmount } = render(
      <A2Recorder
        taskId="a2:transport:practice:speaking:0"
        ids={[]}
        onSave={() => {}}
        onDelete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Gravar resposta' }));
    unmount();
    resolve({ getTracks: () => [{ stop }] });
    await waitFor(() => expect(stop).toHaveBeenCalled());
  });
});
