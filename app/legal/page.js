import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 戻るボタン */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          戻る
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">販売事業者</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>事業者名：</strong>FesSnap（フェススナップ）</p>
                <p><strong>代表者：</strong>代表取締役</p>
                <p><strong>所在地：</strong>請求があれば開示いたします</p>
                <p><strong>連絡先：</strong><a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a></p>
                <p><strong>メールアドレス：</strong><a href="mailto:info@fessnap.com" className="text-blue-600 hover:underline">info@fessnap.com</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">販売価格</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">プラン名</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">価格</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">支払方法</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Freeプラン</td>
                      <td className="border border-gray-300 px-4 py-2">無料</td>
                      <td className="border border-gray-300 px-4 py-2">-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Plusプラン</td>
                      <td className="border border-gray-300 px-4 py-2">3,000円（税込）</td>
                      <td className="border border-gray-300 px-4 py-2">クレジットカード決済</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Proプラン</td>
                      <td className="border border-gray-300 px-4 py-2">10,000円（税込）</td>
                      <td className="border border-gray-300 px-4 py-2">クレジットカード決済</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">支払方法</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>クレジットカード決済（Visa、Mastercard、American Express、JCB）</li>
                <li>決済処理はStripe株式会社が提供するサービスを使用</li>
                <li>決済は即座に処理され、サービス利用開始</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">商品の引き渡し時期</h2>
              <p className="mb-4">
                決済完了後、即座にサービスをご利用いただけます。
                有料プランの機能は、決済完了と同時にアカウントに反映されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">返品・キャンセルについて</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="font-semibold text-yellow-800 mb-2">返品・キャンセルポリシー</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  <li>デジタルサービスのため、原則として返品・キャンセルはできません</li>
                  <li>サービス提供開始前であれば、返金対応いたします</li>
                  <li>返金希望の場合は、決済後7日以内にお問い合わせください</li>
                  <li>返金時は、Stripeの手数料（約3.6%）を差し引いた金額となります</li>
                </ul>
              </div>
              <p className="mt-4">
                詳細については、<a href="/refund" className="text-blue-600 hover:underline">返金ポリシー</a>をご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">送料</h2>
              <p className="mb-4">
                デジタルサービスのため、送料は発生いたしません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">運送時の損害の責任所在</h2>
              <p className="mb-4">
                デジタルサービスのため、運送時の損害は発生いたしません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">クーリングオフについて</h2>
              <p className="mb-4">
                デジタルコンテンツの提供であるため、クーリングオフは適用されません。
                ただし、サービス提供開始前であれば返金対応いたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">動作環境</h2>
              <p className="mb-4">以下の環境での動作を推奨します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>ブラウザ：</strong>Chrome、Safari、Firefox、Edge（最新版）</li>
                <li><strong>デバイス：</strong>スマートフォン、タブレット、PC</li>
                <li><strong>インターネット：</strong>安定したインターネット接続</li>
                <li><strong>カメラ：</strong>写真撮影機能（投稿時）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">利用規約・プライバシーポリシー</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><a href="/terms" className="text-blue-600 hover:underline">利用規約</a></li>
                <li><a href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</a></li>
                <li><a href="/refund" className="text-blue-600 hover:underline">返金ポリシー</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">お問い合わせ</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>お問い合わせ方法：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a></li>
                  <li>メール：<a href="mailto:info@fessnap.com" className="text-blue-600 hover:underline">info@fessnap.com</a></li>
                </ul>
                <p className="mt-2"><strong>営業時間：</strong>平日 10:00〜18:00（土日祝日除く）</p>
                <p><strong>回答目安：</strong>通常3営業日以内</p>
              </div>
            </section>

            <div className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-500">
                制定日：2024年1月1日<br />
                最終更新日：2024年12月1日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 