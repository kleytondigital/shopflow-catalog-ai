
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoreVariationGroup {
  id: string;
  store_id: string;
  master_group_id: string;
  name: string;
  description?: string;
  attribute_key: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreVariationValue {
  id: string;
  store_id: string;
  group_id: string;
  master_value_id: string;
  value: string;
  hex_color?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useStoreVariations = (storeId?: string) => {
  const [groups, setGroups] = useState<StoreVariationGroup[]>([]);
  const [values, setValues] =useState<StoreVariationValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGroups = useCallback(async () => {
    if (!storeId) {
      setGroups([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('store_variation_groups')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setGroups(data || []);
    } catch (err: any) {
      console.error('Error fetching store variation groups:', err);
      setError(err.message);
      toast({
        title: "Erro",
        description: "Falha ao carregar grupos de variação da loja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, toast]);

  const fetchValues = useCallback(async () => {
    if (!storeId) {
      setValues([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('store_variation_values')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setValues(data || []);
    } catch (err: any) {
      console.error('Error fetching store variation values:', err);
      setError(err.message);
    }
  }, [storeId]);

  const createGroup = useCallback(async (groupData: Omit<StoreVariationGroup, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('store_variation_groups')
        .insert(groupData)
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order));
      
      toast({
        title: "Grupo criado",
        description: "Grupo de variação criado com sucesso",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating variation group:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar grupo de variação",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateGroup = useCallback(async (groupId: string, updates: Partial<StoreVariationGroup>) => {
    try {
      const { data, error } = await supabase
        .from('store_variation_groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, ...data } : group
      ));

      toast({
        title: "Grupo atualizado",
        description: "Grupo de variação atualizado com sucesso",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating variation group:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar grupo de variação",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteGroup = useCallback(async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('store_variation_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prev => prev.filter(group => group.id !== groupId));

      toast({
        title: "Grupo removido",
        description: "Grupo de variação removido com sucesso",
      });
    } catch (error: any) {
      console.error('Error deleting variation group:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover grupo de variação",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const createValue = useCallback(async (valueData: Omit<StoreVariationValue, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('store_variation_values')
        .insert(valueData)
        .select()
        .single();

      if (error) throw error;

      setValues(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order));
      
      toast({
        title: "Valor criado",
        description: "Valor de variação criado com sucesso",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating variation value:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar valor de variação",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateValue = useCallback(async (valueId: string, updates: Partial<StoreVariationValue>) => {
    try {
      const { data, error } = await supabase
        .from('store_variation_values')
        .update(updates)
        .eq('id', valueId)
        .select()
        .single();

      if (error) throw error;

      setValues(prev => prev.map(value => 
        value.id === valueId ? { ...value, ...data } : value
      ));

      toast({
        title: "Valor atualizado",
        description: "Valor de variação atualizado com sucesso",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating variation value:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar valor de variação",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteValue = useCallback(async (valueId: string) => {
    try {
      const { error } = await supabase
        .from('store_variation_values')
        .delete()
        .eq('id', valueId);

      if (error) throw error;

      setValues(prev => prev.filter(value => value.id !== valueId));

      toast({
        title: "Valor removido",
        description: "Valor de variação removido com sucesso",
      });
    } catch (error: any) {
      console.error('Error deleting variation value:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover valor de variação",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Fetch benefits instead of store_benefits
  const fetchStoreBenefits = useCallback(async () => {
    if (!storeId) return [];

    try {
      const { data, error } = await supabase
        .from('system_benefits')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching store benefits:', err);
      return [];
    }
  }, [storeId]);

  useEffect(() => {
    fetchGroups();
    fetchValues();
  }, [fetchGroups, fetchValues]);

  return {
    groups,
    values,
    loading,
    error,
    fetchGroups,
    fetchValues,
    createGroup,
    updateGroup,
    deleteGroup,
    createValue,
    updateValue,
    deleteValue,
    refetch: () => {
      fetchGroups();
      fetchValues();
    }
  };
};
