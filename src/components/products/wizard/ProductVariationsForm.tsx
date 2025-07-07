
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import ProductVariationsManager from '../ProductVariationsManager';
import { ProductVariation } from '@/types/product';

interface ProductVariationsFormProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
}

const ProductVariationsForm: React.FC<ProductVariationsFormProps> = ({
  variations,
  onVariationsChange,
  productId,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Variações do Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProductVariationsManager
          variations={variations}
          onChange={onVariationsChange}
        />
      </CardContent>
    </Card>
  );
};

export default ProductVariationsForm;
