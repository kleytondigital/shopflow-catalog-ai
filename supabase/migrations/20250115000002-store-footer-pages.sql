-- Adicionar campos para páginas de informações do footer
-- Estas páginas serão editáveis pelo lojista

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS privacy_policy_content TEXT,
ADD COLUMN IF NOT EXISTS terms_of_use_content TEXT,
ADD COLUMN IF NOT EXISTS returns_policy_content TEXT,
ADD COLUMN IF NOT EXISTS delivery_policy_content TEXT,
ADD COLUMN IF NOT EXISTS about_us_content TEXT,
ADD COLUMN IF NOT EXISTS contact_address TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS business_hours_text TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS footer_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS footer_custom_text TEXT,
ADD COLUMN IF NOT EXISTS footer_copyright_text TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.store_settings.privacy_policy_content IS 'Conteúdo da política de privacidade da loja';
COMMENT ON COLUMN public.store_settings.terms_of_use_content IS 'Conteúdo dos termos de uso da loja';
COMMENT ON COLUMN public.store_settings.returns_policy_content IS 'Conteúdo da política de trocas e devoluções';
COMMENT ON COLUMN public.store_settings.delivery_policy_content IS 'Conteúdo da política de entrega';
COMMENT ON COLUMN public.store_settings.about_us_content IS 'Conteúdo da página sobre nós';
COMMENT ON COLUMN public.store_settings.contact_address IS 'Endereço para exibição no footer';
COMMENT ON COLUMN public.store_settings.contact_phone IS 'Telefone para exibição no footer';
COMMENT ON COLUMN public.store_settings.contact_email IS 'Email para exibição no footer';
COMMENT ON COLUMN public.store_settings.business_hours_text IS 'Texto personalizado do horário de funcionamento';
COMMENT ON COLUMN public.store_settings.linkedin_url IS 'URL do LinkedIn da loja';
COMMENT ON COLUMN public.store_settings.youtube_url IS 'URL do YouTube da loja';
COMMENT ON COLUMN public.store_settings.tiktok_url IS 'URL do TikTok da loja';
COMMENT ON COLUMN public.store_settings.footer_enabled IS 'Se o footer deve ser exibido';
COMMENT ON COLUMN public.store_settings.footer_custom_text IS 'Texto personalizado do footer';
COMMENT ON COLUMN public.store_settings.footer_copyright_text IS 'Texto de copyright personalizado'; 