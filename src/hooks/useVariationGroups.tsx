
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VariationGroup, HierarchicalVariation } from '@/types/variation';

export const useVariationGroups = (productId?: string) => {
  const [groups, setGroups] = useState<VariationGroup[]>([]);
  const [variations, setVariations] = useState<HierarchicalVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGroups = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎯 VARIATION GROUPS - Carregando para produto:', id);

      const { data: groupsData, error: groupsError } = await supabase
        .from('variation_groups')
        .select('*')
        .eq('product_id', id);

      if (groupsError) {
        console.error('❌ Erro ao buscar grupos:', groupsError);
        setError(groupsError.message);
        return;
      }

      const { data: variationsData, error: variationsError } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', id)
        .order('display_order', { ascending: true });

      if (variationsError) {
        console.error('❌ Erro ao buscar variações:', variationsError);
        setError(variationsError.message);
        return;
      }

      // Processar variações hierárquicas
      const processedVariations = variationsData?.map(v => ({
        id: v.id,
        product_id: v.product_id,
        variation_group_id: v.variation_group_id,
        parent_variation_id: v.parent_variation_id,
        variation_type: v.variation_type || 'simple',
        variation_value: v.variation_value || '',
        color: v.color,
        size: v.size,
        sku: v.sku,
        stock: v.stock,
        price_adjustment: v.price_adjustment,
        is_active: v.is_active,
        image_url: v.image_url,
        display_order: v.display_order || 0,
        created_at: v.created_at,
        updated_at: v.updated_at,
        children: []
      })) || [];

      // Organizar variações hierárquicas
      const mainVariations = processedVariations.filter(v => v.variation_type === 'main');
      const subVariations = processedVariations.filter(v => v.variation_type === 'sub');

      // Associar subvariações às principais
      mainVariations.forEach(main => {
        main.children = subVariations.filter(sub => sub.parent_variation_id === main.id);
      });

      console.log('✅ VARIATION GROUPS - Grupos carregados:', groupsData?.length || 0);
      console.log('✅ VARIATION GROUPS - Variações carregadas:', processedVariations.length);
      
      setGroups(groupsData || []);
      setVariations(mainVariations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('🚨 Erro inesperado ao carregar grupos:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveVariationGroup = async (
    productId: string, 
    groupData: Omit<VariationGroup, 'id' | 'created_at' | 'updated_at'>,
    variationsData: HierarchicalVariation[]
  ) => {
    try {
      console.log('💾 VARIATION GROUPS - Salvando grupo:', groupData);

      // 1. Remover grupo e variações existentes
      await supabase
        .from('variation_groups')
        .delete()
        .eq('product_id', productId);

      await supabase
        .from('product_variations')
        .delete()
        .eq('product_id', productId);

      // 2. Criar novo grupo
      const { data: newGroup, error: groupError } = await supabase
        .from('variation_groups')
        .insert(groupData)
        .select()
        .single();

      if (groupError) {
        console.error('❌ Erro ao criar grupo:', groupError);
        throw groupError;
      }

      // 3. Preparar e inserir variações
      const variationsToInsert: any[] = [];
      let displayOrder = 0;

      for (const mainVariation of variationsData) {
        // Upload da imagem principal se houver
        let mainImageUrl = mainVariation.image_url;
        if (mainVariation.image_file) {
          mainImageUrl = await uploadVariationImage(mainVariation.image_file, displayOrder, productId);
        }

        // Inserir variação principal
        const mainVariationData = {
          product_id: productId,
          variation_group_id: newGroup.id,
          variation_type: 'main',
          variation_value: mainVariation.variation_value,
          color: mainVariation.color,
          size: mainVariation.size,
          sku: mainVariation.sku || null,
          stock: 0, // Estoque será a soma das subvariações
          price_adjustment: mainVariation.price_adjustment,
          is_active: mainVariation.is_active,
          image_url: mainImageUrl,
          display_order: displayOrder++
        };

        variationsToInsert.push(mainVariationData);
      }

      // Inserir variações principais primeiro
      const { data: insertedMainVariations, error: mainError } = await supabase
        .from('product_variations')
        .insert(variationsToInsert)
        .select();

      if (mainError) {
        console.error('❌ Erro ao inserir variações principais:', mainError);
        throw mainError;
      }

      // 4. Inserir subvariações
      const subVariationsToInsert: any[] = [];
      
      for (let i = 0; i < variationsData.length; i++) {
        const mainVariation = variationsData[i];
        const insertedMain = insertedMainVariations[i];

        if (mainVariation.children && mainVariation.children.length > 0) {
          for (const subVariation of mainVariation.children) {
            subVariationsToInsert.push({
              product_id: productId,
              variation_group_id: newGroup.id,
              parent_variation_id: insertedMain.id,
              variation_type: 'sub',
              variation_value: subVariation.variation_value,
              color: subVariation.color,
              size: subVariation.size,
              sku: subVariation.sku || null,
              stock: subVariation.stock,
              price_adjustment: subVariation.price_adjustment,
              is_active: subVariation.is_active,
              image_url: subVariation.image_url,
              display_order: subVariation.display_order
            });
          }
        }
      }

      if (subVariationsToInsert.length > 0) {
        const { error: subError } = await supabase
          .from('product_variations')
          .insert(subVariationsToInsert);

        if (subError) {
          console.error('❌ Erro ao inserir subvariações:', subError);
          throw subError;
        }
      }

      console.log('✅ VARIATION GROUPS - Grupo e variações salvos com sucesso');
      
      toast({
        title: 'Variações salvas!',
        description: 'O sistema de variações foi configurado com sucesso.'
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('💥 VARIATION GROUPS - Erro no salvamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar variações';
      
      toast({
        title: 'Erro ao salvar variações',
        description: errorMessage,
        variant: 'destructive'
      });

      return { success: false, error: errorMessage };
    }
  };

  const uploadVariationImage = async (file: File, index: number, productId: string): Promise<string | null> => {
    try {
      console.log('📤 Upload de imagem da variação:', index);
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `variations/${productId}/${index}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erro no upload da variação:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('✅ Upload da variação concluído:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('🚨 Erro inesperado no upload da variação:', error);
      return null;
    }
  };

  useEffect(() => {
    if (productId) {
      fetchGroups(productId);
    } else {
      setGroups([]);
      setVariations([]);
      setLoading(false);
      setError(null);
    }
  }, [productId]);

  return {
    groups,
    variations,
    loading,
    error,
    saveVariationGroup,
    refetch: () => productId && fetchGroups(productId)
  };
};
