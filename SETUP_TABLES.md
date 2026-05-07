# Setup de Tabelas - Salvar & Alertas

Para ativar as funcionalidades de "Salvar para Biblioteca" e "Criar Alerta", execute o SQL abaixo no Supabase.

## Passos:

1. Abra seu projeto em https://app.supabase.com
2. Vá para **SQL Editor** (no menu esquerdo)
3. Clique em **"New query"**
4. Cole o SQL abaixo e execute

## SQL:

```sql
-- Create saved_items table
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id TEXT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('escalating', 'new', 'price_change')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_items_offer_id ON saved_items(offer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_offer_id ON alerts(offer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
```

Pronto! Após executar, os botões "Salvar para Biblioteca" e "Criar Alerta" funcionarão normalmente.
