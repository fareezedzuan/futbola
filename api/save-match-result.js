import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals } = req.body;

    console.log("Received data:", {
      game_id,
      session_id,
      match_number,
      team_a,
      team_b,
      score_a,
      score_b,
      goals
    });

    const { data, error } = await supabase
      .from('match_results')
      .insert([{ game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals }]);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
}
