
import { supabase } from '@/integrations/supabase/client';

// Função para normalizar texto (remover acentos, espaços, etc)
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Substitui caracteres especiais por hífen
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
};

// Função para verificar se SKU já existe
export const checkSKUExists = async (sku: string, excludeProductId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('products')
      .select('id')
      .eq('sku', sku);

    if (excludeProductId) {
      query = query.neq('id', excludeProductId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao verificar SKU:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar SKU:', error);
    return false;
  }
};

// Função para verificar se SKU de variação já existe
export const checkVariationSKUExists = async (sku: string, excludeVariationId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from('product_variations')
      .select('id')
      .eq('sku', sku);

    if (excludeVariationId) {
      query = query.neq('id', excludeVariationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao verificar SKU de variação:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar SKU de variação:', error);
    return false;
  }
};

// Função para gerar SKU base do produto
export const generateProductSKU = async (productName: string, category?: string, excludeProductId?: string): Promise<string> => {
  const baseName = normalizeText(productName);
  const baseCategory = category ? normalizeText(category) : '';
  
  let baseSKU = '';
  
  if (baseCategory) {
    baseSKU = `${baseCategory.substring(0, 3)}-${baseName.substring(0, 10)}`;
  } else {
    baseSKU = baseName.substring(0, 15);
  }

  // Verificar se SKU base já existe
  const exists = await checkSKUExists(baseSKU, excludeProductId);
  
  if (!exists) {
    return baseSKU;
  }

  // Se existir, adicionar sufixo numérico
  let counter = 1;
  let newSKU = `${baseSKU}-${counter}`;
  
  while (await checkSKUExists(newSKU, excludeProductId)) {
    counter++;
    newSKU = `${baseSKU}-${counter}`;
  }
  
  return newSKU;
};

// Função para gerar SKU de variação
export const generateVariationSKU = async (
  productSKU: string,
  variationData: {
    color?: string;
    size?: string;
    material?: string;
    variation_value?: string;
  },
  excludeVariationId?: string
): Promise<string> => {
  const parts = [productSKU];
  
  if (variationData.color) {
    parts.push(normalizeText(variationData.color).substring(0, 3));
  }
  
  if (variationData.size) {
    parts.push(normalizeText(variationData.size).substring(0, 3));
  }
  
  if (variationData.material) {
    parts.push(normalizeText(variationData.material).substring(0, 3));
  }
  
  if (variationData.variation_value) {
    parts.push(normalizeText(variationData.variation_value).substring(0, 3));
  }
  
  let baseSKU = parts.join('-');
  
  // Verificar se SKU já existe
  const exists = await checkVariationSKUExists(baseSKU, excludeVariationId);
  
  if (!exists) {
    return baseSKU;
  }

  // Se existir, adicionar sufixo numérico
  let counter = 1;
  let newSKU = `${baseSKU}-${counter}`;
  
  while (await checkVariationSKUExists(newSKU, excludeVariationId)) {
    counter++;
    newSKU = `${baseSKU}-${counter}`;
  }
  
  return newSKU;
};

// Função para gerar SKU único (compatibilidade)
export const generateUniqueSKU = (
  productName: string, 
  variationData?: { 
    color?: string; 
    size?: string; 
    name?: string; 
    index?: number;
  }
): string => {
  const baseName = normalizeText(productName);
  const parts = [baseName.substring(0, 8)];
  
  if (variationData?.color) {
    parts.push(normalizeText(variationData.color).substring(0, 3));
  }
  
  if (variationData?.size) {
    parts.push(normalizeText(variationData.size).substring(0, 3));
  }
  
  if (variationData?.index !== undefined) {
    parts.push(String(variationData.index + 1).padStart(2, '0'));
  }
  
  return parts.join('-').toUpperCase();
};

// Função para gerar SKUs em lote
export const generateBatchSKUs = (
  productName: string,
  variations: Array<{ color?: string; size?: string; name?: string }>
): string[] => {
  return variations.map((variation, index) => 
    generateUniqueSKU(productName, { ...variation, index })
  );
};

// Função para validar unicidade de SKUs
export const validateSKUUniqueness = (skus: string[]): boolean => {
  const uniqueSkus = new Set(skus);
  return uniqueSkus.size === skus.length;
};

// Função para sugerir SKU (usada em tempo real nos forms)
export const suggestSKU = async (input: string, type: 'product' | 'variation' = 'product'): Promise<string> => {
  const normalized = normalizeText(input);
  
  if (type === 'product') {
    return await generateProductSKU(input);
  } else {
    // Para variações, retorna apenas a versão normalizada
    // O SKU completo será gerado quando o produto for salvo
    return normalized.substring(0, 10);
  }
};

// Função para validar formato de SKU
export const validateSKUFormat = (sku: string): boolean => {
  // SKU deve ter entre 3 e 50 caracteres, apenas letras, números e hífens
  const skuRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,49}$/;
  return skuRegex.test(sku);
};

// Função para limpar e formatar SKU inserido manualmente
export const formatSKU = (sku: string): string => {
  return sku
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '') // Remove caracteres inválidos
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
};
