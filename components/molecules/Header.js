// サイト全体で使うモダンなヘッダーコンポーネント
// props: type（'default'|'menu'|'login' などページ種別で切替）、onMenuClick, onLoginClick
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '../atoms/Logo';
import Link from 'next/link';

export default function Header({ type = 'default', onMenuClick, onLoginClick }) {
  const router = useRouter();
  const pathname = usePathname();
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
        {type === 'login' && (
          <Button onClick={onLoginClick} className="text-sm px-4 py-2">ログイン</Button>
        )}
        {type === 'menu' && (
          <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-100 transition">
            <Icon type="menu" className="w-7 h-7 text-gray-700" />
          </button>
        )}
      </div>
    </header>
  );
} 