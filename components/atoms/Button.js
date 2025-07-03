// 落ち着いたブルーグレー/ネイビー/グレー系の単色ボタンデザイン
// スマホでのサイズ感も最適化
// props: children, onClick, className, type, active
import { motion } from 'framer-motion';

export default function Button({ children, onClick, className = '', type = 'button', active = false }) {
  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        boxShadow: '0 12px 32px 0 rgba(56,189,248,0.18)',
      }}
      whileTap={{
        scale: 0.96,
        boxShadow: '0 4px 12px 0 rgba(30,58,138,0.28)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      type={type}
      onClick={onClick}
      className={`
        flowing-gradient
        relative
        rounded-full
        px-4 py-2
        min-w-[80px]
        font-bold
        text-white
        border border-green-200
        shadow-2xl shadow-blue-200/60
        focus:outline-none
        focus:ring-2 focus:ring-green-100
        active:scale-98
        transition-all duration-200
        ${className}
      `}
      style={undefined}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
} 