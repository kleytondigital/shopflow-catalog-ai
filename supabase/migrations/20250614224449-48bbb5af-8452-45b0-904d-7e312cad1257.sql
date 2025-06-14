
-- Criar enum para tipos de planos
CREATE TYPE subscription_plan_type AS ENUM ('basic', 'premium', 'enterprise');

-- Criar enum para tipos de features
CREATE TYPE feature_type AS ENUM (
  'max_products', 'max_images_per_product', 'max_team_members', 
  'whatsapp_integration', 'payment_pix', 'payment_credit_card', 
  'custom_domain', 'api_access', 'ai_agent', 'discount_coupons',
  'abandoned_cart_recovery', 'multi_variations', 'shipping_calculator',
  'dedicated_support', 'team_management', 'pickup_points'
);

-- Criar enum para status de assinatura
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'canceled', 'past_due', 'trialing');

-- Tabela de planos disponíveis
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type subscription_plan_type NOT NULL UNIQUE,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  trial_days INTEGER DEFAULT 7,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de features dos planos
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_type feature_type NOT NULL,
  feature_value TEXT, -- JSON string para valores complexos ou texto simples
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de assinaturas das lojas
CREATE TABLE store_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'trialing',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  mercadopago_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de uso de features
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  feature_type feature_type NOT NULL,
  current_usage INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT DATE_TRUNC('month', NOW()),
  period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, feature_type, period_start)
);

-- Inserir planos padrão
INSERT INTO subscription_plans (name, type, description, price_monthly, price_yearly) VALUES
('Plano Básico', 'basic', 'Ideal para começar sua loja online', 19.90, 199.00),
('Plano Premium', 'premium', 'Para lojas que querem crescer e vender mais', 49.90, 499.00);

-- Inserir features do plano básico
INSERT INTO plan_features (plan_id, feature_type, feature_value, is_enabled) 
SELECT 
  (SELECT id FROM subscription_plans WHERE type = 'basic'),
  unnest(ARRAY[
    'max_images_per_product'::feature_type,
    'whatsapp_integration'::feature_type,
    'payment_pix'::feature_type
  ]),
  unnest(ARRAY['5', 'true', 'true']),
  true;

-- Inserir features do plano premium
INSERT INTO plan_features (plan_id, feature_type, feature_value, is_enabled) 
SELECT 
  (SELECT id FROM subscription_plans WHERE type = 'premium'),
  unnest(ARRAY[
    'max_images_per_product'::feature_type,
    'max_team_members'::feature_type,
    'whatsapp_integration'::feature_type,
    'payment_pix'::feature_type,
    'payment_credit_card'::feature_type,
    'custom_domain'::feature_type,
    'api_access'::feature_type,
    'ai_agent'::feature_type,
    'discount_coupons'::feature_type,
    'abandoned_cart_recovery'::feature_type,
    'multi_variations'::feature_type,
    'shipping_calculator'::feature_type,
    'dedicated_support'::feature_type,
    'team_management'::feature_type
  ]),
  unnest(ARRAY['10', '5', 'true', 'true', 'true', 'true', 'true', 'true', 'true', 'true', 'true', 'true', 'true', 'true']),
  true;

-- Triggers para updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_store_subscriptions_updated_at
  BEFORE UPDATE ON store_subscriptions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_feature_usage_updated_at
  BEFORE UPDATE ON feature_usage
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para verificar se uma loja tem acesso a uma feature
CREATE OR REPLACE FUNCTION has_feature_access(
  _store_id UUID, 
  _feature_type feature_type
) RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM store_subscriptions ss
    JOIN plan_features pf ON pf.plan_id = ss.plan_id
    WHERE ss.store_id = _store_id
      AND ss.status IN ('active', 'trialing')
      AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
      AND pf.feature_type = _feature_type
      AND pf.is_enabled = true
  );
$$;

-- Função para obter limite de uma feature
CREATE OR REPLACE FUNCTION get_feature_limit(
  _store_id UUID, 
  _feature_type feature_type
) RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT pf.feature_value
  FROM store_subscriptions ss
  JOIN plan_features pf ON pf.plan_id = ss.plan_id
  WHERE ss.store_id = _store_id
    AND ss.status IN ('active', 'trialing')
    AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
    AND pf.feature_type = _feature_type
    AND pf.is_enabled = true
  LIMIT 1;
$$;

-- Criar índices para performance
CREATE INDEX idx_store_subscriptions_store_id ON store_subscriptions(store_id);
CREATE INDEX idx_store_subscriptions_status ON store_subscriptions(status);
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_feature_type ON plan_features(feature_type);
CREATE INDEX idx_feature_usage_store_feature ON feature_usage(store_id, feature_type);

-- Migrar lojas existentes para plano básico com trial
INSERT INTO store_subscriptions (store_id, plan_id, status, trial_ends_at)
SELECT 
  s.id,
  (SELECT id FROM subscription_plans WHERE type = 'basic'),
  'trialing',
  NOW() + INTERVAL '7 days'
FROM stores s
WHERE NOT EXISTS (
  SELECT 1 FROM store_subscriptions ss WHERE ss.store_id = s.id
);
