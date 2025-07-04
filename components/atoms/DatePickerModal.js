import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ja } from 'date-fns/locale';

function formatDate(dateObj) {
  if (!dateObj) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePickerModal({ value, onChange, show, onClose, label = '日付を選択', error }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-xs relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700">×</button>
        <div className="mb-4 text-lg font-bold text-gray-700">{label}</div>
        <ReactDatePicker
          selected={value ? new Date(value) : null}
          onChange={dateObj => { onChange(formatDate(dateObj)); onClose(); }}
          minDate={new Date()}
          locale={ja}
          dateFormat="yyyy年MM月dd日"
          inline
          className="rounded-lg border border-gray-300 shadow-sm"
        />
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </div>
    </div>
  );
} 