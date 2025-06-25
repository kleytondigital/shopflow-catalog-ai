
import React from 'react';
import ProductVariationsManager from '../ProductVariationsManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductVariation } from '@/types/variation';

interface ProductVariationsFormProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
}

const ProductVariationsForm: React.FC<ProductVariationsFormProps> = ({
  variations,
  onVariationsChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Variações do Produto</h3>
        <p className="text-sm text-muted-foreground">
          Adicione variações como tamanhos, cores ou materiais para seu produto.
          Cada variação pode ter ajuste de preço, estoque próprio e imagem específica.
        </p>
      </div>

      <ProductVariationsManager
        variations={variations}
        onChange={onVariationsChange}
      />

      {variations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo das Variações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Total de variações: <strong>{variations.length}</strong></p>
              <p>Estoque total das variações: <strong>{variations.reduce((sum, v) => sum + v.stock, 0)}</strong></p>
              <p>Variações com imagem própria: <strong>{variations.filter(v => v.image_url || v.image_file).length}</strong></p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductVariationsForm;
