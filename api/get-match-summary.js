// /api/get-match-summary.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { game_id, session_id } = req.query;
  if (!game_id || !session_id) {
    return res.status(400).json({ error: 'Missing game_id or session_id' });
  }

  try {
    const { data, error } = await supabase
      .from('match_results')
      .select('*')
      .eq('game_id', game_id)
      .eq('session_id', session_id)
      .order('match_number', { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error });
    }

    res.status(200).json({ matches: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: 'Unexpected error', details: err.message });
  }
}
