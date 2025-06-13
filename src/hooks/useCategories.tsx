
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Category {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  store_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export const useCategories = (storeId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Usar o store_id do parâmetro ou do profile
      const targetStoreId = storeId || profile?.store_id;
      
      console.log('useCategories: Buscando categorias para store_id:', targetStoreId);
      
      if (!targetStoreId) {
        console.log('useCategories: Nenhum store_id disponível');
        setCategories([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', targetStoreId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      console.log('useCategories: Resultado da busca:', { data, error });

      if (error) {
        console.error('useCategories: Erro ao buscar categorias:', error);
        throw error;
      }
      
      setCategories(data || []);
    } catch (error) {
      console.error('useCategories: Erro ao buscar categorias:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: CreateCategoryData) => {
    try {
      console.log('useCategories: Criando categoria:', categoryData);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      console.log('useCategories: Resultado da inserção:', { data, error });

      if (error) {
        console.error('useCategories: Erro na inserção:', error);
        throw error;
      }
      
      await fetchCategories();
      return { data, error: null };
    } catch (error) {
      console.error('useCategories: Erro ao criar categoria:', error);
      return { data: null, error };
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchCategories();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return { data: null, error };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      await fetchCategories();
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      return { error };
    }
  };

  useEffect(() => {
    if (profile || storeId) {
      fetchCategories();
    }
  }, [profile?.store_id, storeId]);

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
