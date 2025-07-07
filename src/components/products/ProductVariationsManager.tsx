
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { ProductVariation } from "@/types/product";

interface ProductVariationsManagerProps {
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
}

const ProductVariationsManager: React.FC<ProductVariationsManagerProps> = ({
  variations,
  onChange,
}) => {
  const [isAddingVariation, setIsAddingVariation] = useState(false);
  const [newVariation, setNewVariation] = useState({
    color: "",
    size: "",
    sku: "",
    stock: 0,
    price_adjustment: 0,
    is_active: true,
    image_url: null,
  });

  const addVariation = () => {
    const variation: ProductVariation = {
      id: `temp-${Date.now()}`,
      product_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newVariation,
    };

    onChange([...variations, variation]);
    setNewVariation({
      color: "",
      size: "",
      sku: "",
      stock: 0,
      price_adjustment: 0,
      is_active: true,
      image_url: null,
    });
    setIsAddingVariation(false);
  };

  const removeVariation = (index: number) => {
    const updatedVariations = variations.filter((_, i) => i !== index);
    onChange(updatedVariations);
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const updatedVariations = variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    );
    onChange(updatedVariations);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Variações do Produto</CardTitle>
        <Button
          onClick={() => setIsAddingVariation(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Variação
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {variations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma variação adicionada</p>
            <p className="text-sm">Clique em "Adicionar Variação" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {variations.map((variation, index) => (
              <div
                key={variation.id || index}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    {variation.color && (
                      <Badge variant="outline">Cor: {variation.color}</Badge>
                    )}
                    {variation.size && (
                      <Badge variant="outline">Tamanho: {variation.size}</Badge>
                    )}
                    {!variation.is_active && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariation(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`color-${index}`}>Cor</Label>
                    <Input
                      id={`color-${index}`}
                      value={variation.color || ""}
                      onChange={(e) => updateVariation(index, "color", e.target.value)}
                      placeholder="Ex: Azul"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`size-${index}`}>Tamanho</Label>
                    <Input
                      id={`size-${index}`}
                      value={variation.size || ""}
                      onChange={(e) => updateVariation(index, "size", e.target.value)}
                      placeholder="Ex: M"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`sku-${index}`}>SKU</Label>
                    <Input
                      id={`sku-${index}`}
                      value={variation.sku || ""}
                      onChange={(e) => updateVariation(index, "sku", e.target.value)}
                      placeholder="Código único"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`stock-${index}`}>Estoque</Label>
                    <Input
                      id={`stock-${index}`}
                      type="number"
                      min="0"
                      value={variation.stock}
                      onChange={(e) =>
                        updateVariation(index, "stock", parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${index}`}>Ajuste de Preço (R$)</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      value={variation.price_adjustment}
                      onChange={(e) =>
                        updateVariation(
                          index,
                          "price_adjustment",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      id={`active-${index}`}
                      checked={variation.is_active}
                      onCheckedChange={(checked) =>
                        updateVariation(index, "is_active", checked)
                      }
                    />
                    <Label htmlFor={`active-${index}`}>Ativo</Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddingVariation && (
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <h4 className="font-medium">Nova Variação</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-color">Cor</Label>
                <Input
                  id="new-color"
                  value={newVariation.color}
                  onChange={(e) =>
                    setNewVariation({ ...newVariation, color: e.target.value })
                  }
                  placeholder="Ex: Azul"
                />
              </div>
              <div>
                <Label htmlFor="new-size">Tamanho</Label>
                <Input
                  id="new-size"
                  value={newVariation.size}
                  onChange={(e) =>
                    setNewVariation({ ...newVariation, size: e.target.value })
                  }
                  placeholder="Ex: M"
                />
              </div>
              <div>
                <Label htmlFor="new-sku">SKU</Label>
                <Input
                  id="new-sku"
                  value={newVariation.sku}
                  onChange={(e) =>
                    setNewVariation({ ...newVariation, sku: e.target.value })
                  }
                  placeholder="Código único"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-stock">Estoque</Label>
                <Input
                  id="new-stock"
                  type="number"
                  min="0"
                  value={newVariation.stock}
                  onChange={(e) =>
                    setNewVariation({
                      ...newVariation,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="new-price">Ajuste de Preço (R$)</Label>
                <Input
                  id="new-price"
                  type="number"
                  step="0.01"
                  value={newVariation.price_adjustment}
                  onChange={(e) =>
                    setNewVariation({
                      ...newVariation,
                      price_adjustment: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingVariation(false)}
              >
                Cancelar
              </Button>
              <Button onClick={addVariation}>Adicionar</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductVariationsManager;
