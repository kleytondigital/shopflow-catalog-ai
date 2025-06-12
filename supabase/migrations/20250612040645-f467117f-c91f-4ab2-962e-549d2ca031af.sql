
-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, name)
);

-- Habilitar RLS para categorias
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias (usuários podem gerenciar categorias de sua loja)
CREATE POLICY "Users can view categories of their store" 
  ON public.categories 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = categories.store_id
    )
  );

CREATE POLICY "Users can create categories for their store" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = categories.store_id
    )
  );

CREATE POLICY "Users can update categories of their store" 
  ON public.categories 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = categories.store_id
    )
  );

CREATE POLICY "Users can delete categories of their store" 
  ON public.categories 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = categories.store_id
    )
  );

-- Adicionar configurações de catálogo na tabela store_settings
ALTER TABLE public.store_settings ADD COLUMN retail_catalog_active BOOLEAN DEFAULT true;
ALTER TABLE public.store_settings ADD COLUMN wholesale_catalog_active BOOLEAN DEFAULT false;

-- Trigger para updated_at nas categorias
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
