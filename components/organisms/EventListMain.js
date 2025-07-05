// イベントリストページのメイン部分を構成するorganism
// Header, FilterBar, イベントカードリスト、ページネーションを含む
// APIからイベントデータを取得し、フィルタ・ページネーションも実装
import { useState, useRef, useEffect } from 'react';
import Header from '../molecules/Header';
import FilterBar from '../molecules/FilterBar';
import Card from '../atoms/Card';
import Button from '../atoms/Button';
import { useRouter } from 'next/navigation';
import Modal from '../atoms/Modal';
import LoginModal from '../molecules/LoginModal';
import PrefectureSelect from '../atoms/PrefectureSelect';
import DatePickerModal from '../atoms/DatePickerModal';
import CategorySelectModal from '../atoms/CategorySelectModal';
import { supabase } from '../../lib/supabaseClient';

const PAGE_SIZE = 5;
const DEMO_EVENT_ID = '630316dc-a3a3-4a16-98c5-ae7a3094533e';

export default function EventListMain() {
  // イベントデータ・フィルタ・ページネーションの状態管理
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterState, setFilterState] = useState({ region: '', date: '', category: '' });
  const [page, setPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 動画のラストフレームで止めるためのref
  const videoRef = useRef(null);

  // ログイン状態を確認
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        console.log('Login status checked:', !!user);
      } catch (error) {
        console.error('Login status check error:', error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session?.user);
      setIsLoggedIn(!!session?.user);
      
      // ログイン成功時にイベントリストを更新
      if (event === 'SIGNED_IN' && session?.user) {
        fetch('/api/events')
          .then(res => res.json())
          .then(data => {
            setEvents(data);
            setFiltered(data);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 動画の強制再生（Safari対策）
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch(() => {});
    }
    // 保険：画面全体のクリック/タップで再生
    const handler = (e) => {
      // ボタン以外のみ
      if (e.target.tagName !== 'BUTTON' && videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('click', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  // APIからイベントデータを取得
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        // ログインしていない場合はデモイベントのみ表示
        if (!isLoggedIn) {
          const demoEvent = data.find(event => event.id === DEMO_EVENT_ID);
          setFiltered(demoEvent ? [demoEvent] : []);
        } else {
          setFiltered(data);
        }
      });
  }, [isLoggedIn]);

  // フィルタ適用（ログインしている場合のみ）
  useEffect(() => {
    if (!isLoggedIn) return;
    
    let filteredEvents = events;
    if (filterState.region) filteredEvents = filteredEvents.filter(ev => ev.region && ev.region.includes(filterState.region));
    if (filterState.date) filteredEvents = filteredEvents.filter(ev => ev.date && ev.date === filterState.date);
    if (filterState.category) filteredEvents = filteredEvents.filter(ev => ev.category && ev.category === filterState.category);
    setFiltered(filteredEvents);
    setPage(1);
  }, [filterState, events, isLoggedIn]);

  // ページネーション
  const pagedEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // イベント詳細ページへの遷移
  const handleEventClick = (id) => {
    router.push(`/events/${id}`);
  };

  // 新規イベント作成ボタン
  const handleCreateEvent = () => router.push('/admin');

  // ログインを促すメッセージのクリック
  const handleLoginPrompt = () => {
    setLoginModalOpen(true);
  };

  // ログインモーダルが閉じられた時の処理
  const handleLoginModalClose = () => {
    setLoginModalOpen(false);
    // ログイン状態を再確認
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) {
        // ログイン成功時は全イベントを表示
        fetch('/api/events')
          .then(res => res.json())
          .then(data => {
            setEvents(data);
            setFiltered(data);
          });
      }
    });
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0" style={{fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>
      {/* ミニ動画（PCと同じ比率でスマホも比率維持） */}
      <div className="w-full flex justify-center items-center pt-16 sm:pt-[4.5rem] mb-2">
        <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            className="w-full h-full object-cover object-center"
            src="/canva1.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            style={{aspectRatio: '16/9', background: '#eee'}}
            onEnded={() => { videoRef.current && (videoRef.current.currentTime = videoRef.current.duration); }}
          />
        </div>
      </div>
      {/* メイン内容 */}
      <div className="relative z-20 w-full flex flex-col items-center">
        {/* ヘッダー（ログインボタン付き） */}
        <Header type="login" onLoginClick={() => setLoginModalOpen(true)} />
        {/* ボタン行：ログインしている場合のみ表示 */}
        {isLoggedIn && (
          <>
            <div className="w-full max-w-[400px] flex items-center gap-4 justify-center mt-4 mb-4 px-2 sm:px-0">
              <Button onClick={() => setFilterModalOpen(true)} className="max-w-[140px] text-sm py-2 px-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md">絞り込み</Button>
              <Button onClick={handleCreateEvent} className="text-base px-5 py-2 rounded-full bg-blue-100 text-blue-700 shadow-sm">新規イベント作成</Button>
            </div>
            {/* 選択中のフィルタタグ */}
            <div className="w-full max-w-[400px] flex flex-wrap gap-2 mb-2 px-2 sm:px-0">
              {filterState.region && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs cursor-pointer" onClick={()=>setFilterState(s=>({...s,region:''}))}>{filterState.region} ×</span>}
              {filterState.date && <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs cursor-pointer" onClick={()=>setFilterState(s=>({...s,date:''}))}>{filterState.date} ×</span>}
              {filterState.category && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs cursor-pointer" onClick={()=>setFilterState(s=>({...s,category:''}))}>{filterState.category} ×</span>}
              {(filterState.region||filterState.date||filterState.category) && <span className="ml-auto text-xs text-gray-400 cursor-pointer underline" onClick={()=>setFilterState({region:'',date:'',category:''})}>すべて解除</span>}
            </div>
          </>
        )}
        {/* ログインしていない場合のメッセージ */}
        {!isLoggedIn && (
          <div className="w-full max-w-[400px] mt-4 mb-4 px-2 sm:px-0">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl border border-blue-200">
              <p className="text-sm text-gray-700 mb-2">ログインして自分のプロジェクトを確認しよう！</p>
              <Button onClick={handleLoginPrompt} className="text-sm py-2 px-4 rounded-full bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 text-white shadow-md">
                ログイン
              </Button>
            </div>
          </div>
        )}
        {/* フィルターモーダル */}
        <Modal isOpen={filterModalOpen} onClose={() => setFilterModalOpen(false)}>
          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
            <Button onClick={() => { setFilterModalOpen(false); setShowPrefModal(true); }} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">エリア {filterState.region && `: ${filterState.region}`}</Button>
            <Button onClick={() => { setFilterModalOpen(false); setShowDateModal(true); }} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">日付 {filterState.date && `: ${filterState.date}`}</Button>
            <Button onClick={() => { setFilterModalOpen(false); setShowCategoryModal(true); }} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">カテゴリー {filterState.category && `: ${filterState.category}`}</Button>
          </div>
        </Modal>
        <PrefectureSelect show={showPrefModal} value={filterState.region} onChange={v=>setFilterState(s=>({...s,region:v}))} onClose={()=>setShowPrefModal(false)} label="エリアを選択" />
        <DatePickerModal show={showDateModal} value={filterState.date} onChange={v=>setFilterState(s=>({...s,date:v}))} onClose={()=>setShowDateModal(false)} label="日付を選択" />
        <CategorySelectModal show={showCategoryModal} value={filterState.category} onChange={v=>setFilterState(s=>({...s,category:v}))} onClose={()=>setShowCategoryModal(false)} label="カテゴリーを選択" />
        {/* イベントリスト：おしゃれな浮遊カードのみ */}
        <div className="w-full max-w-[400px] flex flex-col gap-8 mt-2 mb-8 px-2 sm:px-0">
          {pagedEvents.length === 0 && (
            <div className="w-full text-center text-black py-12 font-bold text-lg">イベントがありません</div>
          )}
          {pagedEvents.map(event => (
            <Card key={event.id} className="cursor-pointer bg-white/80 backdrop-blur-lg rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] hover:scale-105 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.55)] transition-transform duration-200 p-6 flex flex-col gap-2 border-none" onClick={() => handleEventClick(event.id)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-blue-400 via-pink-400 to-blue-600 bg-clip-text text-transparent drop-shadow">
                  {event.title}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500">
                <span>{event.date ? `日付：${event.date}` : ''}</span>
              </div>
            </Card>
          ))}
        </div>
        {/* ページネーション：ログインしている場合のみ表示 */}
        {isLoggedIn && totalPages > 1 && (
          <div className="fixed bottom-0 left-0 w-full flex justify-center gap-2 px-2 sm:px-0 z-30 pb-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 text-sm sm:text-base ${page === i + 1 ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</Button>
            ))}
          </div>
        )}
        {/* ログインモーダル */}
        <LoginModal isOpen={loginModalOpen} onClose={handleLoginModalClose} />
      </div>
    </div>
  );
} 