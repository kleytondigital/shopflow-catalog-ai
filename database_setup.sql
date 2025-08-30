-- Script SQL para criar as tabelas necessárias no Supabase (PostgreSQL)
-- Execute este script no Supabase SQL Editor

-- Primeiro, criamos os ENUMs necessários
DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('pix', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'crypto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipping_method_type AS ENUM ('pickup', 'delivery', 'correios', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_hours_display AS ENUM ('summary', 'detailed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Tabela para métodos de pagamento
CREATE TABLE IF NOT EXISTS store_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type payment_method_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela para métodos de entrega
CREATE TABLE IF NOT EXISTS store_shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type shipping_method_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    price DECIMAL(10,2) DEFAULT 0.00,
    estimated_days INTEGER DEFAULT 1,
    config JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela para configurações de order bump
CREATE TABLE IF NOT EXISTS store_order_bump_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    product_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    urgency_text TEXT DEFAULT NULL,
    social_proof_text TEXT DEFAULT NULL,
    is_limited_time BOOLEAN DEFAULT FALSE,
    limited_quantity INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_store_id ON store_payment_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON store_payment_methods(is_active);

CREATE INDEX IF NOT EXISTS idx_shipping_methods_store_id ON store_shipping_methods(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_is_active ON store_shipping_methods(is_active);

CREATE INDEX IF NOT EXISTS idx_order_bump_configs_store_id ON store_order_bump_configs(store_id);
CREATE INDEX IF NOT EXISTS idx_order_bump_configs_product_id ON store_order_bump_configs(product_id);
CREATE INDEX IF NOT EXISTS idx_order_bump_configs_is_active ON store_order_bump_configs(is_active);

-- 5. Criar constraint única para evitar order bumps duplicados
DO $$ BEGIN
    ALTER TABLE store_order_bump_configs 
    ADD CONSTRAINT unique_store_product UNIQUE (store_id, product_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Adicionar colunas à tabela store_settings (se não existirem)
DO $$ BEGIN
    ALTER TABLE store_settings 
    ADD COLUMN checkout_upsell_enabled BOOLEAN DEFAULT TRUE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE store_settings 
    ADD COLUMN urgency_timer_enabled BOOLEAN DEFAULT TRUE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE store_settings 
    ADD COLUMN social_proof_enabled BOOLEAN DEFAULT TRUE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE store_settings 
    ADD COLUMN trust_badges_enabled BOOLEAN DEFAULT TRUE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE store_settings 
    ADD COLUMN quick_add_enabled BOOLEAN DEFAULT TRUE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE store_settings 
    ADD COLUMN business_hours_display_type business_hours_display DEFAULT 'summary';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 7. Criar triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_store_payment_methods_updated_at ON store_payment_methods;
CREATE TRIGGER update_store_payment_methods_updated_at
    BEFORE UPDATE ON store_payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_shipping_methods_updated_at ON store_shipping_methods;
CREATE TRIGGER update_store_shipping_methods_updated_at
    BEFORE UPDATE ON store_shipping_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_order_bump_configs_updated_at ON store_order_bump_configs;
CREATE TRIGGER update_store_order_bump_configs_updated_at
    BEFORE UPDATE ON store_order_bump_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Habilitar RLS (Row Level Security) se necessário
-- ALTER TABLE store_payment_methods ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE store_shipping_methods ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE store_order_bump_configs ENABLE ROW LEVEL SECURITY;

-- 9. Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso no Supabase!' as status;

-- Para verificar as tabelas criadas no Supabase:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'store_%';

-- Para verificar a estrutura das tabelas:
-- \d store_payment_methods;
-- \d store_shipping_methods;
-- \d store_order_bump_configs;
