import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("❌ Supabase environment variables are missing. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set.");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals } = req.body;

    console.log("📥 Received data from client:", {
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
      console.error("❌ Supabase insert error:", error);
      return res.status(400).json({ error });
    }

    console.log("✅ Match result saved to Supabase:", data);
    res.status(200).json({ success: true, data });

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
}
