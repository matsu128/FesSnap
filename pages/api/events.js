import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 全イベント取得
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    // 新規イベント作成
    const { title, date, region, category, desc, price, capacity } = req.body;
    const { data, error } = await supabase.from('events').insert([
      { title, date, region, category, desc, price, capacity }
    ]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }
  res.status(405).json({ error: 'Method not allowed' });
} 