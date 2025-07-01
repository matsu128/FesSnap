// 白ベースで立体感・シャドウ・丸み・アニメーションを持つ汎用カードコンポーネント
// props: children（カード内要素）、className（追加クラス）、onClick（クリックイベント）
import { motion } from 'framer-motion';

export default function Card({ children, className = '', onClick }) {
  return (
    // motion.divでアニメーションを付与
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.10)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`bg-white rounded-2xl shadow-md p-4 transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
} 