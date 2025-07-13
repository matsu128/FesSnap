import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 基本方針</h2>
              <p className="mb-4">
                FesSnap（フェススナップ）（以下「当サービス」）は、お客様の個人情報の保護を最重要事項と考え、
                適切な収集、利用、管理を行います。本プライバシーポリシーは、当サービスにおける個人情報の取り扱いについて定めています。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 収集する情報</h2>
              <p className="mb-4">当サービスでは、以下の情報を収集します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>アカウント情報：</strong>LINEアカウント連携による表示名、プロフィール画像</li>
                <li><strong>イベント情報：</strong>イベント名、開催日時、場所、参加者情報</li>
                <li><strong>投稿情報：</strong>アップロードされた写真、コメント</li>
                <li><strong>決済情報：</strong>Stripeを通じた決済データ（クレジットカード情報は当社では保持しません）</li>
                <li><strong>利用ログ：</strong>アクセス日時、IPアドレス、ブラウザ情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 情報の利用目的</h2>
              <p className="mb-4">収集した情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>当サービスの提供・運営</li>
                <li>ユーザー認証・アカウント管理</li>
                <li>決済処理・課金管理</li>
                <li>お客様サポート・お問い合わせ対応</li>
                <li>サービス改善・新機能開発</li>
                <li>法令に基づく対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 第三者提供</h2>
              <p className="mb-4">
                当サービスは、以下の場合を除き、お客様の個人情報を第三者に提供いたしません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>お客様の事前の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要な場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要な場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 外部サービスの利用</h2>
              <p className="mb-4">当サービスでは、以下の外部サービスを利用しています：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Supabase：</strong>データベース・認証サービス</li>
                <li><strong>Stripe：</strong>決済処理サービス</li>
                <li><strong>LINE：</strong>ソーシャルログインサービス</li>
                <li><strong>Vercel：</strong>ホスティング・分析サービス</li>
              </ul>
              <p className="mt-4">
                これらのサービスは、それぞれ独自のプライバシーポリシーに従って情報を処理します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookieの利用</h2>
              <p className="mb-4">
                当サービスでは、以下の目的でCookieを使用します：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>セッション管理（ログイン状態の維持）</li>
                <li>アクセス解析（サービス改善のため）</li>
                <li>ユーザー体験の向上</li>
              </ul>
              <p className="mt-4">
                ブラウザの設定でCookieを無効にすることも可能ですが、一部の機能が正常に動作しない場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. セキュリティ対策</h2>
              <p className="mb-4">
                当サービスでは、個人情報の保護のために以下の対策を実施しています：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL暗号化通信の使用</li>
                <li>アクセス制御の実施</li>
                <li>定期的なセキュリティ監査</li>
                <li>従業員への個人情報保護教育</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. 情報の確認・削除</h2>
              <p className="mb-4">
                お客様は、ご自身の個人情報について以下の権利を有します：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>個人情報の開示請求</li>
                <li>個人情報の訂正・追加・削除請求</li>
                <li>個人情報の利用停止・消去請求</li>
              </ul>
              <p className="mt-4">
                これらの請求については、<a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a>からご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. データの保持期間</h2>
              <p className="mb-4">
                当サービスでは、以下の期間にわたってデータを保持します：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>アカウント情報：アカウント削除まで</li>
                <li>イベント情報：イベント終了後30日</li>
                <li>投稿写真：イベント終了後30日（有料プランは延長可能）</li>
                <li>決済情報：法令に基づく保存期間</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. お問い合わせ窓口</h2>
              <p className="mb-4">
                個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>FesSnap プライバシー担当</strong></p>
                <p>メール：<a href="mailto:privacy@fessnap.com" className="text-blue-600 hover:underline">privacy@fessnap.com</a></p>
                <p>お問い合わせフォーム：<a href="/contact" className="text-blue-600 hover:underline">こちら</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. プライバシーポリシーの変更</h2>
              <p className="mb-4">
                当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
                重要な変更がある場合は、当サービス上でお知らせいたします。
              </p>
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