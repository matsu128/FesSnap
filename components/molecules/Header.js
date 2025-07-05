// サイト全体で使うモダンなヘッダーコンポーネント
// props: type（'default'|'menu'|'login' などページ種別で切替）、onMenuClick, onLoginClick, menuColor
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '../atoms/Logo';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Header({ type = 'default', onMenuClick, onLoginClick, menuColor }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // ログイン状態を確認
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        setUser(user);
      } catch (error) {
        console.error('Login status check error:', error);
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkLoginStatus();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        alert('ログアウトに失敗しました');
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('ログアウトに失敗しました');
    }
  };

  // ロゴ押下時の遷移先をパスで分岐
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (pathname === '/events') {
      router.push('/');
    } else {
      router.push('/events');
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 backdrop-blur-md shadow-sm fixed top-0 left-0 z-40 bg-transparent">
      {/* ロゴ部分（パスで遷移先分岐） */}
      <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <a href="#" onClick={handleLogoClick} className="focus:outline-none block">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
            <Logo size="text-xl" />
          </motion.div>
        </a>
      </motion.div>
      {/* 右側のボタンやメニュー */}
      <div className="flex items-center gap-2">
        {type === 'login' && !isLoggedIn && (
          <Button onClick={onLoginClick} className="text-sm px-4 py-2">ログイン</Button>
        )}
        {type === 'login' && isLoggedIn && (
          <Button onClick={handleLogout} className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700">ログアウト</Button>
        )}
        {type === 'menu' && !isLoggedIn && (
          <Button onClick={onLoginClick} className="text-sm px-4 py-2">ログイン</Button>
        )}
        {type === 'menu' && isLoggedIn && (
          <button onClick={onMenuClick} className={`p-2 rounded-full transition ${menuColor === 'white' ? '' : 'hover:bg-gray-100'}`}>
            <Icon type="menu" className={`w-7 h-7 ${menuColor === 'white' ? 'text-white' : 'text-gray-700'}`} />
          </button>
        )}
      </div>
    </header>
  );
} 