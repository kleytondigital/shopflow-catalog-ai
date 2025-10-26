/**
 * Hook para cálculo de preços de grades flexíveis
 * 
 * Calcula preços considerando:
 * - Modo de venda (completa, meia, custom)
 * - Price tiers da loja
 * - Descontos configurados
 * - Ajustes de preço
 */

import { useMemo } from "react";
import type { ProductVariation } from "@/types/product";
import type {
  FlexibleGradeConfig,
  CustomGradeSelection,
  HalfGradeInfo,
} from "@/types/flexible-grade";
import { calculateHalfGradeInfo } from "@/types/flexible-grade";
import type { ProductPriceTier } from "@/types/product";

export interface UseFlexibleGradePriceParams {
  /** Variação de grade */
  variation: ProductVariation;
  /** Modo de venda selecionado */
  mode: 'full' | 'half' | 'custom';
  /** Seleção customizada (se mode === 'custom') */
  customSelection?: CustomGradeSelection;
  /** Preço base unitário */
  basePrice: number;
  /** Tiers de preço (opcional) */
  priceTiers?: ProductPriceTier[];
}

export interface FlexibleGradePriceResult {
  /** Preço base antes de descontos */
  basePrice: number;
  /** Preço unitário por par */
  unitPrice: number;
  /** Preço total final */
  totalPrice: number;
  /** Quantidade total de pares */
  totalPairs: number;
  /** Desconto aplicado */
  discount: {
    amount: number;
    percentage: number;
    reason: string;
  };
  /** Tier aplicado (se houver) */
  appliedTier?: {
    name: string;
    minQuantity: number;
    price: number;
  };
  /** Informações sobre o próximo tier */
  nextTierInfo?: {
    pairsNeeded: number;
    potentialSaving: number;
    tierName: string;
  };
  /** Economia em relação à grade completa */
  savingsVsFullGrade?: {
    amount: number;
    percentage: number;
  };
}

/**
 * Hook principal para cálculo de preços de grades flexíveis
 */
export function useFlexibleGradePrice(
  params: UseFlexibleGradePriceParams
): FlexibleGradePriceResult {
  const {
    variation,
    mode,
    customSelection,
    basePrice,
    priceTiers = [],
  } = params;

  const config = variation.flexible_grade_config;

  return useMemo(() => {
    // Validar configuração
    if (!config) {
      console.warn('useFlexibleGradePrice: No flexible config found');
      return createDefaultResult(basePrice, variation.grade_quantity || 0);
    }

    // Calcular baseado no modo
    switch (mode) {
      case 'full':
        return calculateFullGradePrice(variation, basePrice, config, priceTiers);
      
      case 'half':
        return calculateHalfGradePrice(variation, basePrice, config, priceTiers);
      
      case 'custom':
        if (!customSelection) {
          console.warn('useFlexibleGradePrice: Custom mode requires customSelection');
          return createDefaultResult(basePrice, 0);
        }
        return calculateCustomGradePrice(
          variation,
          customSelection,
          basePrice,
          config,
          priceTiers
        );
      
      default:
        return createDefaultResult(basePrice, variation.grade_quantity || 0);
    }
  }, [variation, mode, customSelection, basePrice, config, priceTiers]);
}

/**
 * Calcular preço para grade completa
 */
function calculateFullGradePrice(
  variation: ProductVariation,
  basePrice: number,
  config: FlexibleGradeConfig,
  priceTiers: ProductPriceTier[]
): FlexibleGradePriceResult {
  const totalPairs = variation.grade_quantity || 0;
  let unitPrice = basePrice;
  let appliedTier: FlexibleGradePriceResult['appliedTier'] = undefined;

  // Aplicar tier se configurado
  if (config.apply_quantity_tiers && priceTiers.length > 0) {
    const tierResult = findApplicableTier(
      totalPairs,
      priceTiers,
      config.tier_calculation_mode
    );
    
    if (tierResult) {
      unitPrice = tierResult.price;
      appliedTier = {
        name: tierResult.name,
        minQuantity: tierResult.minQuantity,
        price: tierResult.price,
      };
    }
  }

  const totalPrice = unitPrice * totalPairs;
  const baseTotalPrice = basePrice * totalPairs;
  const discountAmount = baseTotalPrice - totalPrice;
  const discountPercentage = baseTotalPrice > 0 
    ? (discountAmount / baseTotalPrice) * 100 
    : 0;

  // Calcular próximo tier
  const nextTierInfo = calculateNextTierInfo(
    totalPairs,
    unitPrice,
    priceTiers,
    config.tier_calculation_mode
  );

  return {
    basePrice: baseTotalPrice,
    unitPrice,
    totalPrice,
    totalPairs,
    discount: {
      amount: discountAmount,
      percentage: discountPercentage,
      reason: appliedTier 
        ? `Desconto de quantidade (${appliedTier.name})` 
        : 'Sem desconto',
    },
    appliedTier,
    nextTierInfo,
  };
}

/**
 * Calcular preço para meia grade
 */
function calculateHalfGradePrice(
  variation: ProductVariation,
  basePrice: number,
  config: FlexibleGradeConfig,
  priceTiers: ProductPriceTier[]
): FlexibleGradePriceResult {
  // Calcular informações da meia grade
  const halfGradeInfo: HalfGradeInfo | null = 
    variation.grade_sizes && variation.grade_pairs
      ? calculateHalfGradeInfo(variation.grade_sizes, variation.grade_pairs, config)
      : null;

  if (!halfGradeInfo) {
    console.warn('calculateHalfGradePrice: Could not calculate half grade info');
    return createDefaultResult(basePrice, 0);
  }

  const totalPairs = halfGradeInfo.totalPairs;

  // Aplicar desconto de meia grade
  const halfGradeDiscount = (config.half_grade_discount_percentage || 0) / 100;
  let unitPrice = basePrice * (1 - halfGradeDiscount);

  let appliedTier: FlexibleGradePriceResult['appliedTier'] = undefined;

  // Aplicar tier se configurado
  if (config.apply_quantity_tiers && priceTiers.length > 0) {
    const tierResult = findApplicableTier(
      totalPairs,
      priceTiers,
      config.tier_calculation_mode
    );
    
    if (tierResult) {
      // Usar o menor preço entre tier e desconto de meia grade
      const tierPrice = tierResult.price * (1 - halfGradeDiscount);
      if (tierPrice < unitPrice) {
        unitPrice = tierPrice;
        appliedTier = {
          name: tierResult.name,
          minQuantity: tierResult.minQuantity,
          price: tierResult.price,
        };
      }
    }
  }

  const totalPrice = unitPrice * totalPairs;
  const baseTotalPrice = basePrice * totalPairs;
  const discountAmount = baseTotalPrice - totalPrice;
  const discountPercentage = baseTotalPrice > 0 
    ? (discountAmount / baseTotalPrice) * 100 
    : 0;

  // Calcular economia vs grade completa
  const fullGradePrice = calculateFullGradePrice(variation, basePrice, config, priceTiers);
  const savingsVsFullGrade = {
    amount: fullGradePrice.totalPrice - totalPrice,
    percentage: fullGradePrice.totalPrice > 0
      ? ((fullGradePrice.totalPrice - totalPrice) / fullGradePrice.totalPrice) * 100
      : 0,
  };

  // Calcular próximo tier
  const nextTierInfo = calculateNextTierInfo(
    totalPairs,
    unitPrice,
    priceTiers,
    config.tier_calculation_mode
  );

  return {
    basePrice: baseTotalPrice,
    unitPrice,
    totalPrice,
    totalPairs,
    discount: {
      amount: discountAmount,
      percentage: discountPercentage,
      reason: halfGradeDiscount > 0
        ? `Desconto de meia grade (${config.half_grade_discount_percentage}%)${appliedTier ? ` + ${appliedTier.name}` : ''}`
        : appliedTier
        ? `Desconto de quantidade (${appliedTier.name})`
        : 'Sem desconto',
    },
    appliedTier,
    nextTierInfo,
    savingsVsFullGrade,
  };
}

/**
 * Calcular preço para grade customizada
 */
function calculateCustomGradePrice(
  variation: ProductVariation,
  selection: CustomGradeSelection,
  basePrice: number,
  config: FlexibleGradeConfig,
  priceTiers: ProductPriceTier[]
): FlexibleGradePriceResult {
  const totalPairs = selection.totalPairs;

  // Aplicar ajuste de preço para mesclagem
  const priceAdjustment = config.custom_mix_price_adjustment || 0;
  let unitPrice = basePrice + priceAdjustment;

  let appliedTier: FlexibleGradePriceResult['appliedTier'] = undefined;

  // Aplicar tier se configurado
  if (config.apply_quantity_tiers && priceTiers.length > 0) {
    const tierResult = findApplicableTier(
      totalPairs,
      priceTiers,
      config.tier_calculation_mode
    );
    
    if (tierResult) {
      // Aplicar tier + ajuste
      unitPrice = tierResult.price + priceAdjustment;
      appliedTier = {
        name: tierResult.name,
        minQuantity: tierResult.minQuantity,
        price: tierResult.price,
      };
    }
  }

  const totalPrice = unitPrice * totalPairs;
  const baseTotalPrice = basePrice * totalPairs;
  const discountAmount = baseTotalPrice - totalPrice;
  const discountPercentage = baseTotalPrice > 0 
    ? (discountAmount / baseTotalPrice) * 100 
    : 0;

  // Calcular economia vs grade completa
  const fullGradePrice = calculateFullGradePrice(variation, basePrice, config, priceTiers);
  const savingsVsFullGrade = {
    amount: fullGradePrice.totalPrice - totalPrice,
    percentage: fullGradePrice.totalPrice > 0
      ? ((fullGradePrice.totalPrice - totalPrice) / fullGradePrice.totalPrice) * 100
      : 0,
  };

  // Calcular próximo tier
  const nextTierInfo = calculateNextTierInfo(
    totalPairs,
    unitPrice,
    priceTiers,
    config.tier_calculation_mode
  );

  return {
    basePrice: baseTotalPrice,
    unitPrice,
    totalPrice,
    totalPairs,
    discount: {
      amount: discountAmount,
      percentage: discountPercentage,
      reason: appliedTier
        ? `Desconto de quantidade (${appliedTier.name})`
        : priceAdjustment !== 0
        ? `Ajuste de mesclagem (${priceAdjustment > 0 ? '+' : ''}R$ ${Math.abs(priceAdjustment).toFixed(2)})`
        : 'Sem desconto',
    },
    appliedTier,
    nextTierInfo,
    savingsVsFullGrade,
  };
}

/**
 * Encontrar tier aplicável
 */
function findApplicableTier(
  quantity: number,
  tiers: ProductPriceTier[],
  mode: 'per_pair' | 'per_grade'
): ProductPriceTier | null {
  if (tiers.length === 0) return null;

  // Ordenar tiers por quantidade mínima (decrescente)
  const sortedTiers = [...tiers]
    .filter(t => t.is_active !== false)
    .sort((a, b) => b.min_quantity - a.min_quantity);

  // Encontrar o tier apropriado
  for (const tier of sortedTiers) {
    if (quantity >= tier.min_quantity) {
      return tier;
    }
  }

  return null;
}

/**
 * Calcular informações sobre o próximo tier
 */
function calculateNextTierInfo(
  currentQuantity: number,
  currentPrice: number,
  tiers: ProductPriceTier[],
  mode: 'per_pair' | 'per_grade'
): FlexibleGradePriceResult['nextTierInfo'] {
  if (tiers.length === 0) return undefined;

  // Encontrar próximo tier disponível
  const nextTier = tiers
    .filter(t => t.is_active !== false && t.min_quantity > currentQuantity)
    .sort((a, b) => a.min_quantity - b.min_quantity)[0];

  if (!nextTier) return undefined;

  const pairsNeeded = nextTier.min_quantity - currentQuantity;
  const potentialSaving = (currentPrice - nextTier.price) * nextTier.min_quantity;

  return {
    pairsNeeded,
    potentialSaving,
    tierName: nextTier.tier_name,
  };
}

/**
 * Criar resultado padrão
 */
function createDefaultResult(
  basePrice: number,
  totalPairs: number
): FlexibleGradePriceResult {
  const totalPrice = basePrice * totalPairs;

  return {
    basePrice: totalPrice,
    unitPrice: basePrice,
    totalPrice,
    totalPairs,
    discount: {
      amount: 0,
      percentage: 0,
      reason: 'Sem desconto',
    },
  };
}

