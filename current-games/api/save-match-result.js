import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals } = req.body;
console.log("📥 Incoming match save payload:", req.body);

  const { data, error } = await supabase
    .from('match_results')
    .upsert(
      [{ game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals }],
      { onConflict: ['game_id', 'session_id', 'match_number'] }
    );

  if (error) {
    console.error("❌ Supabase upsert error:", error);
    return res.status(400).json({ error });
  }

  res.status(200).json({ success: true, data });
}
