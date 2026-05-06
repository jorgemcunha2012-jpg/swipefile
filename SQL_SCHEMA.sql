-- Offers Table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  num_ads INTEGER,
  num_creatives INTEGER,
  num_clicks INTEGER,
  language TEXT,
  niche TEXT,
  structure TEXT,
  product_type TEXT,
  status TEXT DEFAULT 'active',
  days_active INTEGER,
  detected_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  momentum_tag TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved Offers (Favoritos)
CREATE TABLE saved_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, offer_id)
);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Offers (public read)
CREATE POLICY "Offers are public" ON offers
  FOR SELECT USING (true);

-- RLS Policies - Saved Offers (users see only their own)
CREATE POLICY "Users see only their saved offers" ON saved_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved offers" ON saved_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved offers" ON saved_offers
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved offers" ON saved_offers
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert mock data
INSERT INTO offers (name, platform, num_ads, num_creatives, language, niche, structure, product_type, status, days_active, momentum_tag, detected_at)
VALUES
  ('Emagrecimento 10kg em 30 dias', 'facebook', 145, 28, 'Português', 'Emagrecimento', 'VSL', 'Nutracêutico', 'active', 85, 'escalating', NOW() - INTERVAL '85 days'),
  ('Software de Gestão ERP', 'youtube', 89, 12, 'Português', 'Software', 'Email', 'Software', 'active', 45, 'hot', NOW() - INTERVAL '45 days'),
  ('Cura Diabetes Tipo 2', 'instagram', 234, 45, 'Português', 'Diabetes', 'VSL', 'Nutracêutico', 'active', 120, 'escalating', NOW() - INTERVAL '120 days'),
  ('Curso Python Avançado', 'facebook', 56, 9, 'Português', 'Educação', 'Landing Page', 'Curso', 'recently_disabled', 30, 'radar', NOW() - INTERVAL '30 days'),
  ('Tratamento Alopecia', 'tiktok', 178, 34, 'Português', 'Saúde', 'VSL', 'Nutracêutico', 'active', 92, 'hot', NOW() - INTERVAL '92 days');
