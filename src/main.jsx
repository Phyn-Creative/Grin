import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import InstallPrompt from './InstallPrompt';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('GRIN render failure:', error, info?.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: '32px 20px', background: '#f7f5ef', color: '#183b2b', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: 640, margin: '8vh auto', padding: 24, background: '#fff', border: '1px solid #e5d9c5', borderRadius: 18 }}>
            <h1 style={{ marginTop: 0 }}>GRIN couldn't load this screen</h1>
            <p>The app hit a rendering error. Refresh once; if it continues, share the error details below.</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 12, background: '#f7f5ef', borderRadius: 8 }}>{String(this.state.error?.message || this.state.error)}</pre>
            <button onClick={() => window.location.reload()} style={{ padding: '11px 16px', border: 0, borderRadius: 10, background: '#176447', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Reload GRIN</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <>
        <App />
        <InstallPrompt />
      </>
    </AppErrorBoundary>
  </React.StrictMode>
);

// Keep the PWA service worker registered: background push depends on it.
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => registration.update().catch(() => {}))
      .catch((error) => console.error('GRIN service worker registration failed:', error));
  }, { once: true });
}
