
-- Adicionar novos campos à tabela catalog_banners
ALTER TABLE public.catalog_banners 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id),
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual';

-- Adicionar constraint para validar source_type
ALTER TABLE public.catalog_banners 
ADD CONSTRAINT check_source_type 
CHECK (source_type IN ('manual', 'product'));

-- Criar bucket para banners se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket banners
CREATE POLICY "Public can view banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banners" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'banners' AND
    (storage.foldername(name))[1] IN (
      SELECT store_id::text FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their banners" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'banners' AND
    (storage.foldername(name))[1] IN (
      SELECT store_id::text FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their banners" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'banners' AND
    (storage.foldername(name))[1] IN (
      SELECT store_id::text FROM profiles WHERE id = auth.uid()
    )
  );

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_catalog_banners_product_id ON public.catalog_banners(product_id);
CREATE INDEX IF NOT EXISTS idx_catalog_banners_source_type ON public.catalog_banners(source_type, store_id);
