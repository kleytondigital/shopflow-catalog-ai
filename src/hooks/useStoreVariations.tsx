
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VariationGroup {
  id: string;
  store_id: string;
  name: string;
  attribute_key: string;
  display_order: number;
}

interface VariationValue {
  id: string;
  group_id: string;
  value: string;
  hex_color?: string;
  display_order: number;
}

export const useStoreVariations = () => {
  const [groups, setGroups] = useState<VariationGroup[]>([]);
  const [values, setValues] = useState<VariationValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoreVariations = async () => {
      try {
        // Buscar o store_id do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('store_id')
          .eq('id', user.id)
          .single();

        if (!profile?.store_id) return;

        // Buscar grupos de variação da loja
        const { data: groupsData, error: groupsError } = await supabase
          .from('store_variation_groups')
          .select('*')
          .eq('store_id', profile.store_id)
          .order('display_order');

        if (groupsError) throw groupsError;

        // Buscar valores das variações
        const { data: valuesData, error: valuesError } = await supabase
          .from('store_variation_values')
          .select('*')
          .eq('store_id', profile.store_id)
          .order('display_order');

        if (valuesError) throw valuesError;

        setGroups(groupsData || []);
        setValues(valuesData || []);
      } catch (error) {
        console.error('Erro ao carregar variações da loja:', error);
        // Se não conseguir carregar, cria grupos padrão
        setGroups([
          { id: 'color', store_id: '', name: 'Cor', attribute_key: 'color', display_order: 1 },
          { id: 'size', store_id: '', name: 'Tamanho', attribute_key: 'size', display_order: 2 },
          { id: 'material', store_id: '', name: 'Material', attribute_key: 'material', display_order: 3 },
          { id: 'style', store_id: '', name: 'Estilo', attribute_key: 'style', display_order: 4 },
        ]);
        setValues([
          // Cores padrão
          { id: 'color-1', group_id: 'color', value: 'Preto', hex_color: '#000000', display_order: 1 },
          { id: 'color-2', group_id: 'color', value: 'Branco', hex_color: '#FFFFFF', display_order: 2 },
          { id: 'color-3', group_id: 'color', value: 'Vermelho', hex_color: '#FF0000', display_order: 3 },
          { id: 'color-4', group_id: 'color', value: 'Azul', hex_color: '#0000FF', display_order: 4 },
          // Tamanhos padrão
          { id: 'size-1', group_id: 'size', value: 'PP', display_order: 1 },
          { id: 'size-2', group_id: 'size', value: 'P', display_order: 2 },
          { id: 'size-3', group_id: 'size', value: 'M', display_order: 3 },
          { id: 'size-4', group_id: 'size', value: 'G', display_order: 4 },
          { id: 'size-5', group_id: 'size', value: 'GG', display_order: 5 },
          // Materiais padrão
          { id: 'material-1', group_id: 'material', value: 'Algodão', display_order: 1 },
          { id: 'material-2', group_id: 'material', value: 'Poliéster', display_order: 2 },
          { id: 'material-3', group_id: 'material', value: 'Couro', display_order: 3 },
          // Estilos padrão
          { id: 'style-1', group_id: 'style', value: 'Casual', display_order: 1 },
          { id: 'style-2', group_id: 'style', value: 'Formal', display_order: 2 },
          { id: 'style-3', group_id: 'style', value: 'Esportivo', display_order: 3 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadStoreVariations();
  }, []);

  return { groups, values, loading };
};
