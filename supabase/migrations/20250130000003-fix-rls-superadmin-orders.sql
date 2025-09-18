-- Migration: Corrigir RLS para permitir superadmin acessar todos os pedidos
-- Data: 2025-01-30

-- Verificar se as políticas atuais existem e removê-las
DROP POLICY IF EXISTS "Superadmins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Store admins can manage their store orders" ON public.orders;

-- Recriar políticas RLS para orders com acesso correto para superadmin
CREATE POLICY "Superadmins can view all orders" 
  ON public.orders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all orders" 
  ON public.orders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Store admins can view their store orders" 
  ON public.orders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'store_admin' AND store_id = orders.store_id
    )
  );

CREATE POLICY "Store admins can manage their store orders" 
  ON public.orders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'store_admin' AND store_id = orders.store_id
    )
  );

-- Verificar se há dados na tabela orders
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
  SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as total_revenue,
  MIN(created_at) as oldest_order,
  MAX(created_at) as newest_order
FROM public.orders;


