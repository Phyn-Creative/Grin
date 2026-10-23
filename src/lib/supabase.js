import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Keep a missing build-time configuration from crashing the entire React app
// during module evaluation. main.jsx shows a clear setup screen when either
// value is absent, instead of leaving users with a blank white page.
export const supabaseConfigured = Boolean(url && key);
export const supabase = createClient(
  url || 'https://missing-configuration.supabase.co',
  key || 'missing-publishable-key'
);
