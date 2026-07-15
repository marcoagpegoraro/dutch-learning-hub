import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { serviceWorkerUrl } from './pwa';

describe('PWA configuration', () => {
  it('builds a base-aware service worker URL', () => {
    expect(serviceWorkerUrl('/dutch-learning-hub/')).toBe('/dutch-learning-hub/sw.js');
    expect(serviceWorkerUrl('./')).toBe('./sw.js');
  });
  it('has an installable offline manifest', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('./#/');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});
