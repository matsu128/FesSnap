// 主催者ページのorganism
// タイトル入力とQRコード生成機能のみ
import { useEffect, useState, useRef } from 'react';
import Header from '../molecules/Header';
import Button from '../atoms/Button';
import Modal from '../atoms/Modal';
import Input from '../atoms/Input';
import Icon from '../atoms/Icon';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iP(hone|od|ad)/.test(window.navigator.userAgent);
}

export default function AdminMain() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [qr, setQr] = useState('');
  const qrRef = useRef();
  const qrAreaRef = useRef();
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrJpegUrl, setQrJpegUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [qrTouched, setQrTouched] = useState(false);
  const [qrEventId, setQrEventId] = useState(null);
  const router = useRouter();

  // イベントデータ取得
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setSelectedEvent({
          id: '',
          title: '',
        });
      });
  }, []);

  // イベント切り替え
  const handleEventSwitch = (event) => {
    setSelectedEvent(event);
    setShowEventModal(false);
  };

  // QRコード生成
  const handleGenerateQr = async () => {
    setQrTouched(true);
    setQrError('');
    const newMissing = [];
    if (!selectedEvent?.title) newMissing.push('title');
    setMissingFields(newMissing);
    if (newMissing.length > 0) {
      setQr('');
      return;
    }
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedEvent?.title,
          date: new Date().toISOString().slice(0, 10),
          region: '',
          category: '',
          desc: '',
          price: null,
          capacity: null
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setQrError(data.error || 'イベント作成に失敗しました');
        return;
      }
      // 返却IDでQRコードURL生成
      const qrValue = `https://fes-snap.vercel.app/events/${data.id}/post`;
      setQr(qrValue);
      setQrEventId(data.id);
      // QR画像アップロード＆DB保存
      setTimeout(async () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svg);
        const img = new window.Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const filePath = `${data.id}.png`;
            const { error: uploadError } = await supabase.storage
              .from('event-qrcodes')
              .upload(filePath, blob, { contentType: 'image/png', upsert: true });
            if (uploadError) {
              setQrError('QR画像のアップロードに失敗しました');
              return;
            }
            const { data: urlData } = supabase.storage.from('event-qrcodes').getPublicUrl(filePath);
            const qrUrl = urlData?.publicUrl;
            if (!qrUrl) {
              setQrError('QR画像URLの取得に失敗しました');
              return;
            }
            const { error: dbError } = await supabase
              .from('qrcodes')
              .insert([{ eventId: data.id, qrUrl }]);
            if (dbError) {
              setQrError('QR画像URLの保存に失敗しました');
              return;
            }
          }, 'image/png');
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
      }, 300);
      setTimeout(() => {
        if (qrAreaRef.current) {
          qrAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (e) {
      setQrError('サーバーエラーが発生しました :(');
    }
  };

  // QRコードをJPEGに変換
  const handleQrToJpeg = () => {
    if (!qrRef.current) return;
    html2canvas(qrRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      width: 180,
      height: 180,
    }).then(canvas => {
      const jpegUrl = canvas.toDataURL('image/jpeg', 0.9);
      setQrJpegUrl(jpegUrl);
      setShowQrModal(true);
    });
  };

  // QR情報を画像として保存
  async function handleShareQrInfo() {
    const captureArea = document.getElementById('qr-info-capture-area');
    if (!captureArea) return;
    try {
      const canvas = await html2canvas(captureArea, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 340,
        height: 480,
        useCORS: true,
        allowTaint: true,
      });
      const dataUrl = canvas.toDataURL('image/png', 0.9);
      const link = document.createElement('a');
      link.download = `fes-snap-qr-${selectedEvent?.title || 'event'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('画像保存エラー:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col items-center">
      {/* ヘッダー */}
      <Header type="default" />
      {/* ページタイトル */}
      <div className="w-full max-w-[400px] mt-24 mb-8 px-2 sm:px-0">
        <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 mb-2" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", letterSpacing: '0.05em'}}>
          タイトルを入力して<br className="sm:hidden" />QRコード生成
        </h1>
      </div>
      {/* タイトル入力 */}
      <div className="w-full max-w-[400px] flex flex-col gap-6 mb-8 px-2 sm:px-0">
        <div className="flex flex-col items-center">
          <div className="text-base font-bold text-gray-700 mb-1 text-center">タイトル <span className="text-gray-300 text-sm font-normal">例: サマー音楽フェス2025</span></div>
          <Input value={selectedEvent?.title || ''} onChange={e => {
            setSelectedEvent({ ...selectedEvent, title: e.target.value.slice(0,10) });
          }} placeholder="タイトル" maxLength={10} className={`mb-1 text-lg py-3 text-black text-center ${(qrTouched && missingFields.includes('title')) ? 'ring-2 ring-red-400' : ''}`} />
        </div>
      </div>
      {/* エラー表示 */}
      {qrError && (
        <div className="w-full max-w-[400px] text-center text-red-500 text-base mb-2 font-bold">{qrError}</div>
      )}
      {missingFields.length > 0 && (
        <div className="w-full max-w-[400px] text-center text-red-400 text-sm mb-2 font-semibold tracking-wide">
          {missingFields.includes('title') && 'タイトルが未入力です'}
        </div>
      )}
      {/* QRコード生成ボタン */}
      <div className="flex w-full max-w-[400px] gap-4 mb-8 px-2 sm:px-0">
        <Button onClick={handleGenerateQr} className="flex-1 text-base py-4 bg-slate-700">QRコード生成</Button>
      </div>
      {/* QRコード表示＋投稿ボタン */}
      {qr && (
        <div ref={qrAreaRef} className="w-full max-w-[400px] flex flex-col items-center mb-8 px-2 sm:px-0">
          <div className="cursor-pointer" onClick={handleQrToJpeg} ref={qrRef}>
            <QRCode value={qr} size={180} bgColor="#fff" fgColor="#1e3a8a" />
          </div>
          <div className="text-xs text-gray-400 mt-1">タップで拡大・保存</div>
          {qrEventId && (
            <Button onClick={() => router.push(`/events/${qrEventId}`)} className="w-full mt-2 text-base py-4 bg-blue-600">
              イベントページへ
            </Button>
          )}
        </div>
      )}
      {/* QR拡大モーダル */}
      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)}>
        <div className="flex flex-col items-center w-full relative">
          <button onClick={() => setShowQrModal(false)} className="absolute top-2 right-2 text-3xl text-gray-400 hover:text-gray-700 z-10">×</button>
          <div id="qr-info-capture-area" className="w-full max-w-[340px] mx-auto flex flex-col justify-between items-center mb-2 mt-1 bg-white rounded-xl p-2 shadow-md overflow-hidden" style={{ aspectRatio: '9/16', minHeight: 480, height: 480, fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif" }}>
            <div className="w-full flex flex-col items-center mb-1 mt-2">
              <div className="font-extrabold mb-1 text-center break-words w-full tracking-wide" style={{fontSize:'2.1rem', color:'#193a6a', letterSpacing:'0.06em', lineHeight:1.08}}>{selectedEvent?.title}</div>
            </div>
            <div className="flex flex-col w-full flex-1 justify-center items-center">
              {qrJpegUrl && (
                <img src={qrJpegUrl} alt="QRコード" className="w-40 h-40 object-contain bg-white rounded-lg mx-auto" />
              )}
            </div>
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
            <Button onClick={handleShareQrInfo} className="bg-slate-700 flex items-center gap-1"><Icon type="download" className="w-5 h-5" />保存</Button>
          </div>
          {isIOS() && (
            <div className="mt-3 text-xs text-gray-500 text-center">iPhoneの方は画像を長押しして「写真に追加」してください</div>
          )}
        </div>
      </Modal>
      {/* イベント切り替えモーダル */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)}>
        <div className="flex flex-col items-center">
          <div className="mb-2 text-lg font-bold">イベント切り替え</div>
          {events.map(ev => (
            <Button key={ev.id} onClick={() => handleEventSwitch(ev)} className="mb-1 w-40 bg-slate-700">{ev.title}</Button>
          ))}
        </div>
      </Modal>
    </div>
  );
} 