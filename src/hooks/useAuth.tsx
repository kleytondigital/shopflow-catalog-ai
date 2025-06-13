
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'superadmin' | 'store_admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  store_id: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createStoreForUser: (userId: string, storeName: string, description?: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      console.log('Perfil encontrado:', data);
      setProfile(data);
    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Recarregando perfil do usuário:', user.id);
      await fetchProfile(user.id);
    }
  };

  const createStoreForUser = async (userId: string, storeName: string, description?: string) => {
    try {
      console.log('Criando loja para usuário:', userId, 'Nome:', storeName);

      // Criar a loja
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert([{
          name: storeName,
          description: description || `Loja de ${storeName}`,
          owner_id: userId,
          is_active: true,
          plan_type: 'basic',
          monthly_fee: 0
        }])
        .select()
        .single();

      if (storeError) {
        console.error('Erro ao criar loja:', storeError);
        throw storeError;
      }

      console.log('Loja criada:', storeData);

      // Associar o usuário à loja criada
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ store_id: storeData.id })
        .eq('id', userId);

      if (profileError) {
        console.error('Erro ao associar usuário à loja:', profileError);
        throw profileError;
      }

      console.log('Usuário associado à loja com sucesso');

      // Criar configurações padrão da loja
      const { error: settingsError } = await supabase
        .from('store_settings')
        .insert([{
          store_id: storeData.id,
          payment_methods: { pix: true, credit_card: false, bank_slip: false },
          shipping_options: { pickup: true, delivery: false, shipping: false },
          retail_catalog_active: true,
          wholesale_catalog_active: false
        }]);

      if (settingsError) {
        console.error('Erro ao criar configurações da loja:', settingsError);
        throw settingsError;
      }

      console.log('Configurações da loja criadas com sucesso');

      // Atualizar o perfil local
      await fetchProfile(userId);

      return { error: null };
    } catch (error) {
      console.error('Erro ao criar loja para usuário:', error);
      return { error };
    }
  };

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de autenticação:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar perfil do usuário após login
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão existente:', session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'store_admin') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    // Se o usuário foi criado com sucesso e é um store_admin, criar loja automaticamente
    if (!error && data.user && role === 'store_admin') {
      // Aguardar um pouco para garantir que o perfil foi criado pelo trigger
      setTimeout(async () => {
        await createStoreForUser(
          data.user.id, 
          `Loja de ${fullName}`,
          `Loja criada automaticamente para ${fullName}`
        );
      }, 2000);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    createStoreForUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
