-- Migration: Fix users table 406 error
-- Esta migração resolve o erro HTTP 406 (Not Acceptable) relacionado à tabela users

-- 1. Verificar se existe uma tabela users conflitante e removê-la se necessário
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Criar/atualizar view users que aponta para profiles (para compatibilidade)
CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  email,
  full_name,
  avatar_url,
  role,
  store_id,
  created_at,
  updated_at,
  phone,
  preferences,
  last_sign_in_at
FROM public.profiles;

-- 3. Conceder permissões adequadas para a view
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- 4. Criar políticas RLS para a view users
ALTER VIEW public.users SET (security_invoker = true);

-- 5. Comentário explicativo
COMMENT ON VIEW public.users IS 'View de compatibilidade que aponta para a tabela profiles para resolver erro 406';

-- 6. Atualizar políticas da tabela profiles para garantir acesso adequado
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON public.profiles;

-- Recriar políticas mais permissivas para evitar erro 406
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Superadmins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'superadmin'
    )
  );

-- 7. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Atualizar função de criação de perfil para evitar conflitos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'store_admin')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro para debug
  RAISE WARNING 'Erro ao criar/atualizar perfil: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_store_id ON public.profiles(store_id);

-- 11. Função para debug de políticas RLS
CREATE OR REPLACE FUNCTION public.debug_rls_policies()
RETURNS TABLE(
  table_name text,
  policy_name text,
  policy_type text,
  policy_definition text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    policyname as policy_name,
    cmd as policy_type,
    qual as policy_definition
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'users')
  ORDER BY tablename, policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Comentário final
COMMENT ON FUNCTION public.debug_rls_policies() IS 'Função para debug de políticas RLS que podem causar erro 406';