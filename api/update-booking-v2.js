import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { game_id, user_id, booking_id, jersey_number } = req.body

  // Start building the query
  let query = supabase.from('game_bookings').update({ jersey_number })

  // Choose condition based on whether it's a guest or registered user
  if (user_id) {
    query = query.eq('game_id', game_id).eq('user_id', user_id)
  } else if (booking_id) {
    query = query.eq('id', booking_id)
  } else {
    return res.status(400).json({ error: 'Missing user_id or booking_id' })
  }

  const { data, error } = await query

  if (error) {
    return res.status(500).json({ error })
  }

  return res.status(200).json({ success: true, data })
}
