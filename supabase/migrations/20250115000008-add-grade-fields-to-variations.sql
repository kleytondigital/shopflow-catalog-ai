-- Migration: Adicionar campos para suportar variações de grade na tabela product_variations
-- Data: 2025-01-15

-- Adicionar campos para variações de grade
ALTER TABLE public.product_variations 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS is_grade BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS grade_name TEXT,
ADD COLUMN IF NOT EXISTS grade_color TEXT,
ADD COLUMN IF NOT EXISTS grade_quantity INTEGER,
ADD COLUMN IF NOT EXISTS grade_sizes JSONB,
ADD COLUMN IF NOT EXISTS grade_pairs JSONB;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.product_variations.name IS 'Nome da variação (ex: "Preto - Baixa")';
COMMENT ON COLUMN public.product_variations.is_grade IS 'Indica se é uma variação de grade';
COMMENT ON COLUMN public.product_variations.grade_name IS 'Nome da grade (ex: "Baixa", "Alta")';
COMMENT ON COLUMN public.product_variations.grade_color IS 'Cor da grade';
COMMENT ON COLUMN public.product_variations.grade_quantity IS 'Quantidade de grades';
COMMENT ON COLUMN public.product_variations.grade_sizes IS 'Array de tamanhos da grade (ex: ["34", "35", "36"])';
COMMENT ON COLUMN public.product_variations.grade_pairs IS 'Array de pares por tamanho (ex: [1, 2, 3])';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_product_variations_is_grade ON public.product_variations(is_grade);
CREATE INDEX IF NOT EXISTS idx_product_variations_grade_name ON public.product_variations(grade_name);
CREATE INDEX IF NOT EXISTS idx_product_variations_variation_type ON public.product_variations(variation_type);

-- Atualizar a constraint UNIQUE para incluir o campo name
-- Primeiro remover a constraint existente
ALTER TABLE public.product_variations DROP CONSTRAINT IF EXISTS product_variations_product_id_color_size_key;

-- Adicionar nova constraint que inclui o name
ALTER TABLE public.product_variations 
ADD CONSTRAINT product_variations_product_id_name_key 
UNIQUE(product_id, name);

-- Adicionar constraint para variações de grade
ALTER TABLE public.product_variations 
ADD CONSTRAINT product_variations_grade_unique 
UNIQUE(product_id, grade_name, grade_color); 