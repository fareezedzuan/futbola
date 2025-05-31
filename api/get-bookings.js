import { createClient } from "@supabase/supabase-js";
import Cors from "micro-cors";

const cors = Cors({
  allowMethods: ["GET", "OPTIONS"],
  origin: "https://www.futbola.my", // Replace with your frontend domain
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

  const gameId = req.query.game_id;

  if (!gameId) {
    return res.status(400).json({ error: "Missing game_id parameter" });
  }

  try {
    const { data, error } = await supabase
      // .from("bookings") 
      // .select("id, name, phone, status")
      .from("game_bookings")
      .select("id, user_id, jersey_name, phone, avatar_url, booked_by_user_id")
      .eq("game_id", gameId);

    if (error) throw error;

    res.status(200).json({ bookings: data });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: err.message || "Failed to fetch bookings" });
  }
}

export default cors(handler);
