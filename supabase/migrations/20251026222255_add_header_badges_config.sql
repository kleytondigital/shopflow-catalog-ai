-- Migration: Add Header Badges Configuration
-- Created: 2025-10-26 22:22:55
-- Description: Adiciona campos para configuração individual dos badges do header
-- EXECUTE ESTA MIGRATION VIA SUPABASE DASHBOARD

-- Adicionar campos de badges individuais
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS header_badge_fast_delivery boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS header_badge_fast_delivery_text text DEFAULT 'Entrega Rápida em 24h',
ADD COLUMN IF NOT EXISTS header_badge_free_shipping boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS header_badge_free_shipping_text text DEFAULT 'Frete Grátis',
ADD COLUMN IF NOT EXISTS header_free_shipping_threshold numeric DEFAULT 200.00,
ADD COLUMN IF NOT EXISTS header_badge_secure_checkout boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS header_badge_secure_checkout_text text DEFAULT 'Compra 100% Segura',
ADD COLUMN IF NOT EXISTS header_badge_custom_1 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS header_badge_custom_1_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS header_badge_custom_1_icon text DEFAULT 'star';

-- Comentários
COMMENT ON COLUMN store_settings.header_badge_fast_delivery IS 'Mostrar badge de entrega rápida no header';
COMMENT ON COLUMN store_settings.header_badge_fast_delivery_text IS 'Texto do badge de entrega rápida';
COMMENT ON COLUMN store_settings.header_badge_free_shipping IS 'Mostrar badge de frete grátis no header';
COMMENT ON COLUMN store_settings.header_badge_free_shipping_text IS 'Texto do badge de frete grátis';
COMMENT ON COLUMN store_settings.header_free_shipping_threshold IS 'Valor mínimo para frete grátis';
COMMENT ON COLUMN store_settings.header_badge_secure_checkout IS 'Mostrar badge de compra segura no header';
COMMENT ON COLUMN store_settings.header_badge_secure_checkout_text IS 'Texto do badge de compra segura';
COMMENT ON COLUMN store_settings.header_badge_custom_1 IS 'Mostrar badge customizado 1 no header';
COMMENT ON COLUMN store_settings.header_badge_custom_1_text IS 'Texto do badge customizado 1';
COMMENT ON COLUMN store_settings.header_badge_custom_1_icon IS 'Ícone do badge customizado 1 (lucide-react icon name)';

-- Atualizar registros existentes com valores padrão
UPDATE store_settings
SET 
  header_badge_fast_delivery = COALESCE(header_badge_fast_delivery, true),
  header_badge_fast_delivery_text = COALESCE(header_badge_fast_delivery_text, 'Entrega Rápida em 24h'),
  header_badge_free_shipping = COALESCE(header_badge_free_shipping, true),
  header_badge_free_shipping_text = COALESCE(header_badge_free_shipping_text, 'Frete Grátis'),
  header_free_shipping_threshold = COALESCE(header_free_shipping_threshold, 200.00),
  header_badge_secure_checkout = COALESCE(header_badge_secure_checkout, true),
  header_badge_secure_checkout_text = COALESCE(header_badge_secure_checkout_text, 'Compra 100% Segura'),
  header_badge_custom_1 = COALESCE(header_badge_custom_1, false),
  header_badge_custom_1_icon = COALESCE(header_badge_custom_1_icon, 'star')
WHERE header_badge_fast_delivery IS NULL 
   OR header_badge_free_shipping IS NULL 
   OR header_badge_secure_checkout IS NULL
   OR header_badge_custom_1 IS NULL;

