// LP（紹介ページ）のメイン部分を構成するorganism
// Header, ServiceVideo, HorizontalEventSlider, EmphasizedNavButtonを組み合わせて、ページ遷移も実装
// APIからダミーイベントデータを取得してスライダーに渡す
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
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
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../molecules/LoginModal';

export default function LPMain() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const { isLoggedIn } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  // アニメーション用ref
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroDescriptionRef = useRef(null);
  const heroButtonRef = useRef(null);
  const serviceVideoRef = useRef(null);
  const eventSliderRef = useRef(null);
  const howtoTitleRef = useRef(null);
  const howtoCardsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingTitleRef = useRef(null);
  const pricingCardsRef = useRef(null);
  const pricingSectionRef = useRef(null);
  const ctaRef = useRef(null);

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
      name: 'Plusプラン', price: '3,000円', desc: '中規模イベント<br />（小規模結婚式、子ども会、サークルイベント）', features: [
        '画像125枚（最大25人分想定）', '30日間', 'まとまった写真枚数対応', '高画質アップロード対応', 'QRコード共有で参加者も<br />簡単投稿',
      ], highlight: true,
    },
    {
      name: 'Proプラン', price: '10,000円', desc: '大規模イベント<br />（結婚式・企業パーティ<br />地域イベント・フェス）', features: [
        '画像無制限', '半年間', '枚数制限なし', '長期間の保存・共有が可能', '写真のモデレーションや<br />カスタマイズ機能付き', '専用サポート対応',
      ], highlight: false,
    },
  ];

  // 認証状態の監視はuseAuthのisLoggedIn依存で十分

  // 今すぐ始めるボタンでイベントページへ
  const handleStart = () => router.push('/events');
  const handleCreateEvent = () => router.push('/admin');
  const handleTryPost = () => router.push('/events/630316dc-a3a3-4a16-98c5-ae7a3094533e/post');

  // アニメーション初期化
  useLayoutEffect(() => {
    // Heroセクション：1文字ずつバラバラに生成
    if (heroTitleRef.current) {
      const title = heroTitleRef.current;
      const chars = title.textContent.split('');
      title.innerHTML = chars.map(char => `<span class="char">${char}</span>`).join('');
      
      gsap.set('.char', { 
        opacity: 0, 
        y: 100, 
        rotationX: 90,
        transformOrigin: '50% 50% -50px'
      });
      
      gsap.to('.char', {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        delay: 0.5
      });
    }

    // Heroサブタイトル：左からスライドイン
    if (heroSubtitleRef.current) {
      gsap.fromTo(heroSubtitleRef.current, 
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.5 }
      );
    }

    // Hero説明文：下からフェードイン
    if (heroDescriptionRef.current) {
      gsap.fromTo(heroDescriptionRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.5 }
      );
    }

    // Heroボタン：スケールアニメーション
    if (heroButtonRef.current) {
      gsap.fromTo(heroButtonRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.5 }
      );
    }

    // ServiceVideo：右からスライドイン
    if (serviceVideoRef.current) {
      ScrollTrigger.create({
        trigger: serviceVideoRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(serviceVideoRef.current,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: 'power2.out' }
          );
        }
      });
    }

    // EventSlider：下からフェードイン
    if (eventSliderRef.current) {
      ScrollTrigger.create({
        trigger: eventSliderRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(eventSliderRef.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
          );
        }
      });
    }

    // 使い方タイトル：上からフェードイン
    if (howtoTitleRef.current) {
      ScrollTrigger.create({
        trigger: howtoTitleRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(howtoTitleRef.current,
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
          );
        }
      });
    }

    // 使い方カード：左と右からスライドイン
    if (howtoCardsRef.current) {
      const cards = Array.from(howtoCardsRef.current.children);
      ScrollTrigger.create({
        trigger: howtoCardsRef.current,
        start: 'top 80%',
        onEnter: () => {
          if (cards[0]) {
            gsap.fromTo(cards[0],
              { x: -100, opacity: 0 },
              { x: 0, opacity: 1, duration: 1, ease: 'power2.out' }
            );
          }
          if (cards[1]) {
            gsap.fromTo(cards[1],
              { x: 100, opacity: 0 },
              { x: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.3 }
            );
          }
        }
      });
    }

    // 利用者の声：初期表示アニメーション
    if (testimonialsRef.current) {
      const testimonials = Array.from(testimonialsRef.current.children);
      if (testimonials.length > 0) {
        gsap.set(testimonials, { y: 100, opacity: 0 });
        gsap.to(testimonials, {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power2.out',
          delay: 3.5
        });
      }
    }

    // 料金プラン：固定スクロールアニメーション
    if (pricingSectionRef.current && pricingCardsRef.current) {
      const cards = Array.from(pricingCardsRef.current.children);
      if (cards.length >= 3) {
        // 初期状態：1枚だけ表示
        cards.forEach((card, idx) => {
          gsap.set(card, { position: 'absolute', left: '50%', top: '50%', x: '-50%', y: '-50%', zIndex: 2, scale: 0.9, opacity: 0 });
        });
        gsap.set(cards[0], { scale: 1, opacity: 1, zIndex: 3 });

        ScrollTrigger.create({
          trigger: pricingSectionRef.current,
          start: 'center center',
          end: '+=300%',
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            let activeIdx = 0;
            if (progress < 0.33) {
              activeIdx = 0;
            } else if (progress < 0.66) {
              activeIdx = 1;
            } else {
              activeIdx = 2;
            }
            cards.forEach((card, idx) => {
              gsap.set(card, {
                position: 'absolute',
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%',
                zIndex: idx === activeIdx ? 3 : 2,
                scale: idx === activeIdx ? 1 : 0.9,
                opacity: idx === activeIdx ? 1 : 0
              });
            });
          },
          onLeave: () => {
            // pin解除後、Proカードのみを表示し、FreeとPlusは非表示
            cards.forEach((card, idx) => {
              gsap.set(card, {
                position: 'absolute',
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%',
                zIndex: idx === 2 ? 3 : 2,
                scale: idx === 2 ? 1 : 0.9,
                opacity: idx === 2 ? 1 : 0
              });
            });
          }
        });
      }
    }


    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

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
        <div className="w-full max-w-6xl mx-auto" style={{
          width: '100%',
          maxWidth: 'clamp(300px, 95vw, 1200px)'
        }}>
          <h1
            className="mb-6 mt-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-center bg-gradient-to-r from-[#00c6fb] to-[#005bea] bg-clip-text text-transparent drop-shadow-lg"
            style={{
              fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
              letterSpacing: '0.15em',
              lineHeight: 1.1,
              wordBreak: 'keep-all',
              maxWidth: '100%',
              margin: 'clamp(1rem, 3vw, 2rem) auto',
              overflowWrap: 'break-word',
              fontSize: 'clamp(3rem, 10vw, 6.5rem)',
              boxSizing: 'border-box'
            }}
            ref={heroTitleRef}
          >
            FesSnap
          </h1>
          <div className="mb-8 mt-4" style={{
            marginBottom: 'clamp(2rem, 6vw, 3rem)', 
            marginTop: 'clamp(1rem, 3vw, 1.5rem)',
            width: '100%',
            maxWidth: 'clamp(280px, 95vw, 1400px)',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '0 clamp(1rem, 4vw, 3rem)',
            boxSizing: 'border-box'
          }}>
            <h2
              className="font-extrabold text-white tracking-tight leading-tight drop-shadow-xl text-center sm:text-center"
              style={{
                fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                letterSpacing: '0.04em',
                textShadow: '0 4px 24px rgba(0,0,0,0.18)',
                fontSize: 'clamp(1.1rem, 6vw, 4.5rem)',
                lineHeight: 1.15,
                maxWidth: '100%',
                margin: '0 auto',
                wordBreak: 'keep-all',
                width: '100%',
                boxSizing: 'border-box'
              }}
              ref={heroSubtitleRef}
            >
              <span className="block w-full text-center mx-auto" style={{
                maxWidth: '100%',
                width: '100%'
              }}>
                <span className="block font-bold mb-2 sm:mb-3 text-lg sm:text-xl text-black" style={{
                  fontSize: 'clamp(0.95rem, 4.5vw, 2.5rem)',
                  marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)',
                  lineHeight: '1.3',
                  wordBreak: 'keep-all',
                  maxWidth: '100%',
                  width: '100%'
                }}>
                  <span className="bg-gradient-to-r from-[#00c6fb] to-[#005bea] bg-clip-text text-transparent text-xl sm:text-2xl align-middle" style={{fontSize: 'clamp(1.05rem, 5vw, 3rem)'}}>QRコード</span>でつながった人だけが
                </span>
                <span className="block font-bold bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-3 text-2xl sm:text-3xl lg:inline lg:whitespace-nowrap" style={{
                  fontSize: 'clamp(1.3rem, 5.5vw, 3.2rem)',
                  marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)',
                  lineHeight: '1.2',
                  wordBreak: 'keep-all',
                  maxWidth: '100%',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>写真を投稿・閲覧できる</span>
                <span className="block font-bold mb-2 sm:mb-3 text-lg sm:text-xl text-black lg:block lg:ml-2" style={{
                  fontSize: 'clamp(0.95rem, 4.5vw, 2.2rem)',
                  marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)',
                  lineHeight: '1.3',
                  wordBreak: 'keep-all',
                  maxWidth: '100%',
                  width: '100%'
                }}>
                  <span className="bg-gradient-to-r from-[#00c6fb] to-[#005bea] bg-clip-text text-transparent text-xl sm:text-2xl align-middle" style={{fontSize: 'clamp(1.05rem, 5vw, 2.8rem)'}}>クローズドな空間</span>を提供します。
                </span>
              </span>
            </h2>
            <p
              className="font-light mx-auto leading-relaxed sm:leading-normal w-full text-center mt-6"
              style={{
                fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                fontSize: 'clamp(0.95rem, 4vw, 2.5rem)',
                maxWidth: '100%',
                margin: '0 auto',
                wordBreak: 'keep-all',
                WebkitTextWrap: 'balance',
                textWrap: 'balance',
                lineHeight: 1.5,
                letterSpacing: '0.01em',
                boxSizing: 'border-box',
                overflowX: 'hidden',
                padding: '0',
                marginTop: 'clamp(1.5rem, 4vw, 2rem)',
                width: '100%'
              }}
              ref={heroDescriptionRef}
            >
              <span className="block text-xl sm:text-2xl font-bold mt-4 lg:inline" style={{
                fontSize: 'clamp(1.1rem, 4.5vw, 3rem)',
                marginTop: 'clamp(1rem, 3vw, 1.5rem)',
                lineHeight: '1.3',
                wordBreak: 'keep-all',
                maxWidth: '100%',
                width: '100%'
              }}>
                <span className="bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 bg-clip-text text-transparent">あの写真誰が撮ったんだっけ？</span><span className="hidden lg:inline"> </span><br className="lg:hidden" />
                <span className="text-black lg:inline">をなくすサービスです。</span>
              </span>
            </p>
          </div>
          {/* QRコード画像カード・使い方・下向き矢印 */}
          <div className="flex flex-col items-center w-full mb-4" style={{
            marginBottom: 'clamp(1rem, 4vw, 2rem)',
            width: '100%',
            maxWidth: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '0',
            boxSizing: 'border-box'
          }}>
            <div className="bg-white rounded-2xl shadow-lg p-3 w-full aspect-square flex items-center justify-center cursor-pointer" style={{
              maxWidth: 'clamp(110px, 22vw, 260px)',
              padding: 'clamp(0.5rem, 2vw, 0.75rem)',
              width: '100%',
              boxSizing: 'border-box'
            }} onClick={() => router.push('/events')}>
              <img src="/QR_code.jpg" alt="QRコード" className="w-full h-full object-contain rounded-xl aspect-square" />
            </div>
            {/* 使い方はこちら文言 */}
            <div className="w-full flex justify-center mt-4 mb-6" style={{
              marginTop: 'clamp(1rem, 3vw, 1.5rem)',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              width: '100%'
            }}>
              <span className="text-2xl md:text-3xl font-semibold text-gray-700 text-center select-none cursor-pointer" style={{
                fontSize: 'clamp(1.2rem, 5vw, 2.8rem)',
                lineHeight: '1.3',
                wordBreak: 'keep-all',
                maxWidth: '100%',
                width: '100%'
              }} onClick={() => {
                const el = document.getElementById('howto');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>使い方はこちら</span>
            </div>
            {/* 下向き矢印アニメーション */}
            <div className="flex justify-center mt-2 mb-6 overflow-visible" style={{
              marginTop: 'clamp(0.5rem, 2vw, 1rem)',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              width: '100%'
            }}>
              <span className="block text-6xl md:text-7xl lg:text-8xl font-black text-[#00c6fb] select-none" style={{
                fontSize: 'clamp(2.5rem, 12vw, 7rem)',
                filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.10))', 
                lineHeight: '1'
              }}>
                ↓
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section（使い方） */}
      <section id="howto" className="px-4 bg-gradient-to-b from-blue-50 to-white w-full" style={{overflowX: 'hidden', padding: 'clamp(1rem, 4vw, 2rem)'}}>
        <div className="w-full max-w-6xl mx-auto px-2" style={{overflowX: 'hidden', padding: 'clamp(0.5rem, 2vw, 1rem)'}}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg tracking-wide" style={{
            fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", 
            letterSpacing: '0.08em',
            fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
            margin: 'clamp(3rem, 8vw, 4rem) auto clamp(1rem, 4vw, 2rem) auto',
            padding: 'clamp(1rem, 3vw, 2rem) 0',
            width: '100%',
            minHeight: 'clamp(4rem, 10vw, 6rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1.2'
          }}
          ref={howtoTitleRef}
          >
            使い方
          </h2>
          <div className="w-full flex justify-center mb-6" style={{marginBottom: 'clamp(1.5rem, 4vw, 2rem)'}}>
            <p className="text-center text-base sm:text-lg md:text-xl font-bold text-gray-700 leading-relaxed mx-auto max-w-sm sm:max-w-2xl lg:max-w-4xl" style={{
              fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", 
              lineHeight: '1.7', 
              whiteSpace: 'pre-line',
              fontSize: 'clamp(0.6rem, 3.5vw, 1.8rem)',
              maxWidth: 'clamp(280px, 95vw, 1400px)',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <span className="text-[#2563EB] block lg:block" style={{
                fontSize: 'clamp(0.6rem, 3.5vw, 1.8rem)',
                lineHeight: '1.3',
                wordBreak: 'keep-all',
                maxWidth: '100%',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>１：イベントを作成してQRコードを取得</span>
              <span className="text-pink-500 block lg:block" style={{
                fontSize: 'clamp(0.6rem, 3.5vw, 1.8rem)',
                lineHeight: '1.3',
                wordBreak: 'keep-all',
                maxWidth: '100%',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>２：QRコードをシェアして実際に画像を投稿！</span>
            </p>
          </div>
          <div className="relative flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-stretch w-full" style={{
            overflowX: 'hidden',
            gap: 'clamp(2rem, 6vw, 3rem)'
          }}
          ref={howtoCardsRef}
          >
            {/* 並び順を逆に：まずイベント作成、次にQRコード読み込み */}
            <div className="flex flex-col items-center mb-10 w-full max-w-[240px] md:max-w-[320px] mx-auto" style={{
              marginBottom: 'clamp(2.5rem, 6vw, 3rem)',
              maxWidth: 'clamp(200px, 60vw, 320px)'
            }}>
              <h3 className="text-lg font-bold mb-2 text-center text-[#2563EB]" style={{
                fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                fontSize: 'clamp(1.1rem, 4vw, 1.25rem)',
                marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)'
              }}>1：イベント作成</h3>
              <VideoWithPlayButton src="/create_event.mp4" />
              <Button className="mt-3 w-full bg-[#2563EB] text-white font-bold py-2 rounded-full shadow-md hover:bg-blue-700 transition" style={{
                marginTop: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)'
              }} onClick={() => router.push('/admin')}>イベントを作成してみる</Button>
            </div>
            <div className="flex flex-col items-center mb-6 w-full max-w-[240px] md:max-w-[320px] mx-auto" style={{
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              maxWidth: 'clamp(200px, 60vw, 320px)'
            }}>
              <h3 className="text-lg font-bold mb-2 text-center text-pink-500 whitespace-pre-line" style={{
                fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                fontSize: 'clamp(1.1rem, 4vw, 1.25rem)',
                marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)'
              }}>2：画像投稿</h3>
              <VideoWithPlayButton src="/publish_image_demo.mp4" />
              <Button className="mt-3 w-full bg-pink-500 text-white font-bold py-2 rounded-full shadow-md hover:bg-pink-600 transition" style={{
                marginTop: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)'
              }} onClick={() => router.push('/events/630316dc-a3a3-4a16-98c5-ae7a3094533e/post')}>画像投稿を試してみる</Button>
            </div>
          </div>
          <div className="mt-4" style={{marginTop: 'clamp(1rem, 3vw, 1.5rem)'}} />
        </div>
      </section>
      {/* Event Examples Section */}
      <section className="py-16 px-4 overflow-hidden w-full" style={{
        overflowX: 'hidden',
        padding: 'clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2rem)'
      }}>
        <div className="w-full mx-auto px-2" style={{
          overflowX: 'hidden',
          padding: 'clamp(0.5rem, 2vw, 1rem)'
        }}>
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg text-balance" style={{
            fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", 
            fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', 
            maxWidth: '28ch', 
            margin: 'clamp(1rem, 3vw, 2rem) auto',
            padding: 'clamp(0.5rem, 2vw, 1rem) 0',
            width: '100%',
            minHeight: 'clamp(2rem, 5vw, 3rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1.2',
            wordBreak: 'keep-all', 
            WebkitTextWrap: 'balance', 
            textWrap: 'balance'
          }}>
            開催イベント例
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 max-w-full" style={{
            overflowX: 'auto',
            gap: 'clamp(1rem, 3vw, 1.5rem)',
            paddingBottom: 'clamp(1rem, 3vw, 1.5rem)'
          }}>
            {eventExamples.map((ev, i) => (
              <Card key={i} className="event-card w-full sm:w-64 min-w-0 sm:min-w-[260px] flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden" style={{
                minWidth: 'clamp(200px, 60vw, 260px)'
              }}>
                <div className="h-40 overflow-hidden" style={{height: 'clamp(120px, 25vw, 160px)'}}>
                  <img src={ev.img} alt={`${ev.title}のイベント写真｜FesSnapイベント写真共有サービス`} className="w-full max-w-full h-auto object-cover block" />
                </div>
                <div className="p-4" style={{padding: 'clamp(0.75rem, 3vw, 1rem)'}}>
                  <h3 className="font-semibold mb-1 text-gray-900" style={{
                    fontSize: 'clamp(1rem, 3vw, 1.1rem)',
                    marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)'
                  }}>{ev.title}</h3>
                  <p className="text-sm text-gray-800 mb-2" style={{
                    fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                    marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)'
                  }}>{ev.date}</p>
                  <div className="flex items-center text-sm text-gray-800" style={{fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'}}>
                    <Icon type="user" className="w-4 h-4 mr-1" style={{
                      width: 'clamp(0.8rem, 2.5vw, 1rem)',
                      height: 'clamp(0.8rem, 2.5vw, 1rem)',
                      marginRight: 'clamp(0.25rem, 1vw, 0.5rem)'
                    }} />
                    <span>参加者: {ev.participants}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="pb-16 px-4 bg-gray-50 w-full" style={{
        overflowX: 'hidden',
        padding: 'clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 2rem)'
      }}>
        <div className="w-full mx-auto px-2" style={{
          overflowX: 'hidden',
          padding: 'clamp(0.5rem, 2vw, 1rem)'
        }}>
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg text-balance" style={{
            fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", 
            fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', 
            maxWidth: '28ch', 
            margin: 'clamp(1rem, 3vw, 1.5rem) auto',
            padding: 'clamp(1rem, 3vw, 2rem) 0',
            width: '100%',
            minHeight: 'clamp(3rem, 8vw, 5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1.2',
            wordBreak: 'keep-all', 
            WebkitTextWrap: 'balance', 
            textWrap: 'balance'
          }}
          ref={testimonialsRef}
          >
            利用者の声
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{
            gap: 'clamp(2rem, 5vw, 3rem)'
          }}>
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white p-6 rounded-lg shadow-md" style={{
                padding: 'clamp(1.5rem, 4vw, 2rem)'
              }}>
                <div className="flex items-center mb-4" style={{
                  marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
                }}>
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4" style={{
                    width: 'clamp(2.5rem, 8vw, 3rem)',
                    height: 'clamp(2.5rem, 8vw, 3rem)',
                    marginRight: 'clamp(1rem, 3vw, 1.5rem)'
                  }}>
                    <img src={t.img} alt={`${t.name}さんの顔写真｜FesSnap利用者の声`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black" style={{
                      color:'#000',
                      fontSize: 'clamp(1rem, 3vw, 1.1rem)'
                    }}>{t.name}</h4>
                    <p className="text-sm text-black" style={{
                      color:'#000',
                      fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
                    }}>{t.role}</p>
                  </div>
                </div>
                <p className="text-black" style={{
                  color:'#000',
                  fontSize: 'clamp(0.9rem, 2.8vw, 1rem)',
                  lineHeight: '1.6'
                }}>&quot;{t.comment}&quot;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Pricing Section（洗練・装飾追加） */}
      <section ref={pricingSectionRef} className="w-full bg-gradient-to-br from-blue-100 via-white to-pink-100" style={{
        padding: '2vh 0',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <div className="max-w-6xl mx-auto px-2" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <h2 className="text-4xl font-extrabold text-center tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 drop-shadow-lg text-balance" style={{
            fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", 
            letterSpacing: '0.1em', 
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
            maxWidth: '28ch', 
            margin: '2vh auto 0 auto',
            padding: '1vh 0',
            width: '100%',
            height: '8vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1.2',
            wordBreak: 'keep-all', 
            WebkitTextWrap: 'balance', 
            textWrap: 'balance',
            flexShrink: 0
          }}>
            料金プラン
          </h2>
          <div className="relative flex-1" style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
            minHeight: 0,
            height: '92vh'
          }}>
            <div className="relative" style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1000px',
              height: '100%',
              minHeight: '400px', // 必要に応じて高さを調整
              margin: '0 auto'
            }}
            ref={pricingCardsRef}
            >
              {plans.map((plan, i) => (
                <Card key={i} disableHover
                  className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border ${plan.highlight ? 'border-blue-600 scale-105 z-10 shadow-2xl' : 'border-gray-100'} transition-all hover:shadow-2xl p-0 md:max-w-xl mb-4`} style={{
                    marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
                  }}>
                  <div className={`p-8 border-b ${plan.highlight ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-pink-400 text-white relative' : ''}`} style={{
                    fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif",
                    padding: 'clamp(2rem, 5vw, 3rem)'
                  }}>
                    {plan.highlight && <div className="absolute top-4 right-4 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow" style={{
                      top: 'clamp(1rem, 3vw, 1.5rem)',
                      right: 'clamp(1rem, 3vw, 1.5rem)',
                      padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)'
                    }}>人気</div>}
                    <h3 className="text-2xl font-bold mb-2 tracking-wide drop-shadow-sm text-center md:text-3xl md:mb-4 text-black" style={{
                      color:'#000',
                      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                      marginBottom: 'clamp(0.5rem, 2vw, 1rem)'
                    }}>
                      <span className="text-3xl md:text-4xl" style={{fontSize: 'clamp(1.8rem, 5vw, 2.5rem)'}}>{plan.name.split('プラン')[0]}</span>
                      <span className="text-lg md:text-xl ml-1" style={{
                        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                        marginLeft: 'clamp(0.25rem, 1vw, 0.5rem)'
                      }}>プラン</span>
                    </h3>
                    <div className="flex items-end justify-center md:justify-center mb-4 md:mb-6 gap-1 md:gap-2" style={{
                      marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
                      gap: 'clamp(0.25rem, 1vw, 0.5rem)'
                    }}>
                      <span className={`text-4xl md:text-5xl font-extrabold drop-shadow-sm whitespace-nowrap ${plan.price === '0円' ? 'text-blue-500' : 'text-pink-500'}`} style={{
                        fontSize: 'clamp(2rem, 6vw, 3rem)'
                      }}>{plan.price}</span>
                      <span className={`ml-1 ${plan.highlight ? 'text-white text-opacity-80' : 'text-black'} text-sm md:text-base whitespace-nowrap`} style={{
                        fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", 
                        maxWidth: '5.5ch', 
                        fontSize: 'clamp(0.8rem, 1.2vw, 1.05rem)', 
                        color: plan.highlight ? undefined : '#000',
                        marginLeft: 'clamp(0.25rem, 1vw, 0.5rem)'
                      }}>/イベント</span>
                    </div>
                    <p className={plan.highlight ? 'text-white text-opacity-90' : 'text-black'} style={{
                      ...(plan.highlight ? undefined : {color:'#000'}),
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                    }} dangerouslySetInnerHTML={{ __html: plan.desc }}></p>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-white via-blue-50 to-pink-50" style={{
                    padding: 'clamp(2rem, 5vw, 3rem)'
                  }}>
                    <ul className="space-y-3 mb-6" style={{
                      gap: 'clamp(0.75rem, 2vw, 1rem)',
                      marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
                    }}>
                      {plan.features.map((f, j) => (
                        <li key={j} className={`flex items-start ${f.includes('なし') ? 'text-gray-400' : 'text-black'} text-xs md:text-base`} style={{
                          ...(f.includes('なし') ? {fontFamily: "'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"} : {fontFamily: "'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", color:'#000'}),
                          fontSize: 'clamp(0.8rem, 2.5vw, 1rem)'
                        }}>
                          <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 mt-0.5 text-green-500 flex-shrink-0" style={{
                            width: 'clamp(0.8rem, 2.5vw, 1rem)',
                            height: 'clamp(0.8rem, 2.5vw, 1rem)',
                            marginRight: 'clamp(0.25rem, 1vw, 0.5rem)',
                            marginTop: 'clamp(0.1rem, 0.5vw, 0.2rem)'
                          }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className={`whitespace-nowrap md:whitespace-normal break-words ${f.includes('枚') || f.includes('日間') || f.includes('画像無制限') || f.includes('年間') || f.includes('制限なし') ? 'text-blue-600 font-semibold' : ''}`} dangerouslySetInnerHTML={{ __html: f }}></span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col md:flex-row gap-4 justify-center" style={{
                      gap: 'clamp(1rem, 3vw, 1.5rem)'
                    }}>
                      <button
                        type="button"
                        className={`mt-auto px-8 py-3 rounded-full font-bold text-white ${plan.price === '0円' ? 'bg-blue-400' : 'bg-pink-500'} shadow-lg hover:opacity-90 transition disabled:opacity-60 w-full text-sm sm:text-base`}
                        style={{
                          padding: 'clamp(0.75rem, 2vw, 1rem) clamp(2rem, 5vw, 3rem)',
                          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                        }}
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem('stripeFrom', 'top');
                          }
                          router.push('/stripe');
                        }}
                      >
                        詳細を見る
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white w-full" style={{
        overflowX: 'hidden',
        padding: 'clamp(4rem, 10vw, 6rem) clamp(1rem, 4vw, 2rem)'
      }}>
        <div className="w-full mx-auto px-2 text-center" style={{
          overflowX: 'hidden',
          padding: 'clamp(0.5rem, 2vw, 1rem)'
        }}>
          <h2 className="text-3xl font-bold text-balance" style={{
            fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", 
            fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', 
            maxWidth: '28ch', 
            margin: '0 auto clamp(1.5rem, 4vw, 2rem) auto',
            padding: 'clamp(1rem, 3vw, 2rem) 0',
            width: '100%',
            minHeight: 'clamp(3rem, 8vw, 5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1.2',
            wordBreak: 'keep-all', 
            WebkitTextWrap: 'balance', 
            textWrap: 'balance'
          }}>
            イベントをもっと特別な体験に
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-balance" style={{
            fontFamily: "'Quicksand', 'Noto Sans JP', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif", 
            fontSize: 'clamp(1rem, 3vw, 1.3rem)', 
            maxWidth: '32ch', 
            marginLeft: 'auto', 
            marginRight: 'auto', 
            wordBreak: 'keep-all', 
            WebkitTextWrap: 'balance', 
            textWrap: 'balance',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            FesSnapで、参加者全員の視点からイベントを記録しましょう。思い出はみんなで作るもの。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4" style={{
            gap: 'clamp(1rem, 3vw, 1.5rem)'
          }}>
            <Button className="bg-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all shadow-lg border border-white hover:bg-blue-100 hover:text-blue-600" style={{
              background: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)',
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(2rem, 5vw, 3rem)',
              fontSize: 'clamp(1rem, 3vw, 1.25rem)'
            }} onClick={handleStart}>イベントを探す</Button>
            <Button className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-blue-400 hover:to-pink-400 transition-all shadow-lg" style={{
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(2rem, 5vw, 3rem)',
              fontSize: 'clamp(1rem, 3vw, 1.25rem)'
            }} onClick={()=>router.push('/admin')}>イベント作成</Button>
          </div>
        </div>
      </section>
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