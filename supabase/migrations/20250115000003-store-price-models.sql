-- Migration: Sistema de Modelos de Preço Configuráveis por Loja
-- Data: 2025-01-15

-- 1. Configuração do modelo de preço por loja
CREATE TABLE store_price_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  
  -- Modelo escolhido pela loja
  price_model VARCHAR(50) NOT NULL DEFAULT 'retail_only', -- 'retail_only', 'simple_wholesale', 'gradual_wholesale'
  
  -- Configurações para atacado simples
  simple_wholesale_enabled BOOLEAN DEFAULT false,
  simple_wholesale_name VARCHAR(50) DEFAULT 'Atacado',
  simple_wholesale_min_qty INTEGER DEFAULT 10,
  
  -- Configurações para atacado gradativo
  gradual_wholesale_enabled BOOLEAN DEFAULT false,
  gradual_tiers_count INTEGER DEFAULT 2, -- 2, 3 ou 4 níveis
  
  -- Nomes dos níveis (configuráveis)
  tier_1_name VARCHAR(50) DEFAULT 'Varejo',
  tier_2_name VARCHAR(50) DEFAULT 'Atacarejo',
  tier_3_name VARCHAR(50) DEFAULT 'Atacado Pequeno',
  tier_4_name VARCHAR(50) DEFAULT 'Atacado Grande',
  
  -- Ativar/desativar níveis específicos
  tier_1_enabled BOOLEAN DEFAULT true,
  tier_2_enabled BOOLEAN DEFAULT false,
  tier_3_enabled BOOLEAN DEFAULT false,
  tier_4_enabled BOOLEAN DEFAULT false,
  
  -- Configurações de exibição
  show_price_tiers BOOLEAN DEFAULT true,
  show_savings_indicators BOOLEAN DEFAULT true,
  show_next_tier_hint BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Níveis de preço por produto
CREATE TABLE product_price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Identificação do nível
  tier_name VARCHAR(50) NOT NULL,
  tier_order INTEGER NOT NULL, -- 1, 2, 3, 4
  tier_type VARCHAR(50) NOT NULL, -- 'retail', 'simple_wholesale', 'gradual_wholesale'
  
  -- Configurações de preço
  price DECIMAL(10,2) NOT NULL,
  min_quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_tier_order CHECK (tier_order >= 1 AND tier_order <= 4),
  CONSTRAINT valid_min_quantity CHECK (min_quantity >= 1),
  CONSTRAINT unique_product_tier UNIQUE (product_id, tier_order)
);

-- 3. Índices para performance
CREATE INDEX idx_store_price_models_store_id ON store_price_models(store_id);
CREATE INDEX idx_product_price_tiers_product_id ON product_price_tiers(product_id);
CREATE INDEX idx_product_price_tiers_active ON product_price_tiers(product_id, is_active) WHERE is_active = true;

-- 4. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Triggers para updated_at
CREATE TRIGGER update_store_price_models_updated_at 
    BEFORE UPDATE ON store_price_models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_price_tiers_updated_at 
    BEFORE UPDATE ON product_price_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS Policies
ALTER TABLE store_price_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_tiers ENABLE ROW LEVEL SECURITY;

-- Políticas para store_price_models
CREATE POLICY "Store admins can manage their price models" ON store_price_models
    FOR ALL USING (store_id IN (
        SELECT store_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Public can read price models" ON store_price_models
    FOR SELECT USING (true);

-- Políticas para product_price_tiers
CREATE POLICY "Store admins can manage their product price tiers" ON product_price_tiers
    FOR ALL USING (product_id IN (
        SELECT p.id FROM products p 
        JOIN profiles pr ON p.store_id = pr.store_id 
        WHERE pr.id = auth.uid()
    ));

CREATE POLICY "Public can read product price tiers" ON product_price_tiers
    FOR SELECT USING (true);

-- 7. Comentários para documentação
COMMENT ON TABLE store_price_models IS 'Configuração do modelo de preço por loja (varejo, atacado simples, atacado gradativo)';
COMMENT ON TABLE product_price_tiers IS 'Níveis de preço configurados por produto';
COMMENT ON COLUMN store_price_models.price_model IS 'Modelo de preço: retail_only, simple_wholesale, gradual_wholesale';
COMMENT ON COLUMN store_price_models.gradual_tiers_count IS 'Número de níveis no atacado gradativo (2, 3 ou 4)';
COMMENT ON COLUMN product_price_tiers.tier_type IS 'Tipo do nível: retail, simple_wholesale, gradual_wholesale';

-- 8. Função para criar modelo de preço padrão
CREATE OR REPLACE FUNCTION create_store_price_model(
  p_store_id UUID,
  p_price_model VARCHAR(50) DEFAULT 'wholesale_only'
)
RETURNS JSON AS $$
DECLARE
  new_model_id UUID;
  result JSON;
BEGIN
  -- Verificar se já existe um modelo para esta loja
  IF EXISTS (SELECT 1 FROM store_price_models WHERE store_id = p_store_id) THEN
    RETURN json_build_object('message', 'Modelo já existe para esta loja');
  END IF;

  -- Inserir novo modelo
  INSERT INTO store_price_models (
    store_id,
    price_model,
    tier_1_enabled,
    tier_1_name,
    tier_2_enabled,
    tier_2_name,
    tier_3_enabled,
    tier_3_name,
    tier_4_enabled,
    tier_4_name,
    simple_wholesale_enabled,
    simple_wholesale_name,
    simple_wholesale_min_qty,
    gradual_wholesale_enabled,
    gradual_tiers_count,
    show_price_tiers,
    show_savings_indicators,
    show_next_tier_hint
  ) VALUES (
    p_store_id,
    p_price_model,
    true,
    CASE WHEN p_price_model = 'wholesale_only' THEN 'Atacado' ELSE 'Varejo' END,
    false,
    'Atacarejo',
    false,
    'Atacado Pequeno',
    false,
    'Atacado Grande',
    false,
    'Atacado',
    1,
    false,
    2,
    true,
    true,
    true
  ) RETURNING id INTO new_model_id;

  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'id', new_model_id,
    'store_id', p_store_id,
    'price_model', p_price_model
  ) INTO result;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 