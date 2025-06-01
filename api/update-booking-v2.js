import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { game_id, name, jersey_number } = req.body

  const { data, error } = await supabase
    .from('game-bookings')
    .update({ jersey_number })
    .eq('game_id', game_id)
    .eq('name', name)

  if (error) return res.status(500).json({ error })
  res.status(200).json({ success: true, data })
}
