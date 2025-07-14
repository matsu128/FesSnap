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

// プランごとの制限
export const planLimits = {
  free: { imageLimit: 25, storagePeriodDays: 7 },
  plus: { imageLimit: 125, storagePeriodDays: 30 },
  pro: { imageLimit: -1, storagePeriodDays: 180 },
};

// ユーザープラン更新関数（ダミー実装、必要に応じてDB更新処理を追加）
export async function updateUserPlan(userId, plan) {
  // ここでDB更新処理を実装する（例: supabase.from('user_plans').update...）
  return { success: true };
} 