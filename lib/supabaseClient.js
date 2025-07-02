import { createClient } from '@supabase/supabase-js';

// Vercelの環境変数を優先して参照
const supabaseUrl = process.env.VERCEL_ENV ? process.env.SUPABASE_URL : process.env.SUPABASE_URL; // ローカル開発時も同じ変数名
const supabaseAnonKey = process.env.VERCEL_ENV ? process.env.SUPABASE_ANON_KEY : process.env.SUPABASE_ANON_KEY; // ローカル開発時も同じ変数名

// ※ローカル開発時は.env.localにSUPABASE_URL, SUPABASE_ANON_KEYを記載してください
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 