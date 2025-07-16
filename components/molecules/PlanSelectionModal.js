import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import Modal from '../atoms/Modal';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function PlanSelectionModal({ isOpen, onClose, onPlanSelected }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const questionsContainerRef = useRef(null);

  const questions = [
    {
      id: 'scale',
      title: 'イベントの規模は？',
      options: [
        { id: 'small', label: '小規模（5人以下）', plan: 'free', color: 'bg-green-50 border-green-200' },
        { id: 'medium', label: '中規模（6-25人）', plan: 'plus', color: 'bg-blue-50 border-blue-200' },
        { id: 'large', label: '大規模（26人以上）', plan: 'pro', color: 'bg-purple-50 border-purple-200' }
      ]
    },
    {
      id: 'duration',
      title: '保存期間は？',
      options: [
        { id: 'short', label: '1週間程度', plan: 'free', color: 'bg-green-50 border-green-200' },
        { id: 'medium', label: '1ヶ月程度', plan: 'plus', color: 'bg-blue-50 border-blue-200' },
        { id: 'long', label: '半年以上', plan: 'pro', color: 'bg-purple-50 border-purple-200' }
      ]
    }
  ];

  const plans = [
    {
      id: 'free',
      name: 'Freeプラン',
      price: '0円',
      description: '小規模イベント（親しい友人の誕生日会など）',
      features: [
        '画像25枚（最大5人分想定）',
        '7日間',
        '無料で気軽に試せる',
        '参加者数が少なくてシンプル利用向き'
      ],
      highlight: false,
      color: 'green'
    },
    {
      id: 'plus',
      name: 'Plusプラン',
      price: '3,000円',
      description: '中規模イベント（小規模結婚式、子ども会、サークルイベント）',
      features: [
        '画像125枚（最大25人分想定）',
        '30日間',
        'まとまった写真枚数対応',
        '高画質アップロード対応',
        'QRコード共有で参加者も簡単投稿'
      ],
      highlight: true,
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Proプラン',
      price: '10,000円',
      description: '大規模イベント（結婚式・企業パーティ地域イベント・フェス）',
      features: [
        '画像無制限',
        '半年間',
        '枚数制限なし',
        '長期間の保存・共有が可能',
        '写真のモデレーションやカスタマイズ機能付き',
        '専用サポート対応'
      ],
      highlight: false,
      color: 'purple'
    }
  ];

  // スワイプ機能
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentQuestionIndex < questions.length - 1) {
        // 左スワイプ - 次の質問
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (diff < 0 && currentQuestionIndex > 0) {
        // 右スワイプ - 前の質問
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    }
    
    setIsDragging(false);
  };

  const getRecommendedPlan = () => {
    const planCounts = { free: 0, plus: 0, pro: 0 };
    
    Object.values(answers).forEach(answer => {
      const question = questions.find(q => q.options.some(opt => opt.id === answer));
      if (question) {
        const selectedOption = question.options.find(opt => opt.id === answer);
        if (selectedOption) {
          planCounts[selectedOption.plan]++;
        }
      }
    });
    
    // 最も多く選択されたプランを返す
    const maxCount = Math.max(...Object.values(planCounts));
    const recommendedPlans = Object.keys(planCounts).filter(plan => planCounts[plan] === maxCount);
    
    // 複数ある場合はPlusプランを優先
    if (recommendedPlans.includes('plus')) return 'plus';
    if (recommendedPlans.includes('pro')) return 'pro';
    return 'free';
  };

  const handleQuestionSelect = (questionId, optionId) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);
    
    // 次の質問に進む（最後の質問の場合は最初に戻る）
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const handlePlanSelect = async (plan) => {
    if (plan.id === 'free') {
      // 無料プランの場合はモーダルを閉じるだけ
      onClose();
      return;
    }
    // Plus/Proプランの場合は親で状態変更
    onPlanSelected && onPlanSelected(plan);
    onClose();
  };

  const recommendedPlan = Object.keys(answers).length > 0 ? getRecommendedPlan() : null;

  // スマホ時のみおすすめプランを一番上に
  const sortedPlans = useMemo(() => {
    if (!recommendedPlan) return plans;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      // スマホ（lg未満）
      const rec = plans.find(p => p.id === recommendedPlan);
      const rest = plans.filter(p => p.id !== recommendedPlan);
      return [rec, ...rest];
    }
    // PCはそのまま
    return plans;
  }, [recommendedPlan, plans]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} wide={true}>
      <div className="relative bg-white rounded-3xl p-4 sm:p-6 max-w-4xl lg:max-w-6xl mx-auto w-full max-h-[90vh] overflow-y-auto">
        {/* バツ閉じボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-700 z-10 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow"
          aria-label="閉じる"
          style={{lineHeight:'1'}}>
          ×
        </button>
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">料金プランを選択</h2>
          <p className="text-sm sm:text-base text-gray-600">イベントの規模に合わせて最適なプランをお選びください</p>
        </div>

        {/* 質問セクション */}
        <div className="mb-6">
          <div 
            ref={questionsContainerRef}
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentQuestionIndex * 100}%)` }}
            >
              {questions.map((question, index) => (
                <div key={question.id} className="w-full flex-shrink-0 px-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 text-center">
                    {question.title}
                  </h3>
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleQuestionSelect(question.id, option.id)}
                        className={`w-full p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                          answers[question.id] === option.id 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <span className={`font-medium ${
                          answers[question.id] === option.id ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 質問ナビゲーション */}
          <div className="flex justify-center mt-4 space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentQuestionIndex ? 'bg-blue-500 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* プラン選択セクション */}
        <div className="mb-6">
          {/* おすすめプラン表示 */}
          {recommendedPlan && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">おすすめプラン</h3>
                <p className="text-sm text-gray-600">
                  あなたの回答から「{plans.find(p => p.id === recommendedPlan)?.name}」をおすすめします
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:gap-8">
            {sortedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl ${
                  plan.highlight 
                    ? 'border-blue-600 scale-105 z-10 shadow-2xl' 
                    : 'border-gray-100'
                } ${recommendedPlan === plan.id ? 'ring-2 ring-green-200 bg-green-50' : ''}`}
              >
                <div className={`p-6 border-b ${plan.highlight ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-pink-400 text-white relative' : ''}`}>
                  {plan.highlight && (
                    <div className="absolute top-4 right-4 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow">
                      人気
                    </div>
                  )}
                  
                  {recommendedPlan === plan.id && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        おすすめ
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold mb-2 tracking-wide drop-shadow-sm text-center text-black">
                      <span className="text-2xl">{plan.name.split('プラン')[0]}</span>
                      <span className="text-lg ml-1">プラン</span>
                    </h3>
                    <div className="flex items-end justify-center mb-4 gap-1">
                      <span className={`text-3xl font-extrabold drop-shadow-sm whitespace-nowrap ${plan.price === '0円' ? 'text-blue-500' : 'text-pink-500'}`}>
                        {plan.price}
                      </span>
                      <span className={`ml-1 ${plan.highlight ? 'text-white text-opacity-80' : 'text-black'} text-sm whitespace-nowrap`}>
                        /イベント
                      </span>
                    </div>
                    <p className={`${plan.highlight ? 'text-white text-opacity-90' : 'text-black'} text-sm`}>
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-white via-blue-50 to-pink-50">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`${feature.includes('枚') || feature.includes('日間') || feature.includes('画像無制限') || feature.includes('年間') || feature.includes('制限なし') ? 'text-blue-600 font-semibold' : ''}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3 px-4 rounded-full font-bold text-white shadow-lg hover:opacity-90 transition ${
                      plan.price === '0円' ? 'bg-blue-400' : 'bg-pink-500'
                    }`}
                  >
                    選択する
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </Modal>
  );
} 