import Link from 'next/link';

export default function RefundPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">返金ポリシー</h1>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">基本方針</h2>
              <p className="mb-4">
                FesSnap（フェススナップ）では、お客様に安心してサービスをご利用いただくため、
                明確で公平な返金ポリシーを定めています。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">返金対象</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="font-semibold text-green-800 mb-2">返金可能な場合</p>
                <ul className="list-disc list-inside space-y-1 text-green-700">
                  <li>サービス提供開始前の返金請求</li>
                  <li>Stripe側のエラーによる重複決済</li>
                  <li>当社のシステム障害によるサービス提供不能</li>
                  <li>明らかな当社の過失による問題</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="font-semibold text-red-800 mb-2">返金不可の場合</p>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  <li>サービス提供開始後の返金請求</li>
                  <li>お客様の都合によるキャンセル</li>
                  <li>利用規約違反による利用停止</li>
                  <li>お客様の操作ミスによる問題</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">返金手続き</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="font-semibold text-blue-800 mb-2">返金請求の手順</p>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li><a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a>またはメールで返金請求</li>
                  <li>決済日時、金額、理由を明記</li>
                  <li>当社による審査（通常1-3営業日）</li>
                  <li>返金承認の場合、Stripeを通じて返金処理</li>
                  <li>返金完了の通知</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">返金期限</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="font-semibold text-yellow-800 mb-2">重要：返金請求期限</p>
                <p className="text-yellow-700">
                  返金請求は、決済日から<strong>7日以内</strong>にお願いいたします。
                  7日を過ぎた場合、返金対応ができませんのでご了承ください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">返金金額</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">ケース</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">返金金額</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">サービス提供前</td>
                      <td className="border border-gray-300 px-4 py-2">全額返金</td>
                      <td className="border border-gray-300 px-4 py-2">Stripe手数料を差し引く</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">重複決済</td>
                      <td className="border border-gray-300 px-4 py-2">重複分全額返金</td>
                      <td className="border border-gray-300 px-4 py-2">手数料なし</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">システム障害</td>
                      <td className="border border-gray-300 px-4 py-2">全額返金</td>
                      <td className="border border-gray-300 px-4 py-2">手数料なし</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">手数料について</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold mb-2">Stripe決済手数料について</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Stripeの決済手数料（約3.6%）は返金できません</li>
                  <li>当社が負担する場合もありますが、原則としてお客様負担となります</li>
                  <li>重複決済やシステム障害の場合は、当社が手数料を負担いたします</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">返金処理期間</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="font-semibold text-green-800 mb-2">返金処理の流れ</p>
                <ul className="list-disc list-inside space-y-2 text-green-700">
                  <li><strong>審査期間：</strong>1-3営業日</li>
                  <li><strong>返金処理：</strong>承認後1-2営業日</li>
                  <li><strong>反映期間：</strong>クレジットカード会社により3-10営業日</li>
                  <li><strong>合計：</strong>通常5-15営業日程度</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">返金方法</h2>
              <p className="mb-4">
                返金は、決済に使用されたクレジットカードに直接返金されます。
                返金先の変更はできませんのでご了承ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">返金後のサービス利用</h2>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                <p className="font-semibold text-orange-800 mb-2">返金後の注意事項</p>
                <ul className="list-disc list-inside space-y-1 text-orange-700">
                  <li>返金後は、該当プランの機能が利用できなくなります</li>
                  <li>再度プラン購入をご希望の場合は、新たに決済が必要です</li>
                  <li>返金後も投稿された写真は、無料プランの保存期間に従って管理されます</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">よくある質問</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Q: 決済後すぐに返金できますか？</h3>
                  <p className="text-gray-700">
                    A: はい、サービス提供開始前であれば返金可能です。ただし、Stripeの手数料（約3.6%）は差し引かれます。
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Q: 返金に時間がかかるのはなぜですか？</h3>
                  <p className="text-gray-700">
                    A: クレジットカード会社の処理に時間がかかるためです。当社の処理は1-2営業日で完了します。
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Q: 返金後も写真は残りますか？</h3>
                  <p className="text-gray-700">
                    A: 投稿された写真は、無料プランの保存期間（30日）に従って管理されます。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">お問い合わせ</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold mb-2">返金に関するお問い合わせ</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a></li>
                  <li>メール：<a href="mailto:refund@fessnap.com" className="text-blue-600 hover:underline">refund@fessnap.com</a></li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  営業時間：平日 10:00〜18:00（土日祝日除く）<br />
                  回答目安：通常1-3営業日以内
                </p>
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