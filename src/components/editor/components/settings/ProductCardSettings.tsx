import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditorStore } from '../../stores/useEditorStore';

const ProductCardSettings: React.FC = () => {
  const { configuration, updateConfiguration } = useEditorStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Configurações dos Cards de Produto</h3>
        
        {/* Quick View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Visualização Rápida</label>
            <Switch
              checked={Boolean(configuration.productCard.showQuickView)}
              onCheckedChange={(checked) => updateConfiguration('productCard.showQuickView', checked)}
            />
          </div>
          
          {/* Add to Cart Button */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Botão Adicionar ao Carrinho</label>
            <Switch
              checked={Boolean(configuration.productCard.showAddToCart)}
              onCheckedChange={(checked) => updateConfiguration('productCard.showAddToCart', checked)}
            />
          </div>
          
          {/* Card Style */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Estilo do Card</label>
            <Select 
              value={configuration.productCard.productCardStyle} 
              onValueChange={(value) => updateConfiguration('productCard.productCardStyle', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="compact">Compacto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSettings;
