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
import LikeButton from '../atoms/LikeButton';
import { useAuth } from '../../contexts/AuthContext';
import UpgradePlanModal from '../molecules/UpgradePlanModal';

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

// 1時間操作がなければ自動ログアウト
function useAutoLogout() {
  const timerRef = useRef(null);
  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        supabase.auth.signOut();
        window.location.reload();
      }, 60 * 60 * 1000); // 1時間
    };
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);
}

export default function PostMain() {
  useAutoLogout();
  const { isLoggedIn, user, signOut, signIn, signUp, signInWithOAuth } = useAuth();
  const [images, setImages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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
  const [eventCreatedAt, setEventCreatedAt] = useState(null);
  const [showPostError, setShowPostError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [pageSize, setPageSize] = useState(getPageSize());
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [sortType, setSortType] = useState('newest'); // newest or popular
  const [uploadError, setUploadError] = useState("");
  const [showLoginGuideModal, setShowLoginGuideModal] = useState(false);
  const [likeEnabled, setLikeEnabled] = useState(false);
  const [showLikeLoginGuideModal, setShowLikeLoginGuideModal] = useState(false);
  const [showAlreadyLikedModal, setShowAlreadyLikedModal] = useState(false); // 追加
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [eventImageLimit, setEventImageLimit] = useState(null);
  const [eventStoragePeriod, setEventStoragePeriod] = useState(null);

  useEffect(() => {
    const handleResize = () => setPageSize(getPageSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!eventId) return;
    fetchImages();
  }, [eventId]);

  useEffect(() => {
    const channel = supabase
      .channel('images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'images',
          filter: `eventId=eq.${eventId}`
        },
        (payload) => {
          fetchImages();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('eventId', eventId)
      .order('created_at', { ascending: false });
    if (!error) setImages(data);
  };

  // いいね処理（ログイン必須・カウントのみ）
  const handleLike = async (imageId) => {
    if (!user) {
      setShowLikeLoginGuideModal(true);
      return;
    }
    try {
      // 1. すでにいいね済みかチェック
      const { data: existing, error: selectError, status: selectStatus } = await supabase
        .from('image_likes')
        .select('id, user_id, image_id')
        .eq('image_id', Number(imageId))
        .eq('user_id', user.id)
        .single();

      if (existing) {
        setShowAlreadyLikedModal(true);
        return;
      }

      // 2. いいね履歴を追加
      const { error: likeError } = await supabase
        .from('image_likes')
        .insert([{ image_id: Number(imageId), user_id: user.id }]);

      if (likeError) {
        // エラー処理（UNIQUE違反など）
        return;
      }

      // 3. like_countを+1
      const currentImage = images.find(img => img.id === Number(imageId));
      const newLikeCount = (currentImage.like_count || 0) + 1;
      await supabase
        .from('images')
        .update({ like_count: newLikeCount })
        .eq('id', Number(imageId));
      setImages(prev => prev.map(img =>
        img.id === Number(imageId) ? { ...img, like_count: newLikeCount } : img
      ));
    } catch (error) {
      console.error('いいね処理エラー:', error);
    }
  };

  // ソート処理
  const getSortedImages = () => {
    let sortedImages = [...images];
    
    if (sortType === 'popular') {
      // いいね数でソート
      sortedImages.sort((a, b) => {
        const likesA = a.like_count || 0;
        const likesB = b.like_count || 0;
        return likesB - likesA;
      });
    } else {
      // 新しい順（デフォルト）
      sortedImages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return sortedImages;
  };

  // イベント作成日・タイトル・いいね有効フラグ・画像上限・保存期間取得
  useEffect(() => {
    if (!eventId) return;
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        const event = data.find(e => e.id === eventId);
        setEventCreatedAt(event?.created_at || null);
        setEventTitle(event?.title || "");
        setLikeEnabled(!!event?.like_enabled);
        setEventImageLimit(event?.image_limit ?? null);
        setEventStoragePeriod(event?.storage_period_days ?? null);
      });
  }, [eventId]);

  // 投稿許可判定
  const isPostAllowed = (() => {
    if (eventId === '630316dc-a3a3-4a16-98c5-ae7a3094533e') return true; // デモイベントは常に投稿可
    if (!eventCreatedAt) return false;
    const created = new Date(eventCreatedAt);
    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 7;
  })();

  // 投稿画像のソート処理
  const sortedImages = getSortedImages();
  // ページネーションは全画像数で計算
  const totalPages = Math.ceil(sortedImages.length / pageSize);

  // カメラ対応判定（スマホ端末のみ）
  const isCameraSupported = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return (
      isMobile &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  };
  // 投稿ボタン押下時の制限チェック
  const handlePostImage = async () => {
    // 最新の画像枚数をDBから取得して上限チェック
    if (eventImageLimit !== null && eventImageLimit !== undefined && eventImageLimit !== -1) {
      const { count } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('eventId', eventId);
      if (count >= eventImageLimit) {
        setShowLimitModal(true);
        return;
      }
    }
    setShowSelectModal(true);
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
  const handlePost = async () => {
    if (!capturedImage) return;
    setUploadError("");
    try {
      setIsUploading(true);
      // 最新の画像枚数を取得して上限チェック
      const { count } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('eventId', eventId);
      if (eventImageLimit !== null && eventImageLimit !== undefined && eventImageLimit !== -1) {
        if (count >= eventImageLimit) {
          setShowLimitModal(true);
          setIsUploading(false);
          return;
        }
      }
      // 画像をbase64からBlobに変換
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const fileExt = 'jpg';
      const fileName = `${eventId}_${Date.now()}.${fileExt}`;
      // ストレージにアップロード
      const { error: uploadError } = await supabase.storage
        .from('event-image')
        .upload(fileName, blob, { contentType: 'image/jpeg' });
      if (uploadError) {
        console.error('アップロード失敗:', uploadError.message, uploadError);
        setUploadError('アップロード失敗: ' + uploadError.message);
        setIsUploading(false);
        return;
      }
      const { publicUrl } = supabase.storage.from('event-image').getPublicUrl(fileName).data;
      if (!publicUrl) {
        console.error('画像URL取得失敗');
        setUploadError('画像URL取得失敗');
        setIsUploading(false);
        return;
      }
      // DBに保存
              const { error: dbError } = await supabase
          .from('images')
          .insert([{ 
            eventId, 
            url: publicUrl, 
            user_id: user ? user.id : null, // uuidを入れる
            date: new Date().toISOString().slice(0, 10),
            like_count: 0
          }]);
      if (dbError) {
        console.error('DB保存失敗:', dbError.message, dbError);
        setUploadError('DB保存失敗: ' + dbError.message);
        setIsUploading(false);
        return;
      }
      // DB保存後に未ログインなら案内モーダル発火
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowLoginGuideModal(true);
        setSelectedImage({ url: publicUrl });
        setShowImageModal(true);
      }
      fetchImages();
      setIsUploading(false);
    } catch (e) {
      let jpMsg = '予期せぬエラーが発生しました';
      if (e.message && e.message.includes('Anonymous sign-ins are disabled')) {
        jpMsg = '匿名サインインは無効化されています。メールアドレスでログインしてください';
      } else if (e.message) {
        jpMsg = 'エラー: ' + e.message;
      }
      setUploadError(jpMsg);
      setIsUploading(false);
    }
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
    const idx = sortedImages.findIndex(i => i.id === img.id);
    setSelectedImage(img);
    setModalImageIndex(idx);
    setShowImageModal(true);
  };
  const handlePrevImage = () => {
    if (modalImageIndex > 0) {
      const prevIdx = modalImageIndex - 1;
      setSelectedImage(sortedImages[prevIdx]);
      setModalImageIndex(prevIdx);
    }
  };
  const handleNextImage = () => {
    if (modalImageIndex < sortedImages.length - 1) {
      const nextIdx = modalImageIndex + 1;
      setSelectedImage(sortedImages[nextIdx]);
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

  // 複数ファイル対応
  const handleUpload = async (files) => {
    setUploadError("");
    try {
      setIsUploading(true);
      // 最新の画像枚数を取得して上限チェック
      const { count } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('eventId', eventId);
      if (eventImageLimit !== null && eventImageLimit !== undefined && eventImageLimit !== -1) {
        if (count >= eventImageLimit) {
          setShowLimitModal(true);
          setIsUploading(false);
          return;
        }
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${eventId}_${Date.now()}_${i}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('event-image')
          .upload(fileName, file, { contentType: file.type });
        if (uploadError) {
          console.error('アップロード失敗:', uploadError.message, uploadError);
          setUploadError('アップロード失敗: ' + uploadError.message);
          continue; // 他のファイルは続行
        }
        const { publicUrl } = supabase.storage.from('event-image').getPublicUrl(fileName).data;
        if (!publicUrl) {
          console.error('画像URL取得失敗');
          setUploadError('画像URL取得失敗');
          continue;
        }
        // 再度最新の画像枚数を取得して上限チェック（多重アップロード対策）
        const { count: currentCount } = await supabase
          .from('images')
          .select('*', { count: 'exact', head: true })
          .eq('eventId', eventId);
        if (eventImageLimit !== null && eventImageLimit !== undefined && eventImageLimit !== -1) {
          if (currentCount >= eventImageLimit) {
            setShowLimitModal(true);
            setIsUploading(false);
            break;
          }
        }
        const { error: dbError } = await supabase
          .from('images')
          .insert([{ 
            eventId, 
            url: publicUrl, 
            user_id: user ? user.id : null, // uuidを入れる
            date: new Date().toISOString().slice(0, 10),
            like_count: 0
          }]);
        if (dbError) {
          console.error('DB保存失敗:', dbError.message, dbError);
          setUploadError('DB保存失敗: ' + dbError.message);
          continue;
        }
        // DB保存後に未ログインなら案内モーダル発火
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          setShowLoginGuideModal(true);
          setSelectedImage({ url: publicUrl });
          setShowImageModal(true);
        }
      }
      fetchImages();
      setIsUploading(false);
    } catch (e) {
      let jpMsg = '予期せぬエラーが発生しました';
      if (e.message && e.message.includes('Anonymous sign-ins are disabled')) {
        jpMsg = '匿名サインインは無効化されています。メールアドレスでログインしてください';
      } else if (e.message) {
        jpMsg = 'エラー: ' + e.message;
      }
      setUploadError(jpMsg);
      setIsUploading(false);
    }
  };

  // Stripe決済ページ遷移用
  const handleUpgradePlan = () => {
    // Stripeのプランアップグレードページに遷移（仮実装: plusプランに遷移）
    window.location.href = '/stripe';
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
      {/* ヘッダー（ハンバーガーメニュー） */}
      <Header type="menu" onMenuClick={() => setShowMenu(v => !v)} onLoginClick={() => setLoginModalOpen(true)} />
      {/* メニュー（ログイン・新規イベント作成） */}
      {showMenu && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowMenu(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[240px] max-w-[90vw] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            {!isLoggedIn ? (
              <Button onClick={() => { setLoginModalOpen(true); setShowMenu(false); }} className="w-full text-base py-3 bg-slate-700">ログイン</Button>
            ) : (
              <Button onClick={async () => { await signOut(); setShowMenu(false); }} className="w-full text-base py-3 bg-red-600">ログアウト</Button>
            )}
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
        {uploadError && (
          <div className="w-full text-center text-red-600 font-bold mt-2 text-sm break-words">{uploadError}</div>
        )}
      </div>
      
      {/* 絞り込みボタン */}
      {likeEnabled && eventId !== '630316dc-a3a3-4a16-98c5-ae7a3094533e' && (
        <div className="w-full max-w-[400px] flex gap-2 mb-4 px-2 sm:px-0">
          <Button 
            onClick={() => setSortType('popular')} 
            className={`flex-1 py-2.5 text-sm font-bold transition-all duration-200 ${
              sortType === 'popular' 
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              人気順
            </div>
          </Button>
          <Button 
            onClick={() => setSortType('newest')} 
            className={`flex-1 py-2.5 text-sm font-bold transition-all duration-200 ${
              sortType === 'newest' 
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              新しい順
            </div>
          </Button>
        </div>
      )}

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
      {/* 画像グリッド */}
      <div className="w-full max-w-[400px] grid grid-cols-3 md:grid-cols-5 gap-2 mb-8 md:mb-4 px-2 sm:px-0">
        {sortedImages.length === 0 && (
          <div className="w-full text-center text-gray-400 py-12">画像を投稿しよう！</div>
        )}
        {sortedImages.map((img, idx) => {
          const startIdx = (page - 1) * pageSize;
          const endIdx = page * pageSize;
          if (idx < startIdx || idx >= endIdx) return null;

          // idが「630316dc-a3a3-4a16-98c5-ae7a3094533e」の場合はいいね機能を表示しない
          const showLike = likeEnabled && eventId !== '630316dc-a3a3-4a16-98c5-ae7a3094533e';

          return (
            <div
              key={img.id}
              className={`aspect-square bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center cursor-pointer relative transition-all duration-150 group`}
              onClick={() => handleImageClick(img)}
            >
              <img src={img.url} alt="投稿画像" className="w-full h-full object-cover rounded-lg" />
              {showLike && (
                <LikeButton
                  imageId={img.id}
                  likeCount={img.like_count}
                  onLike={() => handleLike(img.id)}
                  disabled={false}
                />
              )}
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
      {/* 画像拡大モーダル（撮影時 or 通常 or未ログイン案内） */}
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
              {modalImageIndex < sortedImages.length - 1 && (
                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white text-3xl rounded-full w-12 h-20 flex items-center justify-center z-10">&#62;</button>
              )}
            </div>
            {/* 下部保存ボタン or 未ログイン案内 */}
            <div className="w-full flex justify-center p-4 fixed bottom-0 left-0 bg-black bg-opacity-80 z-50">
              {showLoginGuideModal ? (
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="text-white text-center font-extrabold text-base sm:text-lg leading-relaxed mb-3" style={{fontFamily: "'Baloo 2', 'Noto Sans JP', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"}}>
                    ログインをして画像を保存しよう！<br />
                    <span className="text-sm sm:text-base font-normal">ログインをすると<br className="sm:hidden" />過去イベントの閲覧および<br className="sm:hidden" />投稿した画像を確認することができます</span>
                  </div>
                  <Button onClick={() => { setLoginModalOpen(true); setShowLoginGuideModal(false); }} className="w-48 bg-white text-blue-600 font-bold py-2 rounded-full shadow-md hover:bg-blue-100 transition text-base">ログイン</Button>
                </div>
              ) : (
                isMobile() ? (
                  <Button onClick={handleShareSave} className="w-64 bg-slate-700 text-lg py-3 flex items-center justify-center gap-2"><Icon type="download" className="w-5 h-5" /><span className="text-center w-full">保存</span></Button>
                ) : (
                  <Button onClick={handleDownload} className="w-64 bg-slate-700 text-lg py-3 flex items-center justify-center gap-2"><Icon type="download" className="w-5 h-5" /><span className="text-center w-full">保存</span></Button>
                )
              )}
            </div>
          </div>
        ) : null}
      </Modal>
      {/* いいね未ログイン案内モーダル */}
      <Modal isOpen={showLikeLoginGuideModal} onClose={() => setShowLikeLoginGuideModal(false)}>
        <div className="flex flex-col items-center p-6">
          <div className="font-bold text-lg text-blue-600 mb-2">ログインすると「いいね」できます</div>
          <div className="text-base text-gray-700 mb-4">この機能を利用するにはログインが必要です</div>
          <Button onClick={() => { setShowLikeLoginGuideModal(false); setLoginModalOpen(true); }} className="w-40 bg-slate-700">ログインする</Button>
        </div>
      </Modal>
      {/* 既にいいね済みモーダル */}
      <Modal isOpen={showAlreadyLikedModal} onClose={() => setShowAlreadyLikedModal(false)}>
        <div className="flex flex-col items-center p-6">
          <div className="font-bold text-lg text-blue-600 mb-2 text-center">
            <span className="block sm:inline">同じ画像には</span>
            <span className="block sm:inline">1度のみ<br className='sm:hidden' />いいね可能です</span>
          </div>
          <Button onClick={() => setShowAlreadyLikedModal(false)} className="w-32 bg-slate-700">閉じる</Button>
        </div>
      </Modal>
      {/* 画像枚数制限時のアップグレードモーダル */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgradePlan}
        currentPlanLimit={eventImageLimit}
      />
      {/* 投稿上限到達モーダル */}
      <Modal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)}>
        <div className="flex flex-col items-center p-6">
          <div className="font-bold text-lg text-black mb-2">これ以上投稿できません</div>
          <div className="text-base text-gray-700 mb-4">このイベントの画像投稿枚数がプランの上限に達しています。</div>
          <Button onClick={() => { setShowLimitModal(false); setShowUpgradeModal(true); }} className="w-full py-3 text-base font-bold rounded-full bg-gradient-to-r from-blue-500 via-pink-400 to-blue-600 text-white shadow-lg">プランをアップグレード</Button>
        </div>
      </Modal>
      {/* 戻るボタン */}
      <Button onClick={handleBack} className="mb-8 mt-2 px-8 py-3 bg-slate-700 w-full max-w-[400px]">イベント詳細ページへ戻る</Button>
    </div>
  );
} 