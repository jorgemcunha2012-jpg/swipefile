-- Create saved_items table
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('escalating', 'new', 'price_change')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_saved_items_offer_id ON saved_items(offer_id);
CREATE INDEX idx_alerts_offer_id ON alerts(offer_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
