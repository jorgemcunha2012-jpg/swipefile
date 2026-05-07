-- Copie e execute isso no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('escalating', 'new', 'price_change')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_items_offer_id ON saved_items(offer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_offer_id ON alerts(offer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
