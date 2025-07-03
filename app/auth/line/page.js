"use client";
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

function LineAuthPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const jwt = params.get('jwt');
    if (!jwt) return;
    (async () => {
      const { error } = await supabase.auth.signInWithCustomToken(jwt);
      if (!error) {
        router.replace('/');
      } else {
        alert('LINE認証に失敗しました');
        router.replace('/');
      }
    })();
  }, [params, router]);
  return <div className="mt-32 text-center text-gray-400">LINE認証中...</div>;
}

export default function LineAuthPage() {
  return (
    <Suspense>
      <LineAuthPageInner />
    </Suspense>
  );
} 