-- ============================================================================
-- EXECUTE ESTE SQL NO SUPABASE DASHBOARD
-- ============================================================================
-- Como executar:
-- 1. Acesse seu projeto no Supabase Dashboard
-- 2. Vá em "SQL Editor" no menu lateral
-- 3. Cole este código completo
-- 4. Clique em "Run" ou pressione Ctrl+Enter
-- ============================================================================

-- Adicionar campos de badges individuais do header
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

-- Adicionar campos de estilos de aparência
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'modern' CHECK (button_style IN ('flat', 'modern', 'rounded')),
ADD COLUMN IF NOT EXISTS footer_style text DEFAULT 'dark' CHECK (footer_style IN ('dark', 'light', 'gradient')),
ADD COLUMN IF NOT EXISTS footer_bg_color text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS footer_text_color text DEFAULT NULL;

-- Adicionar campos de cores inteligentes
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS logo_color_palette jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS auto_extract_colors boolean DEFAULT false;

-- Atualizar registros existentes
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
  header_badge_custom_1_icon = COALESCE(header_badge_custom_1_icon, 'star'),
  button_style = COALESCE(button_style, 'modern'),
  footer_style = COALESCE(footer_style, 'dark'),
  auto_extract_colors = COALESCE(auto_extract_colors, false)
WHERE header_badge_fast_delivery IS NULL 
   OR button_style IS NULL 
   OR footer_style IS NULL
   OR auto_extract_colors IS NULL;

-- Verificar se funcionou
SELECT 
  id,
  store_id,
  header_badge_fast_delivery,
  header_badge_free_shipping,
  header_badge_secure_checkout,
  button_style,
  footer_style
FROM store_settings
LIMIT 5;

-- ============================================================================
-- Se aparecer uma tabela com os campos acima, está tudo certo! ✅
-- Agora volte para o admin e clique em Salvar novamente.
-- ============================================================================

