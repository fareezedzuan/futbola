import { createClient } from "@supabase/supabase-js";
import Cors from "micro-cors";

const cors = Cors({
  allowMethods: ["GET", "OPTIONS"],
  origin: "*", // or set to your frontend like "https://www.futbola.my"
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

  try {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("is_active", true)
      .gte("game_date", today)
      .order("game_date", { ascending: true });

    if (error) throw error;

    res.status(200).json({ games: data });
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({ error: err.message || "Failed to fetch games" });
  }
}

export default cors(handler);
