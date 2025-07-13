"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // 実際の送信処理は後で実装
      // 現在は送信成功のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">お問い合わせ</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* お問い合わせ情報 */}
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">お問い合わせ方法</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">お問い合わせフォーム</h3>
                    <p className="text-blue-700">
                      下記のフォームからお気軽にお問い合わせください。
                      通常3営業日以内にご回答いたします。
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <h3 className="font-semibold text-green-800 mb-2">メール</h3>
                    <p className="text-green-700">
                      <a href="mailto:info@fessnap.com" className="text-green-600 hover:underline">
                        info@fessnap.com
                      </a>
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">営業時間</h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-semibold mb-2">平日 10:00〜18:00</p>
                  <p className="text-gray-600">土日祝日はお休みをいただいております</p>
                  <p className="text-sm text-gray-500 mt-2">
                    営業時間外のお問い合わせは、翌営業日に順次対応いたします
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">よくある質問</h2>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-semibold text-gray-900 mb-1">Q: 返金について</h3>
                    <p className="text-sm text-gray-600">
                      <a href="/refund" className="text-blue-600 hover:underline">返金ポリシー</a>をご確認ください。
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-semibold text-gray-900 mb-1">Q: 利用規約について</h3>
                    <p className="text-sm text-gray-600">
                      <a href="/terms" className="text-blue-600 hover:underline">利用規約</a>をご確認ください。
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-semibold text-gray-900 mb-1">Q: プライバシーについて</h3>
                    <p className="text-sm text-gray-600">
                      <a href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</a>をご確認ください。
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* お問い合わせフォーム */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">お問い合わせフォーム</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 font-semibold">お問い合わせを送信しました</p>
                  <p className="text-green-700 text-sm mt-1">
                    通常3営業日以内にご回答いたします。お急ぎの場合は、メールでもご連絡ください。
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 font-semibold">送信に失敗しました</p>
                  <p className="text-red-700 text-sm mt-1">
                    しばらく時間をおいて再度お試しください。または、メールでご連絡ください。
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="山田太郎"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    件名 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="general">一般的なお問い合わせ</option>
                    <option value="technical">技術的な問題</option>
                    <option value="billing">決済・料金について</option>
                    <option value="refund">返金について</option>
                    <option value="feature">機能要望</option>
                    <option value="bug">バグ報告</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    お問い合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="お問い合わせ内容を詳しくお書きください"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>注意：</strong>返金に関するお問い合わせは、決済日時、金額、理由を必ず明記してください。
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
              </form>
            </div>
          </div>

          <div className="border-t pt-8 mt-8">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                お急ぎの場合は、直接メールでご連絡ください：<br />
                <a href="mailto:info@fessnap.com" className="text-blue-600 hover:underline">
                  info@fessnap.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 