import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-black py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* サービス情報 */}
          <div className="lg:col-span-2">
            <div className="flex flex-col items-center w-full">
              <h2 
                className="mb-4 mt-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-center bg-gradient-to-r from-[#00c6fb] to-[#005bea] bg-clip-text text-transparent drop-shadow-lg"
                style={{
                  fontFamily: '"Baloo 2", "Noto Sans JP", Quicksand, Nunito, Rubik, "Rounded Mplus 1c", Poppins, sans-serif',
                  letterSpacing: '0.15em',
                  lineHeight: '1.1',
                  wordBreak: 'keep-all',
                  maxWidth: '100%',
                  margin: 'clamp(0.5rem, 2vw, 1rem) auto clamp(1rem, 3vw, 1.5rem)',
                  overflowWrap: 'break-word',
                  fontSize: 'clamp(2.6rem, 8vw, 5rem)'
                }}
              >
                FesSnap
              </h2>
            </div>
            <p className="text-gray-700 mb-4 text-center lg:text-left">
              イベントの感動をその場でみんなと共有できる新しい写真共有サービスです。
              QRコードで簡単参加、リアルタイムで思い出をシェア！
            </p>
          </div>

          {/* サービス */}
          <div>
            <h4 className="text-lg font-semibold mb-4">サービス</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-gray-700 hover:text-black transition-colors">
                  イベント一覧
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-700 hover:text-black transition-colors">
                  イベント作成
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h4 className="text-lg font-semibold mb-4">サポート</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-700 hover:text-black transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-700 hover:text-black transition-colors">
                  返金ポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 法的事項 */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-black transition-colors">
                利用規約
              </Link>
              <Link href="/privacy" className="hover:text-black transition-colors">
                プライバシーポリシー
              </Link>
              <a href="/legal" className="text-xs text-gray-500 hover:underline">特定商取引法に基づく表記</a>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 FesSnap. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 