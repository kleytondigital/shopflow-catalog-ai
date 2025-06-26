
-- Adicionar campos para suportar variações hierárquicas
ALTER TABLE public.product_variations 
ADD COLUMN variation_group_id UUID,
ADD COLUMN parent_variation_id UUID REFERENCES public.product_variations(id) ON DELETE CASCADE,
ADD COLUMN variation_type TEXT DEFAULT 'simple',
ADD COLUMN display_order INTEGER DEFAULT 0,
ADD COLUMN variation_value TEXT;

-- Criar tabela para grupos de variação
CREATE TABLE public.variation_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  primary_attribute TEXT NOT NULL, -- 'color', 'size', 'material', etc
  secondary_attribute TEXT, -- 'size', 'material', etc (opcional)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.variation_groups ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para variation_groups (mesmas regras dos produtos)
CREATE POLICY "Users can view variation groups from their store" ON public.variation_groups
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = variation_groups.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can create variation groups for their products" ON public.variation_groups
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = variation_groups.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can update their variation groups" ON public.variation_groups
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = variation_groups.product_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Users can delete their variation groups" ON public.variation_groups
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.products p 
    JOIN public.profiles prof ON p.store_id = prof.store_id 
    WHERE p.id = variation_groups.product_id AND prof.id = auth.uid()
  ));

-- Trigger para updated_at
CREATE TRIGGER update_variation_groups_updated_at
  BEFORE UPDATE ON public.variation_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índices para performance
CREATE INDEX idx_variation_groups_product_id ON public.variation_groups(product_id);
CREATE INDEX idx_product_variations_group_id ON public.product_variations(variation_group_id);
CREATE INDEX idx_product_variations_parent_id ON public.product_variations(parent_variation_id);
