import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('grin-install-dismissed') === 'yes') setDismissed(true);
    } catch {}

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!installEvent || dismissed) return null;

  const install = async () => {
    if (installing) return;
    setInstalling(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
    } catch {
      setInstallEvent(null);
    } finally {
      setInstalling(false);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('grin-install-dismissed', 'yes'); } catch {}
  };

  return (
    <aside
      role="region"
      aria-label="Install GRIN"
      style={{
        position: 'fixed', zIndex: 10000, left: 'max(12px, env(safe-area-inset-left))',
        right: 'max(12px, env(safe-area-inset-right))', bottom: 'max(12px, env(safe-area-inset-bottom))',
        maxWidth: 520, margin: '0 auto', padding: 14, borderRadius: 18,
        background: 'var(--card, #ffffff)', color: 'var(--text, #17211c)',
        border: '1px solid var(--border, #dfe7e2)', boxShadow: '0 12px 36px rgba(0,0,0,.18)',
        display: 'flex', alignItems: 'center', gap: 12
      }}
    >
      <img src="/icons/grin.svg" alt="" width="44" height="44" style={{ flex: '0 0 44px', borderRadius: 12 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: 'block', fontSize: 15 }}>Get GRIN on your device</strong>
        <span style={{ display: 'block', fontSize: 12, opacity: .78, marginTop: 3 }}>
          Install the app for quicker access from your home screen.
        </span>
      </div>
      <button type="button" onClick={install} disabled={installing} style={{ border: 0, borderRadius: 11, padding: '10px 13px', background: '#19c37d', color: '#062516', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>
        {installing ? 'Opening…' : 'Install'}
      </button>
      <button type="button" onClick={dismiss} aria-label="Dismiss install prompt" style={{ border: 0, background: 'transparent', color: 'inherit', padding: 5, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>
        ×
      </button>
    </aside>
  );
}
