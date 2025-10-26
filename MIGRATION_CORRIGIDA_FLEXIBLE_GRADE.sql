-- ========================================
-- MIGRATION: Sistema de Grade Flexível (CORRIGIDA)
-- Data: 2025-10-24
-- ========================================

-- 1. ADICIONAR CAMPOS À TABELA
-- ========================================

-- Adicionar campo JSONB para configuração de grade flexível
ALTER TABLE public.product_variations 
ADD COLUMN IF NOT EXISTS flexible_grade_config JSONB;

-- Adicionar campo para modo de venda ativo
ALTER TABLE public.product_variations 
ADD COLUMN IF NOT EXISTS grade_sale_mode VARCHAR(20) DEFAULT 'full';

-- ========================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice para consultas por modo de venda
CREATE INDEX IF NOT EXISTS idx_variations_grade_sale_mode 
ON public.product_variations(grade_sale_mode) 
WHERE is_grade = true;

-- Índice GIN para consultas no JSONB de configuração
CREATE INDEX IF NOT EXISTS idx_variations_flexible_config_gin 
ON public.product_variations USING GIN (flexible_grade_config) 
WHERE flexible_grade_config IS NOT NULL;

-- ========================================
-- 3. CONSTRAINTS E VALIDAÇÕES
-- ========================================

-- Validar valores do grade_sale_mode
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_grade_sale_mode' 
        AND conrelid = 'public.product_variations'::regclass
    ) THEN
        ALTER TABLE public.product_variations 
        ADD CONSTRAINT chk_grade_sale_mode 
        CHECK (grade_sale_mode IN ('full', 'half', 'custom') OR grade_sale_mode IS NULL);
    END IF;
END $$;

-- Constraint: se tem flexible_grade_config, deve ser grade
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_flexible_config_requires_grade' 
        AND conrelid = 'public.product_variations'::regclass
    ) THEN
        ALTER TABLE public.product_variations 
        ADD CONSTRAINT chk_flexible_config_requires_grade 
        CHECK (
          flexible_grade_config IS NULL OR 
          (is_grade = true AND flexible_grade_config IS NOT NULL)
        );
    END IF;
END $$;

-- ========================================
-- 4. COMENTÁRIOS DE DOCUMENTAÇÃO
-- ========================================

COMMENT ON COLUMN public.product_variations.flexible_grade_config IS 
'Configuração de grade flexível (JSONB): permite grade completa, meia grade, mesclagem personalizada';

COMMENT ON COLUMN public.product_variations.grade_sale_mode IS 
'Modo de venda ativo da grade: full (Grade completa), half (Meia grade), custom (Mesclagem personalizada)';

-- ========================================
-- 5. FUNÇÃO HELPER PARA VALIDAR CONFIGURAÇÃO (CORRIGIDA)
-- ========================================

CREATE OR REPLACE FUNCTION validate_flexible_grade_config(config JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se config é null, é válido (grade tradicional)
  IF config IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Validar estrutura básica
  IF NOT (
    config ? 'allow_full_grade' AND
    config ? 'allow_half_grade' AND
    config ? 'allow_custom_mix'
  ) THEN
    RAISE EXCEPTION 'Campos obrigatórios ausentes na configuração de grade flexível';
  END IF;

  -- Pelo menos um modo deve estar ativo
  IF NOT (
    (config->>'allow_full_grade')::boolean OR
    (config->>'allow_half_grade')::boolean OR
    (config->>'allow_custom_mix')::boolean
  ) THEN
    RAISE EXCEPTION 'Pelo menos um modo de venda deve estar ativo';
  END IF;

  -- Validar percentual de meia grade (se habilitado)
  IF (config->>'allow_half_grade')::boolean THEN
    IF NOT (config ? 'half_grade_percentage') THEN
      RAISE EXCEPTION 'Percentual de meia grade não definido';
    END IF;
    
    IF (config->>'half_grade_percentage')::numeric < 25 OR 
       (config->>'half_grade_percentage')::numeric > 75 THEN
      RAISE EXCEPTION 'Percentual de meia grade deve estar entre 25 e 75';
    END IF;
  END IF;

  -- Validar configuração de mesclagem (se habilitado)
  IF (config->>'allow_custom_mix')::boolean THEN
    IF NOT (config ? 'custom_mix_min_pairs') THEN
      RAISE EXCEPTION 'Mínimo de pares para mesclagem não definido';
    END IF;
    
    IF (config->>'custom_mix_min_pairs')::integer < 1 THEN
      RAISE EXCEPTION 'Mínimo de pares para mesclagem deve ser maior ou igual a 1';
    END IF;
    
    IF config ? 'custom_mix_max_colors' THEN
      IF (config->>'custom_mix_max_colors')::integer < 1 OR 
         (config->>'custom_mix_max_colors')::integer > 10 THEN
        RAISE EXCEPTION 'Número de cores para mesclagem deve estar entre 1 e 10';
      END IF;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION validate_flexible_grade_config IS 
'Valida a estrutura e regras de negócio da configuração de grade flexível';

-- ========================================
-- 6. TRIGGER PARA VALIDAÇÃO AUTOMÁTICA
-- ========================================

CREATE OR REPLACE FUNCTION trg_validate_flexible_grade_config()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar configuração se presente
  IF NEW.flexible_grade_config IS NOT NULL THEN
    PERFORM validate_flexible_grade_config(NEW.flexible_grade_config);
  END IF;

  RETURN NEW;
END;
$$;

-- Remover trigger se existir
DROP TRIGGER IF EXISTS validate_flexible_config_before_insert_update ON public.product_variations;

-- Criar trigger
CREATE TRIGGER validate_flexible_config_before_insert_update
  BEFORE INSERT OR UPDATE ON public.product_variations
  FOR EACH ROW
  WHEN (NEW.flexible_grade_config IS NOT NULL)
  EXECUTE FUNCTION trg_validate_flexible_grade_config();

COMMENT ON TRIGGER validate_flexible_config_before_insert_update ON public.product_variations IS
'Trigger que valida automaticamente a configuração de grade flexível antes de inserção/atualização';

-- ========================================
-- 7. VIEW HELPER PARA GRADES FLEXÍVEIS
-- ========================================

CREATE OR REPLACE VIEW v_flexible_grades AS
SELECT 
  pv.id,
  pv.product_id,
  pv.grade_name,
  pv.grade_color,
  pv.grade_sizes,
  pv.grade_pairs,
  pv.grade_quantity,
  pv.grade_sale_mode,
  pv.flexible_grade_config,
  pv.stock,
  pv.price_adjustment,
  -- Campos calculados
  (pv.flexible_grade_config->>'allow_full_grade')::boolean AS allows_full,
  (pv.flexible_grade_config->>'allow_half_grade')::boolean AS allows_half,
  (pv.flexible_grade_config->>'allow_custom_mix')::boolean AS allows_custom,
  CASE 
    WHEN (pv.flexible_grade_config->>'allow_full_grade')::boolean AND
         (pv.flexible_grade_config->>'allow_half_grade')::boolean AND
         (pv.flexible_grade_config->>'allow_custom_mix')::boolean 
    THEN 3
    WHEN ((pv.flexible_grade_config->>'allow_full_grade')::boolean::int +
          (pv.flexible_grade_config->>'allow_half_grade')::boolean::int +
          (pv.flexible_grade_config->>'allow_custom_mix')::boolean::int) >= 2
    THEN 2
    ELSE 1
  END AS purchase_options_count
FROM public.product_variations pv
WHERE pv.is_grade = true 
  AND pv.flexible_grade_config IS NOT NULL;

COMMENT ON VIEW v_flexible_grades IS 
'View helper para consultar grades com configuração flexível';

-- ========================================
-- 8. PERMISSÕES
-- ========================================

-- Garantir que usuários autenticados possam ler as views
GRANT SELECT ON v_flexible_grades TO authenticated;

-- ========================================
-- MIGRATION CONCLUÍDA
-- ========================================

SELECT 'Migration executada com sucesso! Colunas flexible_grade_config e grade_sale_mode adicionadas.' AS status;

