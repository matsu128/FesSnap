// LP（紹介ページ）のメイン部分を構成するorganism
// Header, ServiceVideo, HorizontalEventSlider, EmphasizedNavButtonを組み合わせて、ページ遷移も実装
// APIからダミーイベントデータを取得してスライダーに渡す
import { useEffect, useState, useRef } from 'react';
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
import { supabase } from '../../lib/supabaseClient';
import LoginModal from '../molecules/LoginModal';

export default function LPMain() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
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
      name: 'Freeプラン', price: '0円', desc: '小規模イベント<br />（親しい友人の誕生日会など）', features: [
        '画像25枚（最大5人分想定）', '7日間', '無料で気軽に試せる', '参加者数が少なくて<br />シンプル利用向き',
      ], highlight: false,
    },
    {
      name: 'Plusプラン', price: '7,000円', desc: '中規模イベント<br />（小規模結婚式、子ども会、サークルイベント）', features: [
        '画像125枚（最大25人分想定）', '30日間', 'まとまった写真枚数対応', '高画質アップロード対応', 'QRコード共有で参加者も<br />簡単投稿',
      ], highlight: true,
    },
    {
      name: 'Proプラン', price: '15,000円', desc: '大規模イベント<br />（結婚式・企業パーティ<br />地域イベント・フェス）', features: [
        '画像無制限', '1年間', '枚数制限なし', '長期間の保存・共有が可能', '写真のモデレーションや<br />カスタマイズ機能付き', '専用サポート対応',
      ], highlight: false,
    },
  ];

  // ログイン状態を確認
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error('Login status check error:', error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 今すぐ始めるボタンでイベントページへ
  const handleStart = () => router.push('/events');
  const handleCreateEvent = () => router.push('/admin');
  const handleTryPost = () => router.push('/events/630316dc-a3a3-4a16-98c5-ae7a3094533e/post');

  return (
    <>
      <Header type="menu" onMenuClick={() => setShowMenu(v => !v)} onLoginClick={() => setLoginModalOpen(true)} />
      {showMenu && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowMenu(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[240px] max-w-[90vw] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            {!isLoggedIn ? (
              <>
                <Button onClick={() => { setLoginModalOpen(true); setShowMenu(false); }} className="w-full text-base py-3 bg-slate-700">ログイン</Button>
                <Button onClick={() => { router.push('/events'); setShowMenu(false); }} className="w-full text-base py-3 bg-blue-600">ホーム</Button>
              </>
            ) : (
              <>
                <Button onClick={() => { router.push('/events'); setShowMenu(false); }} className="w-full text-base py-3 bg-blue-600">ホーム</Button>
                <Button onClick={() => { router.push('/admin'); setShowMenu(false); }} className="w-full text-base py-3 bg-green-600">新規イベント作成</Button>
              </>
            )}
          </div>
        </div>
      )}
      {/* LoginModal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <section className="hero-section flex flex-col items-center justify-start relative overflow-hidden w-full min-h-screen pt-[56px] mt-4 bg-white">
        <div className="w-full max-w-2xl lg:max-w-4xl mx-auto" style={{margin: '0 auto', boxSizing: 'border-box', paddingLeft: '1rem', paddingRight: '1rem', overflowX: 'hidden'}}>
          <h1
            className="mb-6 mt-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-center bg-gradient-to-r from-[#00c6fb] to-[#005bea] bg-clip-text text-transparent drop-shadow-lg"
            style={{
              fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
              letterSpacing: '0.15em',
              lineHeight: 1.1,
              wordBreak: 'keep-all',
              maxWidth: '100%',
              marginLeft: 'auto',
              marginRight: 'auto',
              overflowWrap: 'break-word',
              fontSize: 'clamp(2.6rem, 8vw, 5rem)',
            }}
          >
            FesSnap
          </h1>
          <h2
            className="font-extrabold text-white mb-4 tracking-tight leading-tight drop-shadow-xl text-center sm:text-center"
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
            }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-pink-400 to-blue-600 bg-clip-text text-transparent block">
              <span className="block text-left sm:text-center">イベントの感動を、<span className="sm:hidden"><br /></span></span>
              <span className="block text-right sm:text-center w-full" style={{display: 'block'}}>
                <span className="sm:hidden">その場でみんなと。</span>
                <span className="hidden sm:inline">その場でみんなと。</span>
              </span>
            </span>
          </h2>
          <p
            className="font-light mb-8 mx-auto leading-relaxed sm:leading-normal w-full text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600"
            style={{
              fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
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
            <span className="block text-center mt-1">新しい写真共有の形を提供します。</span>
          </p>
          <div className="flex flex-row gap-6 md:gap-10 justify-center items-center w-full max-w-xs md:max-w-md mx-auto mb-8 mt-10">
            <Button onClick={handleCreateEvent} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full font-bold text-base shadow-md transition">イベント作成</Button>
            <Button onClick={handleTryPost} className="flex-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-blue-400 hover:to-pink-400 text-white py-3 rounded-full font-bold text-base shadow-md transition">お試し投稿</Button>
          </div>
          {/* QRコード画像カード */}
          <div className="flex flex-col items-center w-full mb-4">
            <div className="bg-white rounded-2xl shadow-lg p-3 max-w-[150px] md:max-w-[180px] lg:max-w-[220px] w-full aspect-square flex items-center justify-center cursor-pointer" onClick={() => router.push('/events')}>
              <img src="/QR_code.jpg" alt="QRコード" className="w-full h-full object-contain rounded-xl aspect-square" />
            </div>
            {/* 使い方はこちら文言 */}
            <div className="w-full flex justify-center mt-4 mb-2">
              <span className="text-2xl md:text-3xl font-semibold text-gray-700 text-center select-none cursor-pointer" onClick={() => {
                const el = document.getElementById('howto');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>使い方はこちら</span>
            </div>
            {/* 下向き矢印アニメーション */}
            <div className="flex justify-center mt-2 mb-6 overflow-visible">
              <span className="block text-6xl md:text-7xl lg:text-8xl font-black text-[#00c6fb] select-none" style={{filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.10))', lineHeight: '1'}}>
                ↓
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section（使い方） */}
      <section id="howto" className="px-4 bg-gradient-to-b from-blue-50 to-white w-full" style={{overflowX: 'hidden'}}>
        <div className="w-full max-w-screen-lg mx-auto px-2" style={{overflowX: 'hidden'}}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg tracking-wide mt-12" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", letterSpacing: '0.08em'}}>使い方</h2>
          <div className="relative flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-stretch w-full" style={{overflowX: 'hidden'}}>
            {/* Feature 0: 1：QRコード読み込み\n2：画像投稿（再生ボタン付き） */}
            <div className="flex flex-col items-center mb-6 w-full max-w-[240px] mx-auto">
              <h3 className="text-lg font-bold mb-2 text-center text-blue-700 whitespace-pre-line" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>1：QRコード読み込み{`\n`}2：画像投稿</h3>
              <VideoWithPlayButton src="/publish_image_demo.mp4" />
            </div>
            {/* Feature 1: イベント作成 */}
            <div className="flex flex-col items-center mb-10 w-full max-w-[240px] mx-auto">
              <h3 className="text-lg font-bold mb-2 text-center text-blue-700" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>イベント作成</h3>
              <VideoWithPlayButton src="/create_event.mp4" />
            </div>
          </div>
          <div className="mt-4" />
        </div>
      </section>
      {/* Event Examples Section */}
      <section className="py-16 px-4 overflow-hidden w-full" style={{overflowX: 'hidden'}}>
        <div className="w-full mx-auto px-2" style={{overflowX: 'hidden'}}>
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg text-balance" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', maxWidth: '28ch', marginLeft: 'auto', marginRight: 'auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance'}}>
            開催イベント例
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 max-w-full" style={{overflowX: 'auto'}}>
            {eventExamples.map((ev, i) => (
              <Card key={i} className="event-card w-full sm:w-64 min-w-0 sm:min-w-[260px] flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img src={ev.img} alt={`${ev.title}のイベント写真｜FesSnapイベント写真共有サービス`} className="w-full max-w-full h-auto object-cover block" />
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
          <h2 className="text-3xl font-bold text-center mt-4 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg text-balance" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', maxWidth: '28ch', marginLeft: 'auto', marginRight: 'auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance'}}>
            利用者の声
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                    <img src={t.img} alt={`${t.name}さんの顔写真｜FesSnap利用者の声`} className="w-full h-full object-cover" />
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
          <h2 className="mt-8 text-4xl font-extrabold text-center mb-4 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg text-balance" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", letterSpacing: '0.1em', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', maxWidth: '28ch', marginLeft: 'auto', marginRight: 'auto', wordBreak: 'keep-all', WebkitTextWrap: 'balance', textWrap: 'balance'}}>
            料金プラン
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border ${plan.highlight ? 'border-blue-600 scale-105 z-10 shadow-2xl' : 'border-gray-100'} transition-all hover:shadow-2xl p-0 md:max-w-xl mb-4`}>
                <div className={`p-8 border-b ${plan.highlight ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-pink-400 text-white relative' : ''}`} style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>
                  {plan.highlight && <div className="absolute top-4 right-4 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow">人気</div>}
                  <h3 className="text-2xl font-bold mb-2 tracking-wide drop-shadow-sm text-center md:text-3xl md:mb-4 text-black" style={{color:'#000'}}>
                    <span className="text-3xl md:text-4xl">{plan.name.split('プラン')[0]}</span>
                    <span className="text-lg md:text-xl ml-1">プラン</span>
                  </h3>
                  <div className="flex items-end justify-center md:justify-center mb-4 md:mb-6 gap-1 md:gap-2">
                    <span className={`text-4xl md:text-5xl font-extrabold drop-shadow-sm whitespace-nowrap ${plan.price === '0円' ? 'text-blue-500' : 'text-pink-500'}`}>{plan.price}</span>
                    <span className={`ml-1 ${plan.highlight ? 'text-white text-opacity-80' : 'text-black'} text-sm md:text-base whitespace-nowrap`} style={{fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", maxWidth: '5.5ch', fontSize: 'clamp(0.8rem, 1.2vw, 1.05rem)', color: plan.highlight ? undefined : '#000'}}>/イベント</span>
                  </div>
                  <p className={plan.highlight ? 'text-white text-opacity-90' : 'text-black'} style={plan.highlight ? undefined : {color:'#000'}} dangerouslySetInnerHTML={{ __html: plan.desc }}></p>
                </div>
                <div className="p-8 bg-gradient-to-br from-white via-blue-50 to-pink-50">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className={`flex items-start ${f.includes('なし') ? 'text-gray-400' : 'text-black'} text-xs md:text-base`} style={f.includes('なし') ? {fontFamily: "'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"} : {fontFamily: "'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", color:'#000'}}>
                        <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 mt-0.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`whitespace-nowrap md:whitespace-normal break-words ${f.includes('枚') || f.includes('日間') || f.includes('画像無制限') || f.includes('年間') || f.includes('制限なし') ? 'text-blue-600 font-semibold' : ''}`} dangerouslySetInnerHTML={{ __html: f }}></span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href="/stripe">
                      <button className={`mt-auto px-8 py-3 rounded-full font-bold text-white ${plan.price === '0円' ? 'bg-blue-400' : 'bg-pink-500'} shadow-lg hover:opacity-90 transition disabled:opacity-60 w-full text-sm sm:text-base`}>
                        {plan.price === '0円'
                          ? '無料で始める'
                          : plan.price === '15,000円'
                            ? '15,000円で申込'
                            : plan.price === '7,000円'
                              ? '7,000円で申込'
                              : `${plan.price}で申込`
                        }
                      </button>
                    </Link>
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
      <footer className="bg-white border-gray-100 py-6 px-4 w-full mt-8 pt-8" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: 0}}>
        <div className="w-full mx-auto px-2" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: 0}}>
          <div className="flex flex-col items-center w-full" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box'}}>
            <h2
              className="mb-4 mt-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-center bg-gradient-to-r from-[#00c6fb] to-[#005bea] bg-clip-text text-transparent drop-shadow-lg"
              style={{
                fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                letterSpacing: '0.15em',
                lineHeight: 1.1,
                wordBreak: 'keep-all',
                maxWidth: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                overflowWrap: 'break-word',
                fontSize: 'clamp(2.6rem, 8vw, 5rem)',
              }}
            >
              FesSnap
            </h2>
          </div>
          <div className="border-gray-100 pt-8 flex flex-col items-center text-sm text-gray-500 w-full" style={{overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box'}}>
            <div className="flex flex-col items-center w-full gap-1">
              <span className="text-center w-full">© 2025 FesSnap.</span>
              <span className="text-center w-full">All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
      {/* QRコード拡大モーダル */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowQRModal(false)}>
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-[90vw] max-h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQRModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow">
              ×
            </button>
            <img src="/QR_code.jpg" alt="QRコード拡大" className="w-full h-full max-w-[70vw] max-h-[70vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </>
  );
}

function VideoWithPlayButton({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const handlePlay = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = true; // Safari対策
      video.load();      // Safari対策
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise) {
        playPromise.then(() => setPlaying(true)).catch(() => {});
      } else {
        setPlaying(true);
      }
    }
  };
  return (
    <div className="w-full aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden mb-2 flex items-center justify-center relative">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        controls={false}
        preload="auto"
        tabIndex={-1}
        style={{ background: '#e5e7eb' }}
      />
      {!playing && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors duration-200"
          style={{ cursor: 'pointer' }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="white" fillOpacity="0.85" />
            <polygon points="22,18 40,28 22,38" fill="#2563EB" />
          </svg>
        </button>
      )}
    </div>
  );
} 