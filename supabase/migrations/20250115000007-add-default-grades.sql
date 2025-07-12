-- Migration para adicionar grades padrão ao sistema de variações
-- Grades: Baixa Infantil, Baixa Feminino, Baixa Masculino, Alta Feminino, Alta Masculino

-- 1. Adicionar grupo de variação "grade" se não existir
INSERT INTO public.variation_master_groups (id, name, description, attribute_key, display_order, is_active)
VALUES 
  (gen_random_uuid(), 'Grade', 'Grades de calçados (Baixa, Alta)', 'grade', 5, true)
ON CONFLICT (attribute_key) DO NOTHING;

-- 2. Adicionar valores de grade padrão
INSERT INTO public.variation_master_values (id, group_id, value, display_order)
SELECT 
  gen_random_uuid(),
  mg.id,
  mv.value,
  mv.display_order
FROM public.variation_master_groups mg
CROSS JOIN (
  VALUES 
    ('Baixa Infantil', 1),
    ('Baixa Feminino', 2),
    ('Baixa Masculino', 3),
    ('Alta Feminino', 4),
    ('Alta Masculino', 5)
) AS mv(value, display_order)
WHERE mg.attribute_key = 'grade'
ON CONFLICT (group_id, value) DO NOTHING;

-- 3. Função para inicializar grades em lojas existentes
CREATE OR REPLACE FUNCTION public.initialize_store_grades(_store_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar grupo de grade para a loja se não existir
  INSERT INTO public.store_variation_groups (store_id, master_group_id, name, description, attribute_key, display_order)
  SELECT 
    _store_id,
    mg.id,
    mg.name,
    mg.description,
    mg.attribute_key,
    mg.display_order
  FROM public.variation_master_groups mg
  WHERE mg.attribute_key = 'grade'
  ON CONFLICT (store_id, attribute_key) DO NOTHING;

  -- Criar valores de grade para a loja
  INSERT INTO public.store_variation_values (store_id, group_id, master_value_id, value, display_order)
  SELECT 
    _store_id,
    sg.id,
    mv.id,
    mv.value,
    mv.display_order
  FROM public.variation_master_values mv
  JOIN public.store_variation_groups sg ON sg.store_id = _store_id AND sg.attribute_key = 'grade'
  JOIN public.variation_master_groups mg ON mg.id = mv.group_id AND mg.attribute_key = 'grade'
  ON CONFLICT (store_id, group_id, value) DO NOTHING;
END;
$$;

-- 4. Executar para todas as lojas existentes
DO $$
DECLARE
  store_record RECORD;
BEGIN
  FOR store_record IN SELECT id FROM public.stores WHERE is_active = true
  LOOP
    PERFORM public.initialize_store_grades(store_record.id);
  END LOOP;
END;
$$;

-- 5. Atualizar função de inicialização automática para incluir grades
CREATE OR REPLACE FUNCTION public.auto_initialize_store_variations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inicializar variações padrão
  PERFORM public.initialize_store_variations(NEW.id);
  
  -- Inicializar grades
  PERFORM public.initialize_store_grades(NEW.id);
  
  RETURN NEW;
END;
$$; 