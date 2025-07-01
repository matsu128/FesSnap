// 投稿ページのorganism
// Header（ハンバーガーメニュー）、画像投稿ボタン（モーダル）、自分/友達の投稿切替、画像グリッド、画像拡大・ダウンロード、ページネーション、戻るボタンなど
// APIから画像データ取得
import { useEffect, useState, useRef } from 'react';
import Header from '../molecules/Header';
import Button from '../atoms/Button';
import Modal from '../atoms/Modal';
import Icon from '../atoms/Icon';
import { useRouter, useParams } from 'next/navigation';

const PAGE_SIZE = 15;

function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iP(hone|od|ad)/.test(window.navigator.userAgent);
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

  // 画像データ取得
  useEffect(() => {
    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        const eventImages = data.find(e => e.eventId === eventId)?.images || [];
        setImages(eventImages);
      });
  }, [eventId]);

  // 投稿画像の絞り込み（ダミー：ユーザーIDで分岐）
  const filteredImages = images.filter(img => tab === 'mine' ? img.user === 'user1' : img.user !== 'user1');
  const pagedImages = filteredImages.slice((page - 1) * 15, page * 15);
  const totalPages = Math.ceil(filteredImages.length / PAGE_SIZE);

  // カメラ対応判定（スマホ端末のみ）
  const isCameraSupported = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return (
      isMobile &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  };
  // 画像投稿ボタンでカメラ起動 or 注意
  const handlePostImage = () => {
    if (isCameraSupported()) {
      fileInputRef.current.click();
    } else {
      setShowCameraAlert(true);
    }
  };
  // 撮影画像をstateにセット
  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target.result);
        setShowImageModal(true);
      };
      reader.readAsDataURL(file);
    }
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

  // 画像拡大モーダル
  const handleImageClick = (img) => {
    setSelectedImage(img);
    setShowImageModal(true);
  };
  const handleCloseImageModal = () => setShowImageModal(false);

  // 画像ダウンロード
  const handleDownload = () => {
    if (!selectedImage?.url) return;
    const a = document.createElement('a');
    a.href = selectedImage.url;
    a.download = 'fesnap-image.jpg';
    a.click();
  };
  // 共有API
  const handleShare = async () => {
    if (navigator.share && selectedImage?.url) {
      try {
        const res = await fetch(selectedImage.url);
        const blob = await res.blob();
        const file = new File([blob], 'fesnap-image.jpg', { type: blob.type });
        await navigator.share({ files: [file], title: 'FesSnap画像', text: 'FesSnapで投稿された画像です' });
      } catch (e) {
        alert('共有に失敗しました');
      }
    } else {
      alert('この端末では共有機能が利用できません');
    }
  };

  // 戻るボタン
  const handleBack = () => router.push(`/events/${eventId}`);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー（ハンバーガーメニュー） */}
      <Header type="menu" onMenuClick={() => setShowMenu(v => !v)} />
      {/* メニュー（ダミー） */}
      {showMenu && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowMenu(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[200px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <Button onClick={() => alert('ログイン（ダミー）')}>ログイン</Button>
          </div>
        </div>
      )}
      {/* 画像投稿ボタン＋input */}
      <div className="w-full max-w-[400px] flex justify-end mt-24 mb-2 px-2 sm:px-0">
        <Button onClick={handlePostImage} className="text-base py-3 px-6 bg-slate-700">画像投稿</Button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
      </div>
      {/* カメラ非対応端末向け注意モーダル */}
      <Modal isOpen={showCameraAlert} onClose={() => setShowCameraAlert(false)}>
        <div className="flex flex-col items-center p-4">
          <div className="mb-2 text-lg font-bold text-red-600">この端末では撮影が不可です</div>
          <div className="text-gray-600 text-sm mb-4">スマートフォンやカメラ対応端末でご利用ください。</div>
          <Button onClick={() => setShowCameraAlert(false)} className="w-32 bg-slate-700">閉じる</Button>
        </div>
      </Modal>
      {/* 自分/友達の投稿切替 */}
      <div className="w-full max-w-[400px] flex justify-between mb-2 px-2 sm:px-0">
        <Button onClick={() => setTab('mine')} active={tab === 'mine'} className={`flex-1 mr-1`}>自分の投稿</Button>
        <Button onClick={() => setTab('friends')} active={tab === 'friends'} className={`flex-1 ml-1`}>友達の投稿</Button>
      </div>
      {/* 画像グリッド */}
      <div className="w-full max-w-[400px] grid grid-cols-3 gap-2 mb-4 px-2 sm:px-0">
        {pagedImages.map(img => (
          <div key={img.id} className="aspect-square bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => handleImageClick(img)}>
            {img.url.startsWith('data:') ? (
              <img src={img.url} alt="投稿画像" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-xs sm:text-sm text-gray-400">画像</span>
            )}
          </div>
        ))}
      </div>
      {/* 画像拡大モーダル（撮影時 or 通常） */}
      <Modal isOpen={showImageModal} onClose={() => { setShowImageModal(false); setCapturedImage(null); }}>
        <div className="flex flex-col items-center">
          {capturedImage ? (
            <>
              <img src={capturedImage} alt="撮影画像" className="w-40 h-40 sm:w-56 sm:h-56 object-cover rounded-lg mb-2" />
              <Button onClick={handlePost} className="w-32 bg-slate-700">投稿</Button>
            </>
          ) : selectedImage ? (
            <>
              <img src={selectedImage.url} alt="拡大画像" className="w-40 h-40 sm:w-56 sm:h-56 object-cover rounded-lg mb-2" />
              <div className="flex gap-4 mt-2">
                <Button onClick={handleDownload} className="bg-slate-700 flex items-center gap-1"><Icon type="download" className="w-5 h-5" />保存</Button>
                <Button onClick={handleShare} className="bg-slate-700 flex items-center gap-1"><Icon type="share" className="w-5 h-5" />共有</Button>
              </div>
              {isIOS() && (
                <div className="mt-3 text-xs text-gray-500 text-center">iPhoneの方は画像を長押しして「写真に追加」してください</div>
              )}
            </>
          ) : null}
        </div>
      </Modal>
      {/* ページネーション */}
      <div className="flex gap-2 mb-8 w-full max-w-[400px] px-2 sm:px-0">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button key={i} onClick={() => setPage(i + 1)} active={page === i + 1} className={`px-3 py-1 text-sm sm:text-base`}>{i + 1}</Button>
        ))}
      </div>
      {/* 戻るボタン */}
      <Button onClick={handleBack} className="mb-8 mt-2 px-8 py-3 bg-slate-700 w-full max-w-[400px]">イベント詳細ページへ戻る</Button>
    </div>
  );
} 