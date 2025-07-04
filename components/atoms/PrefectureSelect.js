import { useEffect, useState } from 'react';

export default function PrefectureSelect({ value, onChange, show, onClose, label = '都道府県を選択', error }) {
  const [prefectures, setPrefectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  useEffect(() => {
    if (!show) return;
    setLoading(true);
    fetch('/prefectures.json')
      .then(res => res.json())
      .then(data => { setPrefectures(data); setLoading(false); })
      .catch(() => { setFetchError('都道府県リストの取得に失敗しました'); setLoading(false); });
  }, [show]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-xs relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700">×</button>
        <div className="mb-4 text-lg font-bold text-gray-700">{label}</div>
        {fetchError && <div className="text-red-500 text-sm mb-2">{fetchError}</div>}
        {loading ? (
          <div className="text-gray-400 text-center py-8">読み込み中...</div>
        ) : (
          <div className="max-h-72 overflow-y-auto flex flex-col gap-1">
            {prefectures.map(p => (
              <button
                key={p}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-100 cursor-pointer border border-transparent hover:bg-blue-50 ${value === p ? 'bg-blue-100 font-bold text-blue-700 border-blue-400' : 'text-gray-800'}`}
                onClick={() => { onChange(p); onClose(); }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </div>
    </div>
  );
} 