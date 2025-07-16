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
import { useAuth } from '../../contexts/AuthContext';
import { PLAN_LIMITS } from '../../lib/planLimits';
import PlanSelectionModal from '../molecules/PlanSelectionModal';
import { loadStripe } from '@stripe/stripe-js';
import LoginModal from '../molecules/LoginModal';
import { getVisitorId } from '../../lib/visitorId';

function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iP(hone|od|ad)/.test(window.navigator.userAgent);
}

// sessionStorageキー
const ADMIN_FORM_KEY = 'adminForm';

// sessionStorage保存
function saveAdminFormToStorage({ title, plan, storagePeriod, eventScale, likeEnabled }) {
  if (typeof window === 'undefined') return;
  const data = { title: title || '', plan, storagePeriod, eventScale, likeEnabled };
  sessionStorage.setItem(ADMIN_FORM_KEY, JSON.stringify(data));
}
// sessionStorage復元
function getInitialAdminForm() {
  if (typeof window === 'undefined') return null;
  const saved = sessionStorage.getItem(ADMIN_FORM_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return parsed;
  } catch(e) {
    return null;
  }
}

export default function AdminMain() {
  // デフォルト値
  const [restored, setRestored] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState({ id: '', title: '' });
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
  const [likeEnabled, setLikeEnabled] = useState(false);
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginGuideModal, setShowLoginGuideModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [visitorId, setVisitorId] = useState(null);
  const [showPlanLoginRequiredModal, setShowPlanLoginRequiredModal] = useState(false);

  // イベント規模・保存期間の選択状態
  const [eventScale, setEventScale] = useState('');
  const [storagePeriod, setStoragePeriod] = useState('');
  const [recommendedPlan, setRecommendedPlan] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('free');

  // イベントデータ取得
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        // sessionStorageに値がなければ初期化
        if (restored) {
          const saved = sessionStorage.getItem(ADMIN_FORM_KEY);
          if (!saved) {
            setSelectedEvent({ id: '', title: '' });
            setLikeEnabled(false);
          }
        }
      });
  }, [restored]);

  // 決済成功後の処理
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const planType = urlParams.get('plan_type');
    const canceled = urlParams.get('canceled');

    if (success === 'true' && sessionId && planType) {
      // 決済成功後の処理
      setSelectedPlanType(planType);
      // URLパラメータをクリア
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      // 決済キャンセル時の処理
      setQrError('決済がキャンセルされました。もう一度お試しください。');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // おすすめプランの計算
  useEffect(() => {
    if (eventScale && storagePeriod) {
      let plan = 'free';
      
      if (eventScale === 'large' || storagePeriod === '6months') {
        plan = 'pro';
      } else if (eventScale === 'medium' || storagePeriod === '1month') {
        plan = 'plus';
      }
      
      setRecommendedPlan(plan);
      setSelectedPlanType(plan);
    }
  }, [eventScale, storagePeriod]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = getVisitorId();
      setVisitorId(id);
    }
  }, []);

  // タイトル入力時にエラーを動的に消す
  useEffect(() => {
    if (selectedEvent?.title && missingFields.includes('title')) {
      setMissingFields(missingFields.filter(f => f !== 'title'));
    }
  }, [selectedEvent?.title]);

  // 初期化時にsessionStorageから一括復元、復元完了までUIを描画しない
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = sessionStorage.getItem(ADMIN_FORM_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedEvent({ id: '', title: parsed.title ?? '' });
        setSelectedPlanType(parsed.plan ?? 'free');
        setEventScale(parsed.eventScale ?? '');
        setStoragePeriod(parsed.storagePeriod ?? '');
        setLikeEnabled(parsed.likeEnabled ?? false);
      } catch(e) {}
    }
    setRestored(true);
  }, []);

  // 入力値・選択値が変わるたびにsessionStorageへ保存
  useEffect(() => {
    if (!restored) return;
    saveAdminFormToStorage({
      title: selectedEvent?.title || '',
      plan: selectedPlanType,
      storagePeriod,
      eventScale,
      likeEnabled,
    });
  }, [selectedEvent?.title, selectedPlanType, storagePeriod, eventScale, likeEnabled, restored]);

  // イベント切り替え
  const handleEventSwitch = (event) => {
    setSelectedEvent(event);
    setShowEventModal(false);
    setLikeEnabled(!!event.like_enabled);
  };

  // QRコード生成
  const handleGenerateQr = async () => {
    setShowLoginGuideModal(false); // まずモーダルを必ず閉じる
    setQrTouched(true);
    setQrError('');
    const newMissing = [];
    if (!selectedEvent?.title) newMissing.push('title');
    setMissingFields(newMissing);
    if (newMissing.length > 0) {
      setQr('');
      // エラー内容はモーダル外にも表示される
      return;
    }
    if (!user || !user.id) {
      // returnせず、ダミーUUIDでAPIリクエストを送る
    }
    // 有料プランの場合は/stripeページの該当プランstripe決済ページに遷移
    if (selectedPlanType === 'plus' || selectedPlanType === 'pro') {
      // /stripeページのプランIDと同じものを使う
      const planPriceIdMap = {
        plus: 'price_1Rl5iCINMH35xP4jXDQJEXZf',
        pro: 'price_1Rl5u3INMH35xP4jdbyrUZcn',
      };
      const priceId = planPriceIdMap[selectedPlanType];
      if (priceId) {
        // /stripeページのhandleStripeCheckoutと同じ処理
        try {
          const returnUrl = window.location.href;
          const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId, returnUrl }),
          });
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
            return;
          } else {
            setQrError(data.error || '決済ページの生成に失敗しました。しばらくしてから再度お試しください。');
            return;
          }
        } catch (e) {
          setQrError('決済ページへの遷移中にエラーが発生しました。しばらくしてから再度お試しください。');
          return;
        }
      }
    }

    // 無料プランの場合は通常のQRコード生成
    try {
      // プランごとの制限値を取得
      const limits = PLAN_LIMITS[selectedPlanType] || PLAN_LIMITS['free'];
      // ownerフィールドはuserがいればuser.id、いなければダミーUUID
      const eventBody = {
        title: selectedEvent?.title,
        like_enabled: likeEnabled,
        plan_type: selectedPlanType,
        image_limit: limits.image_limit,
        storage_period_days: limits.storage_period_days,
        owner: (user && user.id) ? user.id : visitorId
      };
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventBody)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        // 英語エラーを日本語に変換
        let jpError = errorData.error;
        if (jpError && jpError.includes('null value in column "owner"')) {
          jpError = 'イベント作成に失敗しました（ログイン情報が正しく取得できませんでした）';
        } else if (jpError && jpError.includes('violates not-null constraint')) {
          jpError = 'イベント作成に失敗しました（必要な情報が不足しています）';
        } else if (!jpError) {
          jpError = 'イベント作成に失敗しました';
        }
        setQrError(jpError);
        return;
      }
      
      const data = await res.json();
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
      if (e.message && e.message.includes("Cannot read properties of null (reading 'id')")) {
        setQrError('ログイン情報が取得できませんでした。再度ログインしてください');
      } else {
        setQrError('サーバーエラーが発生しました');
      }
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
      // Web Share API対応
      if (navigator.canShare && navigator.canShare({ files: [new File([], '')] })) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `fes-snap-qr-${selectedEvent?.title || 'event'}.png`, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'FesSnap QRコード',
          text: 'イベントのQRコードを共有します',
        });
      } else {
        // 従来通りダウンロード
        const link = document.createElement('a');
        link.download = `fes-snap-qr-${selectedEvent?.title || 'event'}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      // 画像保存エラー: error;
    }
  }

  // UI描画前に復元が終わっていなければローディング表示
  if (!restored) {
    return <div className="w-full min-h-screen flex items-center justify-center text-lg font-bold">読み込み中...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col items-center px-2 sm:px-0" style={{fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>
      <div className="relative z-20 w-full flex flex-col items-center">
        {/* ヘッダー */}
        <Header
          type="menu"
          onLoginClick={() => { setShowLoginModal(true); }}
          onMenuClick={() => { setShowMenu(true); }}
        />
      </div>
      {/* ログイン推奨モーダル */}
      <Modal isOpen={showLoginGuideModal} onClose={() => setShowLoginGuideModal(false)}>
        <div className="flex flex-col items-center p-6 w-full max-w-xs mx-auto text-center relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowLoginGuideModal(false)}>&times;</button>
          <h2
            className="text-2xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow text-center"
            style={{
              fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
              letterSpacing: '0.05em',
              lineHeight: 1.15
            }}
          >
            ログインを推奨します
          </h2>
          <div
            className="mb-4 text-base sm:text-lg text-gray-600 font-medium text-center"
            style={{
              fontFamily: "'Quicksand', 'Noto Sans JP', 'Poppins', 'Nunito', 'Rubik', 'Rounded Mplus 1c', sans-serif",
              letterSpacing: '0.02em',
              lineHeight: 1.6
            }}
          >
            ログインしないままイベントを作成すると<br className="sm:hidden" />イベントを探すことが出来なくなります。
          </div>
          {/* エラー表示（モーダル内） */}
          {missingFields.length > 0 && (
            <div className="w-full text-center text-red-500 text-base mb-2 font-bold">{missingFields.includes('title') && 'タイトルが未入力です'}</div>
          )}
          <div className="flex flex-col w-full gap-2 mt-2">
            <Button
              onClick={handleGenerateQr}
              className="w-full py-3 text-lg font-bold rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-blue-600 shadow-lg hover:from-blue-400 hover:to-green-400 transition-all duration-200 border-0"
              style={{
                fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                letterSpacing: '0.04em'
              }}
            >
              生成する
            </Button>
            <Button
              onClick={() => { setShowLoginGuideModal(false); setShowLoginModal(true); }}
              className="w-full py-3 text-lg font-bold rounded-full bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 shadow-lg hover:from-pink-400 hover:to-blue-500 transition-all duration-200 border-0"
              style={{
                fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                letterSpacing: '0.04em'
              }}
            >
              ログイン
            </Button>
          </div>
        </div>
      </Modal>
      {/* ログインモーダル */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      {/* ハンバーガーメニューの中身（例: モーダル） */}
      <Modal isOpen={showMenu} onClose={() => setShowMenu(false)}>
        <div className="flex flex-col items-center p-6 w-full max-w-xs mx-auto text-center relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowMenu(false)}>&times;</button>
          <div className="text-lg font-bold mb-4">メニュー</div>
          <Button onClick={() => { setShowMenu(false); router.push('/events'); }} className="w-full mb-2 py-3 text-base font-bold rounded-full bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 text-white shadow-lg">イベント一覧へ</Button>
          <Button onClick={() => { setShowMenu(false); setShowLoginModal(true); }} className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-red-500 via-pink-400 to-blue-600 text-white shadow-lg">ログアウト</Button>
        </div>
      </Modal>
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
            const newTitle = e.target.value.slice(0, 10);
            setSelectedEvent(ev => { const next = { ...ev, title: newTitle }; return next; });
          }} placeholder="タイトル" maxLength={10} className={`mb-1 text-lg py-3 text-black text-center ${(qrTouched && missingFields.includes('title')) ? 'ring-2 ring-red-400' : ''}`} />
        </div>
        
        {/* プラン選択ボタン */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => { setShowPlanModal(true); }}
            className="w-full max-w-xs bg-white text-gray-700 py-3 px-6 rounded-full font-semibold text-base shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:scale-105"
          >
            プランを調べてみる
          </button>
        </div>

        {/* 質問セクション（初期では非表示） */}
        {showQuestions && (
          <>
            {/* イベント規模選択 */}
            <div className="flex flex-col items-center">
              <div className="text-base font-bold text-gray-700 mb-3 text-center">イベントの規模は？</div>
              <div className="flex flex-col gap-2 w-full">
                <button 
                  onClick={() => { setEventScale('small'); }} 
                  className={`py-3 px-4 rounded-2xl text-sm transition-all duration-300 hover:scale-105 ${
                    eventScale === 'small' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  小規模（〜5人）<br />
                  <span className="text-xs opacity-80">誕生日会、家族旅行など</span>
                </button>
                <button 
                  onClick={() => { setEventScale('medium'); }} 
                  className={`py-3 px-4 rounded-2xl text-sm transition-all duration-300 hover:scale-105 ${
                    eventScale === 'medium' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  中規模（〜25人）<br />
                  <span className="text-xs opacity-80">結婚式、サークルイベントなど</span>
                </button>
                <button 
                  onClick={() => { setEventScale('large'); }} 
                  className={`py-3 px-4 rounded-2xl text-sm transition-all duration-300 hover:scale-105 ${
                    eventScale === 'large' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  大規模（無制限）<br />
                  <span className="text-xs opacity-80">企業パーティ、フェスなど</span>
                </button>
              </div>
            </div>

            {/* 保存期間選択 */}
            <div className="flex flex-col items-center">
              <div className="text-base font-bold text-gray-700 mb-3 text-center">保存期間は？</div>
              <div className="flex flex-col gap-2 w-full">
                <button 
                  onClick={() => { setStoragePeriod('1week'); }} 
                  className={`py-3 px-4 rounded-2xl text-sm transition-all duration-300 hover:scale-105 ${
                    storagePeriod === '1week' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  1週間<br />
                  <span className="text-xs opacity-80">短期間のイベント</span>
                </button>
                <button 
                  onClick={() => { setStoragePeriod('1month'); }} 
                  className={`py-3 px-4 rounded-2xl text-sm transition-all duration-300 hover:scale-105 ${
                    storagePeriod === '1month' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  1ヶ月<br />
                  <span className="text-xs opacity-80">中期的な保存</span>
                </button>
                <button 
                  onClick={() => { setStoragePeriod('6months'); }} 
                  className={`py-3 px-4 rounded-2xl text-sm transition-all duration-300 hover:scale-105 ${
                    storagePeriod === '6months' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  半年<br />
                  <span className="text-xs opacity-80">長期間の保存</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* おすすめプラン表示 */}
        {showQuestions && recommendedPlan && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4">
            <div className="text-center">
              <div className="text-sm font-bold text-blue-900 mb-2">
                おすすめプラン
              </div>
              <div className="text-lg font-bold text-blue-600 mb-2">
                {recommendedPlan === 'free' ? 'Freeプラン' : 
                 recommendedPlan === 'plus' ? 'Plusプラン' : 'Proプラン'}
              </div>
              <div className="text-xs text-blue-700">
                {recommendedPlan === 'free' ? '画像25枚・7日間保存' :
                 recommendedPlan === 'plus' ? '画像125枚・30日間保存' :
                 '画像無制限・半年間保存'}
              </div>
            </div>
          </div>
        )}

        {/* いいね機能トグル */}
        <div className="flex items-center gap-2 justify-center mt-2">
          <input type="checkbox" id="likeEnabled" checked={likeEnabled} onChange={e => { setLikeEnabled(e.target.checked); }} className="w-5 h-5 accent-pink-500" />
          <label htmlFor="likeEnabled" className="text-base font-bold text-pink-500 select-none" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>
            いいね機能をつける
          </label>
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
      
      {/* プラン選択ボタン（QRコード生成ボタンの上） */}
      <div className="w-full max-w-[400px] flex gap-2 mb-4 px-2 sm:px-0">
        <button 
          onClick={() => { const next = selectedPlanType === 'plus' ? 'free' : 'plus'; setSelectedPlanType(next); }} 
          className={`flex-1 py-2 px-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
            selectedPlanType === 'plus' 
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
          }`}
        >
          Plusプラン
        </button>
        <button 
          onClick={() => { const next = selectedPlanType === 'pro' ? 'free' : 'pro'; setSelectedPlanType(next); }} 
          className={`flex-1 py-2 px-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
            selectedPlanType === 'pro' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
          }`}
        >
          Proプラン
        </button>
      </div>

      {/* QRコード生成ボタン */}
      <div className="flex w-full max-w-[400px] gap-4 mb-8 px-2 sm:px-0">
        <Button 
          onClick={() => {
            // まずタイトル必須チェック
            if (!selectedEvent?.title) {
              setQrTouched(true);
              setMissingFields(['title']);
              setQrError('');
              return;
            }
            if (!isLoggedIn) {
              if (selectedPlanType === 'plus' || selectedPlanType === 'pro') {
                setShowPlanLoginRequiredModal(true);
              } else {
                setShowLoginGuideModal(true);
              }
            } else {
              handleGenerateQr();
            }
          }} 
          className="flex-1 text-base py-4"
        >
          {selectedPlanType === 'free' ? 'QRコード生成' : '決済してQRコード生成'}
        </Button>
      </div>
      {/* QRコード表示＋投稿ボタン */}
      {qr && (
        <div ref={qrAreaRef} className="w-full max-w-[400px] flex flex-col items-center mb-8 px-2 sm:px-0">
          <div className="cursor-pointer" onClick={handleQrToJpeg} ref={qrRef}>
            <QRCode value={qr} size={180} bgColor="#fff" fgColor="#1e3a8a" />
          </div>
          <div className="text-xs text-gray-400 mt-1">タップで拡大・保存</div>
          {qrEventId && (
            <button
              onClick={() => router.push(`/events/${qrEventId}`)}
              className="flex-1 text-base py-4 bg-gradient-to-r from-green-400 via-blue-400 to-blue-600 text-white rounded-full font-bold shadow-lg hover:from-blue-400 hover:to-green-400 transition-all duration-200 border-0 mt-2"
              style={{ fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", letterSpacing: '0.04em' }}
            >
              イベントページへ
            </button>
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
            <button 
              onClick={handleShareQrInfo} 
              className="bg-gradient-to-r from-slate-700 to-slate-800 flex items-center gap-1 text-white px-4 py-2 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              保存
            </button>
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
            <button 
              key={ev.id} 
              onClick={() => handleEventSwitch(ev)} 
              className="mb-1 w-40 bg-gradient-to-r from-slate-700 to-slate-800 text-white py-2 px-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {ev.title}
            </button>
          ))}
        </div>
      </Modal>
      {/* プラン選択モーダル */}
      <div className="lg:w-full">
        <PlanSelectionModal 
          isOpen={showPlanModal} 
          onClose={() => {
            setShowPlanModal(false);
            setShowQuestions(false);
          }} 
          onPlanSelected={(plan) => {
            setShowPlanModal(false);
            if (plan.id === 'free') {
              setSelectedPlanType('free');
              setShowQuestions(false);
            } else if (plan.id === 'plus' || plan.id === 'pro') {
              setSelectedPlanType(plan.id);
              setShowQuestions(true);
            }
          }}
        />
      </div>
      {/* Plus/Proプラン用ログイン必須モーダル */}
      <Modal isOpen={showPlanLoginRequiredModal} onClose={() => setShowPlanLoginRequiredModal(false)}>
        <div className="flex flex-col items-center p-6 w-full max-w-xs mx-auto text-center relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowPlanLoginRequiredModal(false)}>&times;</button>
          <h2 className="text-2xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow text-center">
            {selectedPlanType === 'plus' ? 'Plusプラン' : 'Proプラン'}でのイベント作成では<br />ログインが必須です。
          </h2>
          <div className="mb-4 text-base sm:text-lg text-gray-600 font-medium text-center">
            ログインしてからイベント作成を進めてください。
          </div>
          <Button
            onClick={() => { setShowPlanLoginRequiredModal(false); setShowLoginModal(true); }}
            className="w-full py-3 text-lg font-bold rounded-full bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 shadow-lg hover:from-pink-400 hover:to-blue-500 transition-all duration-200 border-0"
          >
            ログイン
          </Button>
        </div>
      </Modal>
    </div>
  );
} 