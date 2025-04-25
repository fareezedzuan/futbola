// /api/get-match-summary.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { game_id, session_id } = req.query;
  if (!game_id || !session_id) return res.status(400).json({ error: 'Missing game_id or session_id' });

  try {
    const { data: matches, error } = await supabase
      .from('match_results')
      .select('*')
      .eq('game_id', game_id)
      .eq('session_id', session_id)
      .order('match_number');

    if (error) throw error;

    const standings = {};
    const goalTally = {};

    for (const match of matches) {
      const { team_a, team_b, score_a, score_b, goals = [] } = match;

      const sA = standings[team_a] ||= { team: team_a, MP: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0 };
      const sB = standings[team_b] ||= { team: team_b, MP: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0 };

      sA.MP++; sB.MP++;
      sA.GF += score_a; sA.GA += score_b;
      sB.GF += score_b; sB.GA += score_a;

      if (score_a > score_b) { sA.W++; sB.L++; sA.Pts += 3; }
      else if (score_b > score_a) { sB.W++; sA.L++; sB.Pts += 3; }
      else { sA.D++; sB.D++; sA.Pts += 1; sB.Pts += 1; }

      goals.forEach(goal => {
        if (!goal.isOG) {
          goalTally[goal.player] = (goalTally[goal.player] || 0) + 1;
        }
      });
    }

    const standingsArr = Object.values(standings).map(s => ({ ...s, GD: s.GF - s.GA }))
      .sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF);

    const topScorers = Object.entries(goalTally)
      .map(([player, goals]) => ({ player, goals }))
      .sort((a, b) => b.goals - a.goals);

    res.status(200).json({ matches, standings: standingsArr, top_scorers: topScorers });

  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to load summary', details: err.message });
  }
}
