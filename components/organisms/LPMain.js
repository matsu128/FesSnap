// LP（紹介ページ）のメイン部分を構成するorganism
// Header, ServiceVideo, HorizontalEventSlider, EmphasizedNavButtonを組み合わせて、ページ遷移も実装
// APIからダミーイベントデータを取得してスライダーに渡す
import { useEffect, useState } from 'react';
import Header from '../molecules/Header';
import ServiceVideo from '../molecules/ServiceVideo';
import HorizontalEventSlider from '../molecules/HorizontalEventSlider';
import EmphasizedNavButton from '../molecules/EmphasizedNavButton';
import { useRouter } from 'next/navigation';
import Logo from '../atoms/Logo';

export default function LPMain() {
  // イベントデータの状態管理
  const [events, setEvents] = useState([]);
  const router = useRouter();

  // APIからダミーイベントデータを取得
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  // イベントページへの遷移
  const handleEventPage = () => {
    router.push('/events');
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー */}
      <Header type="default" />
      {/* タイトル */}
      <div className="mt-24 mb-4 text-center max-w-[400px] w-full px-4">
        <h1 className="drop-shadow-lg animate-fadein"><Logo size="text-3xl sm:text-4xl" /></h1>
        <p className="mt-2 text-base sm:text-lg text-gray-600 animate-fadein delay-100">イベント参加者限定のリアルタイム写真共有サービス</p>
      </div>
      {/* サービス紹介動画エリア */}
      <div className="w-full max-w-[400px] px-2 sm:px-0">
        <ServiceVideo />
      </div>
      {/* 過去イベント例スライダー */}
      <div className="w-full max-w-[400px] px-2 sm:px-0">
        <HorizontalEventSlider events={events} />
      </div>
      {/* イベントページ遷移ボタン（画面下部に固定・中央表示） */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[400px] flex justify-center z-50 px-2 sm:px-0">
        <EmphasizedNavButton onClick={handleEventPage}>
          イベントページへ
        </EmphasizedNavButton>
      </div>
    </div>
  );
} 