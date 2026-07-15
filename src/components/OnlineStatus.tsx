import { useEffect, useState } from 'react';
export function OnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online ? null : (
    <div className="offline-banner text-center py-2" role="status">
      <i className="bi bi-wifi-off me-2" />
      You’re offline. Saved lessons and exercises remain available.
    </div>
  );
}
