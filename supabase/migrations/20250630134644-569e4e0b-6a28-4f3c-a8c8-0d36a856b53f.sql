
-- Criar tabela para grupos mestres de variações (ex: Cor, Tamanho, Material)
CREATE TABLE public.variation_master_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  attribute_key TEXT NOT NULL, -- 'color', 'size', 'material', etc
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attribute_key)
);

-- Criar tabela para valores mestres de variações (ex: Preto, Branco, 36, 37)
CREATE TABLE public.variation_master_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.variation_master_groups(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  hex_color TEXT, -- Para cores
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, value)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.variation_master_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_master_values ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para variation_master_groups (todos podem ver, apenas superadmins podem modificar)
CREATE POLICY "Everyone can view variation master groups" ON public.variation_master_groups
  FOR SELECT USING (true);

CREATE POLICY "Only superadmins can create variation master groups" ON public.variation_master_groups
  FOR INSERT WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can update variation master groups" ON public.variation_master_groups
  FOR UPDATE USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can delete variation master groups" ON public.variation_master_groups
  FOR DELETE USING (public.is_superadmin(auth.uid()));

-- Políticas RLS para variation_master_values (todos podem ver, apenas superadmins podem modificar)
CREATE POLICY "Everyone can view variation master values" ON public.variation_master_values
  FOR SELECT USING (true);

CREATE POLICY "Only superadmins can create variation master values" ON public.variation_master_values
  FOR INSERT WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can update variation master values" ON public.variation_master_values
  FOR UPDATE USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can delete variation master values" ON public.variation_master_values
  FOR DELETE USING (public.is_superadmin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_variation_master_groups_updated_at
  BEFORE UPDATE ON public.variation_master_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variation_master_values_updated_at
  BEFORE UPDATE ON public.variation_master_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_variation_master_groups_attribute_key ON public.variation_master_groups(attribute_key);
CREATE INDEX idx_variation_master_groups_active ON public.variation_master_groups(is_active);
CREATE INDEX idx_variation_master_values_group_id ON public.variation_master_values(group_id);
CREATE INDEX idx_variation_master_values_active ON public.variation_master_values(is_active);

-- Inserir alguns grupos padrão
INSERT INTO public.variation_master_groups (name, description, attribute_key, display_order) VALUES
('Cor', 'Variações de cores do produto', 'color', 1),
('Tamanho', 'Variações de tamanhos do produto', 'size', 2),
('Material', 'Variações de material do produto', 'material', 3),
('Estilo', 'Variações de estilo do produto', 'style', 4);

-- Inserir alguns valores padrão para Cor
INSERT INTO public.variation_master_values (group_id, value, hex_color, display_order) 
SELECT g.id, v.value, v.hex_color, v.display_order
FROM public.variation_master_groups g
CROSS JOIN (VALUES 
  ('Preto', '#000000', 1),
  ('Branco', '#FFFFFF', 2),
  ('Vermelho', '#FF0000', 3),
  ('Azul', '#0000FF', 4),
  ('Verde', '#008000', 5),
  ('Amarelo', '#FFFF00', 6),
  ('Rosa', '#FFC0CB', 7),
  ('Roxo', '#800080', 8),
  ('Cinza', '#808080', 9),
  ('Marrom', '#A52A2A', 10)
) AS v(value, hex_color, display_order)
WHERE g.attribute_key = 'color';

-- Inserir alguns valores padrão para Tamanho
INSERT INTO public.variation_master_values (group_id, value, display_order) 
SELECT g.id, v.value, v.display_order
FROM public.variation_master_groups g
CROSS JOIN (VALUES 
  ('PP', 1),
  ('P', 2),
  ('M', 3),
  ('G', 4),
  ('GG', 5),
  ('XG', 6),
  ('34', 10),
  ('35', 11),
  ('36', 12),
  ('37', 13),
  ('38', 14),
  ('39', 15),
  ('40', 16),
  ('41', 17),
  ('42', 18),
  ('43', 19),
  ('44', 20)
) AS v(value, display_order)
WHERE g.attribute_key = 'size';
