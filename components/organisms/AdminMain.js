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
import { planLimits } from '../../lib/supabaseClient';
import PlanSelectionModal from '../molecules/PlanSelectionModal';
import { loadStripe } from '@stripe/stripe-js';

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
  const [likeEnabled, setLikeEnabled] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

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
        setSelectedEvent({
          id: '',
          title: '',
        });
        setLikeEnabled(false);
      });
  }, []);

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
      alert('決済がキャンセルされました');
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

  // イベント切り替え
  const handleEventSwitch = (event) => {
    setSelectedEvent(event);
    setShowEventModal(false);
    setLikeEnabled(!!event.like_enabled);
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

    // 有料プランの場合はStripe決済
    if (selectedPlanType !== 'free') {
      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planType: selectedPlanType,
            userId: user.id
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '決済セッションの作成に失敗しました');
        }

        const { sessionId } = await response.json();
        
        // Stripe決済ページにリダイレクト
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId,
          });
          if (error) {
            setQrError('決済エラーが発生しました: ' + error.message);
          }
        } else {
          setQrError('Stripeが設定されていません');
        }
        return;
      } catch (error) {
        console.error('Stripe error:', error);
        setQrError('決済処理中にエラーが発生しました: ' + error.message);
        return;
      }
    }

    // 無料プランの場合は通常のQRコード生成
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedEvent?.title,
          like_enabled: likeEnabled,
          plan_type: selectedPlanType
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        setQrError(errorData.error || 'イベント作成に失敗しました');
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
      console.error('QR generation error:', e);
      setQrError('サーバーエラーが発生しました: ' + e.message);
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
      // 画像保存エラー: error;
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
        
        {/* プラン選択ボタン */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowPlanModal(true)}
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
                  onClick={() => setEventScale('small')} 
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
                  onClick={() => setEventScale('medium')} 
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
                  onClick={() => setEventScale('large')} 
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
                  onClick={() => setStoragePeriod('1week')} 
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
                  onClick={() => setStoragePeriod('1month')} 
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
                  onClick={() => setStoragePeriod('6months')} 
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
          <input type="checkbox" id="likeEnabled" checked={likeEnabled} onChange={e => setLikeEnabled(e.target.checked)} className="w-5 h-5 accent-pink-500" />
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
          onClick={() => setSelectedPlanType(selectedPlanType === 'plus' ? 'free' : 'plus')} 
          className={`flex-1 py-2 px-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
            selectedPlanType === 'plus' 
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
          }`}
        >
          Plusプラン
        </button>
        <button 
          onClick={() => setSelectedPlanType(selectedPlanType === 'pro' ? 'free' : 'pro')} 
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
          onClick={handleGenerateQr} 
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
              className="w-full mt-2 text-base py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
              <Icon type="download" className="w-5 h-5" />保存
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
      <PlanSelectionModal 
        isOpen={showPlanModal} 
        onClose={() => {
          setShowPlanModal(false);
          // モーダルが閉じられた時は質問を非表示にする
          setShowQuestions(false);
        }} 
        onPlanSelected={(plan) => {
          setShowPlanModal(false);
          // プラン選択に応じて初期表示のボタンを更新
          if (plan.id === 'free') {
            setSelectedPlanType('free');
            // Freeプランの場合は質問を表示しない
            setShowQuestions(false);
          } else if (plan.id === 'plus') {
            setSelectedPlanType('plus');
            // Plus/Proプランの場合は質問を表示
            setShowQuestions(true);
          } else if (plan.id === 'pro') {
            setSelectedPlanType('pro');
            // Plus/Proプランの場合は質問を表示
            setShowQuestions(true);
          }
        }}
      />
    </div>
  );
} 