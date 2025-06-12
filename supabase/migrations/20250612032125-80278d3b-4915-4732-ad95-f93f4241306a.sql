
-- Criar tabela para variações de produtos
CREATE TABLE public.product_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  sku TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  price_adjustment NUMERIC DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, color, size)
);

-- Criar tabela para imagens de produtos
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES public.product_variations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 1,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (image_order BETWEEN 1 AND 3)
);

-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Política para permitir upload de imagens
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Política para permitir visualização pública das imagens
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir deleção de imagens pelos donos
CREATE POLICY "Users can delete their product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Adicionar campos SEO à tabela products
ALTER TABLE public.products 
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT,
ADD COLUMN keywords TEXT,
ADD COLUMN seo_slug TEXT;

-- Adicionar trigger para atualização automática de updated_at nas novas tabelas
CREATE TRIGGER update_product_variations_updated_at
  BEFORE UPDATE ON public.product_variations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para product_variations (mesmas regras dos produtos)
CREATE POLICY "Users can view variations from their store" ON public.product_variations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = product_variations.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can create variations for their products" ON public.product_variations
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = product_variations.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can update their product variations" ON public.product_variations
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = product_variations.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can delete their product variations" ON public.product_variations
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = product_variations.product_id AND prof.id = auth.uid()
  ));

-- Políticas RLS para product_images (mesmas regras dos produtos)
CREATE POLICY "Users can view images from their store" ON public.product_images
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = product_images.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can create images for their products" ON public.product_images
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = product_images.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can update their product images" ON public.product_images
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = product_images.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can delete their product images" ON public.product_images
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = product_images.product_id AND prof.id = auth.uid()
  ));
