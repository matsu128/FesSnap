import { supabase } from '../../lib/supabaseClient';
import { planLimits } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // イベント一覧取得
    const { data, error } = await supabase
      .from('events')
      .select('id, title, like_enabled, created_at, plan_type, expires_at'); // ownerは一時的に除外
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    // 新規イベント作成
    const { title, like_enabled, plan_type = 'free' } = req.body;
    if (!title) return res.status(400).json({ error: 'タイトル必須' });

    // プランに応じた制限を設定
    const planLimit = planLimits[plan_type] || planLimits.free;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planLimit.storagePeriodDays);

    const { data, error } = await supabase
      .from('events')
      .insert([
        { 
          title, 
          like_enabled,
          plan_type,
          image_limit: planLimit.imageLimit,
          storage_period_days: planLimit.storagePeriodDays,
          expires_at: expiresAt.toISOString(),
          current_image_count: 0
        }
      ])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }
  res.status(405).json({ error: 'Method not allowed' });
} 