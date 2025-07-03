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
      {/* 疑似的な光沢感を上部に追加 */}
      <span
        className="absolute left-0 top-0 w-full h-1/2 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 100%)',
          zIndex: 1,
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
} 