
-- Adicionar política para superadmins poderem atualizar todos os perfis
CREATE POLICY "Superadmins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_superadmin(auth.uid()));

-- Adicionar política para superadmins poderem inserir perfis (se necessário)
CREATE POLICY "Superadmins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (public.is_superadmin(auth.uid()));
