import { useEffect, useRef, useState } from 'react';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';

const RATIOS = [
  { label: '9:16', value: 9 / 16 },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
];
const QUALITIES = [
  { label: '高画質', width: 1920, height: 1080 },
  { label: '標準', width: 960, height: 540 },
];

export default function CustomCameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef();
  const streamRef = useRef();
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [captured, setCaptured] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCaptured(null);
    setLoading(true);
    // カメラ起動
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: quality.width },
        height: { ideal: quality.height },
        facingMode: 'environment',
      },
      audio: false,
    })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setLoading(false);
      })
      .catch(() => {
        alert('カメラの起動に失敗しました');
        setLoading(false);
        onClose();
      });
    return () => {
      // クリーンアップ
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [isOpen, quality]);

  // 撮影
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const videoW = video.videoWidth;
    const videoH = video.videoHeight;
    // 選択比率でクロップ
    let cropW, cropH;
    if (videoW / videoH > ratio.value) {
      cropH = videoH;
      cropW = cropH * ratio.value;
    } else {
      cropW = videoW;
      cropH = cropW / ratio.value;
    }
    const sx = (videoW - cropW) / 2;
    const sy = (videoH - cropH) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH);
    setCaptured(canvas.toDataURL('image/jpeg', 0.95));
  };

  // 再撮影
  const handleRetake = () => setCaptured(null);
  // 投稿
  const handleSubmit = () => {
    if (captured && onCapture) onCapture(captured);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center w-full max-w-xs mx-auto">
        <div className="flex gap-2 mb-2">
          {RATIOS.map(r => (
            <Button key={r.label} onClick={() => setRatio(r)} active={ratio.label === r.label} className="px-2 py-1 text-xs">{r.label}</Button>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          {QUALITIES.map(q => (
            <Button key={q.label} onClick={() => setQuality(q)} active={quality.label === q.label} className="px-2 py-1 text-xs">{q.label}</Button>
          ))}
        </div>
        {!captured ? (
          <>
            <div className="relative w-64 h-96 bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {loading ? (
                <div className="text-white">カメラ起動中...</div>
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ aspectRatio: ratio.value }} />
              )}
            </div>
            <Button onClick={handleCapture} className="mt-4 w-40 bg-slate-700">撮影</Button>
          </>
        ) : (
          <>
            <img src={captured} alt="撮影画像" className="w-64 h-96 object-contain bg-white rounded-lg mb-2" />
            <div className="flex gap-2">
              <Button onClick={handleRetake} className="bg-slate-700">再撮影</Button>
              <Button onClick={handleSubmit} className="bg-slate-700">この画像で投稿</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
} 