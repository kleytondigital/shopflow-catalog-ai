
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/hooks/useAuth';

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Buscando usuários...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }
      
      console.log('Usuários encontrados:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStore = async (userId: string, storeId: string | null) => {
    try {
      console.log('Iniciando atualização do usuário:', userId, 'para loja:', storeId);
      
      // Primeiro, verificar se o usuário existe
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar usuário existente:', checkError);
        throw checkError;
      }

      if (!existingUser) {
        console.error('Usuário não encontrado:', userId);
        throw new Error('Usuário não encontrado');
      }

      console.log('Usuário encontrado:', existingUser);

      // Realizar a atualização
      const { data, error } = await supabase
        .from('profiles')
        .update({ store_id: storeId })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Erro SQL ao atualizar usuário:', error);
        throw error;
      }

      console.log('Resultado da atualização:', data);

      if (!data || data.length === 0) {
        console.error('Nenhuma linha foi atualizada');
        throw new Error('Falha ao atualizar usuário - nenhuma linha afetada');
      }

      console.log('Usuário atualizado com sucesso:', data[0]);
      
      // Atualizar o estado local imediatamente
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, store_id: storeId }
            : user
        )
      );
      
      // Verificar se a atualização persistiu no banco
      setTimeout(async () => {
        try {
          const { data: verifyData, error: verifyError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (verifyError) {
            console.error('Erro ao verificar atualização:', verifyError);
          } else {
            console.log('Verificação da atualização:', verifyData);
            if (verifyData?.store_id !== storeId) {
              console.error('Atualização não persistiu corretamente!');
              // Refetch para garantir consistência
              fetchUsers();
            }
          }
        } catch (verifyErr) {
          console.error('Erro na verificação:', verifyErr);
        }
      }, 1000);

      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { error };
    }
  };

  const updateUserRole = async (userId: string, role: 'superadmin' | 'store_admin') => {
    try {
      console.log('Atualizando papel do usuário:', userId, 'para:', role);
      
      // Verificar se o usuário existe primeiro
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar usuário existente:', checkError);
        throw checkError;
      }

      if (!existingUser) {
        console.error('Usuário não encontrado:', userId);
        throw new Error('Usuário não encontrado');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Erro SQL ao atualizar papel:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('Nenhuma linha foi atualizada ao alterar papel');
        throw new Error('Falha ao atualizar papel do usuário');
      }

      console.log('Papel do usuário atualizado com sucesso:', data[0]);
      
      // Atualizar o estado local imediatamente
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role }
            : user
        )
      );

      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    updateUserStore,
    updateUserRole
  };
};
