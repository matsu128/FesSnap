// イベント詳細ページのorganism
// Header（ハンバーガーメニュー）、イベント情報、QRコード、画像投稿ボタン、過去イベント画像、戻るボタンなどを含む
// APIからイベントデータ取得
import { useEffect, useState } from 'react';
import Header from '../molecules/Header';
import Card from '../atoms/Card';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function EventDetailMain() {
  const [event, setEvent] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId;

  // イベントデータ取得
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvent(data.find(e => e.id === eventId)));
    // QR画像URL取得
    const fetchQrUrl = async () => {
      if (!eventId) return;
      const { data, error } = await supabase
        .from('qrcodes')
        .select('qrUrl')
        .eq('eventId', eventId)
        .single();
      if (!error && data?.qrUrl) setQrUrl(data.qrUrl);
    };
    fetchQrUrl();
  }, [eventId]);

  if (!event) return <div className="mt-32 text-center text-gray-400">Loading...</div>;

  // 投稿ページ遷移
  const handlePost = () => router.push(`/events/${eventId}/post`);
  // イベントリストページに戻る
  const handleBack = () => router.push('/events');

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー（ハンバーガーメニュー） */}
      <Header type="menu" onMenuClick={() => setShowMenu(v => !v)} />
      {/* メニュー（ダミー） */}
      {showMenu && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowMenu(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[200px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <Button onClick={() => alert('ログイン（ダミー）')}>ログイン</Button>
          </div>
        </div>
      )}
      {/* タイトル・日付・場所 */}
      <div className="mt-24 mb-2 w-full max-w-[400px] px-4">
        <div className="flex justify-between items-center">
          <div className="text-lg sm:text-xl font-bold text-gray-700">{event.title}</div>
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
          <span>{event.date}</span>
          <span>{event.location}</span>
        </div>
      </div>
      {/* 詳細説明・金額・参加人数 */}
      <Card className="w-full max-w-[400px] mb-4 px-2 sm:px-0">
        <div className="text-sm sm:text-base text-gray-700 mb-1">{event.description}</div>
        <div className="flex justify-between text-xs sm:text-sm text-gray-500">
          <span>金額: {event.price}円</span>
          <span>定員: {event.capacity}人</span>
        </div>
      </Card>
      {/* QRコード＋画像投稿ボタン */}
      <div className="flex w-full max-w-[400px] gap-4 mb-4 px-2 sm:px-0">
        <Card className="flex-1 flex items-center justify-center p-2">
          {qrUrl ? (
            <img src={qrUrl} alt="QRコード" className="w-16 h-16 object-contain" />
          ) : (
            <Icon type="qr" className="w-12 h-12 text-gray-400" />
          )}
        </Card>
        <Button onClick={handlePost} className="flex-1 text-base py-4 bg-slate-700">画像投稿</Button>
      </div>
      {/* 過去イベント画像（課金時のみ） */}
      {event.pastEvents && event.pastEvents.length > 0 && (
        <div className="w-full max-w-[400px] mb-4 px-2 sm:px-0">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">過去イベント</div>
          {event.pastEvents.slice(0, 6).map((pe, i) => (
            <div key={i} className="flex items-center mb-1">
              <span className="text-xs sm:text-sm text-gray-400 w-20">{pe.date} {pe.location}</span>
              <div className="flex gap-1 flex-1">
                {pe.images.slice(0, 3).map((img, j) => (
                  <div key={j} className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-xs text-gray-400">画像</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 戻るボタン */}
      <Button onClick={handleBack} className="mb-8 mt-2 px-8 py-3 bg-slate-700 w-full max-w-[400px]">イベントリストへ戻る</Button>
    </div>
  );
} 