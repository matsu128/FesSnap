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
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ja } from 'date-fns/locale';
import LPMain from './LPMain';
import Logo from '../atoms/Logo';
import html2canvas from 'html2canvas';

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
  const qrAreaRef = useRef();
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrJpegUrl, setQrJpegUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [calendarDate, setCalendarDate] = useState(date ? new Date(date) : null);
  const [regionSearch, setRegionSearch] = useState('');
  const [regionResults, setRegionResults] = useState([]);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [qrTouched, setQrTouched] = useState(false);

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
    setQrTouched(true);
    setQrError('');
    const newMissing = [];
    if (!selectedEvent?.title) newMissing.push('title');
    if (!date) newMissing.push('date');
    setMissingFields(newMissing);
    if (newMissing.length > 0) {
      setQr('');
      return;
    }
    const qrValue = `https://fes-snap.vercel.app/events/${selectedEvent?.id || ''}`;
    setQr(qrValue);
    setTimeout(() => {
      if (qrAreaRef.current) {
        qrAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // 入力値の変化でmissingFieldsを自動で更新（QRボタン押下後のみ）
  useEffect(() => {
    if (!qrTouched) return;
    const newMissing = [];
    if (!selectedEvent?.title) newMissing.push('title');
    if (!date) newMissing.push('date');
    setMissingFields(newMissing);
  }, [selectedEvent?.title, date, qrTouched]);

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
  // QR拡大モーダルの内容をcanvasで1枚画像として共有
  async function handleShareQrInfo() {
    const area = document.getElementById('qr-info-capture-area');
    if (!area) return;
    const canvas = await html2canvas(area, {backgroundColor: '#fff'});
    const url = canvas.toDataURL('image/png');
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], 'event-qr-info.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: selectedEvent?.title || 'イベント情報', text: 'イベント情報とQRコードです' });
      } catch (e) {
        // ユーザーがキャンセルした場合などは何もしない
      }
    } else {
      alert('この端末では画像の共有がサポートされていません');
    }
  }

  // QR生成ボタンのバリデーション
  const isQrReady = selectedEvent?.title && date;

  // QR拡大モーダルの内容をcanvasで1枚画像として保存
  function handleSaveQrInfoAsImage() {
    const area = document.getElementById('qr-info-capture-area');
    if (!area) return;
    html2canvas(area, {backgroundColor: '#fff'}).then(canvas => {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event-qr-info.png';
      a.click();
    });
  }

  // 日付選択時に赤枠を即消す
  useEffect(() => {
    if (qrTouched && date && missingFields.includes('date')) {
      setMissingFields(missingFields.filter(f => f !== 'date'));
    }
  }, [date]);
  // タイトル入力時に赤枠を即消す
  useEffect(() => {
    if (qrTouched && selectedEvent?.title && missingFields.includes('title')) {
      setMissingFields(missingFields.filter(f => f !== 'title'));
    }
  }, [selectedEvent?.title]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー */}
      <Header type="default" />
      {/* カテゴリー・日付ボタンのみ */}
      <div className="w-full max-w-[400px] grid grid-cols-2 gap-4 mt-24 mb-6 px-2 sm:px-0">
        <Button onClick={() => setShowCategoryModal(true)} className={`bg-slate-700 py-3 text-base ${category ? 'ring-2 ring-blue-400' : ''}`}>{category || 'カテゴリー'}</Button>
        <Button onClick={() => setShowDateModal(true)} className={`bg-slate-700 py-3 text-base flex items-center justify-center ${(date && !missingFields.includes('date')) ? 'ring-2 ring-blue-400' : ''} ${(qrTouched && missingFields.includes('date')) ? 'ring-2 ring-red-400' : ''}`}>
          <Icon type="calendar" className="w-5 h-5 mr-2" />{date || '日付'}
        </Button>
      </div>
      {/* イベント詳細編集（タイトル+例+入力欄、金額・定員は数字＋サフィックス） */}
      <div className="w-full max-w-[400px] flex flex-col gap-6 mb-8 px-2 sm:px-0">
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">タイトル <span className="text-gray-300 text-sm font-normal">例: サマー音楽フェス2025</span></div>
          <Input value={selectedEvent?.title || ''} onChange={e => {
            setSelectedEvent({ ...selectedEvent, title: e.target.value.slice(0,10) });
          }} placeholder="タイトル" maxLength={10} className={`mb-1 text-lg py-3 text-black ${(qrTouched && missingFields.includes('title')) ? 'ring-2 ring-red-400' : ''}`} />
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">エリア <span className="text-gray-300 text-sm font-normal">例: 渋谷駅前</span></div>
          <Input value={region} onChange={e => setRegion(e.target.value.slice(0,10))} placeholder="エリア" maxLength={10} className="mb-1 text-lg py-3 text-black" />
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">詳細 <span className="text-gray-300 text-sm font-normal">例: 受付横</span></div>
          <Input value={desc} onChange={e => setDesc(e.target.value.slice(0,10))} placeholder="詳細" maxLength={10} className="mb-1 text-lg py-3 text-black" />
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">参加費 <span className="text-gray-300 text-sm font-normal">例: 3000</span> <span className="text-xs text-gray-400 ml-2">任意</span></div>
          <div className="flex items-center">
            <Input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="参加費" type="number" className="mb-1 flex-1 text-lg py-3 text-black" />
            <span className="ml-2 text-gray-500 text-lg">円</span>
          </div>
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">人数 <span className="text-gray-300 text-sm font-normal">例: 100</span> <span className="text-xs text-gray-400 ml-2">任意</span></div>
          <div className="flex items-center">
            <Input value={capacity} onChange={e => setCapacity(e.target.value.replace(/[^0-9]/g, ''))} placeholder="人数" type="number" className="mb-1 flex-1 text-lg py-3 text-black" />
            <span className="ml-2 text-gray-500 text-lg">人</span>
          </div>
        </div>
      </div>
      {/* エラー表示（QRボタン直上） */}
      {qrError && <div className="w-full max-w-[400px] text-center text-red-500 text-base mb-2 font-bold">{qrError}</div>}
      {missingFields.length > 0 && (
        <div className="w-full max-w-[400px] text-center text-red-400 text-sm mb-2 font-semibold tracking-wide">
          {missingFields.includes('title') && !missingFields.includes('date') && 'タイトルが未入力です'}
          {!missingFields.includes('title') && missingFields.includes('date') && '日付が未入力です'}
          {missingFields.includes('title') && missingFields.includes('date') && 'タイトル・日付が未入力です'}
        </div>
      )}
      {/* QRコード生成ボタンのみ */}
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
          <Button onClick={() => alert('投稿処理（ダミー）')} className="w-full mt-6 text-base py-4 bg-slate-700">投稿</Button>
        </div>
      )}
      {/* QR拡大モーダル */}
      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)}>
        <div className="flex flex-col items-center w-full relative">
          {/* 右上バツボタン */}
          <button onClick={() => setShowQrModal(false)} className="absolute top-2 right-2 text-3xl text-gray-400 hover:text-gray-700 z-10">×</button>
          {/* 入力情報一覧＋QR＋ロゴを1枚画像化できるようにラップ */}
          <div id="qr-info-capture-area" className="w-full max-w-[340px] mx-auto flex flex-col items-center mb-2 mt-1 bg-white rounded-xl p-2 shadow-md" style={{ aspectRatio: '9/16', minHeight: 480, justifyContent: 'flex-start', fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif" }}>
            <div className="w-full flex flex-col items-center mb-1">
              <div className="font-extrabold mb-1 text-center break-words w-full tracking-wide" style={{fontSize:'2.1rem', color:'#193a6a', letterSpacing:'0.06em', lineHeight:1.08}}>{selectedEvent?.title}</div>
              <div className="font-bold mb-0.5 text-center w-full tracking-wide" style={{fontSize:'1.1rem', color:'#0077b6', letterSpacing:'0.04em'}}>{date}</div>
            </div>
            {region && <div className="font-bold mb-0.5 text-center w-full tracking-wide" style={{fontSize:'1.05rem', color:'#1565a5', letterSpacing:'0.03em'}}>エリア: <span style={{color:'#193a6a'}}>{region}</span></div>}
            {category && <div className="font-bold mb-0.5 text-center w-full tracking-wide" style={{fontSize:'1.05rem', color:'#1565a5', letterSpacing:'0.03em'}}>カテゴリー: <span style={{color:'#193a6a'}}>{category}</span></div>}
            {desc && <div className="font-semibold mb-0.5 text-center w-full tracking-wide" style={{fontSize:'1.05rem', color:'#3a4a6d', letterSpacing:'0.02em'}}>{desc}</div>}
            {(price || capacity) && (
              <div className="flex flex-row items-center justify-center gap-2 font-bold mb-0.5 w-full tracking-wide" style={{fontSize:'0.98rem', color:'#0077b6', letterSpacing:'0.02em'}}>
                {price && <span>参加費: <span style={{color:'#193a6a'}}>{price}円</span></span>}
                {capacity && <span>人数: <span style={{color:'#193a6a'}}>{capacity}人</span></span>}
              </div>
            )}
            {qrJpegUrl && (
              <img src={qrJpegUrl} alt="QRコード" className="w-40 h-40 object-contain bg-white rounded-lg mt-2 mx-auto" />
            )}
            {/* ロゴ（タイトルと同じデザイン・小さめ・ブルーオーシャン色） */}
            <div className="w-full flex justify-center mt-3 mb-2" style={{minHeight: '28px'}}>
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
      {/* 地域モーダル */}
      <Modal isOpen={showRegionModal} onClose={() => setShowRegionModal(false)}>
        <div className="flex flex-col items-center w-full max-w-xs mx-auto p-2">
          <div className="mb-2 text-lg font-bold">エリア検索</div>
          <Input value={regionSearch} onChange={e => setRegionSearch(e.target.value)} placeholder="都道府県・市区町村名で検索" className="mb-2 text-black" />
          <Button onClick={() => { setRegion(''); setShowRegionModal(false); }} className="w-32 bg-red-200 text-red-700">取り消し</Button>
        </div>
      </Modal>
      {/* 日付モーダル（カレンダーUI） */}
      <Modal isOpen={showDateModal} onClose={() => setShowDateModal(false)}>
        <div className="flex flex-col items-center">
          <div className="mb-2 text-lg font-bold">日付選択</div>
          <ReactDatePicker
            selected={calendarDate}
            onChange={dateObj => {
              setCalendarDate(dateObj);
              setDate(dateObj ? dateObj.toISOString().slice(0, 10) : '');
              if (missingFields.includes('date') && dateObj) {
                setMissingFields(missingFields.filter(f => f !== 'date'));
              }
              setShowDateModal(false);
            }}
            minDate={new Date()}
            locale={ja}
            dateFormat="yyyy年MM月dd日"
            inline
            className="rounded-lg border border-gray-300 shadow-sm"
          />
        </div>
      </Modal>
      {/* カテゴリーモーダル */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
        <div className="flex flex-col items-center">
          <div className="mb-2 text-lg font-bold">カテゴリー選択</div>
          <Button onClick={() => { setCategory('音楽フェス'); setShowCategoryModal(false); }} className="mb-1 w-32 bg-slate-700">音楽フェス</Button>
          <Button onClick={() => { setCategory('文化祭'); setShowCategoryModal(false); }} className="mb-1 w-32 bg-slate-700">文化祭</Button>
          <Button onClick={() => { setCategory('地域イベント'); setShowCategoryModal(false); }} className="mb-1 w-32 bg-slate-700">地域イベント</Button>
          <Button onClick={() => { setCategory('その他'); setShowCategoryModal(false); }} className="w-32 bg-slate-700">その他</Button>
        </div>
      </Modal>
    </div>
  );
} 