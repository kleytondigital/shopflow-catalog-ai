
export interface VariationGroup {
  id?: string;
  product_id: string;
  primary_attribute: string;
  secondary_attribute?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HierarchicalVariation {
  id?: string;
  product_id?: string;
  variation_group_id?: string;
  parent_variation_id?: string;
  variation_type: 'main' | 'sub' | 'simple';
  variation_value: string; // 'Azul', '35', etc.
  color?: string | null;
  size?: string | null;
  sku?: string | null;
  stock: number;
  price_adjustment: number;
  is_active: boolean;
  image_url?: string | null;
  image_file?: File;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  // Para subvariações, referência à variação pai
  children?: HierarchicalVariation[];
}

export interface ProductVariation {
  id?: string;
  product_id?: string;
  color?: string | null;
  size?: string | null;
  sku?: string | null;
  stock: number;
  price_adjustment: number;
  is_active: boolean;
  image_url?: string | null;
  image_file?: File;
  created_at?: string;
  updated_at?: string;
}

export interface VariationFormData {
  color?: string;
  size?: string;
  sku?: string;
  stock: number;
  price_adjustment: number;
  is_active: boolean;
  image_url?: string;
  image_file?: File;
}

// Interface para compatibilidade com formulários existentes
export interface LegacyProductVariation {
  color?: string;
  size?: string;
  sku?: string;
  stock: number;
  price_adjustment: number;
}

// Tipos para o sistema hierárquico
export type VariationAttribute = 'color' | 'size' | 'material' | 'style' | 'weight';

export interface VariationTemplate {
  primary: VariationAttribute;
  secondary?: VariationAttribute;
  label: string;
  description: string;
}

export const VARIATION_TEMPLATES: VariationTemplate[] = [
  {
    primary: 'color',
    secondary: 'size',
    label: 'Cor + Tamanho',
    description: 'Para roupas, calçados, etc.'
  },
  {
    primary: 'size',
    label: 'Apenas Tamanho',
    description: 'Para produtos com tamanhos únicos'
  },
  {
    primary: 'color',
    label: 'Apenas Cor',
    description: 'Para produtos com cores diferentes'
  },
  {
    primary: 'material',
    secondary: 'color',
    label: 'Material + Cor',
    description: 'Para produtos artesanais'
  }
];
