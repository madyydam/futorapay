import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tjnhfrsixigwkjebfmyl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Tqobrtiqh-ClSRPhx8lEzw_Gih5uHr3';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing'); // Don't log key in prod

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
