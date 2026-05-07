import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = 'https://jptfluaafcedmmouydob.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdGZsdWFhZmNlZG1tb3V5ZG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA5NDM5NywiZXhwIjoyMDkzNjcwMzk3fQ.zBkq8F82xlY5UEt4Q3G9ek36EZlOhiDWkkiF8nuxGh0'

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const sqls = [
      `CREATE TABLE IF NOT EXISTS saved_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        offer_id UUID NOT NULL,
        alert_type TEXT NOT NULL CHECK (alert_type IN ('escalating', 'new', 'price_change')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_saved_items_offer_id ON saved_items(offer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_alerts_offer_id ON alerts(offer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type)`
    ]

    for (const sql of sqls) {
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error && !error.message.includes('does not exist')) {
        throw error
      }
    }

    return NextResponse.json({ success: true, message: 'Tables created successfully!' })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to create tables'
    }, { status: 500 })
  }
}
