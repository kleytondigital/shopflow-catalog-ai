import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductVariation } from "@/types/product";
import { Plus, Trash2, Settings, Wand2, Info } from "lucide-react";
import UnifiedVariationWizard from "./wizard/UnifiedVariationWizard";

interface ProductVariationsManagerProps {
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
  category?: string;
  productName?: string;
}

const ProductVariationsManager: React.FC<ProductVariationsManagerProps> = ({
  variations,
  onChange,
  productId,
  storeId,
  category,
  productName,
}) => {
  const [mode, setMode] = useState<"traditional" | "wizard">("wizard");
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

  console.log("🎨 PRODUCT VARIATIONS MANAGER - Props:", {
    variationsCount: variations.length,
    mode,
    productId,
    category,
    productName,
  });

  const addVariation = () => {
    const variation: ProductVariation = {
      id: `temp-${Date.now()}`,
      product_id: productId || "",
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

  const updateVariation = (
    index: number,
    field: keyof ProductVariation,
    value: any
  ) => {
    const updatedVariations = variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    );
    onChange(updatedVariations);
  };

  // Se modo wizard está ativo, renderizar o UnifiedVariationWizard
  if (mode === "wizard") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Assistente de Variações
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("traditional")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Modo Tradicional
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UnifiedVariationWizard
            variations={variations}
            onVariationsChange={onChange}
            productId={productId}
            storeId={storeId}
            category={category || ""}
            productName={productName || ""}
          />
        </CardContent>
      </Card>
    );
  }

  // Modo tradicional (sistema anterior)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Variações do Produto
          </CardTitle>
          <div className="flex items-center gap-2">
            {variations.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("wizard")}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Usar Assistente
              </Button>
            )}
            <Badge variant="outline">{variations.length} variações</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {variations.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Nenhuma variação criada. Use o <strong>Assistente</strong> para
              configuração guiada ou adicione variações manualmente abaixo.
            </AlertDescription>
          </Alert>
        )}

        {variations.length > 0 && (
          <div className="space-y-4">
            {variations.map((variation, index) => (
              <div
                key={variation.id || index}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Variação {index + 1}
                    {variation.color && ` - ${variation.color}`}
                    {variation.size && ` (${variation.size})`}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeVariation(index)}
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
                      onChange={(e) =>
                        updateVariation(index, "color", e.target.value)
                      }
                      placeholder="Ex: Azul"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`size-${index}`}>Tamanho</Label>
                    <Input
                      id={`size-${index}`}
                      value={variation.size || ""}
                      onChange={(e) =>
                        updateVariation(index, "size", e.target.value)
                      }
                      placeholder="Ex: M"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`sku-${index}`}>SKU</Label>
                    <Input
                      id={`sku-${index}`}
                      value={variation.sku || ""}
                      onChange={(e) =>
                        updateVariation(index, "sku", e.target.value)
                      }
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
                        updateVariation(
                          index,
                          "stock",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${index}`}>
                      Ajuste de Preço (R$)
                    </Label>
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

        {!isAddingVariation && (
          <Button
            onClick={() => setIsAddingVariation(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Variação Manual
          </Button>
        )}

        {isAddingVariation && (
          <div className="border rounded-lg p-4 space-y-3">
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

            <div className="flex justify-end space-x-2">
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
