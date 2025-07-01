// イベントリストページ用のフィルターバー
// props: onFilterClick（各ボタン押下時の処理）, filterState（現在のフィルタ状態）
import Button from '../atoms/Button';
import { motion } from 'framer-motion';

export default function FilterBar({ onFilterClick, filterState }) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mt-24 mb-4">
      {/* 地域ボタン */}
      <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <Button onClick={() => onFilterClick('region')} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">
          地域 {filterState.region && `: ${filterState.region}`}
        </Button>
      </motion.div>
      {/* 日付ボタン */}
      <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <Button onClick={() => onFilterClick('date')} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">
          日付 {filterState.date && `: ${filterState.date}`}
        </Button>
      </motion.div>
      {/* カテゴリーボタン */}
      <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <Button onClick={() => onFilterClick('category')} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">
          カテゴリー {filterState.category && `: ${filterState.category}`}
        </Button>
      </motion.div>
    </div>
  );
} 