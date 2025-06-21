
-- Tabela para gerenciar banners do catálogo
CREATE TABLE public.catalog_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  banner_type TEXT NOT NULL DEFAULT 'hero', -- hero, category, sidebar, promotional
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.catalog_banners ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para banners
CREATE POLICY "Users can view banners from their store" 
  ON public.catalog_banners 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = catalog_banners.store_id
    )
  );

CREATE POLICY "Store admins can manage banners" 
  ON public.catalog_banners 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = catalog_banners.store_id
      AND profiles.role IN ('store_admin', 'superadmin')
    )
  );

-- Política para visualização pública dos banners ativos
CREATE POLICY "Public can view active banners" 
  ON public.catalog_banners 
  FOR SELECT 
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= now()) 
    AND (end_date IS NULL OR end_date >= now())
  );

-- Índices para performance
CREATE INDEX idx_catalog_banners_store_id ON public.catalog_banners(store_id);
CREATE INDEX idx_catalog_banners_active ON public.catalog_banners(is_active, store_id);
CREATE INDEX idx_catalog_banners_type ON public.catalog_banners(banner_type, store_id);
