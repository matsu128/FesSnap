import QrWithLogo from './QrWithLogo';

export default function QrModalWithTitle({ title, qr, logoDataUrl, size = 220 }) {
  return (
    <div id="qr-info-capture-area" className="w-full max-w-[340px] mx-auto flex flex-col justify-center items-center mb-2 mt-1 bg-white rounded-xl p-2 shadow-md overflow-hidden" style={{ aspectRatio: '9/16', minHeight: 480, height: 480, fontFamily: "'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif" }}>
      <div className="flex flex-col w-full flex-1 justify-center items-center" style={{height: '100%', justifyContent: 'center'}}>
        {/* タイトルをQRの上に表示 */}
        <div className="font-extrabold mb-4 text-center break-words w-full tracking-wide" style={{fontSize: '2.1rem', color: '#193a6a', letterSpacing: '0.06em', lineHeight: 1.08}}>{title}</div>
        <div style={{ width: size, height: size, margin: '0 0 16px 0' }}>
          <QrWithLogo value={qr} logoDataUrl={logoDataUrl} size={size} />
        </div>
      </div>
    </div>
  );
} 