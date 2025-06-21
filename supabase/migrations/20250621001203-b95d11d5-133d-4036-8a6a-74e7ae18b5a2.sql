
-- Adicionar campo image_url na tabela product_variations
ALTER TABLE public.product_variations 
ADD COLUMN IF NOT EXISTS image_url text;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.product_variations.image_url IS 'URL da imagem específica da variação. Se nulo, usa a imagem principal do produto.';
