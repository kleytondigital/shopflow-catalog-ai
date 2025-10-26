-- ========================================
-- MIGRATION MÍNIMA: Grade Flexível
-- Use esta versão SE a migration completa ainda der erro
-- ========================================

-- 1. ADICIONAR COLUNAS (ESSENCIAL)
ALTER TABLE public.product_variations 
ADD COLUMN IF NOT EXISTS flexible_grade_config JSONB;

ALTER TABLE public.product_variations 
ADD COLUMN IF NOT EXISTS grade_sale_mode VARCHAR(20) DEFAULT 'full';

-- 2. ÍNDICES (OPCIONAL MAS RECOMENDADO)
CREATE INDEX IF NOT EXISTS idx_variations_grade_sale_mode 
ON public.product_variations(grade_sale_mode) 
WHERE is_grade = true;

CREATE INDEX IF NOT EXISTS idx_variations_flexible_config_gin 
ON public.product_variations USING GIN (flexible_grade_config) 
WHERE flexible_grade_config IS NOT NULL;

-- 3. COMENTÁRIOS
COMMENT ON COLUMN public.product_variations.flexible_grade_config IS 
'Configuração de grade flexível (JSONB)';

COMMENT ON COLUMN public.product_variations.grade_sale_mode IS 
'Modo de venda: full, half, custom';

-- 4. PERMISSÕES
GRANT SELECT ON public.product_variations TO authenticated;

-- PRONTO! Versão mínima executada com sucesso
SELECT 'Migration mínima OK - Colunas criadas!' AS status;

