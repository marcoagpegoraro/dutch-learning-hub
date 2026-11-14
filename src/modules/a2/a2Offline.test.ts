import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
async function requestRange(range: string) {
  const handlers: Record<string, (event: unknown) => void> = {};
  const fetch = vi.fn();
  const bytes = '0123456789';
  runInNewContext(readFileSync('public/sw.js', 'utf8'), {
    self: {
      location: { origin: 'https://example.test' },
      addEventListener: (name: string, handler: (event: unknown) => void) => {
        handlers[name] = handler;
      },
    },
    caches: {
      open: async () => ({
        match: async () => new Response(bytes, { headers: { 'Content-Type': 'audio/mp4' } }),
      }),
    },
    fetch,
    URL,
    Response,
  });
  let result!: Promise<Response>;
  handlers.fetch({
    request: new Request('https://example.test/audio/a2/transport-practice-conversation.m4a', {
      headers: { Range: range },
    }),
    respondWith: (value: Promise<Response>) => {
      result = value;
    },
  });
  return { response: await result, fetch };
}
describe('offline course audio seeking', () => {
  it('serves cached byte ranges for native audio playback without a network request', async () => {
    const { response, fetch } = await requestRange('bytes=2-5');
    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 2-5/10');
    expect(await response.text()).toBe('2345');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('supports suffix and open-ended ranges', async () => {
    expect(await (await requestRange('bytes=-3')).response.text()).toBe('789');
    expect(await (await requestRange('bytes=7-')).response.text()).toBe('789');
  });
  it('rejects unsatisfiable ranges rather than returning a corrupted clip', async () => {
    expect((await requestRange('bytes=90-100')).response.status).toBe(416);
    expect((await requestRange('bytes=-0')).response.status).toBe(416);
  });
});
