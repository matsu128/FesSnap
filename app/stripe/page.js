"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/molecules/Header';
import Button from '../../components/atoms/Button';

const plans = [
  {
    name: 'Freeプラン', price: '0円', desc: '小規模イベント<br />（親しい友人の誕生日会など）', priceId: null, highlight: false,
    features: [
      '画像25枚（最大5人分想定）',
      '7日間',
      '無料で気軽に試せる',
      '参加者数が少なくて<br />シンプル利用向き',
    ],
  },
  {
    name: 'Plusプラン', price: '7,000円', desc: '中規模イベント<br />（小規模結婚式、子ども会、サークルイベント）', priceId: 'price_1Rh8TUINMH35xP4j7P5hiLq1', highlight: true,
    features: [
      '画像125枚（最大25人分想定）',
      '30日間',
      'まとまった写真枚数対応',
      '高画質アップロード対応',
      'QRコード共有で参加者も<br />簡単投稿',
    ],
  },
  {
    name: 'Proプラン', price: '15,000円', desc: '大規模イベント<br />（結婚式・企業パーティ<br />地域イベント・フェス）', priceId: 'price_1Rh8TiINMH35xP4jqYvfj0YC', highlight: false,
    features: [
      '画像無制限',
      '1年間',
      '枚数制限なし',
      '長期間の保存・共有が可能',
      '写真のモデレーションや<br />カスタマイズ機能付き',
      '専用サポート対応',
    ],
  },
];

export default function StripePage() {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const handleStripeCheckout = async (priceId) => {
    if (!priceId) return alert('無料プランは決済不要です');
    setLoading(true);
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('決済ページの生成に失敗しました');
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white py-16">
      <Header type="menu" onMenuClick={() => setShowMenu(v => !v)} />
      {showMenu && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowMenu(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[240px] max-w-[90vw] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <Button onClick={() => { router.push('/auth/line'); setShowMenu(false); }} className="w-full text-base py-3 bg-slate-700">ログイン</Button>
            <Button onClick={() => { router.push('/admin'); setShowMenu(false); }} className="w-full text-base py-3 bg-blue-600">新規イベント作成</Button>
          </div>
        </div>
      )}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg tracking-wide">FesSnap 料金プラン</h1>
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-stretch w-full max-w-4xl">
        {plans.map((plan, i) => (
          <div key={i} className={`flex-1 bg-white rounded-3xl p-8 shadow-lg border ${plan.highlight ? 'border-pink-400' : 'border-blue-100'} flex flex-col items-center`}>
            <div className="text-xl font-bold mb-2 text-center">
              <span className="text-2xl md:text-3xl">{plan.name.split('プラン')[0]}</span>
              <span className="text-base md:text-lg ml-1">プラン</span>
            </div>
            <div className={`text-4xl font-extrabold mb-2 ${plan.price === '0円' ? 'text-blue-500' : 'text-pink-500'}`}>{plan.price}</div>
            <div className="text-gray-500 mb-4 text-center" dangerouslySetInnerHTML={{ __html: plan.desc }}></div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-start text-sm">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700" dangerouslySetInnerHTML={{ 
                    __html: f
                      .replace(/(\d+枚)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(\d+日間)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(\d+年間)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(無制限)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(枚数制限なし)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(長期間)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(無料)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(高画質)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(QRコード)/g, '<span class="text-blue-600 font-bold">$1</span>')
                      .replace(/(専用サポート)/g, '<span class="text-blue-600 font-bold">$1</span>')
                  }}></span>
                </li>
              ))}
            </ul>
            <button
              className={`mt-auto px-8 py-3 rounded-full font-bold text-white ${plan.price === '0円' ? 'bg-blue-400' : 'bg-pink-500'} shadow-lg hover:opacity-90 transition disabled:opacity-60`}
              onClick={() => handleStripeCheckout(plan.priceId)}
              disabled={loading}
            >
              {plan.price === '0円' ? '無料で始める' : `${plan.price}で申し込む`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 