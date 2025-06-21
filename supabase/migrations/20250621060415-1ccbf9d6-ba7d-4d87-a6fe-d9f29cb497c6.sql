
-- Adicionar colunas de cores personalizadas na store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#0057FF',
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#FF6F00',
ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#8E2DE2',
ADD COLUMN IF NOT EXISTS background_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#1E293B',
ADD COLUMN IF NOT EXISTS border_color text DEFAULT '#E2E8F0';

-- Migrar registros com template_name 'default' para 'modern'
UPDATE public.store_settings 
SET template_name = 'modern' 
WHERE template_name = 'default' OR template_name IS NULL;

-- Atualizar configurações padrão baseadas no template existente
UPDATE public.store_settings 
SET 
  primary_color = CASE 
    WHEN template_name = 'modern' THEN '#0057FF'
    WHEN template_name = 'minimal' THEN '#1F2937'
    WHEN template_name = 'elegant' THEN '#D97706'
    WHEN template_name = 'industrial' THEN '#475569'
    ELSE '#0057FF'
  END,
  secondary_color = CASE 
    WHEN template_name = 'modern' THEN '#FF6F00'
    WHEN template_name = 'minimal' THEN '#059669'
    WHEN template_name = 'elegant' THEN '#92400E'
    WHEN template_name = 'industrial' THEN '#F59E0B'
    ELSE '#FF6F00'
  END,
  accent_color = CASE 
    WHEN template_name = 'modern' THEN '#8E2DE2'
    WHEN template_name = 'minimal' THEN '#DC2626'
    WHEN template_name = 'elegant' THEN '#7C2D12'
    WHEN template_name = 'industrial' THEN '#DC2626'
    ELSE '#8E2DE2'
  END,
  background_color = CASE 
    WHEN template_name = 'modern' THEN '#F8FAFC'
    WHEN template_name = 'minimal' THEN '#FFFFFF'
    WHEN template_name = 'elegant' THEN '#FFFBEB'
    WHEN template_name = 'industrial' THEN '#F1F5F9'
    ELSE '#F8FAFC'
  END,
  text_color = CASE 
    WHEN template_name = 'modern' THEN '#1E293B'
    WHEN template_name = 'minimal' THEN '#111827'
    WHEN template_name = 'elegant' THEN '#78350F'
    WHEN template_name = 'industrial' THEN '#334155'
    ELSE '#1E293B'
  END,
  border_color = CASE 
    WHEN template_name = 'modern' THEN '#E2E8F0'
    WHEN template_name = 'minimal' THEN '#E5E7EB'
    WHEN template_name = 'elegant' THEN '#FDE68A'
    WHEN template_name = 'industrial' THEN '#CBD5E1'
    ELSE '#E2E8F0'
  END
WHERE primary_color IS NULL OR secondary_color IS NULL;
