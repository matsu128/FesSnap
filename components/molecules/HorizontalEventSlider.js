// LP用の過去イベント例を横スライド・無限ループアニメで表示するコンポーネント
// props: events（イベント配列）
import { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Card from '../atoms/Card';

export default function HorizontalEventSlider({ events = [] }) {
  // スライダーの無限ループアニメーション制御
  const controls = useAnimation();
  const sliderRef = useRef(null);

  useEffect(() => {
    // 横スクロールの無限ループアニメーション
    controls.start({
      x: ['0%', '-50%'],
      transition: { repeat: Infinity, duration: 16, ease: 'linear' }
    });
  }, [controls]);

  // イベントカードを2回繰り返して無限ループ感を出す
  const eventCards = [...events, ...events];

  return (
    <section className="w-full overflow-x-hidden py-4">
      <div className="relative w-full max-w-[420px] mx-auto">
        <motion.div
          ref={sliderRef}
          animate={controls}
          className="flex gap-4 w-[200%]"
        >
          {eventCards.map((event, idx) => (
            <Card key={idx} className="min-w-[180px] max-w-[180px] flex-shrink-0 flex flex-col items-center">
              <div className="w-full h-24 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-xl mb-2 flex items-center justify-center">
                <span className="text-xs text-gray-400">画像</span>
              </div>
              <div className="text-sm font-bold text-gray-700 truncate w-full text-center">{event.title}</div>
              <div className="text-xs text-gray-500">{event.date}・{event.location}</div>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 