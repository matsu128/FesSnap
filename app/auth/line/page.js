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
      alert('認証トークンがありません');
      router.replace('/');
      return;
    }

    // 高速認証処理
    (async () => {
      try {
        // signInWithCustomTokenメソッドの存在確認
        if (typeof supabase.auth.signInWithCustomToken !== 'function') {
          alert('認証機能が利用できません。ページを再読み込みしてください。');
          router.replace('/');
          return;
        }
        
        // 即座に認証実行
        const { data, error } = await supabase.auth.signInWithCustomToken(jwt);
        
        if (!error) {
          // 認証成功時は即座にホームページにリダイレクト
          router.replace('/');
        } else {
          alert('LINE認証に失敗しました: ' + error.message);
          router.replace('/');
        }
      } catch (e) {
        alert('LINE認証でエラーが発生しました: ' + e.message);
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