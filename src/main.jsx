import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import InstallPrompt from './InstallPrompt';
import { supabaseConfigured } from './lib/supabase';
import './styles.css';

function ConfigurationError() {
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'24px',background:'#f7f4ec',color:'#173d2b',fontFamily:'system-ui,sans-serif'}}>
      <section style={{width:'min(100%,520px)',padding:'28px',border:'1px solid #e3d9c4',borderRadius:'20px',background:'#fffdf8',boxShadow:'0 16px 48px rgba(23,61,43,.08)'}}>
        <div style={{fontSize:'12px',fontWeight:800,letterSpacing:'.18em',color:'#a17a32'}}>GRIN · STARTUP CHECK</div>
        <h1 style={{fontSize:'28px',lineHeight:1.15,margin:'12px 0'}}>GRIN needs its backend settings</h1>
        <p style={{fontSize:'15px',lineHeight:1.65,color:'#4d5a51'}}>The app loaded, but its Supabase configuration was not included in this build. This is a deployment setting issue, not a problem with your account or messages.</p>
        <p style={{fontSize:'14px',lineHeight:1.6,color:'#4d5a51'}}>In the Cloudflare build environment, set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, then rebuild and deploy GRIN.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {supabaseConfigured ? <><App /><InstallPrompt /></> : <ConfigurationError />}
  </React.StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // The app remains fully usable online if offline support cannot register.
    });
  });
}
