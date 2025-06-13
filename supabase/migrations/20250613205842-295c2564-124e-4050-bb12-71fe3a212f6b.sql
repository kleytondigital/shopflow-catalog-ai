
-- Remover a política atual que não está funcionando
DROP POLICY IF EXISTS "Allow public order creation" ON public.orders;

-- Criar uma política mais simples e direta para criação pública
CREATE POLICY "Enable public order creation" ON public.orders
  FOR INSERT 
  WITH CHECK (
    store_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = orders.store_id 
      AND stores.is_active = true
    )
  );

-- Verificar se a tabela orders tem RLS habilitado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
