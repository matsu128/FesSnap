// LP（紹介ページ）のメイン部分を構成するorganism
// Header, ServiceVideo, HorizontalEventSlider, EmphasizedNavButtonを組み合わせて、ページ遷移も実装
// APIからダミーイベントデータを取得してスライダーに渡す
import { useEffect, useState } from 'react';
import Header from '../molecules/Header';
import ServiceVideo from '../molecules/ServiceVideo';
import HorizontalEventSlider from '../molecules/HorizontalEventSlider';
import EmphasizedNavButton from '../molecules/EmphasizedNavButton';
import { useRouter } from 'next/navigation';
import Logo from '../atoms/Logo';
import Button from '../atoms/Button';
import Link from 'next/link';
import Card from '../atoms/Card';
import Icon from '../atoms/Icon';
import { motion } from 'framer-motion';

export default function LPMain() {
  const router = useRouter();
  // ダミーイベント例
  const eventExamples = [
    {
      title: 'サマーフェスティバル 2025', date: '2025年7月20日 - 東京', participants: '1,200人',
      img: 'https://readdy.ai/api/search-image?query=summer%20music%20festival%20with%20crowd%20enjoying%20concert%2C%20stage%20lights%2C%20evening%20atmosphere%2C%20vibrant%20colors%2C%20professional%20photography&width=400&height=250&seq=event1&orientation=landscape',
    },
    {
      title: 'Tech Conference 2025', date: '2025年6月15日 - 大阪', participants: '850人',
      img: 'https://readdy.ai/api/search-image?query=tech%20conference%20with%20people%20networking%2C%20modern%20venue%2C%20presentation%20screens%2C%20professional%20business%20atmosphere&width=400&height=250&seq=event2&orientation=landscape',
    },
    {
      title: 'グルメフェスタ 2025', date: '2025年8月5日 - 福岡', participants: '3,000人',
      img: 'https://readdy.ai/api/search-image?query=food%20festival%20with%20various%20food%20stalls%2C%20people%20enjoying%20street%20food%2C%20colorful%20decorations%2C%20daytime%20outdoor%20event&width=400&height=250&seq=event3&orientation=landscape',
    },
    {
      title: '現代アート展 2025', date: '2025年9月10日 - 京都', participants: '500人',
      img: 'https://readdy.ai/api/search-image?query=art%20exhibition%20with%20people%20viewing%20modern%20artworks%2C%20gallery%20space%2C%20elegant%20atmosphere%2C%20indoor%20lighting&width=400&height=250&seq=event4&orientation=landscape',
    },
    {
      title: '東京マラソン 2025', date: '2025年10月3日 - 東京', participants: '10,000人',
      img: 'https://readdy.ai/api/search-image?query=sports%20event%20with%20runners%20at%20finish%20line%2C%20crowd%20cheering%2C%20outdoor%20stadium%2C%20sunny%20day&width=400&height=250&seq=event5&orientation=landscape',
    },
  ];
  // ダミー利用者の声
  const testimonials = [
    {
      name: '田中 美咲', role: 'イベント参加者',
      img: 'https://readdy.ai/api/search-image?query=portrait%20of%20young%20japanese%20woman%2C%20natural%20lighting%2C%20neutral%20expression%2C%20professional%20headshot&width=100&height=100&seq=test1&orientation=squarish',
      comment: '友達と行ったフェスで使ってみました。自分が撮った写真だけでなく、他の参加者の写真も見られるので、違う角度からのステージの様子も楽しめました。思い出がより豊かになりました！',
    },
    {
      name: '佐藤 健太', role: 'イベント主催者',
      img: 'https://readdy.ai/api/search-image?query=portrait%20of%20japanese%20businessman%20in%20his%2040s%2C%20wearing%20suit%2C%20professional%20headshot%2C%20neutral%20background&width=100&height=100&seq=test2&orientation=squarish',
      comment: '企業イベントで導入しました。参加者全員が簡単に写真を共有できるので、公式カメラマンだけでは撮りきれない瞬間も記録できました。次回のイベントでも必ず使います。',
    },
    {
      name: '山田 太郎', role: '音楽フェス参加者',
      img: 'https://readdy.ai/api/search-image?query=portrait%20of%20young%20japanese%20man%20with%20casual%20style%2C%20natural%20lighting%2C%20friendly%20smile%2C%20professional%20headshot&width=100&height=100&seq=test3&orientation=squarish',
      comment: 'アプリをインストールする必要がないのが最高です！QRコードを読み込むだけですぐに使えて、イベント後も写真が残るので思い出として大切にしています。',
    },
  ];
  // 料金プラン
  const plans = [
    {
      name: 'ベーシックプラン', price: '無料', desc: '小規模イベント向け', features: [
        '最大50人まで参加可能', '基本的な写真共有機能', 'イベント終了後7日間データ保存', 'カスタマイズ機能なし',
      ], highlight: false,
    },
    {
      name: 'プラスプラン', price: '¥2,000', desc: '中規模イベント向け', features: [
        '最大300人まで参加可能', '高画質写真共有', 'イベント終了後30日間データ保存', '基本的なカスタマイズ機能',
      ], highlight: true,
    },
    {
      name: 'プロプラン', price: '¥5,000', desc: '大規模イベント向け', features: [
        '参加人数無制限', '超高画質写真共有', 'イベント終了後1年間データ保存', '高度なカスタマイズ機能', '専用サポート',
      ], highlight: false,
    },
  ];

  // 今すぐ始めるボタンでイベントページへ
  const handleStart = () => router.push('/events');

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-0 font-['Noto Sans JP']" style={{overflowX: 'hidden', fontFamily: "'Noto Sans JP', 'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>
      {/* ヘッダー */}
      <header className="fixed top-0 w-full z-50 px-2 sm:px-4 py-2 sm:py-3 bg-transparent backdrop-blur-md flex justify-between items-center h-14 sm:h-16 shadow-sm">
        <Link href="/" className="inline-block">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>
            <Logo size="text-xl sm:text-2xl" />
          </motion.div>
        </Link>
        <button className="w-12 h-12 flex items-center justify-center text-gray-700 rounded-full hover:bg-gray-100 transition sm:w-10 sm:h-10" style={{WebkitTapHighlightColor:'transparent'}}>
          <Icon type="menu" className="w-7 h-7" />
        </button>
      </header>
      {/* Hero Section */}
      <section className="hero-section flex items-center justify-center relative overflow-hidden w-full min-h-screen">
        {/* 動画背景 */}
        <video
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          src="/9003388-hd_1920_1080_25fps.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{minWidth: '100%', minHeight: '100%', objectFit: 'cover', objectPosition: 'center'}}
        />
        {/* 黒半透明レイヤー */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        <div className="w-full flex flex-col items-center justify-center z-20 text-center" style={{overflowX: 'hidden'}}>
          <div className="w-full" style={{margin: '0 auto', boxSizing: 'border-box', paddingLeft: '1rem', paddingRight: '1rem', overflowX: 'hidden'}}>
            <Logo size="text-5xl" className="mb-4 drop-shadow-lg" />
            <h2
              className="font-extrabold text-white mb-4 tracking-tight leading-tight drop-shadow-xl text-balance"
              style={{
                fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                letterSpacing: '0.04em',
                textShadow: '0 4px 24px rgba(0,0,0,0.18)',
                fontSize: 'clamp(1.1rem, 6vw, 2.2rem)',
                lineHeight: 1.15,
                maxWidth: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                wordBreak: 'keep-all',
                WebkitTextWrap: 'balance',
                textWrap: 'balance',
              }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-pink-400 to-blue-600 bg-clip-text text-transparent block">イベントの感動を、その場でみんなと。</span>
            </h2>
            <p
              className="text-white/90 font-light mb-8 mx-auto leading-relaxed sm:leading-normal text-balance text-center w-full"
              style={{
                fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                textShadow: '0 2px 8px rgba(0,0,0,0.10)',
                fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)',
                maxWidth: '100%',
                margin: '0 auto',
                wordBreak: 'keep-all',
                WebkitTextWrap: 'balance',
                textWrap: 'balance',
                lineHeight: 1.5,
                letterSpacing: '0.01em',
                boxSizing: 'border-box',
                overflowX: 'hidden',
                paddingLeft: '0.5rem',
                paddingRight: '0.5rem',
              }}
            >
              イベントの思い出をリアルタイムで共有。<br className="hidden sm:block" />新しい写真共有の形を提供します。
            </p>
            <EmphasizedNavButton onClick={handleStart} className="mt-12">今すぐ始める</EmphasizedNavButton>
          </div>
        </div>
      </section>
      {/* Features Section（使い方） */}
      <section className="px-4 bg-gradient-to-b from-blue-50 to-white w-full" style={{overflowX: 'hidden'}}>
        <div className="w-full max-w-screen-lg mx-auto px-2" style={{overflowX: 'hidden'}}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg tracking-wide mt-12" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", letterSpacing: '0.08em'}}>使い方</h2>
          <div className="relative flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-stretch w-full" style={{overflowX: 'hidden'}}>
            {/* Feature 1: QRで参加 */}
            <div className="flex-1 w-full min-w-0 sm:min-w-[260px] max-w-md mx-auto group relative bg-white/80 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-blue-100 backdrop-blur-md mb-4">
              <div className="w-28 h-28 flex items-center justify-center mx-auto mb-6 relative">
                {/* SVGそのまま */}
                <svg width="90" height="90" viewBox="0 0 56 56" fill="none" className="drop-shadow-lg">
                  <rect x="10" y="6" width="36" height="44" rx="8" fill="#fff" stroke="#2563EB" strokeWidth="2"/>
                  <rect x="20" y="16" width="16" height="16" rx="2" fill="#E0E7FF" />
                  <rect x="24" y="20" width="4" height="4" fill="#2563EB" />
                  <rect x="28" y="24" width="4" height="4" fill="#2563EB" />
                  <rect x="32" y="20" width="4" height="4" fill="#2563EB" />
                  <circle cx="28" cy="44" r="2" fill="#2563EB" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-blue-700 text-center tracking-wide" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>QRですぐ参加</h3>
              <p className="text-gray-600 leading-relaxed text-center text-sm sm:text-base text-balance" style={{fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(0.85rem, 3vw, 1.05rem)', maxWidth: '100%', margin: '0 auto', wordBreak: 'break-word', WebkitTextWrap: 'balance', textWrap: 'balance', overflowWrap: 'break-word'}}>アプリのインストール不要。会場のQRコードをスマホで読み込むだけで、すぐに参加できます。</p>
            </div>
            {/* Feature 2: カメラ＋フラッシュ */}
            <div className="flex-1 w-full min-w-0 sm:min-w-[260px] max-w-md mx-auto group relative bg-white/80 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-pink-100 backdrop-blur-md mb-4">
              <div className="w-28 h-28 flex items-center justify-center mx-auto mb-6 relative">
                {/* SVGそのまま */}
                <svg width="90" height="90" viewBox="0 0 56 56" fill="none" className="drop-shadow-lg">
                  <rect x="12" y="18" width="32" height="20" rx="6" fill="#fff" stroke="#F472B6" strokeWidth="2"/>
                  <circle cx="28" cy="28" r="6" fill="#F472B6" />
                  <circle cx="28" cy="28" r="3" fill="#fff" />
                  <rect x="22" y="14" width="12" height="6" rx="2" fill="#F472B6" />
                  <polygon points="28,8 30,14 26,14" fill="#F472B6" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-pink-600 text-center tracking-wide" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>リアルタイム共有</h3>
              <p className="text-gray-600 leading-relaxed text-center text-sm sm:text-base text-balance" style={{fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(0.85rem, 3vw, 1.05rem)', maxWidth: '100%', margin: '0 auto', wordBreak: 'break-word', WebkitTextWrap: 'balance', textWrap: 'balance', overflowWrap: 'break-word'}}>撮影した写真がすぐに共有され、イベントの熱気をリアルタイムで感じることができます。</p>
            </div>
            {/* Feature 3: シールド＋人のシルエット */}
            <div className="flex-1 w-full min-w-0 sm:min-w-[260px] max-w-md mx-auto group relative bg-white/80 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-blue-100 backdrop-blur-md mb-4">
              <div className="w-28 h-28 flex items-center justify-center mx-auto mb-6 relative">
                {/* SVGそのまま */}
                <svg width="90" height="90" viewBox="0 0 56 56" fill="none" className="drop-shadow-lg">
                  <path d="M28 48s16-8 16-20V14l-16-6-16 6v14c0 12 16 20 16 20z" fill="#fff" stroke="#2563EB" strokeWidth="2"/>
                  <circle cx="28" cy="28" r="5" fill="#2563EB" />
                  <ellipse cx="28" cy="36" rx="8" ry="4" fill="#E0E7FF" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-blue-700 text-center tracking-wide" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>イベント限定空間</h3>
              <p className="text-gray-600 leading-relaxed text-center text-sm sm:text-base text-balance" style={{fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(0.85rem, 3vw, 1.05rem)', maxWidth: '100%', margin: '0 auto', wordBreak: 'break-word', WebkitTextWrap: 'balance', textWrap: 'balance', overflowWrap: 'break-word'}}>参加者だけのクローズドな空間で、安心して思い出を共有できます。</p>
            </div>
          </div>
          <div className="mt-4" />
        </div>
      </section>
      {/* Event Examples Section */}
      <section className="py-16 px-4 overflow-hidden w-full" style={{overflowX: 'hidden'}}>
        <div className="w-full mx-auto px-2" style={{overflowX: 'hidden'}}>
          <h2 className="text-3xl font-bold text-center mb-12 text-black text-balance" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', maxWidth: '28ch', marginLeft: 'auto', marginRight: 'auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance'}}>
            開催イベント例
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 max-w-full" style={{overflowX: 'auto'}}>
            {eventExamples.map((ev, i) => (
              <Card key={i} className="event-card w-full sm:w-64 min-w-0 sm:min-w-[260px] flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img src={ev.img} alt={ev.title} className="w-full max-w-full h-auto object-cover block" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 text-gray-900">{ev.title}</h3>
                  <p className="text-sm text-gray-800 mb-2">{ev.date}</p>
                  <div className="flex items-center text-sm text-gray-800">
                    <Icon type="user" className="w-4 h-4 mr-1" />
                    <span>参加者: {ev.participants}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="pb-16 px-4 bg-gray-50 w-full" style={{overflowX: 'hidden'}}>
        <div className="w-full mx-auto px-2" style={{overflowX: 'hidden'}}>
          <h2 className="text-3xl font-bold text-center mt-4 mb-4 text-balance text-black" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', maxWidth: '28ch', marginLeft: 'auto', marginRight: 'auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance', color: '#000'}}>
            利用者の声
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                    <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black" style={{color:'#000'}}>{t.name}</h4>
                    <p className="text-sm text-black" style={{color:'#000'}}>{t.role}</p>
                  </div>
                </div>
                <p className="text-black" style={{color:'#000'}}>&quot;{t.comment}&quot;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Pricing Section（洗練・装飾追加） */}
      <section className="px-4 w-full bg-gradient-to-br from-blue-100 via-white to-pink-100" style={{overflowX: 'hidden'}}>
        <div className="w-full mx-auto px-2" style={{overflowX: 'hidden'}}>
          <h2 className="mt-8 text-4xl font-extrabold text-center mb-4 tracking-wide text-balance text-black" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", letterSpacing: '0.1em', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', maxWidth: '28ch', marginLeft: 'auto', marginRight: 'auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance', color: '#000'}}>
            料金プラン
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border ${plan.highlight ? 'border-blue-600 scale-105 z-10 shadow-2xl' : 'border-gray-100'} transition-all hover:shadow-2xl p-0 md:max-w-xl mb-4`}>
                <div className={`p-8 border-b ${plan.highlight ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-pink-400 text-white relative' : ''}`} style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>
                  {plan.highlight && <div className="absolute top-4 right-4 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow">人気</div>}
                  <h3 className="text-2xl font-bold mb-2 tracking-wide drop-shadow-sm text-center md:text-3xl md:mb-4 text-black" style={{color:'#000'}}>{plan.name}</h3>
                  <div className="flex items-end justify-center md:justify-center mb-4 md:mb-6 gap-1 md:gap-2">
                    <span className="text-4xl md:text-5xl font-extrabold drop-shadow-sm">{plan.price}</span>
                    <span className={`ml-1 ${plan.highlight ? 'text-white text-opacity-80' : 'text-black'} text-sm md:text-base`} style={{fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", maxWidth: '5.5ch', whiteSpace: 'nowrap', fontSize: 'clamp(0.8rem, 1.2vw, 1.05rem)', color: plan.highlight ? undefined : '#000'}}>/イベント</span>
                  </div>
                  <p className={plan.highlight ? 'text-white text-opacity-90' : 'text-black'} style={plan.highlight ? undefined : {color:'#000'}}>{plan.desc}</p>
                </div>
                <div className="p-8 bg-gradient-to-br from-white via-blue-50 to-pink-50">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className={`flex items-start ${f.includes('なし') ? 'text-gray-400' : 'text-black'} text-base`} style={f.includes('なし') ? {fontFamily: "'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"} : {fontFamily: "'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", color:'#000'}}>
                        <Icon type={f.includes('なし') ? 'close' : 'check'} className={`w-5 h-5 mt-0.5 mr-2 ${f.includes('なし') ? 'text-gray-400' : 'text-green-500'}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button className={`w-full py-3 rounded-full font-bold text-lg shadow-md transition-all bg-gradient-to-r from-blue-500 via-blue-400 to-pink-400 text-white hover:from-pink-400 hover:to-blue-500`}>{plan.price === '無料' ? '無料で始める' : '申し込む'}</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white w-full" style={{overflowX: 'hidden'}}>
        <div className="w-full mx-auto px-2 text-center" style={{overflowX: 'hidden'}}>
          <h2 className="text-3xl font-bold mb-6 text-balance" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', maxWidth: '28ch', marginLeft: 'auto', marginRight: 'auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance'}}>
            イベントをもっと特別な体験に
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-balance" style={{fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(1rem, 3vw, 1.3rem)', maxWidth: '32ch', marginLeft: 'auto', marginRight: 'auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance'}}>
            FesSnapで、参加者全員の視点からイベントを記録しましょう。思い出はみんなで作るもの。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all shadow-lg border border-white hover:bg-blue-100 hover:text-blue-600" style={{background: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)'}} onClick={handleStart}>イベントを探す</Button>
            <Button className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-blue-400 hover:to-pink-400 transition-all shadow-lg" onClick={()=>router.push('/admin')}>イベント作成</Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-white border-gray-100 py-12 px-4 w-full mt-12 pt-12" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: 0}}>
        <div className="w-full mx-auto px-2" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: 0}}>
          <div className="flex flex-col items-center mb-8 w-full" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box'}}>
            <h2
              className="font-extrabold text-center mb-4 tracking-tight leading-tight drop-shadow-xl text-balance text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-400 to-blue-600"
              style={{
                fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                letterSpacing: '0.04em',
                fontSize: 'clamp(1.1rem, 6vw, 2.2rem)',
                lineHeight: 1.15,
                maxWidth: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                wordBreak: 'keep-all',
                WebkitTextWrap: 'balance',
                textWrap: 'balance',
              }}
            >
              イベントの感動を、その場でみんなと。
            </h2>
            <p className="text-gray-500 mb-6 text-sm text-center w-full" style={{fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', maxWidth: '32ch', margin: '0 auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance', overflowX: 'hidden', boxSizing: 'border-box', paddingLeft: '1rem', paddingRight: '1rem'}}>
              イベントの思い出をリアルタイムで共有。<br />新しい写真共有の形を提供します。
            </p>
          </div>
          <div className="border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 w-full" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box'}}>
            <p className="mx-auto md:mx-0 w-full text-center" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box', margin: 0}}>&copy; 2025 FesSnap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 