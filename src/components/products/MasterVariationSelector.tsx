import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Plus,
  Palette,
  Shirt,
  Package,
  Sparkles,
  Trash2,
  X,
  PackageCheck,
} from "lucide-react";
import { useStoreVariations } from "@/hooks/useStoreVariations";
import StoreQuickValueAdd from "@/components/variations/StoreQuickValueAdd";
import { ProductVariation } from "@/types/variation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MasterVariationSelectorProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
}

const MasterVariationSelector: React.FC<MasterVariationSelectorProps> = ({
  variations,
  onVariationsChange,
}) => {
  const { groups, values, loading, refetch } = useStoreVariations();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    [groupId: string]: string[];
  }>({});
  const [manualMode, setManualMode] = useState(false);
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

  // Detectar e carregar variações existentes
  useEffect(() => {
    if (variations.length > 0) {
      // Detectar grupos e valores já utilizados
      const usedGroups = new Set<string>();
      const usedValues = new Set<string>();

      variations.forEach((variation) => {
        if (variation.color) {
          usedGroups.add("color");
          usedValues.add(variation.color);
        }
        if (variation.size) {
          usedGroups.add("size");
          usedValues.add(variation.size);
        }
        if (variation.material) {
          usedGroups.add("material");
          usedValues.add(variation.material);
        }
      });

      // Encontrar IDs dos grupos e valores nos dados carregados
      const groupIds: string[] = [];
      const valueIds: string[] = [];

      groups.forEach((group) => {
        if (usedGroups.has(group.attribute_key)) {
          groupIds.push(group.id);

          group.values?.forEach((value) => {
            if (usedValues.has(value.value)) {
              valueIds.push(value.id);
            }
          });
        }
      });

      setSelectedGroups(groupIds);
      setSelectedValues(valueIds);
    }
  }, [variations, groups]);

  const getGroupIcon = (attributeKey: string) => {
    switch (attributeKey) {
      case "color":
        return <Palette className="w-4 h-4" />;
      case "size":
        return <Shirt className="w-4 h-4" />;
      case "material":
        return <Package className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups((prev) => {
      if (prev.includes(groupId)) {
        // Remover grupo e seus valores selecionados
        const newSelected = prev.filter((id) => id !== groupId);
        const newSelectedValues = { ...selectedValues };
        delete newSelectedValues[groupId];
        setSelectedValues(newSelectedValues);
        return newSelected;
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleValueToggle = (groupId: string, valueId: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [groupId]: prev[groupId]?.includes(valueId)
        ? prev[groupId].filter((id) => id !== valueId)
        : [...(prev[groupId] || []), valueId],
    }));
  };

  const generateAllCombinations = () => {
    if (selectedGroups.length === 0) {
      onVariationsChange([]);
      return;
    }

    const groupCombinations: string[][] = [];

    if (selectedGroups.length === 1) {
      // Um grupo apenas - cada valor é uma variação
      const groupId = selectedGroups[0];
      const groupValues = selectedValues[groupId] || [];

      groupValues.forEach((valueId) => {
        const value = values.find((v) => v.id === valueId);
        if (value) {
          groupCombinations.push([value.value]);
        }
      });
    } else {
      // Múltiplos grupos - combinações cartesianas
      const valuesByGroup = selectedGroups.map((groupId) => {
        const groupValues = selectedValues[groupId] || [];
        return groupValues
          .map((valueId) => {
            const value = values.find((v) => v.id === valueId);
            return value?.value || "";
          })
          .filter(Boolean);
      });

      const cartesianProduct = (arr: string[][]): string[][] => {
        return arr.reduce(
          (acc, curr) => {
            const result: string[][] = [];
            acc.forEach((a) => {
              curr.forEach((c) => {
                result.push([...a, c]);
              });
            });
            return result;
          },
          [[]] as string[][]
        );
      };

      if (valuesByGroup.every((group) => group.length > 0)) {
        groupCombinations.push(...cartesianProduct(valuesByGroup));
      }
    }

    const newVariations: ProductVariation[] = groupCombinations.map(
      (combination, index) => {
        const variationKey = combination.join(" - ");

        // Manter valores existentes se a variação já existir
        const existingVariation = variations.find((v) => {
          const existingKey = [v.color, v.size].filter(Boolean).join(" - ");
          return existingKey === variationKey;
        });

        // Gerar ID único usando timestamp e índice para evitar duplicatas
        const uniqueId =
          existingVariation?.id ||
          `variation-${Date.now()}-${index}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

        // Mapear corretamente os valores para os atributos baseado nos grupos selecionados
        const newVariation: ProductVariation = {
          id: uniqueId,
          variation_type: "master",
          stock: existingVariation?.stock || 0,
          price_adjustment: existingVariation?.price_adjustment || 0,
          is_active: existingVariation?.is_active ?? true,
          sku: existingVariation?.sku || "",
          image_url: existingVariation?.image_url || null,
          image_file: existingVariation?.image_file || null,
        };

        // Mapear cada valor da combinação para o atributo correto
        selectedGroups.forEach((groupId, groupIndex) => {
          const group = groups.find((g) => g.id === groupId);
          const value = combination[groupIndex];

          if (group && value) {
            switch (group.attribute_key) {
              case "color":
                newVariation.color = value;
                // Buscar hex_color se disponível
                const colorValue = values.find(
                  (v) => v.group_id === groupId && v.value === value
                );
                if (colorValue?.hex_color) {
                  newVariation.hex_color = colorValue.hex_color;
                }
                break;
              case "size":
                newVariation.size = value;
                break;
              case "material":
                newVariation.material = value;
                break;
              default:
                // Para outros tipos de variação
                if (!newVariation.variation_value) {
                  newVariation.variation_value = value;
                }
                break;
            }
          }
        });

        return newVariation;
      }
    );

    onVariationsChange(newVariations);
  };

  const addSpecificCombination = () => {
    if (selectedGroups.length === 0) return;

    // Gerar ID único usando timestamp e random para evitar duplicatas
    const uniqueId = `variation-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newVariation: ProductVariation = {
      id: uniqueId,
      variation_type: "master",
      color: selectedGroups.includes(
        groups.find((g) => g.attribute_key === "color")?.id || ""
      )
        ? ""
        : undefined,
      size: selectedGroups.includes(
        groups.find((g) => g.attribute_key === "size")?.id || ""
      )
        ? ""
        : undefined,
      stock: 0,
      price_adjustment: 0,
      is_active: true,
      sku: "",
      image_url: null,
      image_file: null,
    };

    onVariationsChange([...variations, newVariation]);
  };

  const updateVariation = (
    index: number,
    updates: Partial<ProductVariation>
  ) => {
    const updatedVariations = variations.map((variation, i) =>
      i === index ? { ...variation, ...updates } : variation
    );
    onVariationsChange(updatedVariations);
  };

  const removeVariation = (index: number) => {
    const updatedVariations = variations.filter((_, i) => i !== index);
    onVariationsChange(updatedVariations);
  };

  const handleValueAdded = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Grupos */}
      <div className="space-y-4">
        <h4 className="font-medium">1. Selecione os tipos de variação</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={`cursor-pointer transition-colors ${
                selectedGroups.includes(group.id)
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-gray-50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => handleGroupToggle(group.id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {getGroupIcon(group.attribute_key)}
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {
                          values.filter(
                            (v) => v.group_id === group.id && v.is_active
                          ).length
                        }{" "}
                        valores
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Seleção de Valores */}
      {selectedGroups.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">
            2. Selecione os valores para cada tipo
          </h4>
          {selectedGroups.map((groupId) => {
            const group = groups.find((g) => g.id === groupId);
            const groupValues = values.filter(
              (v) => v.group_id === groupId && v.is_active
            );

            if (!group) return null;

            return (
              <Card key={groupId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getGroupIcon(group.attribute_key)}
                      {group.name}
                    </div>
                    <StoreQuickValueAdd
                      group={group}
                      onValueAdded={handleValueAdded}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {groupValues.map((value) => (
                      <div
                        key={value.id}
                        className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                          selectedValues[groupId]?.includes(value.id)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleValueToggle(groupId, value.id)}
                      >
                        <Checkbox
                          checked={
                            selectedValues[groupId]?.includes(value.id) || false
                          }
                          onCheckedChange={() =>
                            handleValueToggle(groupId, value.id)
                          }
                        />
                        <div className="flex items-center gap-2 flex-1">
                          {value.hex_color && (
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: value.hex_color }}
                            />
                          )}
                          <span className="text-sm">{value.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Controle de Modo */}
      {selectedGroups.length > 1 && (
        <div className="space-y-4">
          <h4 className="font-medium">3. Escolha o modo de criação</h4>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="manual-mode">Modo Manual</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite adicionar e remover combinações específicas
                    individualmente
                  </p>
                </div>
                <Switch
                  id="manual-mode"
                  checked={manualMode}
                  onCheckedChange={setManualMode}
                />
              </div>
              {!manualMode && (
                <Alert className="mt-4">
                  <AlertDescription>
                    No modo automático, todas as combinações possíveis serão
                    geradas. Use o modo manual para ter controle total sobre
                    quais combinações existem.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Variações Geradas ou Manuais */}
      {selectedGroups.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {manualMode
                ? "4. Gerencie suas variações"
                : "4. Gere as combinações automaticamente"}
            </h4>
            <div className="flex gap-2">
              {variations.length > 1 && (
                <Button
                  onClick={() => {
                    const stock = prompt(
                      "Digite a quantidade de estoque para todas as variações:"
                    );
                    if (stock !== null && !isNaN(Number(stock))) {
                      const stockValue = Math.max(0, parseInt(stock) || 0);
                      const updatedVariations = variations.map((v) => ({
                        ...v,
                        stock: stockValue,
                      }));
                      onVariationsChange(updatedVariations);
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Estoque Automático
                </Button>
              )}
              {manualMode && (
                <Button onClick={addSpecificCombination} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Variação
                </Button>
              )}
            </div>
          </div>

          {/* Botão para gerar combinações no modo automático */}
          {!manualMode && selectedGroups.length > 0 && (
            <div className="space-y-4">
              <Button
                onClick={generateAllCombinations}
                className="w-full"
                disabled={selectedGroups.some(
                  (groupId) =>
                    !selectedValues[groupId] ||
                    selectedValues[groupId].length === 0
                )}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Todas as Combinações (
                {selectedGroups.reduce((total, groupId) => {
                  const groupValueCount = selectedValues[groupId]?.length || 0;
                  return total === 0
                    ? groupValueCount
                    : total * groupValueCount;
                }, 0)}{" "}
                variações)
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Todas as combinações possíveis serão criadas automaticamente
              </p>
            </div>
          )}

          {variations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {manualMode
                    ? 'Clique em "Adicionar Variação" para criar suas combinações específicas'
                    : "Selecione valores nos grupos acima e clique em 'Gerar Todas as Combinações'"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {variations.map((variation, index) => {
                    const variationLabel =
                      [variation.color, variation.size]
                        .filter(Boolean)
                        .join(" - ") || "Nova Variação";

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
                          {manualMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariation(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

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
                                  stock:
                                    value === "" ? 0 : parseInt(value) || 0,
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
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(variation.price_adjustment)}
                                  )
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
                              placeholder="R$ 0,00"
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
                    <h5 className="font-medium text-blue-900 mb-2">
                      💡 Dicas:
                    </h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        •{" "}
                        {manualMode
                          ? "No modo manual, você pode criar apenas as combinações que realmente possui"
                          : "No modo automático, todas as combinações são geradas"}
                      </li>
                      <li>
                        • Use o ajuste de preço para aumentar (+) ou diminuir
                        (-) o valor do produto base
                      </li>
                      <li>• Variações inativas não aparecem no catálogo</li>
                      <li>
                        • Cada variação tem seu próprio estoque independente
                      </li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {selectedGroups.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Selecione pelo menos um tipo de variação para começar
          </p>
        </div>
      )}
    </div>
  );
};

export default MasterVariationSelector;
