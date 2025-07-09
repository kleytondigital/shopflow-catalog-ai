
import React from 'react';
import ImprovedVariationManager from '@/components/variations/ImprovedVariationManager';
import { ProductVariation } from '@/types/product';

interface FluidVariationsManagerProps {
  productId?: string;
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
}

const FluidVariationsManager: React.FC<FluidVariationsManagerProps> = ({
  productId,
  variations,
  onChange,
}) => {
  console.log('🌊 FLUID VARIATIONS MANAGER - Props:', {
    productId,
    variationsCount: variations.length,
    hasOnChange: !!onChange
  });

  return (
    <ImprovedVariationManager
      variations={variations}
      onVariationsChange={onChange}
    />
  );
};

export default FluidVariationsManager;
