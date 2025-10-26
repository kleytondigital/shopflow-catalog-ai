-- ========================================
-- MIGRATION SIMPLIFICADA: Grade Flexível
-- SEM validações restritivas
-- Use esta se continuar dando erro ao salvar
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

-- 3. REMOVER TRIGGERS E FUNÇÕES ANTIGAS (SE EXISTIREM)
DROP TRIGGER IF EXISTS validate_flexible_config_before_insert_update ON public.product_variations;
DROP FUNCTION IF EXISTS trg_validate_flexible_grade_config();
DROP FUNCTION IF EXISTS validate_flexible_grade_config(JSONB);

-- 4. COMENTÁRIOS
COMMENT ON COLUMN public.product_variations.flexible_grade_config IS 
'Configuração de grade flexível (JSONB) - Aceita qualquer estrutura válida';

COMMENT ON COLUMN public.product_variations.grade_sale_mode IS 
'Modo de venda: full, half, custom';

-- 5. PERMISSÕES
GRANT SELECT, INSERT, UPDATE ON public.product_variations TO authenticated;

-- PRONTO! Versão simplificada sem validações
SELECT 'Migration simplificada OK - Sem validações!' AS status;

