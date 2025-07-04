"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/molecules/Header';
import Button from '../../components/atoms/Button';

const plans = [
  {
    name: 'ベーシックプラン', price: '無料', desc: '小規模イベント向け', priceId: null, highlight: false,
    features: [
      '最大50人まで参加可能',
      '基本的な写真共有機能',
      'イベント終了後7日間データ保存',
      'カスタマイズ機能なし',
    ],
  },
  {
    name: 'プラスプラン', price: '¥2,000', desc: '中規模イベント向け', priceId: 'price_1Rh8TUINMH35xP4j7P5hiLq1', highlight: true,
    features: [
      '最大300人まで参加可能',
      '高画質写真共有',
      'イベント終了後30日間データ保存',
      '基本的なカスタマイズ機能',
    ],
  },
  {
    name: 'プロプラン', price: '¥5,000', desc: '大規模イベント向け', priceId: 'price_1Rh8TiINMH35xP4jqYvfj0YC', highlight: false,
    features: [
      '参加人数無制限',
      '超高画質写真共有',
      'イベント終了後1年間データ保存',
      '高度なカスタマイズ機能',
      '専用サポート',
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
            <div className="text-xl font-bold mb-2 text-center">{plan.name}</div>
            <div className={`text-4xl font-extrabold mb-2 ${plan.price === '無料' ? 'text-blue-500' : 'text-pink-500'}`}>{plan.price}</div>
            <div className="text-gray-500 mb-4 text-center">{plan.desc}</div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((f, j) => (
                <li key={j} className={`flex items-start ${f.includes('なし') ? 'text-gray-400' : 'text-black'} text-base`}>
                  <span className="mr-2">{f.includes('なし') ? '✗' : '✓'}</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              className={`mt-auto px-8 py-3 rounded-full font-bold text-white ${plan.price === '無料' ? 'bg-blue-400' : 'bg-pink-500'} shadow-lg hover:opacity-90 transition disabled:opacity-60`}
              onClick={() => handleStripeCheckout(plan.priceId)}
              disabled={loading}
            >
              {plan.price === '無料' ? '無料で始める' : `${plan.price}で申し込む`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 