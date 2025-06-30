-- Migration para implementar variações em dois níveis: Globais e por Loja
-- 
-- Sistema atual: variation_master_groups/values (globais)
-- Sistema novo: store_variation_groups/values (específicas da loja)

-- 1. Criar tabela para grupos de variação específicos da loja
CREATE TABLE public.store_variation_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  master_group_id UUID REFERENCES public.variation_master_groups(id) ON DELETE SET NULL, -- Referência ao grupo global (opcional)
  name TEXT NOT NULL,
  description TEXT,
  attribute_key TEXT NOT NULL, -- 'color', 'size', 'material', etc
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, attribute_key) -- Única por loja
);

-- 2. Criar tabela para valores de variação específicos da loja
CREATE TABLE public.store_variation_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.store_variation_groups(id) ON DELETE CASCADE,
  master_value_id UUID REFERENCES public.variation_master_values(id) ON DELETE SET NULL, -- Referência ao valor global (opcional)
  value TEXT NOT NULL,
  hex_color TEXT, -- Para cores
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, group_id, value) -- Único por loja e grupo
);

-- 3. Habilitar RLS nas novas tabelas
ALTER TABLE public.store_variation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_variation_values ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para store_variation_groups
-- Todos podem ver grupos da sua loja
CREATE POLICY "Users can view store variation groups from their store" ON public.store_variation_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND store_id = store_variation_groups.store_id
    )
  );

-- Store admins podem criar grupos para sua loja
CREATE POLICY "Store admins can create variation groups" ON public.store_variation_groups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND store_id = store_variation_groups.store_id
      AND role IN ('store_admin', 'superadmin')
      AND is_active = true
    )
  );

-- Store admins podem atualizar grupos da sua loja
CREATE POLICY "Store admins can update their variation groups" ON public.store_variation_groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND store_id = store_variation_groups.store_id
      AND role IN ('store_admin', 'superadmin')
      AND is_active = true
    )
  );

-- Store admins podem deletar grupos da sua loja
CREATE POLICY "Store admins can delete their variation groups" ON public.store_variation_groups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND store_id = store_variation_groups.store_id
      AND role IN ('store_admin', 'superadmin')
      AND is_active = true
    )
  );

-- 5. Políticas RLS para store_variation_values
-- Todos podem ver valores da sua loja
CREATE POLICY "Users can view store variation values from their store" ON public.store_variation_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND store_id = store_variation_values.store_id
    )
  );

-- Store admins podem criar valores para sua loja
CREATE POLICY "Store admins can create variation values" ON public.store_variation_values
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND store_id = store_variation_values.store_id
      AND role IN ('store_admin', 'superadmin')
      AND is_active = true
    )
  );

-- Store admins podem atualizar valores da sua loja
CREATE POLICY "Store admins can update their variation values" ON public.store_variation_values
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND store_id = store_variation_values.store_id
      AND role IN ('store_admin', 'superadmin')
      AND is_active = true
    )
  );

-- Store admins podem deletar valores da sua loja
CREATE POLICY "Store admins can delete their variation values" ON public.store_variation_values
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND store_id = store_variation_values.store_id
      AND role IN ('store_admin', 'superadmin')
      AND is_active = true
    )
  );

-- 6. Políticas públicas para catalogs (permitir visualização pública)
CREATE POLICY "Public can view store variation groups from active stores" ON public.store_variation_groups
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = store_variation_groups.store_id 
      AND is_active = true
    )
  );

CREATE POLICY "Public can view store variation values from active stores" ON public.store_variation_values
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = store_variation_values.store_id 
      AND is_active = true
    )
  );

-- 7. Triggers para updated_at
CREATE TRIGGER update_store_variation_groups_updated_at
  BEFORE UPDATE ON public.store_variation_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_variation_values_updated_at
  BEFORE UPDATE ON public.store_variation_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Índices para performance
CREATE INDEX idx_store_variation_groups_store_id ON public.store_variation_groups(store_id);
CREATE INDEX idx_store_variation_groups_attribute_key ON public.store_variation_groups(store_id, attribute_key);
CREATE INDEX idx_store_variation_groups_active ON public.store_variation_groups(store_id, is_active);

CREATE INDEX idx_store_variation_values_store_id ON public.store_variation_values(store_id);
CREATE INDEX idx_store_variation_values_group_id ON public.store_variation_values(group_id);
CREATE INDEX idx_store_variation_values_active ON public.store_variation_values(store_id, is_active);

-- 9. Função para inicializar variações da loja com valores globais
CREATE OR REPLACE FUNCTION public.initialize_store_variations(_store_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar grupos da loja baseados nos grupos globais
  INSERT INTO public.store_variation_groups (store_id, master_group_id, name, description, attribute_key, display_order)
  SELECT 
    _store_id,
    mg.id,
    mg.name,
    mg.description,
    mg.attribute_key,
    mg.display_order
  FROM public.variation_master_groups mg
  WHERE mg.is_active = true
  ON CONFLICT (store_id, attribute_key) DO NOTHING;

  -- Criar valores da loja baseados nos valores globais
  INSERT INTO public.store_variation_values (store_id, group_id, master_value_id, value, hex_color, display_order)
  SELECT 
    _store_id,
    sg.id,
    mv.id,
    mv.value,
    mv.hex_color,
    mv.display_order
  FROM public.variation_master_values mv
  JOIN public.variation_master_groups mg ON mg.id = mv.group_id
  JOIN public.store_variation_groups sg ON sg.master_group_id = mg.id AND sg.store_id = _store_id
  WHERE mv.is_active = true AND mg.is_active = true
  ON CONFLICT (store_id, group_id, value) DO NOTHING;
END;
$$;

-- 10. Trigger para inicializar variações automaticamente quando uma loja é criada
CREATE OR REPLACE FUNCTION public.auto_initialize_store_variations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inicializar variações apenas para lojas ativas
  IF NEW.is_active = true THEN
    PERFORM public.initialize_store_variations(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_initialize_store_variations
  AFTER INSERT ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_initialize_store_variations();

-- 11. Comentários para documentação
COMMENT ON TABLE public.store_variation_groups 
IS 'Grupos de variação específicos por loja. Cada loja herda os grupos globais e pode adicionar seus próprios.';

COMMENT ON TABLE public.store_variation_values 
IS 'Valores de variação específicos por loja. Cada loja herda os valores globais e pode adicionar seus próprios.';

COMMENT ON FUNCTION public.initialize_store_variations(UUID) 
IS 'Inicializa as variações de uma loja copiando os grupos e valores globais como base.';

-- 12. Inicializar variações para lojas existentes
DO $$
DECLARE
  store_record RECORD;
BEGIN
  FOR store_record IN 
    SELECT id FROM public.stores WHERE is_active = true
  LOOP
    PERFORM public.initialize_store_variations(store_record.id);
  END LOOP;
END $$; 