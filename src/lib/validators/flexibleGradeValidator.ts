/**
 * Validador para Sistema de Grade Flexível
 * 
 * Fornece validações client-side para:
 * - Configurações de grade flexível
 * - Seleções customizadas de grades
 * - Validação de estoque
 * - Regras de negócio
 */

import type {
  FlexibleGradeConfig,
  CustomGradeSelection,
  ValidationResult,
  StockValidationResult,
  CustomGradeItem,
} from '@/types/flexible-grade';
import type { ProductVariation } from '@/types/product';

/**
 * Classe principal de validação
 */
export class FlexibleGradeValidator {
  /**
   * Valida uma configuração de grade flexível
   */
  static validateConfig(config: FlexibleGradeConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ===== VALIDAÇÃO DE MODOS =====
    const activeModes = [
      config.allow_full_grade,
      config.allow_half_grade,
      config.allow_custom_mix,
    ].filter(Boolean);

    if (activeModes.length === 0) {
      errors.push('Pelo menos um modo de venda deve estar ativo');
    }

    // ===== VALIDAÇÃO DE MEIA GRADE =====
    if (config.allow_half_grade) {
      if (config.half_grade_percentage < 25 || config.half_grade_percentage > 75) {
        errors.push('Percentual de meia grade deve estar entre 25% e 75%');
      }

      if (config.half_grade_min_pairs < 1) {
        errors.push('Mínimo de pares para meia grade deve ser pelo menos 1');
      }

      if (
        config.half_grade_distribution === 'custom' &&
        (!config.half_grade_custom_sizes || config.half_grade_custom_sizes.length === 0)
      ) {
        errors.push('Distribuição customizada requer tamanhos definidos');
      }

      if (
        config.half_grade_distribution === 'custom' &&
        config.half_grade_custom_sizes &&
        config.half_grade_custom_pairs &&
        config.half_grade_custom_sizes.length !== config.half_grade_custom_pairs.length
      ) {
        errors.push('Número de tamanhos e quantidades deve ser igual para distribuição customizada');
      }
    }

    // ===== VALIDAÇÃO DE MESCLAGEM =====
    if (config.allow_custom_mix) {
      if (config.custom_mix_min_pairs < 1) {
        errors.push('Mínimo de pares para mesclagem deve ser pelo menos 1');
      }

      if (config.custom_mix_max_colors < 1 || config.custom_mix_max_colors > 10) {
        errors.push('Máximo de cores deve estar entre 1 e 10');
      }

      if (config.custom_mix_min_pairs > 100) {
        warnings.push('Mínimo de pares muito alto pode dificultar vendas');
      }
    }

    // ===== VALIDAÇÃO DE PRECIFICAÇÃO =====
    if (config.pricing_mode === 'tier_based' && !config.apply_quantity_tiers) {
      warnings.push('Modo tier_based requer apply_quantity_tiers ativo');
    }

    if (config.half_grade_discount_percentage !== undefined) {
      if (config.half_grade_discount_percentage < 0 || config.half_grade_discount_percentage > 100) {
        errors.push('Desconto de meia grade deve estar entre 0% e 100%');
      }

      if (config.half_grade_discount_percentage > 50) {
        warnings.push('Desconto muito alto para meia grade pode impactar margens');
      }
    }

    if (config.custom_mix_price_adjustment !== undefined) {
      if (config.custom_mix_price_adjustment < -1000 || config.custom_mix_price_adjustment > 1000) {
        warnings.push('Ajuste de preço para mesclagem parece muito alto');
      }
    }

    // ===== VALIDAÇÃO DE TIER CALCULATION =====
    if (config.apply_quantity_tiers && config.tier_calculation_mode === 'per_grade') {
      warnings.push('Cálculo de tier por grade pode resultar em descontos menores');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida uma seleção customizada de grade
   */
  static validateCustomSelection(
    selection: CustomGradeSelection,
    config: FlexibleGradeConfig,
    availableSizes?: string[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ===== VALIDAÇÃO BÁSICA =====
    if (!selection.items || selection.items.length === 0) {
      errors.push('Seleção vazia. Adicione pelo menos um item.');
      return { isValid: false, errors, warnings };
    }

    // ===== VALIDAÇÃO DE QUANTIDADE MÍNIMA =====
    const totalPairs = selection.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalPairs < config.custom_mix_min_pairs) {
      errors.push(
        `Quantidade mínima é ${config.custom_mix_min_pairs} pares. ` +
        `Você selecionou ${totalPairs} pares.`
      );
    }

    // ===== VALIDAÇÃO DE CORES =====
    const uniqueColors = new Set(selection.items.map(item => item.color));
    
    if (uniqueColors.size > config.custom_mix_max_colors) {
      errors.push(
        `Máximo de ${config.custom_mix_max_colors} cor(es) diferente(s). ` +
        `Você selecionou ${uniqueColors.size} cores.`
      );
    }

    // ===== VALIDAÇÃO DE TAMANHOS =====
    if (!config.custom_mix_allow_any_size && config.custom_mix_preset_sizes) {
      const presetSizes = new Set(config.custom_mix_preset_sizes);
      const invalidSizes = selection.items.filter(item => !presetSizes.has(item.size));
      
      if (invalidSizes.length > 0) {
        const invalidSizesList = [...new Set(invalidSizes.map(i => i.size))].join(', ');
        errors.push(
          `Tamanhos permitidos: ${config.custom_mix_preset_sizes.join(', ')}. ` +
          `Tamanhos inválidos: ${invalidSizesList}`
        );
      }
    }

    // Validar contra tamanhos disponíveis (se fornecido)
    if (availableSizes && availableSizes.length > 0) {
      const availableSizesSet = new Set(availableSizes);
      const unavailableSizes = selection.items.filter(
        item => !availableSizesSet.has(item.size)
      );
      
      if (unavailableSizes.length > 0) {
        const unavailableList = [...new Set(unavailableSizes.map(i => i.size))].join(', ');
        errors.push(`Tamanhos não disponíveis nesta grade: ${unavailableList}`);
      }
    }

    // ===== VALIDAÇÃO DE QUANTIDADES =====
    const itemsWithZeroQty = selection.items.filter(item => item.quantity <= 0);
    if (itemsWithZeroQty.length > 0) {
      errors.push('Todos os itens devem ter quantidade maior que zero');
    }

    // ===== AVISOS =====
    if (totalPairs < 6) {
      warnings.push(
        'Quantidades baixas podem ter custo unitário maior. ' +
        'Considere aumentar para obter melhor preço.'
      );
    }

    if (uniqueColors.size === 1 && config.allow_full_grade) {
      warnings.push('Você está montando uma grade com apenas uma cor. Considere usar Grade Completa.');
    }

    // Verificar se há muitos itens com poucas unidades
    const smallQuantityItems = selection.items.filter(item => item.quantity === 1);
    if (smallQuantityItems.length > 5) {
      warnings.push(
        `Você tem ${smallQuantityItems.length} item(ns) com apenas 1 par. ` +
        'Isso pode aumentar o custo de logística.'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida estoque disponível para uma seleção
   */
  static validateStock(
    selection: CustomGradeSelection | 'full' | 'half',
    variation: ProductVariation,
    customSelection?: CustomGradeSelection
  ): StockValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const insufficientItems: StockValidationResult['insufficientItems'] = [];

    let availableStock = variation.stock || 0;
    let requestedStock = 0;

    if (selection === 'full') {
      // Grade completa
      requestedStock = variation.grade_quantity || 0;
      
      if (availableStock < requestedStock) {
        errors.push(
          `Estoque insuficiente. Disponível: ${availableStock}, ` +
          `Necessário: ${requestedStock}`
        );
      }
    } else if (selection === 'half') {
      // Meia grade
      const config = variation.flexible_grade_config;
      if (config) {
        const percentage = config.half_grade_percentage / 100;
        requestedStock = Math.round((variation.grade_quantity || 0) * percentage);
        
        if (availableStock < requestedStock) {
          errors.push(
            `Estoque insuficiente para meia grade. Disponível: ${availableStock}, ` +
            `Necessário: ${requestedStock}`
          );
        }
      }
    } else if (customSelection) {
      // Mesclagem customizada
      requestedStock = customSelection.totalPairs;
      
      // Validar estoque por item (se temos informações detalhadas)
      // Nota: Esta validação é simplificada. Em produção, precisaria
      // consultar estoque individual por cor/tamanho
      if (availableStock < requestedStock) {
        errors.push(
          `Estoque insuficiente para seleção customizada. Disponível: ${availableStock}, ` +
          `Necessário: ${requestedStock}`
        );
        
        // Adicionar itens com estoque insuficiente (simplificado)
        customSelection.items.forEach(item => {
          if (item.quantity > 0) {
            insufficientItems.push({
              color: item.color,
              size: item.size,
              available: 0, // Seria calculado de estoque real
              requested: item.quantity,
            });
          }
        });
      }
    }

    // Avisos de estoque baixo
    if (errors.length === 0 && availableStock < requestedStock * 2) {
      warnings.push('Estoque está baixo para este produto. Considere reabastecer em breve.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      availableStock,
      requestedStock,
      insufficientItems: insufficientItems.length > 0 ? insufficientItems : undefined,
    };
  }

  /**
   * Valida compatibilidade com price model
   */
  static validatePriceModelCompatibility(
    config: FlexibleGradeConfig,
    priceModel: 'retail_only' | 'simple_wholesale' | 'gradual_wholesale' | 'wholesale_only'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Se usar tiers mas price model não suporta
    if (config.apply_quantity_tiers && priceModel === 'retail_only') {
      warnings.push(
        'Modelo de preço "Apenas Varejo" não usa tiers. ' +
        'Considere desabilitar apply_quantity_tiers ou mudar o modelo de preço.'
      );
    }

    // Se é wholesale_only, mínimo de pares deve ser respeitado
    if (priceModel === 'wholesale_only') {
      if (config.allow_custom_mix && config.custom_mix_min_pairs < 10) {
        warnings.push(
          'Para modelo "Apenas Atacado", considere mínimo de 10+ pares na mesclagem'
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida consistência geral do sistema
   */
  static validateConsistency(
    variation: ProductVariation,
    config: FlexibleGradeConfig
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar que é realmente uma grade
    if (!variation.is_grade) {
      errors.push('Configuração flexível só pode ser aplicada a variações de grade');
    }

    // Validar que tem tamanhos definidos
    if (!variation.grade_sizes || variation.grade_sizes.length === 0) {
      errors.push('Grade deve ter tamanhos definidos');
    }

    // Validar que tem quantidades definidas
    if (!variation.grade_pairs || variation.grade_pairs.length === 0) {
      errors.push('Grade deve ter quantidades por tamanho definidas');
    }

    // Validar consistência entre tamanhos e quantidades
    if (
      variation.grade_sizes &&
      variation.grade_pairs &&
      variation.grade_sizes.length !== variation.grade_pairs.length
    ) {
      errors.push('Número de tamanhos e quantidades deve ser igual');
    }

    // Validar mínimo de meia grade não excede total
    if (config.allow_half_grade && variation.grade_quantity) {
      const halfGradePairs = Math.round(
        (variation.grade_quantity * config.half_grade_percentage) / 100
      );
      if (halfGradePairs < config.half_grade_min_pairs) {
        warnings.push(
          `Mínimo de meia grade (${config.half_grade_min_pairs}) é muito alto ` +
          `para ${config.half_grade_percentage}% da grade. Ajuste um dos valores.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Helper: Normalizar seleção customizada (remover itens vazios, etc)
 */
export function normalizeCustomSelection(
  selection: CustomGradeSelection
): CustomGradeSelection {
  const items = selection.items
    .filter(item => item.quantity > 0)
    .map(item => ({
      ...item,
      quantity: Math.max(1, Math.floor(item.quantity)),
    }));

  const totalPairs = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    totalPairs,
    meetsMinimum: selection.meetsMinimum,
    estimatedPrice: selection.estimatedPrice,
  };
}

/**
 * Helper: Mesclar itens duplicados (mesma cor e tamanho)
 */
export function mergeCustomSelectionItems(items: CustomGradeItem[]): CustomGradeItem[] {
  const merged = new Map<string, CustomGradeItem>();

  items.forEach(item => {
    const key = `${item.color}_${item.size}`;
    const existing = merged.get(key);

    if (existing) {
      existing.quantity += item.quantity;
      if (item.unitPrice !== undefined && existing.unitPrice === undefined) {
        existing.unitPrice = item.unitPrice;
      }
    } else {
      merged.set(key, { ...item });
    }
  });

  return Array.from(merged.values());
}

/**
 * Helper: Verificar se uma configuração permite múltiplas opções
 */
export function hasMultiplePurchaseOptions(config: FlexibleGradeConfig): boolean {
  const activeOptions = [
    config.allow_full_grade,
    config.allow_half_grade,
    config.allow_custom_mix,
  ].filter(Boolean);

  return activeOptions.length > 1;
}

