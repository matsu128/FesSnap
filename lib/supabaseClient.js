import { createClient } from '@supabase/supabase-js';

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数チェック
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が不足しています');
}

// リダイレクトURLの設定
const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: redirectUrl
  }
}); 