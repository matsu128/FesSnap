"use client";
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

function LineAuthPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  
  useEffect(() => {
    const sessionParam = params.get('session');
    
    if (!sessionParam) {
      console.log('セッションパラメータがありません');
      router.replace('/');
      return;
    }

    // 高速認証処理
    (async () => {
      try {
        // セッションデータをデコード
        const sessionData = JSON.parse(decodeURIComponent(sessionParam));
        console.log('Session data:', sessionData);
        
        // 現在のセッション状態を確認
        const { data: currentSession } = await supabase.auth.getSession();
        console.log('Current session before:', currentSession);
        
        // Supabaseセッションを直接設定
        const { data, error } = await supabase.auth.setSession(sessionData);
        console.log('setSession result:', { data, error });
        
        if (!error && data.session) {
          // 認証成功時は静かにホームページにリダイレクト
          console.log('LINE認証成功:', data.session);
          
          // セッションが正しく設定されたか再確認
          const { data: newSession } = await supabase.auth.getSession();
          console.log('New session after:', newSession);
          
          // 少し待ってからリダイレクト（セッション確立のため）
          setTimeout(() => {
            router.replace('/');
          }, 1000);
        } else {
          // エラーの場合も静かにリダイレクト
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