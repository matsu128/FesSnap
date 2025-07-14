import { supabase } from '../../lib/supabaseClient';
import { PLAN_LIMITS } from '../../lib/planLimits';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // イベント一覧取得
    const { data, error } = await supabase
      .from('events')
      .select('id, title, like_enabled, created_at, plan_type, expires_at, owner, image_limit, storage_period_days');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    // 新規イベント作成
    const { title, like_enabled, plan_type = 'free', owner } = req.body;
    console.log('[API/events] POST body:', req.body);
    if (!title) {
      console.log('[API/events] タイトル未入力エラー');
      return res.status(400).json({ error: 'タイトル必須' });
    }
    // プランに応じた制限を設定
    const planLimit = PLAN_LIMITS[plan_type] || PLAN_LIMITS.free;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planLimit.storage_period_days);
    // ownerが未指定ならUUID型のダミー値をセット
    const eventOwner = owner || '00000000-0000-0000-0000-000000000000';
    console.log('[API/events] owner:', eventOwner);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([
          { 
            title, 
            like_enabled,
            plan_type,
            image_limit: planLimit.image_limit,
            storage_period_days: planLimit.storage_period_days,
            expires_at: expiresAt.toISOString(),
            current_image_count: 0,
            owner: eventOwner
          }
        ])
        .select();
      console.log('[API/events] insert result:', data, error);
      if (error) {
        console.log('[API/events] DB error:', error.message);
        // 英語エラーを日本語に変換
        if (error.message && error.message.includes('invalid input syntax for type uuid')) {
          return res.status(500).json({ error: '未ログインの場合はゲストとしてイベントを作成します。' });
        }
        if (error.message && error.message.includes('null value in column "owner"')) {
          return res.status(500).json({ error: '未ログインの場合はゲストとしてイベントを作成します。' });
        }
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
      }
      return res.status(200).json(data[0]);
    } catch (e) {
      console.log('[API/events] catch error:', e);
      if (e.message && e.message.includes('invalid input syntax for type uuid')) {
        return res.status(500).json({ error: '未ログインの場合はゲストとしてイベントを作成します。' });
      }
      if (e.message && e.message.includes('null value in column "owner"')) {
        return res.status(500).json({ error: '未ログインの場合はゲストとしてイベントを作成します。' });
      }
      return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
} 