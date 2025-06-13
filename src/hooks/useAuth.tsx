
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'superadmin' | 'store_admin';
  store_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const { user, session, loading: sessionLoading } = useAuthSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data;
    } catch (err) {
      console.error('Erro inesperado ao buscar perfil:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!sessionLoading) {
        if (user) {
          console.log('Usuário autenticado, carregando perfil...');
          const userProfile = await fetchProfile(user.id);
          setProfile(userProfile);
        } else {
          console.log('Usuário não autenticado, limpando perfil');
          setProfile(null);
        }
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, sessionLoading]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { data: null, error: 'Perfil não encontrado' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    }
  };

  const isSuperadmin = profile?.role === 'superadmin';
  const isStoreAdmin = profile?.role === 'store_admin';

  return {
    user,
    session,
    profile,
    loading,
    updateProfile,
    isSuperadmin,
    isStoreAdmin,
    refetchProfile: () => user && fetchProfile(user.id).then(setProfile)
  };
};
