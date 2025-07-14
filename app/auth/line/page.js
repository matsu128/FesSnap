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
      router.replace('/?error=line_no_session');
      return;
    }

    (async () => {
      try {
        let sessionData;
        if (jwtToken) {
          sessionData = {
            access_token: jwtToken,
            refresh_token: jwtToken,
          };
        } else {
          sessionData = JSON.parse(decodeURIComponent(sessionParam));
        }
        console.log('Session data:', sessionData);
        // セッションをセット
        const { data, error } = await supabase.auth.setSession(sessionData);
        console.log('setSession result:', { data, error });
        // ユーザー取得を最大5回リトライ
        let user = null;
        for (let i = 0; i < 5; i++) {
          const { data: userData } = await supabase.auth.getUser();
          user = userData.user;
          if (user) break;
          await new Promise(res => setTimeout(res, 400));
        }
        if (user) {
          console.log('LINE認証成功:', user);
          router.replace('/');
        } else {
          console.log('LINE認証後もユーザー取得できず');
          router.replace('/?error=line_session_failed');
        }
      } catch (e) {
        console.log('LINE認証例外:', e);
        router.replace('/?error=line_session_exception');
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