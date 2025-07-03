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
            <Button onClick={() => { setLoginModalOpen(true); setShowMenu(false); }} className="w-full text-base py-3 bg-slate-700">ログイン</Button>
            <Button onClick={() => { router.push('/admin'); setShowMenu(false); }} className="w-full text-base py-3 bg-blue-600">新規イベント作成</Button>
          </div>
        </div>
      )}
      {/* LoginModal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      {/* 中央コンテンツ */}
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        {/* タイトル・日付・詳細・金額・人数を1つのカードでまとめて表示（デザイン強化） */}
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
          {/* 日付 */}
          <div className="font-bold text-center w-full tracking-wide mb-1" style={{fontSize:'1.1rem', color:'#0077b6', letterSpacing:'0.04em', fontFamily: "'Baloo 2', 'Rounded Mplus 1c', 'Poppins', 'Quicksand', 'Nunito', 'Rubik', sans-serif"}}>
            <span className="mr-1">日付：</span>{event.date || '未設定'}
          </div>
          {/* 詳細 */}
          <div className="font-semibold text-center w-full tracking-wide mb-1" style={{fontSize:'1.05rem', color:'#3a4a6d', letterSpacing:'0.02em', fontFamily: "'Baloo 2', 'Rounded Mplus 1c', 'Poppins', 'Quicksand', 'Nunito', 'Rubik', sans-serif"}}>
            <span className="mr-1">詳細：</span>{event.description ? event.description : '詳細なし'}
          </div>
          {/* 金額・人数 */}
          <div className="flex flex-row items-center justify-center gap-2 font-bold w-full tracking-wide mt-1" style={{fontSize:'0.98rem', color:'#0077b6', letterSpacing:'0.02em', fontFamily: "'Baloo 2', 'Rounded Mplus 1c', 'Poppins', 'Quicksand', 'Nunito', 'Rubik', sans-serif"}}>
            <span>金額: <span style={{color:'#193a6a'}}>{event.price ? `${event.price}円` : '未設定'}</span></span>
            <span>定員: <span style={{color:'#193a6a'}}>{event.capacity ? `${event.capacity}人` : '未設定'}</span></span>
          </div>
        </Card>
        {/* QRコード＋画像投稿ボタン（縦中央） */}
        <div className="flex w-full max-w-[400px] gap-4 mb-4 px-2 sm:px-0 items-center justify-center">
          <Card className="flex-1 flex items-center justify-center p-2">
            {qrUrl ? (
              <img src={qrUrl} alt="QRコード" className="w-36 h-36 object-contain cursor-pointer" onClick={() => setShowQrModal(true)} />
            ) : (
              <Icon type="qr" className="w-28 h-28 text-gray-400" />
            )}
          </Card>
          <Button onClick={handlePost} className="flex-1 text-base py-4 bg-slate-700">画像投稿</Button>
        </div>
        {/* QR拡大・保存モーダル */}
        <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)}>
          <div className="flex flex-col items-center w-full relative">
            {/* 右上バツボタン */}
            <button onClick={() => setShowQrModal(false)} className="absolute top-2 right-2 text-3xl text-gray-400 hover:text-gray-700 z-10">×</button>
            {/* admin/と同じデザインの拡大表示 */}
            <div ref={qrInfoRef} className="w-full max-w-[340px] mx-auto flex flex-col justify-between items-center mb-2 mt-1 bg-white rounded-xl p-2 shadow-md overflow-hidden" style={{ aspectRatio: '9/16', minHeight: 480, height: 480, fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif" }}>
              {/* 上部：タイトル・日付 */}
              <div className="w-full flex flex-col items-center mb-1 mt-2">
                <div className="font-extrabold mb-1 text-center break-words w-full tracking-wide" style={{fontSize:'2.1rem', color:'#193a6a', letterSpacing:'0.06em', lineHeight:1.08}}>{event.title}</div>
                <div className="font-bold mb-0.5 text-center w-full tracking-wide" style={{fontSize:'1.1rem', color:'#0077b6', letterSpacing:'0.04em'}}>{event.date}</div>
              </div>
              {/* 中央：QRコードのみ */}
              <div className="flex flex-col w-full flex-1 justify-center items-center">
                <div className="flex justify-center items-center w-full min-h-[160px]">
                  {qrBase64 && (
                    <img src={qrBase64} alt="QRコード" className="w-40 h-40 object-contain bg-white rounded-lg mx-auto" />
                  )}
                </div>
              </div>
              {/* 下部：ロゴ */}
              <div className="w-full flex justify-center mb-1" style={{minHeight: '28px'}}>
                <span
                  className="font-extrabold tracking-wide select-none"
                  style={{
                    fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                    fontSize: '1.1rem',
                    color: '#0077b6',
                    letterSpacing: '0.06em',
                    display: 'inline-block',
                    textAlign: 'center',
                    width: 'auto',
                    margin: '0 auto',
                  }}
                >
                  FesSnap
                </span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <Button onClick={handleShareQrInfo} className="bg-slate-700 flex items-center gap-1"><Icon type="download" className="w-5 h-5" />共有</Button>
            </div>
            <div className="mt-3 text-xs text-gray-500 text-center">端末によっては画像を長押しして保存できます</div>
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