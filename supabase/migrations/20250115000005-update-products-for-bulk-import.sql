-- Migration para adicionar colunas necessárias para importação em massa

-- Adicionar colunas de preços por tier (caso não existam)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS bulk_price_small DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS bulk_price_large DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,3),
ADD COLUMN IF NOT EXISTS width DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS height DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS depth DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS allow_negative_stock BOOLEAN DEFAULT false;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);

-- Comentários
COMMENT ON COLUMN products.wholesale_price IS 'Preço de atacarejo (5-9 unidades)';
COMMENT ON COLUMN products.bulk_price_small IS 'Preço de atacado pequeno (10-49 unidades)';
COMMENT ON COLUMN products.bulk_price_large IS 'Preço de atacado grande (50+ unidades)';
COMMENT ON COLUMN products.barcode IS 'Código de barras/EAN do produto';
COMMENT ON COLUMN products.weight IS 'Peso do produto em KG';
COMMENT ON COLUMN products.width IS 'Largura do produto em CM';
COMMENT ON COLUMN products.height IS 'Altura do produto em CM';
COMMENT ON COLUMN products.depth IS 'Profundidade do produto em CM';
COMMENT ON COLUMN products.tags IS 'Tags/etiquetas do produto';
COMMENT ON COLUMN products.allow_negative_stock IS 'Permite estoque negativo para este produto'; 