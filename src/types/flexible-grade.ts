// Tipos para o Sistema de Grade Flexível
// Permite configurar múltiplas formas de venda de grades: completa, meia, mesclada

export type GradeSaleMode = 'full' | 'half' | 'custom';
export type GradeDistributionMode = 'proportional' | 'custom';
export type GradePricingMode = 'unit_based' | 'tier_based' | 'custom';
export type TierCalculationMode = 'per_pair' | 'per_grade';

/**
 * Configuração de Grade Flexível
 * Define como uma grade pode ser vendida (completa, meia, mesclada)
 */
export interface FlexibleGradeConfig {
  // ===== MODOS DE VENDA HABILITADOS =====
  /** Permite venda de grade completa */
  allow_full_grade: boolean;
  /** Permite venda de meia grade */
  allow_half_grade: boolean;
  /** Permite mesclagem personalizada pelo cliente */
  allow_custom_mix: boolean;

  // ===== CONFIGURAÇÕES DE MEIA GRADE =====
  /** Percentual da grade completa (25-75%) */
  half_grade_percentage: number;
  /** Mínimo de pares para meia grade */
  half_grade_min_pairs: number;
  /** Como distribuir os tamanhos na meia grade */
  half_grade_distribution: GradeDistributionMode;
  /** Tamanhos específicos para meia grade (se custom) */
  half_grade_custom_sizes?: string[];
  /** Quantidades específicas para meia grade (se custom) */
  half_grade_custom_pairs?: number[];

  // ===== CONFIGURAÇÕES DE MESCLAGEM =====
  /** Mínimo de pares na mesclagem personalizada */
  custom_mix_min_pairs: number;
  /** Máximo de cores diferentes permitidas */
  custom_mix_max_colors: number;
  /** Permite escolher qualquer tamanho disponível */
  custom_mix_allow_any_size: boolean;
  /** Tamanhos fixos predefinidos para mesclagem */
  custom_mix_preset_sizes?: string[];

  // ===== PRECIFICAÇÃO =====
  /** Modo de precificação */
  pricing_mode: GradePricingMode;
  /** Desconto percentual para meia grade (0-100) */
  half_grade_discount_percentage?: number;
  /** Ajuste de preço para mesclagem (positivo ou negativo) */
  custom_mix_price_adjustment?: number;

  // ===== INTEGRAÇÃO COM PRICE TIERS =====
  /** Aplicar descontos por quantidade dos tiers */
  apply_quantity_tiers: boolean;
  /** Como calcular tier: por par ou por grade */
  tier_calculation_mode: TierCalculationMode;
}

/**
 * Configuração padrão para Grade Flexível
 */
export const DEFAULT_FLEXIBLE_GRADE_CONFIG: FlexibleGradeConfig = {
  // Modos de venda
  allow_full_grade: true,
  allow_half_grade: false,
  allow_custom_mix: false,

  // Meia grade
  half_grade_percentage: 50,
  half_grade_min_pairs: 6,
  half_grade_distribution: 'proportional',

  // Mesclagem
  custom_mix_min_pairs: 3,
  custom_mix_max_colors: 3,
  custom_mix_allow_any_size: true,

  // Precificação
  pricing_mode: 'unit_based',
  half_grade_discount_percentage: 0,
  custom_mix_price_adjustment: 0,

  // Price tiers
  apply_quantity_tiers: true,
  tier_calculation_mode: 'per_pair',
};

/**
 * Seleção customizada de grade
 * Representa a escolha do cliente ao montar grade personalizada
 */
export interface CustomGradeSelection {
  /** Itens selecionados */
  items: CustomGradeItem[];
  /** Total de pares */
  totalPairs: number;
  /** Atende o mínimo requerido? */
  meetsMinimum: boolean;
  /** Estimativa de preço (se disponível) */
  estimatedPrice?: number;
}

/**
 * Item individual na seleção customizada
 */
export interface CustomGradeItem {
  /** Cor do item */
  color: string;
  /** Tamanho do item */
  size: string;
  /** Quantidade de pares */
  quantity: number;
  /** Preço unitário (opcional) */
  unitPrice?: number;
}

/**
 * Resultado de validação
 */
export interface ValidationResult {
  /** Validação passou? */
  isValid: boolean;
  /** Mensagens de erro */
  errors: string[];
  /** Avisos (não bloqueiam) */
  warnings: string[];
}

/**
 * Resultado de validação de estoque
 */
export interface StockValidationResult extends ValidationResult {
  /** Estoque disponível */
  availableStock: number;
  /** Estoque solicitado */
  requestedStock: number;
  /** Itens com estoque insuficiente */
  insufficientItems?: Array<{
    color: string;
    size: string;
    available: number;
    requested: number;
  }>;
}

/**
 * Informações sobre meia grade calculada
 */
export interface HalfGradeInfo {
  /** Tamanhos incluídos */
  sizes: string[];
  /** Quantidades por tamanho */
  pairs: number[];
  /** Total de pares */
  totalPairs: number;
  /** Percentual da grade completa */
  percentage: number;
}

/**
 * Helper para verificar se uma grade tem configuração flexível
 */
export function hasFlexibleConfig(
  variation: { flexible_grade_config?: FlexibleGradeConfig | null }
): boolean {
  return variation.flexible_grade_config != null;
}

/**
 * Helper para verificar se permite múltiplas opções de compra
 */
export function allowsMultiplePurchaseOptions(
  config: FlexibleGradeConfig | null | undefined
): boolean {
  if (!config) return false;
  const activeOptions = [
    config.allow_full_grade,
    config.allow_half_grade,
    config.allow_custom_mix,
  ].filter(Boolean);
  return activeOptions.length > 1;
}

/**
 * Calcular informações da meia grade baseado na configuração
 */
export function calculateHalfGradeInfo(
  fullGradeSizes: string[],
  fullGradePairs: number[],
  config: FlexibleGradeConfig
): HalfGradeInfo {
  if (config.half_grade_distribution === 'custom' && config.half_grade_custom_sizes) {
    // Usar tamanhos customizados
    return {
      sizes: config.half_grade_custom_sizes,
      pairs: config.half_grade_custom_pairs || [],
      totalPairs: config.half_grade_custom_pairs?.reduce((a, b) => a + b, 0) || 0,
      percentage: config.half_grade_percentage,
    };
  }

  // Distribuição proporcional
  const targetPercentage = config.half_grade_percentage / 100;
  const totalPairs = fullGradePairs.reduce((a, b) => a + b, 0);
  const targetPairs = Math.round(totalPairs * targetPercentage);

  // Calcular quantidades proporcionais
  const halfPairs = fullGradePairs.map(pairs =>
    Math.max(1, Math.round(pairs * targetPercentage))
  );

  // Ajustar para atingir o total exato
  let currentTotal = halfPairs.reduce((a, b) => a + b, 0);
  while (currentTotal !== targetPairs && currentTotal > 0) {
    if (currentTotal < targetPairs) {
      // Adicionar 1 ao tamanho com mais pares
      const maxIndex = halfPairs.indexOf(Math.max(...halfPairs));
      halfPairs[maxIndex]++;
      currentTotal++;
    } else {
      // Remover 1 do tamanho com mais pares (mas manter mínimo de 1)
      const maxIndex = halfPairs.indexOf(Math.max(...halfPairs.filter(p => p > 1)));
      if (maxIndex >= 0 && halfPairs[maxIndex] > 1) {
        halfPairs[maxIndex]--;
        currentTotal--;
      } else {
        break;
      }
    }
  }

  return {
    sizes: fullGradeSizes,
    pairs: halfPairs,
    totalPairs: halfPairs.reduce((a, b) => a + b, 0),
    percentage: config.half_grade_percentage,
  };
}

/**
 * Validar CustomGradeSelection
 */
export function validateCustomSelection(
  selection: CustomGradeSelection,
  config: FlexibleGradeConfig
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar quantidade mínima
  if (selection.totalPairs < config.custom_mix_min_pairs) {
    errors.push(
      `Quantidade mínima é ${config.custom_mix_min_pairs} pares. Você selecionou ${selection.totalPairs}.`
    );
  }

  // Validar número de cores
  const uniqueColors = new Set(selection.items.map(item => item.color));
  if (uniqueColors.size > config.custom_mix_max_colors) {
    errors.push(
      `Máximo de ${config.custom_mix_max_colors} cores diferentes. Você selecionou ${uniqueColors.size}.`
    );
  }

  // Validar tamanhos (se restrito)
  if (!config.custom_mix_allow_any_size && config.custom_mix_preset_sizes) {
    const invalidSizes = selection.items.filter(
      item => !config.custom_mix_preset_sizes!.includes(item.size)
    );
    if (invalidSizes.length > 0) {
      errors.push(
        `Tamanhos permitidos: ${config.custom_mix_preset_sizes.join(', ')}. ` +
        `Tamanhos inválidos: ${invalidSizes.map(i => i.size).join(', ')}`
      );
    }
  }

  // Avisos
  if (selection.totalPairs < 6) {
    warnings.push(
      'Quantidades baixas podem ter custo unitário maior. Considere aumentar para obter melhor preço.'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

