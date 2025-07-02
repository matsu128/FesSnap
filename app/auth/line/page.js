"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function LineAuthPage() {
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