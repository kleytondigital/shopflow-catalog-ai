
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Package } from 'lucide-react';

export interface ProductVariation {
  id?: string;
  name: string;
  type: 'size' | 'color' | 'material' | 'other';
  sku?: string;
  price_adjustment: number;
  stock: number;
  is_active: boolean;
}

interface ProductVariationsManagerProps {
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
  disabled?: boolean;
}

const ProductVariationsManager: React.FC<ProductVariationsManagerProps> = ({
  variations,
  onChange,
  disabled = false
}) => {
  const [newVariation, setNewVariation] = useState<Partial<ProductVariation>>({
    name: '',
    type: 'other',
    price_adjustment: 0,
    stock: 0,
    is_active: true
  });

  const handleAddVariation = () => {
    if (!newVariation.name?.trim()) return;

    const variation: ProductVariation = {
      id: `temp-${Date.now()}`,
      name: newVariation.name.trim(),
      type: newVariation.type as ProductVariation['type'],
      price_adjustment: Number(newVariation.price_adjustment) || 0,
      stock: Number(newVariation.stock) || 0,
      is_active: true
    };

    onChange([...variations, variation]);
    setNewVariation({
      name: '',
      type: 'other',
      price_adjustment: 0,
      stock: 0,
      is_active: true
    });
  };

  const handleRemoveVariation = (index: number) => {
    const updated = variations.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getVariationTypeLabel = (type: string) => {
    const labels = {
      size: 'Tamanho',
      color: 'Cor',
      material: 'Material',
      other: 'Outro'
    };
    return labels[type as keyof typeof labels] || 'Outro';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Variações do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de variações existentes */}
        {variations.length > 0 && (
          <div className="space-y-3">
            {variations.map((variation, index) => (
              <div key={variation.id || index} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getVariationTypeLabel(variation.type)}
                    </Badge>
                    <span className="font-medium">{variation.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVariation(index)}
                    disabled={disabled}
                    className="transition-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Ajuste de Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variation.price_adjustment}
                      onChange={(e) => handleUpdateVariation(index, 'price_adjustment', Number(e.target.value))}
                      disabled={disabled}
                      placeholder="0.00"
                      className="transition-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Estoque</Label>
                    <Input
                      type="number"
                      value={variation.stock}
                      onChange={(e) => handleUpdateVariation(index, 'stock', Number(e.target.value))}
                      disabled={disabled}
                      placeholder="0"
                      className="transition-none"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">SKU (Opcional)</Label>
                    <Input
                      value={variation.sku || ''}
                      onChange={(e) => handleUpdateVariation(index, 'sku', e.target.value)}
                      disabled={disabled}
                      placeholder="SKU-001"
                      className="transition-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulário para nova variação */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Adicionar Nova Variação</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <Label>Tipo de Variação</Label>
              <Select 
                value={newVariation.type} 
                onValueChange={(value) => setNewVariation(prev => ({ ...prev, type: value as ProductVariation['type'] }))}
                disabled={disabled}
              >
                <SelectTrigger className="transition-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="size">Tamanho</SelectItem>
                  <SelectItem value="color">Cor</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome da Variação</Label>
              <Input
                value={newVariation.name || ''}
                onChange={(e) => setNewVariation(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: P, Azul, Algodão..."
                disabled={disabled}
                className="transition-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <Label>Ajuste de Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={newVariation.price_adjustment || 0}
                onChange={(e) => setNewVariation(prev => ({ ...prev, price_adjustment: Number(e.target.value) }))}
                placeholder="0.00"
                disabled={disabled}
                className="transition-none"
              />
            </div>
            <div>
              <Label>Estoque Inicial</Label>
              <Input
                type="number"
                value={newVariation.stock || 0}
                onChange={(e) => setNewVariation(prev => ({ ...prev, stock: Number(e.target.value) }))}
                placeholder="0"
                disabled={disabled}
                className="transition-none"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddVariation}
            disabled={!newVariation.name?.trim() || disabled}
            className="w-full transition-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Variação
          </Button>
        </div>

        {variations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma variação adicionada</p>
            <p className="text-sm">Adicione variações como tamanhos, cores ou materiais</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductVariationsManager;
