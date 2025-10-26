-- ============================================
-- MIGRATION FASE 2: Conversão Avançada
-- Vídeos, Depoimentos, Tabela de Medidas e Cuidados
-- ============================================

-- 1. Tabela de Vídeos do Produto
CREATE TABLE IF NOT EXISTS product_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'vimeo', 'direct')),
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  duration_seconds INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_videos_product_id ON product_videos(product_id);
CREATE INDEX idx_product_videos_active ON product_videos(is_active);

-- 2. Tabela de Depoimentos/Provas Sociais
CREATE TABLE IF NOT EXISTS product_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT, -- Opcional, para verificação
  customer_city TEXT NOT NULL,
  customer_state TEXT,
  customer_avatar TEXT, -- URL do avatar
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false, -- Destaque
  is_approved BOOLEAN DEFAULT false, -- Aprovação moderada
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_testimonials_product_id ON product_testimonials(product_id);
CREATE INDEX idx_product_testimonials_approved ON product_testimonials(is_approved);
CREATE INDEX idx_product_testimonials_rating ON product_testimonials(rating DESC);

-- 3. Extensão da tabela products para informações de medidas
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_gender TEXT CHECK (product_gender IN ('masculino', 'feminino', 'unissex', 'infantil')),
ADD COLUMN IF NOT EXISTS product_category_type TEXT CHECK (product_category_type IN ('calcado', 'roupa_superior', 'roupa_inferior', 'acessorio')),
ADD COLUMN IF NOT EXISTS has_custom_size_chart BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS product_weight DECIMAL(10,2), -- em kg
ADD COLUMN IF NOT EXISTS dimensions JSONB; -- {length, width, height} em cm

-- 4. Tabela de Tabelas de Medidas Personalizadas
CREATE TABLE IF NOT EXISTS product_size_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_name TEXT NOT NULL, -- PP, P, M, G, GG, 38, 39, etc
  size_br TEXT,
  size_us TEXT,
  size_eu TEXT,
  size_cm TEXT, -- Para calçados
  measurements JSONB, -- {bust, waist, hip, length} para roupas
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_size_charts_product_id ON product_size_charts(product_id);

-- 5. Tabela de Instruções de Cuidados
CREATE TABLE IF NOT EXISTS product_care_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  instruction_type TEXT NOT NULL CHECK (instruction_type IN ('do', 'dont', 'warning')),
  icon_type TEXT NOT NULL CHECK (icon_type IN ('water', 'sun', 'iron', 'wash', 'dry', 'bleach', 'protect', 'custom')),
  instruction_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_care_instructions_product_id ON product_care_instructions(product_id);

-- 6. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_videos_updated_at
BEFORE UPDATE ON product_videos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_testimonials_updated_at
BEFORE UPDATE ON product_testimonials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS (Row Level Security) - Se necessário
-- ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_testimonials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_size_charts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_care_instructions ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de acesso (exemplo)
-- CREATE POLICY "Qualquer um pode ver vídeos ativos"
--   ON product_videos FOR SELECT
--   USING (is_active = true);

-- CREATE POLICY "Qualquer um pode ver depoimentos aprovados"
--   ON product_testimonials FOR SELECT
--   USING (is_approved = true AND is_active = true);

-- ============================================
-- DADOS DE EXEMPLO (Opcional - apenas para testes)
-- ============================================

-- Exemplo de vídeo (descomente para usar)
-- INSERT INTO product_videos (product_id, video_url, video_type, title)
-- VALUES (
--   'ID_DO_SEU_PRODUTO_AQUI',
--   'https://www.youtube.com/watch?v=EXEMPLO',
--   'youtube',
--   'Vídeo Demonstrativo do Produto'
-- );

-- Exemplo de depoimento (descomente para usar)
-- INSERT INTO product_testimonials (
--   product_id, customer_name, customer_city, customer_state,
--   rating, comment, purchase_date, verified_purchase, is_approved
-- ) VALUES (
--   'ID_DO_SEU_PRODUTO_AQUI',
--   'Maria Silva',
--   'São Paulo',
--   'SP',
--   5.0,
--   'Produto excelente! Superou minhas expectativas. Recomendo muito!',
--   '2025-09-15',
--   true,
--   true
-- );

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as tabelas foram criadas
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

-- Verificar novas colunas em products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN (
    'product_gender',
    'product_category_type',
    'has_custom_size_chart',
    'material',
    'product_weight',
    'dimensions'
  )
ORDER BY column_name;

