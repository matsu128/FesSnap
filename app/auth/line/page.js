"use client";
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

function LineAuthPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  
  useEffect(() => {
    const sessionParam = params.get('session');
    const jwtToken = params.get('jwt');
    
    if (!sessionParam && !jwtToken) {
      console.log('認証パラメータがありません');
      router.replace('/');
      return;
    }

    // 高速認証処理
    (async () => {
      try {
        let sessionData;
        
        if (jwtToken) {
          // JWTトークンのみの場合、セッションデータを構築
          const base64Url = jwtToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          sessionData = {
            access_token: jwtToken,
            refresh_token: jwtToken,
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
        } else {
          // セッションデータをデコード
          sessionData = JSON.parse(decodeURIComponent(sessionParam));
        }
        
        console.log('Session data:', sessionData);
        
        // 現在のセッション状態を確認
        const { data: currentSession } = await supabase.auth.getSession();
        console.log('Current session before:', currentSession);
        
        // セッションを確実に設定
        const { data, error } = await supabase.auth.setSession(sessionData);
        console.log('setSession result:', { data, error });
        
        if (!error && data.session) {
          console.log('LINE認証成功:', data.session);
          
          // セッションが正しく設定されたか再確認
          const { data: newSession } = await supabase.auth.getSession();
          console.log('New session after:', newSession);
          
          // 確実にセッションが設定されるまで待機
          if (newSession.session) {
            console.log('セッション設定完了、リダイレクト');
            router.replace('/');
          } else {
            console.log('セッション設定失敗、再試行');
            // 再試行
            setTimeout(async () => {
              const { data: retryData } = await supabase.auth.setSession(sessionData);
              if (retryData.session) {
                router.replace('/');
              } else {
                router.replace('/');
              }
            }, 1000);
          }
        } else {
          console.log('LINE認証エラー:', error);
          router.replace('/');
        }
      } catch (e) {
        console.log('LINE認証例外:', e);
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