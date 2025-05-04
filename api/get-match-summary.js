import { createClient } from "@supabase/supabase-js";
import Cors from "micro-cors";

const cors = Cors({
  allowMethods: ["GET", "OPTIONS"],
  origin: "https://www.futbola.my", // replace with your domain
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { game_id, session_id } = req.query;

  if (!game_id || !session_id) {
    return res.status(400).json({ error: "Missing game_id or session_id" });
  }

  try {
    const { data: matchResults, error } = await supabase
      .from("match_results")
      .select("match_number, team_a, team_b, score_a, score_b, goals")
      .eq("game_id", game_id)
      .eq("session_id", session_id)
      .order("match_number", { ascending: true });

    if (error) throw error;

    const matches = matchResults.map(m => ({
      match_number: m.match_number,
      team_a: m.team_a,
      team_b: m.team_b,
      score_a: m.score_a,
      score_b: m.score_b
    }));

    const goalCounts = {};
    const playerTeams = {};

    matchResults.forEach(m => {
      (m.goals || []).forEach(g => {
        if (!g.isOG) {
          goalCounts[g.player] = (goalCounts[g.player] || 0) + 1;
          playerTeams[g.player] = g.team;
        }
      });
    });

    const top_scorers = Object.entries(goalCounts)
      .map(([player, goals]) => ({
        player,
        goals,
        team: playerTeams[player] || "default"
      }))
      .sort((a, b) => b.goals - a.goals);

    const standingsMap = {};

    function updateStats(team, win, draw, gf, ga) {
      if (!standingsMap[team]) {
        standingsMap[team] = {
          team, MP: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0
        };
      }
      const s = standingsMap[team];
      s.MP += 1;
      s.GF += gf;
      s.GA += ga;
      s.GD = s.GF - s.GA;
      if (win) {
        s.W += 1; s.Pts += 3;
      } else if (draw) {
        s.D += 1; s.Pts += 1;
      } else {
        s.L += 1;
      }
    }

    matchResults.forEach(({ team_a, team_b, score_a, score_b }) => {
      const isDraw = score_a === score_b;
      const aWin = score_a > score_b;
      const bWin = score_b > score_a;

      updateStats(team_a, aWin, isDraw, score_a, score_b);
      updateStats(team_b, bWin, isDraw, score_b, score_a);
    });

    const standings = Object.values(standingsMap).sort((a, b) =>
      b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF
    );

    res.status(200).json({
      matches,
      top_scorers,
      standings
    });
  } catch (err) {
    console.error("Error fetching match summary:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export default cors(handler);
