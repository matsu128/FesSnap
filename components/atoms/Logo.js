// FesSnap共通ロゴコンポーネント（SVGグラデーション対応）
// props: size（テキストサイズクラス, 例: 'text-xl'）, className（追加クラス）
export default function Logo({ size = 'text-5xl', className = '' }) {
  // サイズクラス→フォントサイズpx変換
  const sizeMap = {
    'text-xl': 24,
    'text-2xl': 28,
    'text-3xl': 32,
    'text-4xl': 36,
    'text-5xl': 48,
    'text-6xl': 60,
  };
  const fontSize = sizeMap[size] || 48;
  return (
    <svg
      width="auto"
      height={fontSize + 12}
      viewBox={`0 0 220 ${fontSize + 12}`}
      className={className}
      style={{ display: 'inline', verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id="fesnap-logo-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00c6fb" />
          <stop offset="100%" stopColor="#005bea" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y={fontSize}
        fontFamily="'Baloo 2', 'Quicksand', 'Nunito', 'Rubik', 'Rounded Mplus 1c', 'Poppins', sans-serif"
        fontWeight="bold"
        fontSize={fontSize}
        fill="url(#fesnap-logo-gradient)"
        letterSpacing="0.15em"
      >
        FesSnap
      </text>
    </svg>
  );
} 