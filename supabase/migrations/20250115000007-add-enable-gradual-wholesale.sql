-- Adicionar coluna enable_gradual_wholesale na tabela products
-- Esta coluna controla se o produto terá atacado gradativo ativo
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS enable_gradual_wholesale BOOLEAN DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN public.products.enable_gradual_wholesale IS 'Controla se o produto terá atacado gradativo ativo (descontos progressivos por quantidade)';

-- Criar índice para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_products_enable_gradual_wholesale 
ON public.products(enable_gradual_wholesale) 
WHERE enable_gradual_wholesale = true; 