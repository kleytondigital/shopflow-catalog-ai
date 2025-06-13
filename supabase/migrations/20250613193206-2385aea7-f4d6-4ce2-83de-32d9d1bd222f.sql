
-- Política para permitir criação de pedidos públicos (sem autenticação obrigatória)
CREATE POLICY "Allow public order creation" ON public.orders
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir que donos de lojas vejam seus pedidos
CREATE POLICY "Store owners can view their orders" ON public.orders
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = orders.store_id 
      AND owner_id = auth.uid()
    )
  );

-- Política para permitir que donos de lojas atualizem seus pedidos
CREATE POLICY "Store owners can update their orders" ON public.orders
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = orders.store_id 
      AND owner_id = auth.uid()
    )
  );

-- Habilitar RLS na tabela orders se ainda não estiver habilitado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Política para permitir movimentações de estoque públicas (necessário para reservas)
CREATE POLICY "Allow public stock movements" ON public.stock_movements
  FOR INSERT 
  WITH CHECK (true);

-- Política para donos de lojas verem movimentações de estoque
CREATE POLICY "Store owners can view stock movements" ON public.stock_movements
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = stock_movements.store_id 
      AND owner_id = auth.uid()
    )
  );

-- Habilitar RLS na tabela stock_movements se ainda não estiver habilitado
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
