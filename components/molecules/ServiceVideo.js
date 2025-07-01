// LP用のサービス紹介動画エリア
// ダミー動画＋QRコード＋流れ説明をアニメーション付きで表示
import { motion } from 'framer-motion';
import Card from '../atoms/Card';

export default function ServiceVideo() {
  return (
    <section className="w-full flex flex-col items-center mt-20 mb-8">
      {/* サービス動画（ダミー） */}
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
        <Card className="w-[320px] h-[180px] flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
          {/* ダミー動画の代わりにアニメーションするイメージ */}
          <span className="text-lg text-gray-500">サービス動画（ダミー）</span>
        </Card>
      </motion.div>
      {/* QRコードと流れ説明 */}
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }} className="flex flex-col items-center mt-6">
        <div className="flex items-center gap-4">
          <Card className="p-2 flex items-center justify-center">
            {/* QRコードのダミー */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-400">QR</span>
            </div>
          </Card>
          <span className="text-sm text-gray-500">→ イベントサイト表示 → 画像投稿 → 画像閲覧</span>
        </div>
      </motion.div>
    </section>
  );
} 