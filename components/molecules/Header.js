// サイト全体で使うモダンなヘッダーコンポーネント
// props: type（'default'|'menu'|'login' などページ種別で切替）、onMenuClick, onLoginClick
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Header({ type = 'default', onMenuClick, onLoginClick }) {
  const router = useRouter();
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 z-40">
      {/* ロゴ部分（タップで/に遷移） */}
      <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <button onClick={() => router.push('/')} className="focus:outline-none">
          <span className="text-flowing-gradient text-xl font-extrabold tracking-wide select-none">FesSnap</span>
        </button>
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