
-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Superadmins can view all catalogs" ON public.catalogs;
DROP POLICY IF EXISTS "Store admins can view their store catalogs" ON public.catalogs;
DROP POLICY IF EXISTS "Store admins can manage their store catalogs" ON public.catalogs;

-- Remover políticas públicas existentes antes de recriar
DROP POLICY IF EXISTS "Public can view active stores" ON public.stores;
DROP POLICY IF EXISTS "Public can view active stores for catalogs" ON public.stores;
DROP POLICY IF EXISTS "Public can view active products from active stores" ON public.products;
DROP POLICY IF EXISTS "Public can view active categories from active stores" ON public.categories;
DROP POLICY IF EXISTS "Public can view settings from active stores" ON public.store_settings;
DROP POLICY IF EXISTS "Public can view store settings from active stores" ON public.store_settings;

-- Habilitar RLS nas tabelas (ignorar se já estiver habilitado)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Políticas para categories
DROP POLICY IF EXISTS "Superadmins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Store admins can view their store categories" ON public.categories;
DROP POLICY IF EXISTS "Store admins can manage their store categories" ON public.categories;

CREATE POLICY "Superadmins can view all categories" 
  ON public.categories 
  FOR SELECT 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Store admins can view their store categories" 
  ON public.categories 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = categories.store_id
    )
  );

CREATE POLICY "Store admins can manage their store categories" 
  ON public.categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = categories.store_id
    )
  );

-- Políticas para catalogs
CREATE POLICY "Superadmins can view all catalogs" 
  ON public.catalogs 
  FOR SELECT 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Store admins can view their store catalogs" 
  ON public.catalogs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = catalogs.store_id
    )
  );

CREATE POLICY "Store admins can manage their store catalogs" 
  ON public.catalogs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = catalogs.store_id
    )
  );

-- Políticas para coupons (remover existentes primeiro)
DROP POLICY IF EXISTS "Superadmins can view all coupons" ON public.coupons;
DROP POLICY IF EXISTS "Store admins can view their store coupons" ON public.coupons;
DROP POLICY IF EXISTS "Store admins can manage their store coupons" ON public.coupons;

CREATE POLICY "Superadmins can view all coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Store admins can view their store coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = coupons.store_id
    )
  );

CREATE POLICY "Store admins can manage their store coupons" 
  ON public.coupons 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = coupons.store_id
    )
  );

-- Políticas para orders (remover existentes primeiro)
DROP POLICY IF EXISTS "Superadmins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Store admins can view their store orders" ON public.orders;
DROP POLICY IF EXISTS "Store admins can manage their store orders" ON public.orders;

CREATE POLICY "Superadmins can view all orders" 
  ON public.orders 
  FOR SELECT 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Store admins can view their store orders" 
  ON public.orders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = orders.store_id
    )
  );

CREATE POLICY "Store admins can manage their store orders" 
  ON public.orders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = orders.store_id
    )
  );

-- Políticas para store_settings (remover existentes primeiro)
DROP POLICY IF EXISTS "Superadmins can view all store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Store admins can view their store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Store admins can manage their store settings" ON public.store_settings;

CREATE POLICY "Superadmins can view all store settings" 
  ON public.store_settings 
  FOR SELECT 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Store admins can view their store settings" 
  ON public.store_settings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = store_settings.store_id
    )
  );

CREATE POLICY "Store admins can manage their store settings" 
  ON public.store_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.store_id = store_settings.store_id
    )
  );

-- Políticas para stores (remover existentes primeiro)
DROP POLICY IF EXISTS "Superadmins can view all stores" ON public.stores;
DROP POLICY IF EXISTS "Superadmins can manage all stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can view their stores" ON public.stores;
DROP POLICY IF EXISTS "Store admins can view their own store" ON public.stores;

CREATE POLICY "Superadmins can view all stores" 
  ON public.stores 
  FOR SELECT 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can manage all stores" 
  ON public.stores 
  FOR ALL 
  USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Store owners can view their stores" 
  ON public.stores 
  FOR SELECT 
  USING (owner_id = auth.uid());

-- Recriar políticas públicas para o catálogo funcionar
CREATE POLICY "Public can view active stores for catalogs" 
  ON public.stores 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Public can view active products from active stores" 
  ON public.products 
  FOR SELECT 
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = products.store_id 
      AND stores.is_active = true
    )
  );

CREATE POLICY "Public can view active categories from active stores" 
  ON public.categories 
  FOR SELECT 
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = categories.store_id 
      AND stores.is_active = true
    )
  );

CREATE POLICY "Public can view store settings from active stores" 
  ON public.store_settings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = store_settings.store_id 
      AND stores.is_active = true
    )
  );

-- Funções auxiliares (recriar sempre)
CREATE OR REPLACE FUNCTION public.is_store_owner(_user_id uuid, _store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.stores
    WHERE id = _store_id
      AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_store_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT store_id
  FROM public.profiles
  WHERE id = _user_id
$$;
