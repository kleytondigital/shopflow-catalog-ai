
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VariationMasterGroup {
  id: string;
  name: string;
  description?: string;
  attribute_key: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VariationMasterValue {
  id: string;
  group_id: string;
  value: string;
  hex_color?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useVariationMasterGroups = () => {
  const [groups, setGroups] = useState<VariationMasterGroup[]>([]);
  const [values, setValues] = useState<VariationMasterValue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('variation_master_groups')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os grupos de variações",
        variant: "destructive",
      });
    }
  };

  const fetchValues = async () => {
    try {
      const { data, error } = await supabase
        .from('variation_master_values')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setValues(data || []);
    } catch (error) {
      console.error('Erro ao buscar valores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os valores de variações",
        variant: "destructive",
      });
    }
  };

  const createGroup = async (groupData: Omit<VariationMasterGroup, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('variation_master_groups')
        .insert(groupData)
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order));
      
      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o grupo",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateGroup = async (id: string, groupData: Partial<VariationMasterGroup>) => {
    try {
      const { data, error } = await supabase
        .from('variation_master_groups')
        .update(groupData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => prev.map(group => 
        group.id === id ? data : group
      ).sort((a, b) => a.display_order - b.display_order));

      toast({
        title: "Sucesso",
        description: "Grupo atualizado com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o grupo",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('variation_master_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGroups(prev => prev.filter(group => group.id !== id));
      setValues(prev => prev.filter(value => value.group_id !== id));

      toast({
        title: "Sucesso",
        description: "Grupo removido com sucesso",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o grupo",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const createValue = async (valueData: Omit<VariationMasterValue, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('variation_master_values')
        .insert(valueData)
        .select()
        .single();

      if (error) throw error;

      setValues(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order));
      
      toast({
        title: "Sucesso",
        description: "Valor criado com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar valor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o valor",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateValue = async (id: string, valueData: Partial<VariationMasterValue>) => {
    try {
      const { data, error } = await supabase
        .from('variation_master_values')
        .update(valueData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setValues(prev => prev.map(value => 
        value.id === id ? data : value
      ).sort((a, b) => a.display_order - b.display_order));

      toast({
        title: "Sucesso",
        description: "Valor atualizado com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o valor",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteValue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('variation_master_values')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setValues(prev => prev.filter(value => value.id !== id));

      toast({
        title: "Sucesso",
        description: "Valor removido com sucesso",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar valor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o valor",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const getValuesByGroup = (groupId: string) => {
    return values.filter(value => value.group_id === groupId && value.is_active);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGroups(), fetchValues()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    groups: groups.filter(g => g.is_active),
    values,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    createValue,
    updateValue,
    deleteValue,
    getValuesByGroup,
    refetch: () => Promise.all([fetchGroups(), fetchValues()])
  };
};
