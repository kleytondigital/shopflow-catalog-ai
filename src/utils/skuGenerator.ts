
/**
 * Utilitário para geração de SKUs únicos com verificação de duplicatas
 */

import { supabase } from '@/integrations/supabase/client';

export const generateUniqueSKU = async (
  productName: string,
  storeId: string,
  variationDetails: {
    color?: string;
    size?: string;
    name?: string;
    index?: number;
  } = {}
): Promise<string> => {
  // Normalizar o nome do produto
  const normalizedProduct = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);

  // Normalizar detalhes da variação
  const { color, size, name, index = 0 } = variationDetails;
  
  let variationPart = '';
  
  if (name) {
    variationPart = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  } else {
    if (color) {
      variationPart += color.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 2);
    }
    if (size) {
      variationPart += size.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 2);
    }
  }

  // Se não tiver variação específica, usar índice
  if (!variationPart) {
    variationPart = String(index + 1).padStart(2, '0');
  }

  // Gerar SKU base
  let baseSKU = `${normalizedProduct}-${variationPart}`;
  let finalSKU = baseSKU;
  let counter = 0;

  // Verificar duplicatas no banco e ajustar se necessário
  while (await checkSKUExists(finalSKU, storeId)) {
    counter++;
    const suffix = counter.toString().padStart(2, '0');
    finalSKU = `${baseSKU}-${suffix}`;
    
    // Evitar loop infinito
    if (counter > 999) {
      const timestamp = Date.now().toString().slice(-4);
      finalSKU = `${baseSKU}-${timestamp}`;
      break;
    }
  }

  return finalSKU;
};

export const checkSKUExists = async (sku: string, storeId: string): Promise<boolean> => {
  try {
    // Verificar na tabela de produtos
    const { data: productData } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .eq('store_id', storeId)
      .maybeSingle();

    if (productData) return true;

    // Verificar na tabela de variações
    const { data: variationData } = await supabase
      .from('product_variations')
      .select('id')
      .eq('sku', sku)
      .single();

    if (variationData) {
      // Verificar se a variação pertence à mesma loja
      const { data: productCheck } = await supabase
        .from('products')
        .select('store_id')
        .eq('id', variationData.product_id)
        .eq('store_id', storeId)
        .maybeSingle();
      
      return !!productCheck;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar SKU:', error);
    return false;
  }
};

export const generateBatchSKUs = async (
  productName: string,
  storeId: string,
  variations: Array<{
    color?: string;
    size?: string;
    name?: string;
  }>
): Promise<string[]> => {
  const skus: string[] = [];

  for (let i = 0; i < variations.length; i++) {
    const variation = variations[i];
    const sku = await generateUniqueSKU(productName, storeId, { 
      ...variation, 
      index: i 
    });
    skus.push(sku);
  }

  return skus;
};

export const validateSKUUniqueness = (skus: string[]): boolean => {
  const uniqueSKUs = new Set(skus);
  return uniqueSKUs.size === skus.length;
};

export const suggestSKU = async (
  productName: string, 
  storeId: string, 
  category?: string
): Promise<string> => {
  const categoryPart = category 
    ? category.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3)
    : '';
  
  const productPart = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, categoryPart ? 4 : 6);

  const baseSKU = categoryPart 
    ? `${categoryPart}-${productPart}`
    : productPart;

  let finalSKU = baseSKU;
  let counter = 1;

  while (await checkSKUExists(finalSKU, storeId)) {
    finalSKU = `${baseSKU}-${counter.toString().padStart(3, '0')}`;
    counter++;
    
    if (counter > 999) {
      const timestamp = Date.now().toString().slice(-4);
      finalSKU = `${baseSKU}-${timestamp}`;
      break;
    }
  }

  return finalSKU;
};
