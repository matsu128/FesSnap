// イベント詳細ページのorganism
// Header（ハンバーガーメニュー）、イベント情報、QRコード、画像投稿ボタン、過去イベント画像、戻るボタンなどを含む
// APIからイベントデータ取得
import { useEffect, useState, useRef } from 'react';
import Header from '../molecules/Header';
import Card from '../atoms/Card';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Modal from '../atoms/Modal';
import LoginModal from '../molecules/LoginModal';
import html2canvas from 'html2canvas';
import { useAuth } from '../../contexts/AuthContext';
import QrWithLogo, { getFesSnapLogoDataUrl } from '../atoms/QrWithLogo';
import QrModalWithTitle from '../atoms/QrModalWithTitle';

export default function EventDetailMain() {
  const [event, setEvent] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId;
  const qrInfoRef = useRef();
  const [qrBase64, setQrBase64] = useState('');
  const { isLoggedIn, signOut } = useAuth();

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

  // QRコード画像をBase64に変換
  useEffect(() => {
    async function fetchQrAsBase64(url) {
      if (!url) return '';
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch {
        return '';
      }
    }
    if (qrUrl) {
      fetchQrAsBase64(qrUrl).then(setQrBase64);
    } else {
      setQrBase64('');
    }
  }, [qrUrl]);

  if (!event) return <div className="mt-32 text-center text-gray-400">Loading...</div>;

  // 投稿ページ遷移
  const handlePost = () => router.push(`/events/${eventId}/post`);
  // イベントリストページに戻る
  const handleBack = () => router.push('/events');

  // QR画像共有・保存
  const handleShareQr = async () => {
    if (!qrUrl) return;
    try {
      // QRコード画像の内容がid/post/であることを前提に共有・保存
      if (navigator.share) {
        const res = await fetch(qrUrl);
        const blob = await res.blob();
        const file = new File([blob], 'fesnap-qr.png', { type: blob.type });
        await navigator.share({ files: [file], title: event?.title || 'FesSnapイベントQR', text: 'イベント参加用QRコードです' });
      } else {
        // 非対応端末はダウンロード
        const a = document.createElement('a');
        a.href = qrUrl;
        a.download = 'fesnap-qr.png';
        a.click();
      }
    } catch (e) {
      // 失敗時は何もしない
    }
  };

  // QR拡大モーダルの内容をcanvasで1枚画像として共有
  const handleShareQrInfo = async () => {
    const area = qrInfoRef.current;
    if (!area) return;
    const canvas = await html2canvas(area, {backgroundColor: '#fff'});
    const url = canvas.toDataURL('image/png');
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], 'event-qr-info.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: event?.title || 'イベント情報', text: 'イベント情報とQRコードです' });
      } catch (e) {
        // ユーザーがキャンセルした場合などは何もしない
      }
    } else {
      // 何もしない
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-between bg-white px-2 sm:px-0">
      {/* ヘッダー（ハンバーガーメニュー） */}
      <Header type="menu" onMenuClick={() => setShowMenu(v => !v)} />
      {/* メニュー（ログイン・新規イベント作成） */}
      {showMenu && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowMenu(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[240px] max-w-[90vw] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            {!isLoggedIn ? (
              <Button onClick={() => { setLoginModalOpen(true); setShowMenu(false); }} className="w-full text-base py-3 bg-slate-700">ログイン</Button>
            ) : (
              <Button onClick={async () => { await signOut(); setShowMenu(false); }} className="w-full text-base py-3 bg-red-600">ログアウト</Button>
            )}
            <Button onClick={() => { router.push('/admin'); setShowMenu(false); }} className="w-full text-base py-3 bg-blue-600">新規イベント作成</Button>
          </div>
        </div>
      )}
      {/* LoginModal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      {/* 中央コンテンツ */}
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        {/* タイトルのみを表示 */}
        <Card className="w-full max-w-[400px] mb-4 px-4 py-5 bg-white/90 shadow-lg border border-gray-200 rounded-2xl flex flex-col gap-2 items-center" style={{fontFamily: "'Baloo 2', 'Rounded Mplus 1c', 'Poppins', 'Quicksand', 'Nunito', 'Rubik', sans-serif"}}>
          {/* タイトル（1行・動的フォントサイズ・省略なし） */}
          <div
            className="font-extrabold text-center break-words w-full tracking-wide mb-1"
            style={{
              fontSize:
                event.title && event.title.length <= 8
                  ? '2.1rem'
                  : event.title && event.title.length <= 12
                  ? '1.7rem'
                  : event.title && event.title.length <= 18
                  ? '1.3rem'
                  : '1.05rem',
              color: '#193a6a',
              letterSpacing: '0.06em',
              lineHeight: 1.08,
              fontFamily: "'Baloo 2', 'Rounded Mplus 1c', 'Poppins', 'Quicksand', 'Nunito', 'Rubik', sans-serif"
            }}
          >
            {event.title || 'イベントタイトル未設定'}
          </div>
        </Card>
        {/* QRコード＋画像投稿ボタン（縦中央） */}
        <div className="flex w-full max-w-[400px] gap-4 mb-4 px-2 sm:px-0 items-center justify-center">
          <Card className="flex-1 flex items-center justify-center p-2">
            {qrUrl ? (
              <div className="relative cursor-pointer" onClick={() => setShowQrModal(true)} style={{ width: 180, height: 180 }}>
                <QrWithLogo value={`${window.location.origin}/events/${eventId}/post`} logoDataUrl={getFesSnapLogoDataUrl(120, 36)} size={180} />
              </div>
            ) : (
              <Icon type="qr" className="w-28 h-28 text-gray-400" />
            )}
          </Card>
          <Button onClick={handlePost} className="flex-1 text-base py-4 bg-slate-700">画像投稿</Button>
        </div>
        {/* QRコード下の説明文 */}
        {qrUrl && (
          <div className="text-xs text-gray-400 mt-1">タップで拡大・保存</div>
        )}
        {/* QR拡大・保存モーダル */}
        <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)}>
          <div className="flex flex-col items-center w-full relative">
            <button onClick={() => setShowQrModal(false)} className="absolute top-2 right-2 text-3xl text-gray-400 hover:text-gray-700 z-10">×</button>
            <QrModalWithTitle
              title={event.title}
              qr={`${window.location.origin}/events/${eventId}/post`}
              logoDataUrl={getFesSnapLogoDataUrl(160, 48)}
              size={220}
            />
            <div className="flex gap-4 mt-4">
              <button 
                onClick={handleShareQrInfo} 
                className="bg-gradient-to-r from-slate-700 to-slate-800 flex items-center gap-1 text-white px-4 py-2 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                保存
              </button>
            </div>
            {typeof window !== 'undefined' && /iP(hone|od|ad)/.test(window.navigator.userAgent) && (
              <div className="mt-3 text-xs text-gray-500 text-center">iPhoneの方は画像を長押しして「写真に追加」してください</div>
            )}
          </div>
        </Modal>
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
      </div>
      {/* 下部ボタンエリア（少し上に表示） */}
      <div className="w-full min-w-0 max-w-[400px] md:max-w-2xl flex gap-2 mb-20 md:mx-auto md:justify-center">
        <Button onClick={handleBack} className="w-full min-w-0 text-base py-4 mb-4 bg-slate-700 rounded-full shadow-md">イベントリストへ戻る</Button>
        <Button onClick={() => router.push('/admin')} className="w-full min-w-0 text-base py-4 mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-full shadow-md">
          <span className="block">新規イベント<br />作成</span>
        </Button>
      </div>
    </div>
  );
} 