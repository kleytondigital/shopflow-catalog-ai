
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Palette,
  Shirt,
  Package,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useStoreVariations } from "@/hooks/useStoreVariations";
import StoreQuickValueAdd from "@/components/variations/StoreQuickValueAdd";
import { ProductVariation } from "@/types/product";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StoreVariationSelectorProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
}

const StoreVariationSelector: React.FC<StoreVariationSelectorProps> = ({
  variations,
  onVariationsChange,
}) => {
  const { groups, values, loading, refetch } = useStoreVariations();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    [groupId: string]: string[];
  }>({});
  const [manualMode, setManualMode] = useState(false);

  // Detectar e carregar variações existentes
  useEffect(() => {
    if (variations.length > 0 && groups.length > 0 && values.length > 0) {
      console.log(
        "🔄 Inicializando StoreVariationSelector com variações existentes:",
        variations.length
      );

      // Detectar grupos usados nas variações existentes
      const usedGroups: string[] = [];
      const usedValues: { [groupId: string]: string[] } = {};

      variations.forEach((variation) => {
        // Detectar cor (se houver)
        if (variation.color) {
          const colorGroup = groups.find((g) => g.attribute_key === "color");
          if (colorGroup && !usedGroups.includes(colorGroup.id)) {
            usedGroups.push(colorGroup.id);
            usedValues[colorGroup.id] = [];
          }

          // Encontrar o valor da cor
          const colorValue = values.find(
            (v) => v.group_id === colorGroup?.id && v.value === variation.color
          );
          if (
            colorValue &&
            colorGroup &&
            !usedValues[colorGroup.id].includes(colorValue.id)
          ) {
            usedValues[colorGroup.id].push(colorValue.id);
          }
        }

        // Detectar tamanho (se houver)
        if (variation.size) {
          const sizeGroup = groups.find((g) => g.attribute_key === "size");
          if (sizeGroup && !usedGroups.includes(sizeGroup.id)) {
            usedGroups.push(sizeGroup.id);
            usedValues[sizeGroup.id] = [];
          }

          // Encontrar o valor do tamanho
          const sizeValue = values.find(
            (v) => v.group_id === sizeGroup?.id && v.value === variation.size
          );
          if (
            sizeValue &&
            sizeGroup &&
            !usedValues[sizeGroup.id].includes(sizeValue.id)
          ) {
            usedValues[sizeGroup.id].push(sizeValue.id);
          }
        }
      });

      console.log("🎯 Grupos detectados:", usedGroups);
      console.log("🎯 Valores detectados:", usedValues);

      // Atualizar estado apenas se for diferente do atual
      if (
        JSON.stringify(usedGroups.sort()) !==
        JSON.stringify(selectedGroups.sort())
      ) {
        setSelectedGroups(usedGroups);
      }

      if (JSON.stringify(usedValues) !== JSON.stringify(selectedValues)) {
        setSelectedValues(usedValues);
      }

      // Ativar modo manual se houver variações específicas
      setManualMode(true);
    }
  }, [variations, groups, values]);

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

    // Converter combinações em variações
    const newVariations: ProductVariation[] = groupCombinations.map(
      (combination, index) => {
        const variation: ProductVariation = {
          id: `variation-${index}`,
          product_id: "",
          sku: "",
          stock: 0,
          price_adjustment: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          display_order: index,
        };

        // Mapear valores para propriedades específicas
        selectedGroups.forEach((groupId, groupIndex) => {
          const group = groups.find((g) => g.id === groupId);
          if (!group) return;

          const value = combination[groupIndex];
          if (!value) return;

          switch (group.attribute_key) {
            case "color":
              variation.color = value;
              // Buscar hex_color se disponível
              const colorValue = values.find(
                (v) => v.group_id === groupId && v.value === value
              );
              if (colorValue?.hex_color) {
                variation.hex_color = colorValue.hex_color;
              }
              break;
            case "size":
              variation.size = value;
              break;
            case "material":
              variation.material = value;
              break;
            default:
              // Para outros tipos, usar variation_value
              variation.variation_value = value;
              break;
          }
        });

        return variation;
      }
    );

    onVariationsChange(newVariations);
  };

  const addSpecificCombination = () => {
    const newVariation: ProductVariation = {
      id: `variation-${variations.length}`,
      product_id: "",
      sku: "",
      stock: 0,
      price_adjustment: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      display_order: variations.length,
    };

    onVariationsChange([...variations, newVariation]);
  };

  const updateVariation = (
    index: number,
    updates: Partial<ProductVariation>
  ) => {
    const newVariations = [...variations];
    newVariations[index] = { ...newVariations[index], ...updates };
    onVariationsChange(newVariations);
  };

  const removeVariation = (index: number) => {
    onVariationsChange(variations.filter((_, i) => i !== index));
  };

  const handleValueAdded = () => {
    refetch();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Variações do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando variações...</div>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Variações do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Nenhum grupo de variação encontrado para sua loja. As variações
              serão inicializadas automaticamente em breve.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Variações do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Modo de configuração */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Modo de Configuração</Label>
            <p className="text-sm text-muted-foreground">
              {manualMode
                ? "Configuração manual de variações"
                : "Gerar todas as combinações automaticamente"}
            </p>
          </div>
          <Switch checked={manualMode} onCheckedChange={setManualMode} />
        </div>

        {/* Seleção de grupos */}
        <div className="space-y-4">
          <Label>Grupos de Variação</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedGroups.includes(group.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleGroupToggle(group.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    checked={selectedGroups.includes(group.id)}
                  />
                  {getGroupIcon(group.attribute_key)}
                  <span className="font-medium">{group.name}</span>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seleção de valores */}
        {selectedGroups.map((groupId) => {
          const group = groups.find((g) => g.id === groupId);
          const groupValues = values.filter((v) => v.group_id === groupId);

          if (!group) return null;

          return (
            <div key={groupId} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  {getGroupIcon(group.attribute_key)}
                  {group.name}
                </Label>
                <StoreQuickValueAdd
                  group={group}
                  onValueAdded={handleValueAdded}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {groupValues.map((value) => (
                  <Badge
                    key={value.id}
                    variant={
                      selectedValues[groupId]?.includes(value.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleValueToggle(groupId, value.id)}
                  >
                    {group.attribute_key === "color" && value.hex_color && (
                      <div
                        className="w-3 h-3 rounded-full mr-2 border border-white/20"
                        style={{ backgroundColor: value.hex_color }}
                      />
                    )}
                    {value.value}
                  </Badge>
                ))}
                {groupValues.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum valor disponível para este grupo
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Botões de ação */}
        {selectedGroups.length > 0 && (
          <div className="space-y-4">
            {!manualMode && (
              <Button onClick={generateAllCombinations} className="w-full">
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
            )}

            {manualMode && (
              <Button onClick={addSpecificCombination} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Variação Específica
              </Button>
            )}
          </div>
        )}

        {/* Lista de variações geradas */}
        {variations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Variações Configuradas ({variations.length})</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVariationsChange([])}
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Todas
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {variations.map((variation, index) => (
                <div
                  key={variation.id || index}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  <div className="flex-1">
                    <Input
                      value={variation.sku || ''}
                      onChange={(e) =>
                        updateVariation(index, { sku: e.target.value })
                      }
                      placeholder="SKU da variação"
                    />
                  </div>
                  <div className="flex gap-1">
                    {variation.color && (
                      <Badge variant="secondary">
                        {variation.hex_color && (
                          <div
                            className="w-3 h-3 rounded-full mr-1 border"
                            style={{ backgroundColor: variation.hex_color }}
                          />
                        )}
                        {variation.color}
                      </Badge>
                    )}
                    {variation.size && (
                      <Badge variant="secondary">{variation.size}</Badge>
                    )}
                    {variation.material && (
                      <Badge variant="secondary">{variation.material}</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariation(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreVariationSelector;
