// イベントリストページのメイン部分を構成するorganism
// Header, FilterBar, イベントカードリスト、ページネーションを含む
// APIからイベントデータを取得し、フィルタ・ページネーションも実装
import { useEffect, useState } from 'react';
import Header from '../molecules/Header';
import FilterBar from '../molecules/FilterBar';
import Card from '../atoms/Card';
import Button from '../atoms/Button';
import { useRouter } from 'next/navigation';
import Modal from '../atoms/Modal';

const PAGE_SIZE = 5;

export default function EventListMain() {
  // イベントデータ・フィルタ・ページネーションの状態管理
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterState, setFilterState] = useState({ region: '', date: '', category: '' });
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // APIからイベントデータを取得
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setFiltered(data);
      });
  }, []);

  // フィルタ適用（ダミー実装）
  const handleFilterClick = (type) => {
    // モーダル表示などはorganisms外で管理する想定
    alert(type + 'フィルタモーダル（ダミー）');
  };

  // ページネーション
  const pagedEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // イベント投稿ページへの遷移
  const handleEventClick = (id) => {
    router.push(`/events/${id}/post`);
  };

  // 新規イベント作成ボタン
  const handleCreateEvent = () => router.push('/admin');

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー（ログインボタン付き） */}
      <Header type="login" onLoginClick={() => alert('ログイン（ダミー）')} />
      {/* フィルターバー上部 右寄せ 新規イベント作成ボタン */}
      <div className="w-full max-w-[400px] flex justify-end items-center mt-24 mb-1 px-2 sm:px-0">
        <Button onClick={handleCreateEvent} className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 shadow-sm">新規イベント作成</Button>
      </div>
      {/* フィルターバー */}
      <div className="w-full max-w-[400px] px-2 sm:px-0">
        {/* 初期は絞り込みボタンのみ */}
        <Button onClick={() => setFilterModalOpen(true)} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md mb-4">絞り込み</Button>
        {/* モーダルで3つのボタンを表示 */}
        <Modal isOpen={filterModalOpen} onClose={() => setFilterModalOpen(false)}>
          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
            <Button onClick={() => { setFilterModalOpen(false); handleFilterClick('region'); }} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">地域 {filterState.region && `: ${filterState.region}`}</Button>
            <Button onClick={() => { setFilterModalOpen(false); handleFilterClick('date'); }} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">日付 {filterState.date && `: ${filterState.date}`}</Button>
            <Button onClick={() => { setFilterModalOpen(false); handleFilterClick('category'); }} className="w-full text-base py-3 bg-black hover:bg-neutral-800 text-white shadow-md">カテゴリー {filterState.category && `: ${filterState.category}`}</Button>
          </div>
        </Modal>
      </div>
      {/* イベントカードリスト */}
      <div className="w-full max-w-[400px] flex flex-col gap-3 mt-2 mb-4 px-2 sm:px-0">
        {pagedEvents.length === 0 && (
          <div className="w-full text-center text-gray-400 py-12">イベントがありません</div>
        )}
        {pagedEvents.map(event => (
          <Card key={event.id} className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleEventClick(event.id)}>
            <div className="font-bold text-lg sm:text-xl text-gray-700 mb-1">{event.title}</div>
            <div className="text-xs sm:text-sm text-gray-500 flex justify-between">
              <span>{event.date}</span>
              <span>{event.region}</span>
            </div>
            {/* <div className="text-xs sm:text-sm text-gray-400 mt-1">{event.category}</div> */}
          </Card>
        ))}
      </div>
      {/* ページネーション（中央表示） */}
      <div className="flex justify-center gap-2 mb-8 w-full max-w-[400px] px-2 sm:px-0">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 text-sm sm:text-base ${page === i + 1 ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</Button>
        ))}
      </div>
    </div>
  );
} 