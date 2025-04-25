// /api/get-saved-sessions.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { data, error } = await supabase
      .from('match_results')
      .select('game_id, session_id')
      .neq('session_id', '')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Match results fetch error:", error);
      return res.status(500).json({ error });
    }

    const uniqueSessions = Array.from(
      new Map(data.map(d => [`${d.game_id}_${d.session_id}`, d])).values()
    );

    // Get game info for all unique game_ids
    const gameIds = [...new Set(uniqueSessions.map(s => s.game_id))];
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('id, venue, game_date, start_time')
      .in('id', gameIds);

    if (gamesError) {
      console.error("Games fetch error:", gamesError);
      return res.status(500).json({ error: gamesError });
    }

    // Merge game info with session info
    const sessionsWithDetails = uniqueSessions.map(s => {
      const game = gamesData.find(g => g.id === s.game_id);
      return {
        ...s,
        venue: game?.venue || 'Unknown',
        game_date: game?.game_date,
        start_time: game?.start_time
      };
    });

    res.status(200).json({ sessions: sessionsWithDetails });
  } catch (err) {
    console.error("Unexpected error in get-saved-sessions:", err);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}
