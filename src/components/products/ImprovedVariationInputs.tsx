import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PackageCheck, Trash2 } from "lucide-react";
import { ProductVariation } from "@/types/variation";

interface ImprovedVariationInputsProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  manualMode?: boolean;
  onRemoveVariation?: (index: number) => void;
  selectedGroups?: string[];
  groups?: any[];
}

const ImprovedVariationInputs: React.FC<ImprovedVariationInputsProps> = ({
  variations,
  onVariationsChange,
  manualMode = false,
  onRemoveVariation,
  selectedGroups = [],
  groups = [],
}) => {
  const [bulkStockOpen, setBulkStockOpen] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState("");

  // Aplicar estoque em massa
  const applyBulkStock = () => {
    const stockValue = parseInt(bulkStockValue) || 0;
    if (stockValue < 0) return;

    const updatedVariations = variations.map((variation) => ({
      ...variation,
      stock: stockValue,
    }));

    onVariationsChange(updatedVariations);
    setBulkStockOpen(false);
    setBulkStockValue("");
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Atualizar variação específica
  const updateVariation = (
    index: number,
    updates: Partial<ProductVariation>
  ) => {
    const updatedVariations = [...variations];
    updatedVariations[index] = { ...updatedVariations[index], ...updates };
    onVariationsChange(updatedVariations);
  };

  if (variations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Configurações das Variações
          </CardTitle>
          {variations.length > 1 && (
            <Dialog open={bulkStockOpen} onOpenChange={setBulkStockOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PackageCheck className="h-4 w-4 mr-2" />
                  Estoque Automático
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Definir Estoque para Todas as Variações
                  </DialogTitle>
                  <DialogDescription>
                    Digite a quantidade de estoque que será aplicada a todas as{" "}
                    {variations.length} variações.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="bulk-stock">Quantidade</Label>
                  <Input
                    id="bulk-stock"
                    type="number"
                    min="0"
                    value={bulkStockValue}
                    onChange={(e) => setBulkStockValue(e.target.value)}
                    placeholder="Digite a quantidade"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setBulkStockOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={applyBulkStock}>Aplicar a Todas</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {variations.map((variation, index) => {
            const variationLabel =
              [variation.color, variation.size].filter(Boolean).join(" - ") ||
              "Nova Variação";

            return (
              <div
                key={variation.id}
                className="p-4 bg-gray-50 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{variationLabel}</Badge>
                    {!variation.is_active && (
                      <Badge variant="outline">Inativa</Badge>
                    )}
                  </div>
                  {manualMode && onRemoveVariation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveVariation(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {manualMode && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedGroups.includes(
                      groups.find((g) => g.attribute_key === "color")?.id || ""
                    ) && (
                      <div>
                        <Label htmlFor={`color-${index}`}>Cor</Label>
                        <Input
                          id={`color-${index}`}
                          value={variation.color || ""}
                          onChange={(e) =>
                            updateVariation(index, {
                              color: e.target.value,
                            })
                          }
                          placeholder="Digite a cor"
                        />
                      </div>
                    )}
                    {selectedGroups.includes(
                      groups.find((g) => g.attribute_key === "size")?.id || ""
                    ) && (
                      <div>
                        <Label htmlFor={`size-${index}`}>Tamanho</Label>
                        <Input
                          id={`size-${index}`}
                          value={variation.size || ""}
                          onChange={(e) =>
                            updateVariation(index, {
                              size: e.target.value,
                            })
                          }
                          placeholder="Digite o tamanho"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor={`sku-${index}`}>SKU</Label>
                      <Input
                        id={`sku-${index}`}
                        value={variation.sku || ""}
                        onChange={(e) =>
                          updateVariation(index, {
                            sku: e.target.value,
                          })
                        }
                        placeholder="Código único"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`stock-${index}`}>Estoque</Label>
                    <Input
                      id={`stock-${index}`}
                      type="number"
                      min="0"
                      value={variation.stock || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateVariation(index, {
                          stock: value === "" ? 0 : parseInt(value) || 0,
                        });
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${index}`}>
                      Ajuste de Preço{" "}
                      {variation.price_adjustment !== 0 && (
                        <span className="text-sm text-muted-foreground">
                          ({variation.price_adjustment > 0 ? "+" : ""}
                          {formatCurrency(variation.price_adjustment)})
                        </span>
                      )}
                    </Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      value={variation.price_adjustment || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateVariation(index, {
                          price_adjustment:
                            value === "" ? 0 : parseFloat(value) || 0,
                        });
                      }}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id={`active-${index}`}
                      checked={variation.is_active}
                      onCheckedChange={(checked) =>
                        updateVariation(index, { is_active: checked })
                      }
                    />
                    <Label htmlFor={`active-${index}`}>Ativa</Label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {variations.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">💡 Dicas:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Use o botão "Estoque Automático" para definir a mesma
                quantidade para todas as variações
              </li>
              <li>
                • Para limpar o campo de estoque, apague o valor e digite 0
              </li>
              <li>
                • Use o ajuste de preço para aumentar (+) ou diminuir (-) o
                valor do produto base
              </li>
              <li>• Variações inativas não aparecem no catálogo</li>
              <li>• Cada variação tem seu próprio estoque independente</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovedVariationInputs;
