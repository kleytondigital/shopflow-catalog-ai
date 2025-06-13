
-- Reabilitar RLS na tabela orders se foi desabilitado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Public and authenticated can create orders" ON public.orders;
DROP POLICY IF EXISTS "Store owners can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Store owners can update their orders" ON public.orders;
DROP POLICY IF EXISTS "Store owners can delete their orders" ON public.orders;

-- Política segura para criação pública de pedidos
CREATE POLICY "Allow public order creation" ON public.orders
  FOR INSERT 
  WITH CHECK (
    -- Permitir inserção se store_id existe e está ativo
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = orders.store_id 
      AND is_active = true
    )
  );

-- Política para donos de loja visualizarem seus pedidos
CREATE POLICY "Store owners can view their orders" ON public.orders
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = orders.store_id 
      AND owner_id = auth.uid()
    )
  );

-- Política para donos de loja atualizarem seus pedidos
CREATE POLICY "Store owners can update their orders" ON public.orders
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = orders.store_id 
      AND owner_id = auth.uid()
    )
  );

-- Política para donos de loja excluírem seus pedidos
CREATE POLICY "Store owners can delete their orders" ON public.orders
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = orders.store_id 
      AND owner_id = auth.uid()
    )
  );
