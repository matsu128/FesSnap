// 主催者ページのorganism
// イベント切り替え・地域/日付/カテゴリーのモーダル、イベント詳細編集、QRコード生成・ダウンロード、APIからイベントデータ取得
import { useEffect, useState, useRef } from 'react';
import Header from '../molecules/Header';
import Button from '../atoms/Button';
import Modal from '../atoms/Modal';
import Input from '../atoms/Input';
import Icon from '../atoms/Icon';
// import QRCode from 'qrcode.react';
import QRCode from 'react-qr-code';

function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iP(hone|od|ad)/.test(window.navigator.userAgent);
}

export default function AdminMain() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [region, setRegion] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [qr, setQr] = useState('');
  const qrRef = useRef();
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrJpegUrl, setQrJpegUrl] = useState('');

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
        setRegion('');
        setDate('');
        setCategory('');
        setDesc('');
        setPrice('');
        setCapacity('');
      });
  }, []);

  // イベント切り替え
  const handleEventSwitch = (event) => {
    setSelectedEvent(event);
    setRegion(event.location);
    setDate(event.date);
    setCategory(event.category);
    setDesc(event.description);
    setPrice(event.price);
    setCapacity(event.capacity);
    setShowEventModal(false);
  };

  // QRコード生成
  const handleGenerateQr = () => {
    // 本番用（コメントアウト）
    // const qrValue = `https://fes-snap.com/events/${selectedEvent?.id || ''}`;
    // ローカル用
    const qrValue = `https://fes-snap.vercel.app/events/${selectedEvent?.id || ''}`;
    setQr(qrValue);
  };
  // QRコードをSVG→JPEG変換し、URLをセット
  const handleQrToJpeg = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) {
      alert('QRコードが見つかりません');
      return;
    }
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/jpeg');
      setQrJpegUrl(url);
      setShowQrModal(true);
    };
    img.onerror = () => alert('画像変換に失敗しました');
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };
  // QRダウンロード（JPEG）
  const handleDownloadJpeg = () => {
    if (!qrJpegUrl) return;
    const a = document.createElement('a');
    a.href = qrJpegUrl;
    a.download = 'event-qr.jpg';
    a.click();
  };
  // 共有API
  const handleShare = async () => {
    if (navigator.share && qrJpegUrl) {
      try {
        const res = await fetch(qrJpegUrl);
        const blob = await res.blob();
        const file = new File([blob], 'event-qr.jpg', { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: 'イベントQRコード', text: 'イベント参加用QRコードです' });
      } catch (e) {
        alert('共有に失敗しました');
      }
    } else {
      alert('この端末では共有機能が利用できません');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー */}
      <Header type="default" />
      {/* イベント切り替え・地域・日付・カテゴリー（1行2つずつ） */}
      <div className="w-full max-w-[400px] grid grid-cols-2 gap-4 mt-24 mb-6 px-2 sm:px-0">
        <Button onClick={() => setShowEventModal(true)} className="bg-slate-700 py-3 text-base">イベント切り替え</Button>
        <Button onClick={() => setShowRegionModal(true)} className="bg-slate-700 py-3 text-base">地域</Button>
        <Button onClick={() => setShowDateModal(true)} className="bg-slate-700 py-3 text-base">日付</Button>
        <Button onClick={() => setShowCategoryModal(true)} className="bg-slate-700 py-3 text-base">カテゴリー</Button>
      </div>
      {/* イベント詳細編集（タイトル+例+入力欄、金額・定員は数字＋サフィックス） */}
      <div className="w-full max-w-[400px] flex flex-col gap-6 mb-8 px-2 sm:px-0">
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">タイトル <span className="text-gray-300 text-sm font-normal">例: サマー音楽フェス2025</span></div>
          <Input value={selectedEvent?.title || ''} onChange={e => setSelectedEvent(ev => ({...ev, title: e.target.value.slice(0,20)}))} placeholder="タイトル" maxLength={20} className="mb-1 text-lg py-3" />
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">イベント詳細 <span className="text-gray-300 text-sm font-normal">例: 今年最大の野外フェス</span></div>
          <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="イベント詳細" className="mb-1 text-lg py-3" />
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">金額 <span className="text-gray-300 text-sm font-normal">例: 3000</span></div>
          <div className="flex items-center">
            <Input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="金額" type="number" className="mb-1 flex-1 text-lg py-3" />
            <span className="ml-2 text-gray-500 text-lg">円</span>
          </div>
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">定員 <span className="text-gray-300 text-sm font-normal">例: 100</span></div>
          <div className="flex items-center">
            <Input value={capacity} onChange={e => setCapacity(e.target.value.replace(/[^0-9]/g, ''))} placeholder="定員" type="number" className="mb-1 flex-1 text-lg py-3" />
            <span className="ml-2 text-gray-500 text-lg">人</span>
          </div>
        </div>
      </div>
      {/* QRコード生成・投稿ボタン */}
      <div className="flex w-full max-w-[400px] gap-4 mb-8 px-2 sm:px-0">
        <Button onClick={handleGenerateQr} className="flex-1 text-base py-4 bg-slate-700">QRコード生成</Button>
        <Button onClick={() => alert('投稿処理（ダミー）')} className="flex-1 text-base py-4 bg-slate-700">投稿</Button>
      </div>
      {/* QRコード表示＋ダウンロードボタン */}
      {qr && (
        <div className="w-full max-w-[400px] flex flex-col items-center mb-8 px-2 sm:px-0" ref={qrRef}>
          <div className="cursor-pointer" onClick={handleQrToJpeg}>
            <QRCode value={qr} size={180} bgColor="#fff" fgColor="#1e3a8a" />
          </div>
          <div className="text-xs text-gray-400 mt-1">タップで拡大・保存</div>
        </div>
      )}
      {/* QR拡大モーダル */}
      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)}>
        <div className="flex flex-col items-center">
          {qrJpegUrl && (
            <img src={qrJpegUrl} alt="QRコード" className="w-64 h-64 object-contain bg-white rounded-lg" />
          )}
          <div className="flex gap-4 mt-4">
            <Button onClick={handleDownloadJpeg} className="bg-slate-700 flex items-center gap-1"><Icon type="download" className="w-5 h-5" />保存</Button>
            <Button onClick={handleShare} className="bg-slate-700 flex items-center gap-1"><Icon type="share" className="w-5 h-5" />共有</Button>
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
      {/* 地域モーダル */}
      <Modal isOpen={showRegionModal} onClose={() => setShowRegionModal(false)}>
        <div className="flex flex-col items-center">
          <div className="mb-2 text-lg font-bold">地域選択</div>
          <Input value={region} onChange={e => setRegion(e.target.value)} placeholder="場所を入力" className="mb-2" />
          <Button onClick={() => setShowRegionModal(false)} className="w-32 bg-slate-700">検索</Button>
        </div>
      </Modal>
      {/* 日付モーダル */}
      <Modal isOpen={showDateModal} onClose={() => setShowDateModal(false)}>
        <div className="flex flex-col items-center">
          <div className="mb-2 text-lg font-bold">日付選択</div>
          <Button onClick={() => setDate('今日')} className="mb-1 w-32 bg-slate-700">今日</Button>
          <Button onClick={() => setDate('明日')} className="mb-1 w-32 bg-slate-700">明日</Button>
          <Button onClick={() => setShowDateModal(false)} className="w-32 bg-slate-700">カレンダー（ダミー）</Button>
        </div>
      </Modal>
      {/* カテゴリーモーダル */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
        <div className="flex flex-col items-center">
          <div className="mb-2 text-lg font-bold">カテゴリー選択</div>
          <Button onClick={() => setCategory('音楽フェス')} className="mb-1 w-32 bg-slate-700">音楽フェス</Button>
          <Button onClick={() => setCategory('文化祭')} className="mb-1 w-32 bg-slate-700">文化祭</Button>
          <Button onClick={() => setCategory('地域イベント')} className="mb-1 w-32 bg-slate-700">地域イベント</Button>
          <Button onClick={() => setShowCategoryModal(false)} className="w-32 bg-slate-700">閉じる</Button>
        </div>
      </Modal>
    </div>
  );
} 