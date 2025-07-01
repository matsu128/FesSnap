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

function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iP(hone|od|ad)/.test(window.navigator.userAgent);
}

// サンプル都道府県＋市区町村＋町データ
const PREFS = [
  { name: '東京都', cities: [
    { name: '新宿区', towns: ['西新宿', '歌舞伎町', '高田馬場'] },
    { name: '渋谷区', towns: ['渋谷', '恵比寿', '代官山'] }
  ] },
  { name: '大阪府', cities: [
    { name: '大阪市', towns: ['北区', '中央区', '浪速区'] },
    { name: '堺市', towns: ['堺区', '中区', '南区'] }
  ] }
];

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
  const [qrError, setQrError] = useState('');
  const [calendarDate, setCalendarDate] = useState(date ? new Date(date) : null);
  const [regionSearch, setRegionSearch] = useState('');
  const [regionResults, setRegionResults] = useState([]);
  const [selectedPref, setSelectedPref] = useState(null);
  const [validate, setValidate] = useState(false);

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
    setValidate(true);
    if (!isQrReady) {
      setQrError('タイトルと日付は必須です');
      return;
    }
    setQrError('');
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
        // 失敗時は何もしない
      }
    } else {
      // 失敗時は何もしない
    }
  };

  // QR生成ボタンのバリデーション
  const isQrReady = selectedEvent?.title && date;
  const missingFields = [];
  if (validate && !selectedEvent?.title) missingFields.push('title');
  if (validate && !date) missingFields.push('date');

  // 地域検索
  const handleRegionSearch = () => {
    const results = [];
    PREFS.forEach(pref => {
      if (regionSearch && !pref.name.includes(regionSearch) && !pref.cities.some(c => c.name.includes(regionSearch) || c.towns.some(t => t.includes(regionSearch)))) return;
      results.push({ pref: pref.name, cities: pref.cities });
    });
    setRegionResults(results);
    setSelectedPref(null);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー */}
      <Header type="default" />
      {/* イベント切り替え・地域・日付・カテゴリー（1行2つずつ） */}
      <div className="w-full max-w-[400px] grid grid-cols-2 gap-4 mt-24 mb-6 px-2 sm:px-0">
        <Button onClick={() => setShowRegionModal(true)} className={`bg-slate-700 py-3 text-base ${region ? 'ring-2 ring-blue-400' : ''}`}>{region || '地域'}</Button>
        <Button onClick={() => setShowDateModal(true)} className={`bg-slate-700 py-3 text-base flex items-center justify-center ${date ? 'ring-2 ring-blue-400' : ''}`}>
          <Icon type="calendar" className="w-5 h-5 mr-2" />{date || '日付'}
        </Button>
        <Button onClick={() => setShowCategoryModal(true)} className={`bg-slate-700 py-3 text-base ${category ? 'ring-2 ring-blue-400' : ''}`}>{category || 'カテゴリー'}</Button>
      </div>
      {/* イベント詳細編集（タイトル+例+入力欄、金額・定員は数字＋サフィックス） */}
      <div className="w-full max-w-[400px] flex flex-col gap-6 mb-8 px-2 sm:px-0">
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">タイトル <span className="text-gray-300 text-sm font-normal">例: サマー音楽フェス2025</span></div>
          <Input value={selectedEvent?.title || ''} onChange={e => setSelectedEvent(ev => ({...ev, title: e.target.value.slice(0,20)}))} placeholder="タイトル" maxLength={20} className={`mb-1 text-lg py-3 ${missingFields.includes('title') ? 'ring-2 ring-red-400' : ''}`} />
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">イベント詳細 <span className="text-gray-300 text-sm font-normal">例: 今年最大の野外フェス</span></div>
          <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="イベント詳細" className="mb-1 text-lg py-3" />
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">参加費 <span className="text-gray-300 text-sm font-normal">例: 3000</span> <span className="text-xs text-gray-400 ml-2">任意</span></div>
          <div className="flex items-center">
            <Input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="参加費" type="number" className="mb-1 flex-1 text-lg py-3" />
            <span className="ml-2 text-gray-500 text-lg">円</span>
          </div>
        </div>
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">人数 <span className="text-gray-300 text-sm font-normal">例: 100</span> <span className="text-xs text-gray-400 ml-2">任意</span></div>
          <div className="flex items-center">
            <Input value={capacity} onChange={e => setCapacity(e.target.value.replace(/[^0-9]/g, ''))} placeholder="人数" type="number" className="mb-1 flex-1 text-lg py-3" />
            <span className="ml-2 text-gray-500 text-lg">人</span>
          </div>
        </div>
      </div>
      {/* エラー表示（QRボタン直上） */}
      {qrError && <div className="w-full max-w-[400px] text-center text-red-500 text-base mb-2 font-bold">{qrError}</div>}
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
        <div className="flex flex-col items-center w-full">
          {/* 上部イベント名・日付 */}
          <div className="w-full flex flex-col items-center mb-4 mt-2">
            <div className="text-lg font-bold text-gray-800 mb-1">{selectedEvent?.title}</div>
            <div className="text-sm text-gray-500">{date}</div>
          </div>
          {/* QR＋ロゴをcanvasで1枚画像として保存できるように */}
          <div id="qr-capture-area" className="flex flex-col items-center">
            {qrJpegUrl && (
              <img src={qrJpegUrl} alt="QRコード" className="w-64 h-64 object-contain bg-white rounded-lg" />
            )}
            {/* 下部ロゴ */}
            <div className="w-full flex justify-center mt-4">
              <span
                className="text-3xl font-extrabold tracking-widest px-4 py-1 rounded-full"
                style={{
                  fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                  background: 'linear-gradient(90deg, #00c6fb 0%, #005bea 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  borderRadius: '2rem',
                  letterSpacing: '0.15em',
                }}
              >
                FesSnap
              </span>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleSaveQrAsImage} className="bg-slate-700 flex items-center gap-1"><Icon type="download" className="w-5 h-5" />保存</Button>
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
          <div className="mb-2 text-lg font-bold">地域検索</div>
          <Input value={regionSearch} onChange={e => setRegionSearch(e.target.value)} placeholder="都道府県・市区町村・町名で検索" className="mb-2" />
          <Button onClick={handleRegionSearch} className="w-32 bg-slate-700 mb-2">検索</Button>
          <div className="w-full max-h-60 overflow-y-auto">
            {regionResults.map(r => (
              <div key={r.pref} className="mb-2">
                <div className="font-bold text-blue-700 mb-1">{r.pref}</div>
                {r.cities.map(city => (
                  <div key={city.name} className="ml-2 mb-1">
                    <div className="text-blue-500 font-semibold text-sm mb-1">{city.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {city.towns.map(town => (
                        <Button key={town} onClick={() => { setRegion(`${r.pref} ${city.name} ${town}`); setShowRegionModal(false); }} className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-lg border border-blue-300">{town}</Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {region && (
            <Button onClick={() => { setRegion(''); setShowRegionModal(false); }} className="w-32 mt-4 bg-red-200 text-red-700">取り消し</Button>
          )}
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

// QR拡大モーダルの内容をcanvasで1枚画像として保存
function handleSaveQrAsImage() {
  const area = document.getElementById('qr-capture-area');
  if (!area) return;
  import('html2canvas').then(html2canvas => {
    html2canvas.default(area, {backgroundColor: '#fff'}).then(canvas => {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event-qr.png';
      a.click();
    });
  });
} 