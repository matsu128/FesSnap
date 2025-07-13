import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // イベント一覧取得
    const { data, error } = await supabase
      .from('events')
      .select('id, title, like_enabled, created_at'); // ownerは一時的に除外
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    // 新規イベント作成
    const { title, like_enabled } = req.body;
    if (!title) return res.status(400).json({ error: 'タイトル必須' });
    const { data, error } = await supabase
      .from('events')
      .insert([
        { title, like_enabled } // dateは送信しない
      ])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }
  res.status(405).json({ error: 'Method not allowed' });
} 