import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals } = req.body;
  console.log("📥 Incoming match save payload:", req.body);
  console.log("🔍 Upserting payload to Supabase:", {  game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals });

  // 🧠 Debug logs (you want to keep these!)
  console.log("🎯 Final score submitted:", score_a, "-", score_b);
  console.log("🎯 Goals submitted:", Array.isArray(goals) ? goals.length : 'invalid');
  console.log("📦 Raw payload:", {
    game_id,
    session_id,
    match_number,
    team_a,
    team_b,
    score_a,
    score_b
  });

  // Optional: Basic score sanity check
  if (typeof score_a !== 'number' || typeof score_b !== 'number') {
    console.warn("⚠️ Invalid score values detected:", score_a, score_b);
  }

  // const { data, error } = await supabase
  //   .from('match_results')
  //   .upsert(
  //     [{ game_id, session_id, match_number, team_a, team_b, score_a, score_b, goals }],
  //     { onConflict: ['game_id', 'session_id', 'match_number'] }
  //   );
    
  const { data, error } = await supabase
    .from('match_results')
    .upsert(
      [{
        game_id,
        session_id,
        match_number,
        team_a,
        team_b,
        score_a,
        score_b,
        goals,
        status: req.body.status,
        updated_at: req.body.updated_at
      }],
      { onConflict: ['game_id', 'session_id', 'match_number'] }
    );

  if (error) {
    console.error("❌ Supabase upsert error:", error.details || error.message || error);
    return res.status(400).json({ error });
  }

  res.status(200).json({ success: true, data });
}
