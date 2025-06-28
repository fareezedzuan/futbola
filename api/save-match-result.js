import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    return res.status(500).json({ error: "Supabase URL or key not configured." });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals } = req.body;

    console.log("📥 Received data:", {
      game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals
    });

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
  } catch (err) {
    console.error("❌ Unexpected API error:", err);
    res.status(500).json({ error: "Server crash", details: err.message });
  }
}
