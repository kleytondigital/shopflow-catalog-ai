
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Variation {
  color?: string;
  size?: string;
  stock: number;
  price_adjustment: number;
  sku?: string;
}

interface ProductVariationsFormProps {
  variations: Variation[];
  onVariationsChange: (variations: Variation[]) => void;
}

const ProductVariationsForm = ({ variations, onVariationsChange }: ProductVariationsFormProps) => {
  const [newVariation, setNewVariation] = useState<Variation>({
    color: '',
    size: '',
    stock: 0,
    price_adjustment: 0,
    sku: ''
  });

  const addVariation = () => {
    if (!newVariation.color && !newVariation.size) return;
    
    onVariationsChange([...variations, newVariation]);
    setNewVariation({
      color: '',
      size: '',
      stock: 0,
      price_adjustment: 0,
      sku: ''
    });
  };

  const removeVariation = (index: number) => {
    const updatedVariations = variations.filter((_, i) => i !== index);
    onVariationsChange(updatedVariations);
  };

  const updateVariation = (index: number, field: keyof Variation, value: string | number) => {
    const updatedVariations = variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    );
    onVariationsChange(updatedVariations);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Variações do Produto</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione diferentes cores e tamanhos para o seu produto
        </p>
      </div>

      {/* Lista de variações existentes */}
      {variations.length > 0 && (
        <div className="space-y-3">
          {variations.map((variation, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  {variation.color && (
                    <Badge variant="outline">{variation.color}</Badge>
                  )}
                  {variation.size && (
                    <Badge variant="outline">{variation.size}</Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariation(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor={`color-${index}`}>Cor</Label>
                  <Input
                    id={`color-${index}`}
                    value={variation.color || ''}
                    onChange={(e) => updateVariation(index, 'color', e.target.value)}
                    placeholder="Ex: Azul"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`size-${index}`}>Tamanho</Label>
                  <Input
                    id={`size-${index}`}
                    value={variation.size || ''}
                    onChange={(e) => updateVariation(index, 'size', e.target.value)}
                    placeholder="Ex: M"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`stock-${index}`}>Estoque</Label>
                  <Input
                    id={`stock-${index}`}
                    type="number"
                    value={variation.stock}
                    onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`price-${index}`}>Ajuste Preço (R$)</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    step="0.01"
                    value={variation.price_adjustment}
                    onChange={(e) => updateVariation(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário para nova variação */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h4 className="font-medium mb-3">Adicionar Nova Variação</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <Label htmlFor="new-color">Cor</Label>
            <Input
              id="new-color"
              value={newVariation.color || ''}
              onChange={(e) => setNewVariation({ ...newVariation, color: e.target.value })}
              placeholder="Ex: Azul"
            />
          </div>
          
          <div>
            <Label htmlFor="new-size">Tamanho</Label>
            <Input
              id="new-size"
              value={newVariation.size || ''}
              onChange={(e) => setNewVariation({ ...newVariation, size: e.target.value })}
              placeholder="Ex: M"
            />
          </div>
          
          <div>
            <Label htmlFor="new-stock">Estoque</Label>
            <Input
              id="new-stock"
              type="number"
              value={newVariation.stock}
              onChange={(e) => setNewVariation({ ...newVariation, stock: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <Label htmlFor="new-price">Ajuste Preço (R$)</Label>
            <Input
              id="new-price"
              type="number"
              step="0.01"
              value={newVariation.price_adjustment}
              onChange={(e) => setNewVariation({ ...newVariation, price_adjustment: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        
        <Button
          type="button"
          onClick={addVariation}
          disabled={!newVariation.color && !newVariation.size}
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Adicionar Variação
        </Button>
      </div>
    </div>
  );
};

export default ProductVariationsForm;
