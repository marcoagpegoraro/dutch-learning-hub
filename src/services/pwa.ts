export function serviceWorkerUrl(baseUrl: string): string {
  return `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}sw.js`;
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(serviceWorkerUrl(import.meta.env.BASE_URL));
  });
}
