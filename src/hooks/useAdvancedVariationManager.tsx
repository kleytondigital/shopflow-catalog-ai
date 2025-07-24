
import { useState, useCallback, useMemo } from 'react';
import { ProductVariation } from '@/types/product';

export const useAdvancedVariationManager = (
  variations: ProductVariation[],
  onVariationsChange: (variations: ProductVariation[]) => void
) => {
  const [tempVariations, setTempVariations] = useState<ProductVariation[]>([]);

  // Sincronizar com variações externas
  const managedVariations = useMemo(() => {
    return variations.length > 0 ? variations : tempVariations;
  }, [variations, tempVariations]);

  // Criar todas as combinações possíveis
  const createAllCombinations = useCallback((
    colors: string[],
    sizes: string[],
    materials?: string[]
  ) => {
    const combinations: ProductVariation[] = [];
    let index = 0;

    colors.forEach(color => {
      sizes.forEach(size => {
        if (materials && materials.length > 0) {
          materials.forEach(material => {
            combinations.push({
              id: `variation-${Date.now()}-${index++}`,
              product_id: '',
              color,
              size,
              material,
              stock: 0,
              price_adjustment: 0,
              is_active: true,
              sku: `${color.toLowerCase()}-${size.toLowerCase()}-${material.toLowerCase()}`.replace(/\s+/g, '-'),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              display_order: index
            });
          });
        } else {
          combinations.push({
            id: `variation-${Date.now()}-${index++}`,
            product_id: '',
            color,
            size,
            stock: 0,
            price_adjustment: 0,
            is_active: true,
            sku: `${color.toLowerCase()}-${size.toLowerCase()}`.replace(/\s+/g, '-'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_order: index
          });
        }
      });
    });

    if (variations.length > 0) {
      onVariationsChange(combinations);
    } else {
      setTempVariations(combinations);
    }

    return combinations;
  }, [variations, onVariationsChange]);

  // Limpar todas as variações
  const clearAllVariations = useCallback(() => {
    if (variations.length > 0) {
      onVariationsChange([]);
    } else {
      setTempVariations([]);
    }
  }, [variations, onVariationsChange]);

  // Obter estatísticas
  const getStatistics = useCallback(() => {
    const current = managedVariations;
    return {
      total: current.length,
      withStock: current.filter(v => v.stock > 0).length,
      active: current.filter(v => v.is_active).length,
      inactive: current.filter(v => !v.is_active).length,
      totalStock: current.reduce((sum, v) => sum + (v.stock || 0), 0),
      averagePrice: current.length > 0 
        ? current.reduce((sum, v) => sum + (v.price_adjustment || 0), 0) / current.length 
        : 0
    };
  }, [managedVariations]);

  // Duplicar variação
  const duplicateVariation = useCallback((index: number) => {
    const current = managedVariations;
    const original = current[index];
    
    if (!original) return;

    const duplicate: ProductVariation = {
      ...original,
      id: `variation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku: original.sku ? `${original.sku}-copy` : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...current, duplicate];
    
    if (variations.length > 0) {
      onVariationsChange(updated);
    } else {
      setTempVariations(updated);
    }

    return duplicate;
  }, [managedVariations, variations, onVariationsChange]);

  // Atualizar variação específica
  const updateVariation = useCallback((index: number, updates: Partial<ProductVariation>) => {
    const current = managedVariations;
    const updated = current.map((variation, i) => 
      i === index 
        ? { ...variation, ...updates, updated_at: new Date().toISOString() }
        : variation
    );

    if (variations.length > 0) {
      onVariationsChange(updated);
    } else {
      setTempVariations(updated);
    }
  }, [managedVariations, variations, onVariationsChange]);

  // Remover variação
  const removeVariation = useCallback((index: number) => {
    const current = managedVariations;
    const updated = current.filter((_, i) => i !== index);

    if (variations.length > 0) {
      onVariationsChange(updated);
    } else {
      setTempVariations(updated);
    }
  }, [managedVariations, variations, onVariationsChange]);

  return {
    variations: managedVariations,
    createAllCombinations,
    clearAllVariations,
    getStatistics,
    duplicateVariation,
    updateVariation,
    removeVariation
  };
};
