/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not configured - auth will be disabled');
}

export const supabase = createClientIfAvailable(supabaseUrl, supabaseServiceKey);

function createClientIfAvailable(url: string | undefined, key: string | undefined) {
  if (!url || !key) {
    console.warn('⚠️ Supabase credentials not configured - auth will be disabled');
    return null;
  }
  return createClient(url, key);
}


export const isAuthEnabled = !!supabase;
