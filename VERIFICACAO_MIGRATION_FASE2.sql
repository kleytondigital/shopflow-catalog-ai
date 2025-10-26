-- ============================================
-- VERIFICAÇÃO: Migration FASE 2 Executada?
-- ============================================

-- 1. Verificar se as colunas foram criadas em products
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN (
    'product_gender',
    'product_category_type',
    'material',
    'product_weight',
    'dimensions',
    'has_custom_size_chart'
  )
ORDER BY column_name;

-- Resultado esperado: 6 linhas
-- Se retornar menos, a migration não foi executada corretamente

-- ============================================

-- 2. Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'product_videos',
    'product_testimonials',
    'product_size_charts',
    'product_care_instructions'
  )
ORDER BY table_name;

-- Resultado esperado: 4 linhas
-- Se retornar menos, a migration não criou todas as tabelas

-- ============================================

-- 3. Testar INSERT em products com novos campos
-- (DESCOMENTE PARA TESTAR - substitua SEU_STORE_ID)

/*
INSERT INTO products (
  name,
  category,
  retail_price,
  store_id,
  product_gender,
  product_category_type,
  material
) VALUES (
  'TESTE - Tênis Exemplo',
  'Calçados',
  199.90,
  'SEU_STORE_ID_AQUI', -- ⚠️ SUBSTITUA pelo seu store_id
  'masculino',
  'calcado',
  'Couro sintético e mesh'
) RETURNING id, name, product_gender, product_category_type, material;
*/

-- Se retornar o produto com os campos preenchidos, está funcionando!

-- ============================================

-- 4. Limpar produto de teste (DESCOMENTE SE FEZ O TESTE ACIMA)

/*
DELETE FROM products 
WHERE name = 'TESTE - Tênis Exemplo';
*/

-- ============================================

-- 5. Verificar produtos existentes (se algum já tem os campos)
SELECT 
  id,
  name,
  product_gender,
  product_category_type,
  material,
  created_at
FROM products
WHERE product_gender IS NOT NULL 
   OR product_category_type IS NOT NULL
   OR material IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- Se retornar produtos, significa que alguns já foram cadastrados com sucesso!

-- ============================================
-- DIAGNÓSTICO COMPLETO
-- ============================================

-- Se a query 1 retornar 6 colunas: ✅ Migration executada
-- Se a query 2 retornar 4 tabelas: ✅ Tabelas criadas
-- Se a query 3 funcionar: ✅ INSERT funciona
-- Se a query 5 retornar produtos: ✅ Sistema funcionando

-- ============================================

