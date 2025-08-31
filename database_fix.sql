-- Script para corrigir erros de build - Execute no Supabase SQL Editor
-- 1. Tabela para configurações de order bump
CREATE TABLE IF NOT EXISTS store_order_bump_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  urgency_text TEXT DEFAULT 'Oferta por tempo limitado!',
  social_proof_text TEXT DEFAULT 'Mais de 1000 clientes já aproveitaram!',
  bundle_price DECIMAL(10,2),
  is_limited_time BOOLEAN DEFAULT false,
  limited_quantity INTEGER DEFAULT 0,
  trigger_conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

-- 2. Tabela para métodos de pagamento
CREATE TABLE IF NOT EXISTS store_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('pix', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'crypto')),
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela para métodos de entrega
CREATE TABLE IF NOT EXISTS store_shipping_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('pickup', 'delivery', 'correios', 'custom')),
  is_active BOOLEAN DEFAULT true,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_days INTEGER,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela para configurações gerais da loja
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  checkout_upsell_enabled BOOLEAN DEFAULT true,
  urgency_timer_enabled BOOLEAN DEFAULT true,
  social_proof_enabled BOOLEAN DEFAULT true,
  trust_badges_enabled BOOLEAN DEFAULT true,
  quick_add_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id)
);

-- 5. Verificar se a coluna store_id existe na tabela profiles
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'store_id'
  ) THEN 
    ALTER TABLE profiles ADD COLUMN store_id UUID REFERENCES stores(id);
  END IF;
END $$;

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_store_order_bump_configs_store_id ON store_order_bump_configs(store_id);
CREATE INDEX IF NOT EXISTS idx_store_order_bump_configs_product_id ON store_order_bump_configs(product_id);
CREATE INDEX IF NOT EXISTS idx_store_payment_methods_store_id ON store_payment_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_store_shipping_methods_store_id ON store_shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_store_settings_store_id ON store_settings(store_id);

-- 7. Inserir configurações padrão para lojas existentes
INSERT INTO store_settings (store_id, checkout_upsell_enabled, urgency_timer_enabled, social_proof_enabled, trust_badges_enabled, quick_add_enabled) 
SELECT id, true, true, true, true, true 
FROM stores 
WHERE id NOT IN (SELECT store_id FROM store_settings);

-- 8. Inserir métodos padrão "A Combinar" para lojas existentes
INSERT INTO store_payment_methods (store_id, name, type, is_active, config) 
SELECT id, 'A Combinar', 'cash', true, '{"instructions": "Forma de pagamento será definida via WhatsApp"}' 
FROM stores 
WHERE id NOT IN (SELECT store_id FROM store_payment_methods WHERE name = 'A Combinar');

INSERT INTO store_shipping_methods (store_id, name, type, is_active, price, config) 
SELECT id, 'A Combinar', 'custom', true, 0, '{"custom_instructions": "Detalhes da entrega serão definidos via WhatsApp"}' 
FROM stores 
WHERE id NOT IN (SELECT store_id FROM store_shipping_methods WHERE name = 'A Combinar');

-- 9. Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Triggers para atualizar updated_at
CREATE TRIGGER update_store_order_bump_configs_updated_at 
  BEFORE UPDATE ON store_order_bump_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_payment_methods_updated_at 
  BEFORE UPDATE ON store_payment_methods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_shipping_methods_updated_at 
  BEFORE UPDATE ON store_shipping_methods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at 
  BEFORE UPDATE ON store_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Políticas RLS (Row Level Security)
ALTER TABLE store_order_bump_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Política para store_order_bump_configs
CREATE POLICY "Users can view order bump configs for their store" ON store_order_bump_configs
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order bump configs for their store" ON store_order_bump_configs
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update order bump configs for their store" ON store_order_bump_configs
  FOR UPDATE USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete order bump configs for their store" ON store_order_bump_configs
  FOR DELETE USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política para store_payment_methods
CREATE POLICY "Users can view payment methods for their store" ON store_payment_methods
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payment methods for their store" ON store_payment_methods
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update payment methods for their store" ON store_payment_methods
  FOR UPDATE USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payment methods for their store" ON store_payment_methods
  FOR DELETE USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política para store_shipping_methods
CREATE POLICY "Users can view shipping methods for their store" ON store_shipping_methods
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert shipping methods for their store" ON store_shipping_methods
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update shipping methods for their store" ON store_shipping_methods
  FOR UPDATE USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shipping methods for their store" ON store_shipping_methods
  FOR DELETE USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política para store_settings
CREATE POLICY "Users can view settings for their store" ON store_settings
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert settings for their store" ON store_settings
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update settings for their store" ON store_settings
  FOR UPDATE USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete settings for their store" ON store_settings
  FOR DELETE USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 12. Comentários das tabelas
COMMENT ON TABLE store_order_bump_configs IS 'Configurações de order bump para cada loja';
COMMENT ON TABLE store_payment_methods IS 'Métodos de pagamento configurados para cada loja';
COMMENT ON TABLE store_shipping_methods IS 'Métodos de entrega configurados para cada loja';
COMMENT ON TABLE store_settings IS 'Configurações gerais de checkout e funcionalidades para cada loja';

-- 13. Verificar se as tabelas foram criadas
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('store_order_bump_configs', 'store_payment_methods', 'store_shipping_methods', 'store_settings') 
ORDER BY table_name, ordinal_position;
