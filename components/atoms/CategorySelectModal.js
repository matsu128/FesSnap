const categories = ['音楽フェス', '文化祭', '地域イベント', 'その他'];

export default function CategorySelectModal({ value, onChange, show, onClose, label = 'カテゴリーを選択', error }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-xs relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700">×</button>
        <div className="mb-4 text-lg font-bold text-gray-700">{label}</div>
        <div className="flex flex-col gap-2">
          {categories.map(c => (
            <button
              key={c}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-100 cursor-pointer border border-transparent hover:bg-pink-50 ${value === c ? 'bg-pink-100 font-bold text-pink-700 border-pink-400' : 'text-gray-800'}`}
              onClick={() => { onChange(c); onClose(); }}
            >
              {c}
            </button>
          ))}
        </div>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </div>
    </div>
  );
} 