-- Adicionar campos de configuração de grade aos valores de variação da loja
-- Migration: 20250115000009-add-grade-config-to-store-variation-values.sql

-- Adicionar campos para configuração de grade
ALTER TABLE public.store_variation_values 
ADD COLUMN IF NOT EXISTS grade_sizes JSONB,
ADD COLUMN IF NOT EXISTS grade_pairs JSONB,
ADD COLUMN IF NOT EXISTS grade_config JSONB;

-- Comentários para documentação
COMMENT ON COLUMN public.store_variation_values.grade_sizes IS 'Array de tamanhos da grade (ex: ["34", "35", "36"])';
COMMENT ON COLUMN public.store_variation_values.grade_pairs IS 'Objeto com pares por tamanho (ex: {"34": 1, "35": 2, "36": 3})';
COMMENT ON COLUMN public.store_variation_values.grade_config IS 'Configuração completa da grade (ex: {"name": "Alta", "sizes": ["35", "36", "37"], "pairs": {"35": 1, "36": 2, "37": 3}})';

-- Atualizar valores existentes de grade com configurações padrão
UPDATE public.store_variation_values 
SET 
  grade_sizes = CASE 
    WHEN value ILIKE '%alta%' THEN '["35", "36", "37", "38", "39", "40", "41", "42", "43"]'::jsonb
    WHEN value ILIKE '%baixa%' THEN '["33", "34", "35", "36", "37", "38", "39"]'::jsonb
    WHEN value ILIKE '%masculina%' THEN '["39", "40", "41", "42", "43", "44", "45", "46"]'::jsonb
    WHEN value ILIKE '%feminina%' THEN '["33", "34", "35", "36", "37", "38", "39", "40"]'::jsonb
    WHEN value ILIKE '%infantil%' THEN '["20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]'::jsonb
    ELSE NULL
  END,
  grade_pairs = CASE 
    WHEN value ILIKE '%alta%' THEN '{"35": 1, "36": 2, "37": 3, "38": 3, "39": 3, "40": 3, "41": 3, "42": 2, "43": 1}'::jsonb
    WHEN value ILIKE '%baixa%' THEN '{"33": 1, "34": 2, "35": 3, "36": 3, "37": 3, "38": 2, "39": 1}'::jsonb
    WHEN value ILIKE '%masculina%' THEN '{"39": 1, "40": 2, "41": 3, "42": 3, "43": 3, "44": 2, "45": 1, "46": 1}'::jsonb
    WHEN value ILIKE '%feminina%' THEN '{"33": 1, "34": 2, "35": 3, "36": 3, "37": 3, "38": 3, "39": 2, "40": 1}'::jsonb
    WHEN value ILIKE '%infantil%' THEN '{"20": 1, "21": 1, "22": 2, "23": 2, "24": 2, "25": 2, "26": 2, "27": 2, "28": 2, "29": 1, "30": 1}'::jsonb
    ELSE NULL
  END,
  grade_config = CASE 
    WHEN value ILIKE '%alta%' THEN '{"name": "Alta", "description": "Grade com tamanhos maiores", "type": "adult"}'::jsonb
    WHEN value ILIKE '%baixa%' THEN '{"name": "Baixa", "description": "Grade com tamanhos menores", "type": "adult"}'::jsonb
    WHEN value ILIKE '%masculina%' THEN '{"name": "Masculina", "description": "Grade para calçados masculinos", "type": "male"}'::jsonb
    WHEN value ILIKE '%feminina%' THEN '{"name": "Feminina", "description": "Grade para calçados femininos", "type": "female"}'::jsonb
    WHEN value ILIKE '%infantil%' THEN '{"name": "Infantil", "description": "Grade para calçados infantis", "type": "child"}'::jsonb
    ELSE NULL
  END
WHERE EXISTS (
  SELECT 1 FROM public.store_variation_groups sg 
  WHERE sg.id = store_variation_values.group_id 
  AND sg.attribute_key = 'grade'
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_store_variation_values_grade_sizes ON public.store_variation_values USING GIN (grade_sizes);
CREATE INDEX IF NOT EXISTS idx_store_variation_values_grade_pairs ON public.store_variation_values USING GIN (grade_pairs);
CREATE INDEX IF NOT EXISTS idx_store_variation_values_grade_config ON public.store_variation_values USING GIN (grade_config); 