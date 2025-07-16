import Stripe from 'stripe';
import { supabase, updateUserPlan } from '../../../lib/supabaseClient';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '許可されていないメソッドです' });
  }

  try {
    const { planType, userId } = req.body;

    if (!planType || !userId) {
      return res.status(400).json({ error: '必要なパラメータが不足しています' });
    }

    // プラン情報の取得
    const planConfig = {
      free: { price: 0, name: 'Freeプラン' },
      plus: { price: 3000, name: 'Plusプラン' },
      pro: { price: 10000, name: 'Proプラン' }
    };

    const plan = planConfig[planType];
    if (!plan) {
      return res.status(400).json({ error: 'プランタイプが不正です' });
    }

    // 無料プランの場合は直接更新
    if (planType === 'free') {
      await updateUserPlan(userId, 'free');
      return res.status(200).json({ 
        success: true, 
        message: 'Freeプランに更新しました' 
      });
    }

    // 有料プランの場合
    if (!stripe) {
      return res.status(400).json({ 
        error: '決済システムが正しく設定されていません。管理者にお問い合わせください。' 
      });
    }

    // ユーザー情報の取得
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) throw new Error('ユーザー情報の取得に失敗しました');

    // ユーザープラン情報の取得
    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();
    if (planError) throw new Error('プラン情報の取得に失敗しました');

    let customerId = userPlan?.stripe_customer_id;

    // Stripe顧客が存在しない場合は作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.user.email,
        metadata: {
          user_id: userId
        }
      });

      customerId = customer.id;

      // ユーザープランテーブルにStripe顧客IDを保存
      await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          current_plan: 'free',
          payment_status: 'active'
        });
    }

    // 決済セッションの作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: plan.name,
              description: `${plan.name} - イベント写真共有サービス`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/admin?success=true&session_id={CHECKOUT_SESSION_ID}&plan_type=${planType}`,
      cancel_url: `${req.headers.origin}/admin?canceled=true`,
      metadata: {
        user_id: userId,
        plan_type: planType
      }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: '決済処理中にエラーが発生しました。しばらくしてから再度お試しください。' });
  }
} 