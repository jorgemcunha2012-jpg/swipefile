import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const sql = `
      CREATE TABLE IF NOT EXISTS saved_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
        alert_type TEXT NOT NULL CHECK (alert_type IN ('escalating', 'new', 'price_change')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_saved_items_offer_id ON saved_items(offer_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_offer_id ON alerts(offer_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
    `

    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error?.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        message: 'Execute SQL manually in Supabase dashboard'
      })
    }

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to create tables'
    })
  }
}
