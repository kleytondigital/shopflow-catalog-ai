-- Migration: Adicionar campos de grade na tabela variation_master_values (globais)
-- Data: 2025-07-01

ALTER TABLE public.variation_master_values 
ADD COLUMN IF NOT EXISTS grade_sizes JSONB,
ADD COLUMN IF NOT EXISTS grade_pairs JSONB;

COMMENT ON COLUMN public.variation_master_values.grade_sizes IS 'Array de tamanhos da grade (ex: ["34", "35", "36"])';
COMMENT ON COLUMN public.variation_master_values.grade_pairs IS 'Objeto com pares por tamanho (ex: {"34": 1, "35": 2, "36": 3})';

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_variation_master_values_grade_sizes ON public.variation_master_values USING GIN (grade_sizes);
CREATE INDEX IF NOT EXISTS idx_variation_master_values_grade_pairs ON public.variation_master_values USING GIN (grade_pairs); 