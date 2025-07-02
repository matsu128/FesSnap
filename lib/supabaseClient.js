import { createClient } from '@supabase/supabase-js';

// ローカル開発時は.env.localのSUPABASE_URL, SUPABASE_ANON_KEY、
// Vercel本番やクライアントサイドではNEXT_PUBLIC_を参照
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ※ローカル開発時は.env.localにSUPABASE_URL, SUPABASE_ANON_KEYを記載してください
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 