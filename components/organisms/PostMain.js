// 投稿ページのorganism
// Header（ハンバーガーメニュー）、画像投稿ボタン（モーダル）、自分/友達の投稿切替、画像グリッド、画像拡大・ダウンロード、ページネーション、戻るボタンなど
// APIから画像データ取得
import { useEffect, useState, useRef } from 'react';
import Header from '../molecules/Header';
import Button from '../atoms/Button';
import Modal from '../atoms/Modal';
import Icon from '../atoms/Icon';
import { useRouter, useParams } from 'next/navigation';
import CustomCameraModal from './CustomCameraModal';
import { supabase } from '../../lib/supabaseClient';
import LoginModal from '../molecules/LoginModal';

function getPageSize() {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768 ? 20 : 12;
  }
  return 12;
}

function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iP(hone|od|ad)/.test(window.navigator.userAgent);
}

function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(window.navigator.userAgent);
}

function isMobile() {
  return isIOS() || isAndroid();
}

export default function PostMain() {
  const [images, setImages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tab, setTab] = useState('mine'); // mine or friends
  const [page, setPage] = useState(1);
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId;
  const [capturedImage, setCapturedImage] = useState(null);
  const fileInputRef = useRef();
  const [showCameraAlert, setShowCameraAlert] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(null);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [eventDate, setEventDate] = useState(null);
  const [showPostError, setShowPostError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 追加: ログイン状態（仮実装）
  const [pageSize, setPageSize] = useState(getPageSize());
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setPageSize(getPageSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 画像データ取得
  useEffect(() => {
    if (!eventId) return;
    fetchImages();
  }, [eventId]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('eventId', eventId)
      .order('created_at', { ascending: false });
    if (!error) setImages(data);
  };

  // イベント日付取得
  useEffect(() => {
    if (!eventId) return;
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        const event = data.find(e => e.id === eventId);
        setEventDate(event?.date || null);
        setEventTitle(event?.title || "");
      });
  }, [eventId]);

  // JSTで今日の日付を取得
  function getTodayJST() {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return jst.toISOString().slice(0, 10);
  }

  // 投稿許可判定
  const isPostAllowed = (() => {
    if (eventId === '630316dc-a3a3-4a16-98c5-ae7a3094533e') return true; // id=1は常に投稿可能
    if (!eventDate) return false;
    const event = new Date(eventDate);
    const nextDay = new Date(eventDate);
    nextDay.setDate(event.getDate() + 1);
    const yyyyMMdd = d => d.toISOString().slice(0, 10);
    const todayJST = getTodayJST();
    return todayJST === yyyyMMdd(event) || todayJST === yyyyMMdd(nextDay);
  })();

  // 投稿画像の絞り込み（ダミー：ユーザーIDで分岐）
  const filteredImages = images.filter(img => tab === 'mine' ? img.user === 'user1' : img.user !== 'user1');
  // ページネーションは全画像数で計算
  const totalPages = Math.ceil(images.length / pageSize);

  // カメラ対応判定（スマホ端末のみ）
  const isCameraSupported = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return (
      isMobile &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  };
  // 画像投稿ボタンでカメラ起動 or エラー or 選択モーダル
  const handlePostImage = () => {
    if (!isPostAllowed) {
      setShowPostError(true);
      return;
    }
    if (isMobile()) {
      setShowSelectModal(true);
    } else {
      setShowCameraAlert(true);
    }
  };
  // input/captureで撮影画像をstateにセット
  const handleCapture = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    // 複数画像対応、すべて即投稿
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newImg = {
          id: `img${Date.now()}_${idx}`,
          url: ev.target.result,
          user: 'user1',
          date: new Date().toISOString().slice(0, 10)
        };
        setImages(prev => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    });
    setCapturedImage(null);
    setShowImageModal(false);
  };
  // 撮影選択
  const handleSelectCapture = () => {
    setShowSelectModal(false);
    fileInputRef.current.setAttribute('capture', 'environment');
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };
  // アップロード選択
  const handleSelectUpload = () => {
    setShowSelectModal(false);
    fileInputRef.current.removeAttribute('capture');
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };
  // 投稿処理
  const handlePost = () => {
    if (!capturedImage) return;
    const newImg = {
      id: `img${Date.now()}`,
      url: capturedImage,
      user: 'user1',
      date: new Date().toISOString().slice(0, 10)
    };
    setImages(prev => [...prev, newImg]);
    setCapturedImage(null);
    setShowImageModal(false);
  };
  // 撮影後「この写真を使用」ボタン押下で即投稿
  const handleUsePhoto = () => {
    handlePost();
    // モーダルは開かず投稿一覧に戻る
  };

  // 画像拡大モーダル
  const handleImageClick = (img) => {
    const idx = filteredImages.findIndex(i => i.id === img.id);
    setSelectedImage(img);
    setModalImageIndex(idx);
    setShowImageModal(true);
  };
  const handlePrevImage = () => {
    if (modalImageIndex > 0) {
      const prevIdx = modalImageIndex - 1;
      setSelectedImage(filteredImages[prevIdx]);
      setModalImageIndex(prevIdx);
    }
  };
  const handleNextImage = () => {
    if (modalImageIndex < filteredImages.length - 1) {
      const nextIdx = modalImageIndex + 1;
      setSelectedImage(filteredImages[nextIdx]);
      setModalImageIndex(nextIdx);
    }
  };
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setCapturedImage(null);
    setModalImageIndex(null);
  };

  // 画像ダウンロード
  const handleDownload = () => {
    if (!selectedImage?.url) return;
    const a = document.createElement('a');
    a.href = selectedImage.url;
    a.download = 'fesnap-image.jpg';
    a.click();
  };
  // 共有API（スマホ用保存）
  const handleShareSave = async () => {
    if (navigator.share && selectedImage?.url) {
      try {
        const res = await fetch(selectedImage.url);
        const blob = await res.blob();
        const file = new File([blob], 'fesnap-image.jpg', { type: blob.type });
        await navigator.share({ files: [file], title: 'FesSnap画像', text: 'FesSnapで投稿された画像です' });
      } catch (e) {
        // 失敗時は何もしない
      }
    } else {
      alert('この端末では保存・共有機能が利用できません');
    }
  };

  // 戻るボタン
  const handleBack = () => router.push(`/events/${eventId}`);

  // カスタムカメラで撮影画像を受け取る
  const handleCustomCapture = (dataUrl) => {
    setCapturedImage(dataUrl);
    setShowImageModal(true);
  };

  // 日付を日本語表記に変換する関数
  function formatJPDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }
  function getNextDay(dateStr) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  // 複数ファイル対応
  const handleUpload = async (files) => {
    try {
      setIsUploading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${eventId}_${Date.now()}_${i}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('event-image')
          .upload(fileName, file, { contentType: file.type });
        if (uploadError) {
          console.error('アップロード失敗:', uploadError.message, uploadError);
          alert('アップロード失敗: ' + uploadError.message);
          continue; // 他のファイルは続行
        }
        const { publicUrl } = supabase.storage.from('event-image').getPublicUrl(fileName).data;
        if (!publicUrl) {
          console.error('画像URL取得失敗');
          alert('画像URL取得失敗');
          continue;
        }
        const { error: dbError } = await supabase
          .from('images')
          .insert([{ eventId, url: publicUrl, user: 'anonymous', date: new Date().toISOString().slice(0, 10) }]);
        if (dbError) {
          console.error('DB保存失敗:', dbError.message, dbError);
          alert('DB保存失敗: ' + dbError.message);
          continue;
        }
      }
      fetchImages();
      setIsUploading(false);
    } catch (e) {
      console.error('予期せぬエラー:', e);
      alert('予期せぬエラー: ' + e.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー（ハンバーガーメニュー） */}
      <Header type="menu" onMenuClick={() => setShowMenu(v => !v)} />
      {/* メニュー（ログイン・新規イベント作成） */}
      {showMenu && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowMenu(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[240px] max-w-[90vw] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <Button onClick={() => { setLoginModalOpen(true); setShowMenu(false); }} className="w-full text-base py-3 bg-slate-700">ログイン</Button>
            <Button onClick={() => { router.push('/admin'); setShowMenu(false); }} className="w-full text-base py-3 bg-blue-600">新規イベント作成</Button>
          </div>
        </div>
      )}
      {/* LoginModal */}
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      {/* 画像投稿ボタン＋タイトル＋input（スマホ用input/capture復活） */}
      <div className="w-full max-w-[400px] flex flex-col items-center mt-24 mb-2 px-2 sm:px-0 gap-2">
        <div
          className="truncate font-extrabold text-lg sm:text-xl w-full text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-md shadow-pink-200"
          style={{ fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif" }}
          title={eventTitle}
        >
          {eventTitle}
        </div>
        <div className="w-full flex justify-end items-center gap-2">
          <Button onClick={handlePostImage} className="text-base py-3 px-6 bg-slate-700" disabled={isUploading}>画像投稿</Button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => {
            if (e.target.files && e.target.files.length > 0) handleUpload(Array.from(e.target.files));
          }} />
        </div>
      </div>
      {/* アップロード中ローディング表示 */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center bg-white rounded-xl px-8 py-6 shadow-lg">
            <svg className="animate-spin h-8 w-8 text-slate-700 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <div className="text-slate-700 font-bold text-lg">アップロード中…</div>
          </div>
        </div>
      )}
      {/* 投稿不可エラーモーダル */}
      <Modal isOpen={showPostError} onClose={() => setShowPostError(false)}>
        <div className="flex flex-col items-center p-6">
          <div className="font-bold text-lg text-red-600 mb-2">投稿できません</div>
          <div className="text-base text-gray-700 mb-2">このイベントの投稿受付期間は</div>
          <div className="text-base font-bold mb-2">{formatJPDate(eventDate)} ～ {formatJPDate(getNextDay(eventDate))}</div>
          <div className="text-sm text-red-400 mb-4">※期間外は画像投稿できません</div>
          <Button onClick={() => setShowPostError(false)} className="w-32 bg-slate-700">閉じる</Button>
        </div>
      </Modal>
      {/* 撮影/アップロード選択モーダル */}
      <Modal isOpen={showSelectModal} onClose={() => setShowSelectModal(false)}>
        <div className="flex flex-col items-center p-4">
          <div className="mb-4 text-lg font-bold">画像の追加方法を選択</div>
          <Button onClick={handleSelectCapture} className="w-40 mb-2 bg-slate-700">写真を撮影</Button>
          <Button onClick={handleSelectUpload} className="w-40 bg-slate-700">画像をアップロード</Button>
        </div>
      </Modal>
      {/* カメラ非対応端末向け注意モーダル */}
      <Modal isOpen={showCameraAlert} onClose={() => setShowCameraAlert(false)}>
        <div className="flex flex-col items-center p-4">
          <div className="mb-2 text-lg font-bold text-red-600">カメラ撮影不可端末です</div>
          <div className="text-gray-600 text-sm mb-4">スマートフォンやカメラ対応端末でご利用ください。</div>
          <Button onClick={() => setShowCameraAlert(false)} className="w-32 bg-slate-700">閉じる</Button>
        </div>
      </Modal>
      {/* 自分/友達の投稿切替（ログイン時のみ表示） */}
      {isLoggedIn && (
        <div className="w-full max-w-[400px] flex justify-between mb-2 px-2 sm:px-0">
          <Button onClick={() => setTab('mine')} active={tab === 'mine'} className={`flex-1 mr-1`}>自分の投稿</Button>
          <Button onClick={() => setTab('friends')} active={tab === 'friends'} className={`flex-1 ml-1`}>友達の投稿</Button>
        </div>
      )}
      {/* 画像グリッド */}
      <div className="w-full max-w-[400px] grid grid-cols-3 md:grid-cols-5 gap-2 mb-8 md:mb-4 px-2 sm:px-0">
        {images.length === 0 && (
          <div className="w-full text-center text-gray-400 py-12">画像を投稿しよう！</div>
        )}
        {images.map((img, idx) => {
          const startIdx = (page - 1) * pageSize;
          const endIdx = page * pageSize;
          if (idx < startIdx || idx >= endIdx) return null;
          return (
            <div
              key={img.id}
              className={`aspect-square bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center cursor-pointer relative transition-all duration-150`}
              onClick={() => handleImageClick(img)}
            >
              <img src={img.url} alt="投稿画像" className="w-full h-full object-cover rounded-lg" />
            </div>
          );
        })}
      </div>
      {/* ページネーション（画像下中央） */}
      {totalPages > 1 && (
        <div className="flex gap-2 mb-10 md:mb-8 w-full max-w-[400px] px-2 sm:px-0 justify-center items-center">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-full border transition-all duration-150 text-sm sm:text-base font-bold focus:outline-none
                ${page === i + 1 ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white scale-110 shadow-lg border-transparent' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'}`}
              style={{ minWidth: 36 }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {/* 画像拡大モーダル（撮影時 or 通常） */}
      <Modal isOpen={showImageModal} onClose={handleCloseImageModal} fullScreen>
        {selectedImage ? (
          <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between items-center">
            {/* 上部バツボタン */}
            <div className="w-full flex justify-end p-4">
              <button onClick={handleCloseImageModal} className="text-white text-3xl font-bold">×</button>
            </div>
            {/* 画像本体＋左右ボタン */}
            <div className="flex-1 flex items-center justify-center w-full relative min-h-[400px]">
              {modalImageIndex > 0 && (
                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white text-3xl rounded-full w-12 h-20 flex items-center justify-center z-10">&#60;</button>
              )}
              <img src={selectedImage.url} alt="拡大画像" className="max-w-full max-h-full object-contain" />
              {modalImageIndex < filteredImages.length - 1 && (
                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white text-3xl rounded-full w-12 h-20 flex items-center justify-center z-10">&#62;</button>
              )}
            </div>
            {/* 下部保存ボタン */}
            <div className="w-full flex justify-center p-4 fixed bottom-0 left-0 bg-black bg-opacity-80 z-50">
              {isMobile() ? (
                <Button onClick={handleShareSave} className="w-64 bg-slate-700 text-lg py-3 flex items-center justify-center gap-2"><Icon type="download" className="w-5 h-5" /><span className="text-center w-full">保存</span></Button>
              ) : (
                <Button onClick={handleDownload} className="w-64 bg-slate-700 text-lg py-3 flex items-center justify-center gap-2"><Icon type="download" className="w-5 h-5" /><span className="text-center w-full">保存</span></Button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
      {/* 戻るボタン */}
      <Button onClick={handleBack} className="mb-8 mt-2 px-8 py-3 bg-slate-700 w-full max-w-[400px]">イベント詳細ページへ戻る</Button>
    </div>
  );
} 