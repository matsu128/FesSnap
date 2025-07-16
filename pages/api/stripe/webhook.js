import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabase } from '../../../lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  let reqBuffer;
  try {
    reqBuffer = await buffer(req);
    event = stripe.webhooks.constructEvent(reqBuffer, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 冪等性のためevent.idで重複処理防止（必要ならDBで管理）

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const planType = session.metadata?.plan_type;
    if (!userId || !planType) {
      console.error('user_id or plan_type missing in session metadata');
      return res.status(400).json({ error: 'user_id or plan_type missing' });
    }
    try {
      // user_plansテーブルをupsert
      const { error } = await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          current_plan: planType,
          payment_status: 'active',
          // 必要ならplan_expire_at等もここで計算して追加
        });
      if (error) {
        console.error('user_plans upsert error:', error.message);
        return res.status(500).json({ error: 'DB update error' });
      }
      return res.status(200).json({ received: true });
    } catch (e) {
      console.error('Webhook DB error:', e);
      return res.status(500).json({ error: 'DB exception' });
    }
  }

  // 他のイベントは200でOK返す
  res.status(200).json({ received: true });
} 