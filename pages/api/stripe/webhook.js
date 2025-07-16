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

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function addHalfYear(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 6);
  return d;
}

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const planType = session.metadata?.plan_type;
    const eventId = session.metadata?.event_id;
    const paymentIntentId = session.payment_intent;
    const amount = session.amount_total ? session.amount_total / 100 : null;
    const currency = session.currency || 'jpy';
    const status = session.payment_status || 'succeeded';
    if (!userId || !planType || !eventId) {
      console.error('user_id, plan_type, or event_id missing in session metadata');
      return res.status(400).json({ error: 'user_id, plan_type, or event_id missing' });
    }
    try {
      // payment_historyの冪等insert（event_id単位）
      if (paymentIntentId) {
        const { data: existing, error: findError } = await supabase
          .from('payment_history')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .eq('event_id', eventId)
          .maybeSingle();
        if (!existing) {
          const { error: insertError } = await supabase
            .from('payment_history')
            .insert({
              user_id: userId,
              event_id: eventId,
              stripe_payment_intent_id: paymentIntentId,
              plan_type: planType,
              amount: amount || 0,
              currency,
              status,
            });
          if (insertError) {
            console.error('payment_history insert error:', insertError.message);
          }
        }
      }
      return res.status(200).json({ received: true });
    } catch (e) {
      console.error('Webhook DB error:', e);
      return res.status(500).json({ error: 'DB exception' });
    }
  }
  res.status(200).json({ received: true });
} 