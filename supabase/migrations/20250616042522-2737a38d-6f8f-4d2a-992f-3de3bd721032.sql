
-- Políticas para a tabela stores
-- Permitir que usuários autenticados criem suas próprias lojas
DROP POLICY IF EXISTS "Users can create their own stores" ON public.stores;
CREATE POLICY "Users can create their own stores" ON public.stores
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Permitir que usuários vejam suas próprias lojas
DROP POLICY IF EXISTS "Users can view their own stores" ON public.stores;
CREATE POLICY "Users can view their own stores" ON public.stores
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

-- Permitir que usuários atualizem suas próprias lojas
DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;
CREATE POLICY "Users can update their own stores" ON public.stores
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Permitir que superadmins vejam todas as lojas
DROP POLICY IF EXISTS "Superadmins can view all stores" ON public.stores;
CREATE POLICY "Superadmins can view all stores" ON public.stores
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'superadmin'
    )
  );

-- Permitir que superadmins criem lojas para outros usuários
DROP POLICY IF EXISTS "Superadmins can create stores" ON public.stores;
CREATE POLICY "Superadmins can create stores" ON public.stores
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'superadmin'
    )
  );

-- Permitir que superadmins atualizem qualquer loja
DROP POLICY IF EXISTS "Superadmins can update all stores" ON public.stores;
CREATE POLICY "Superadmins can update all stores" ON public.stores
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'superadmin'
    )
  );

-- Habilitar RLS na tabela stores se não estiver habilitado
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Corrigir políticas para o bucket store-logos no storage
-- Remover políticas existentes
DROP POLICY IF EXISTS "Public can view store logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload store logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their store logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their store logos" ON storage.objects;

-- Política para visualização pública dos logos
CREATE POLICY "Public can view store logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-logos');

-- Política para upload de logos por usuários autenticados
CREATE POLICY "Authenticated users can upload store logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'store-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política para atualização de logos
CREATE POLICY "Users can update their store logos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'store-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política para deleção de logos
CREATE POLICY "Users can delete their store logos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'store-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Políticas para a tabela store_settings
-- Permitir que donos de loja criem configurações
DROP POLICY IF EXISTS "Store owners can create settings" ON public.store_settings;
CREATE POLICY "Store owners can create settings" ON public.store_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = store_settings.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Permitir que donos de loja vejam suas configurações
DROP POLICY IF EXISTS "Store owners can view settings" ON public.store_settings;
CREATE POLICY "Store owners can view settings" ON public.store_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = store_settings.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Permitir que donos de loja atualizem suas configurações
DROP POLICY IF EXISTS "Store owners can update settings" ON public.store_settings;
CREATE POLICY "Store owners can update settings" ON public.store_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = store_settings.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Habilitar RLS na tabela store_settings se não estiver habilitado
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela store_subscriptions
-- Permitir que donos de loja criem assinaturas
DROP POLICY IF EXISTS "Store owners can create subscriptions" ON public.store_subscriptions;
CREATE POLICY "Store owners can create subscriptions" ON public.store_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = store_subscriptions.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Permitir que donos de loja vejam suas assinaturas
DROP POLICY IF EXISTS "Store owners can view subscriptions" ON public.store_subscriptions;
CREATE POLICY "Store owners can view subscriptions" ON public.store_subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = store_subscriptions.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Permitir que donos de loja atualizem suas assinaturas
DROP POLICY IF EXISTS "Store owners can update subscriptions" ON public.store_subscriptions;
CREATE POLICY "Store owners can update subscriptions" ON public.store_subscriptions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = store_subscriptions.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Habilitar RLS na tabela store_subscriptions se não estiver habilitado
ALTER TABLE public.store_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública dos planos de assinatura
DROP POLICY IF EXISTS "Public can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Public can view subscription plans" ON public.subscription_plans
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Habilitar RLS na tabela subscription_plans se não estiver habilitado
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
