// 画面遷移用の強調されたオシャレなボタン
// props: children, onClick, className
import Button from '../atoms/Button';
import { motion } from 'framer-motion';

export default function EmphasizedNavButton({ children, onClick, className = '' }) {
  return (
    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
      <Button
        onClick={onClick}
        className={`text-lg px-8 py-4 shadow-xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-blue-400 hover:to-pink-400 ${className}`}
      >
        {children}
      </Button>
    </motion.div>
  );
} 