// フェードイン・拡大アニメーション付きのモダンなモーダルコンポーネント
// props: isOpen（表示/非表示）、onClose（閉じる処理）、children（モーダル内要素）、className（追加クラス）
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, children, className = '' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        // オーバーレイ
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* モーダル本体。クリックバブリング防止 */}
          <motion.div
            className={`bg-white rounded-2xl shadow-2xl p-6 max-w-full w-[90vw] sm:w-[400px] ${className}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 