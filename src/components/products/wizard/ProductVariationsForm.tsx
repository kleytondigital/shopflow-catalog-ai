
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProductVariation } from '@/types/variation';
import ProductVariationsManager from '../ProductVariationsManager';
import HierarchicalVariationsManager from '../HierarchicalVariationsManager';
import { Settings, Layers } from 'lucide-react';

interface ProductVariationsFormProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
}

const ProductVariationsForm: React.FC<ProductVariationsFormProps> = ({
  variations,
  onVariationsChange,
  productId
}) => {
  const [systemType, setSystemType] = useState<'simple' | 'hierarchical'>('hierarchical');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Variações do Produto</h3>
        <p className="text-sm text-muted-foreground">
          Configure diferentes versões do seu produto com preços, estoques e características próprias.
        </p>
      </div>

      <Tabs value={systemType} onValueChange={(value) => setSystemType(value as 'simple' | 'hierarchical')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hierarchical" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Sistema Hierárquico
            <Badge variant="secondary" className="ml-1">Recomendado</Badge>
          </TabsTrigger>
          <TabsTrigger value="simple" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Sistema Simples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchical" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Sistema Hierárquico de Variações
                <Badge variant="default">Novo</Badge>
              </CardTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✅ <strong>Ideal para produtos com múltiplas características</strong> (ex: cor + tamanho)</p>
                <p>✅ <strong>Cadastro 10x mais rápido</strong> para produtos com muitas variações</p>
                <p>✅ <strong>Experiência melhor</strong> para o cliente no catálogo</p>
                <p>✅ <strong>Gestão organizada</strong> de estoque por grupo</p>
              </div>
            </CardHeader>
            <CardContent>
              <HierarchicalVariationsManager
                productId={productId}
                variations={variations}
                onChange={onVariationsChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simple" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Sistema Simples de Variações
              </CardTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Cada variação é cadastrada individualmente</p>
                <p>• Adequado para produtos com poucas variações</p>
                <p>• Sistema tradicional</p>
              </div>
            </CardHeader>
            <CardContent>
              <ProductVariationsManager
                variations={variations}
                onChange={onVariationsChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              <p>Variações ativas: <strong>{variations.filter(v => v.is_active).length}</strong></p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductVariationsForm;
