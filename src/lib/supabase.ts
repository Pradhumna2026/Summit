import { createClient } from '@supabase/supabase-js';

const getEnvValue = (key: string): string | null => {
    const value = import.meta.env[key];
    if (!value || value === 'undefined' || value === 'null') return null;
    return value.trim();
};

const supabaseUrl = getEnvValue('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvValue('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = () => {
    if (!supabaseUrl || !supabaseAnonKey) return false;
    try {
        new URL(supabaseUrl);
        return true;
    } catch (e) {
        return false;
    }
};

// Fallback to a valid-looking URL to prevent createClient from crashing the app
const safeUrl = isSupabaseConfigured() && supabaseUrl ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured() && supabaseAnonKey ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(safeUrl, safeKey);
