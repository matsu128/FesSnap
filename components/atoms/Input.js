// 丸み・シャドウ・アニメーション付きのオシャレなInputコンポーネント
// props: value, onChange, placeholder, type, className
import { motion } from 'framer-motion';

export default function Input({ value, onChange, placeholder = '', type = 'text', className = '' }) {
  return (
    <motion.input
      whileFocus={{ scale: 1.03, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={`rounded-full px-4 py-2 bg-white shadow-inner border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 ${className}`}
    />
  );
} 