"use client";
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

function LineAuthPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  
  useEffect(() => {
    const jwt = params.get('jwt');
    
    if (!jwt) {
      // アラートなしでリダイレクト
      router.replace('/');
      return;
    }

    // 高速認証処理
    (async () => {
      try {
        // JWTトークンをデコードしてユーザー情報を取得
        const base64Url = jwt.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        console.log('JWT payload:', payload);
        
        // セッションオブジェクトを作成
        const session = {
          access_token: jwt,
          refresh_token: jwt,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: {
            id: payload.sub,
            aud: payload.aud,
            role: payload.role,
            email: payload.user_metadata?.email,
            user_metadata: payload.user_metadata,
            app_metadata: payload.app_metadata,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        };
        
        // セッションを手動で設定
        const { data, error } = await supabase.auth.setSession(session);
        
        if (!error && data.session) {
          // 認証成功時は静かにホームページにリダイレクト
          console.log('LINE認証成功:', data.session);
          router.replace('/');
        } else {
          // JWTエラーの場合も静かにリダイレクト（ログインは成功している可能性）
          console.log('LINE認証エラー（無視）:', error);
          router.replace('/');
        }
      } catch (e) {
        // 例外が発生しても静かにリダイレクト
        console.log('LINE認証例外（無視）:', e);
        router.replace('/');
      }
    })();
  }, [params, router]);
  
  return (
    <div className="mt-32 text-center">
      <div className="text-gray-400 mb-4">LINE認証中...</div>
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );
}

export default function LineAuthPage() {
  return (
    <Suspense>
      <LineAuthPageInner />
    </Suspense>
  );
} 