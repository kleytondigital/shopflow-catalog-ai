
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Palette,
  Shirt,
  Package,
  Sparkles,
  Trash2,
  X,
  Power,
  PowerOff,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { useStoreVariations } from "@/hooks/useStoreVariations";
import StoreQuickValueAdd from "@/components/variations/StoreQuickValueAdd";
import { ProductVariation } from "@/types/product";
import { QuantityInput } from "@/components/ui/quantity-input";

interface ImprovedVariationManagerProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
}

const ImprovedVariationManager: React.FC<ImprovedVariationManagerProps> = ({
  variations,
  onVariationsChange,
}) => {
  const { groups, values, loading, refetch } = useStoreVariations();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    [groupId: string]: string[];
  }>({});
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  console.log('🎯 IMPROVED VARIATION MANAGER - Dados:', {
    variations: variations.length,
    groups: groups.length,
    values: values.length
  });

  // Detectar variações existentes
  useEffect(() => {
    if (variations.length > 0 && groups.length > 0 && values.length > 0) {
      const usedGroups: string[] = [];
      const usedValues: { [groupId: string]: string[] } = {};

      variations.forEach((variation) => {
        if (variation.color) {
          const colorGroup = groups.find((g) => g.attribute_key === "color");
          if (colorGroup && !usedGroups.includes(colorGroup.id)) {
            usedGroups.push(colorGroup.id);
            usedValues[colorGroup.id] = [];
          }

          const colorValue = values.find(
            (v) => v.group_id === colorGroup?.id && v.value === variation.color
          );
          if (colorValue && colorGroup && !usedValues[colorGroup.id].includes(colorValue.id)) {
            usedValues[colorGroup.id].push(colorValue.id);
          }
        }

        if (variation.size) {
          const sizeGroup = groups.find((g) => g.attribute_key === "size");
          if (sizeGroup && !usedGroups.includes(sizeGroup.id)) {
            usedGroups.push(sizeGroup.id);
            usedValues[sizeGroup.id] = [];
          }

          const sizeValue = values.find(
            (v) => v.group_id === sizeGroup?.id && v.value === variation.size
          );
          if (sizeValue && sizeGroup && !usedValues[sizeGroup.id].includes(sizeValue.id)) {
            usedValues[sizeGroup.id].push(sizeValue.id);
          }
        }
      });

      setSelectedGroups(usedGroups);
      setSelectedValues(usedValues);
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

  const toggleVariationActive = (index: number) => {
    const newVariations = [...variations];
    newVariations[index] = { 
      ...newVariations[index], 
      is_active: !newVariations[index].is_active 
    };
    onVariationsChange(newVariations);
  };

  const updateVariationStock = (index: number, stock: number) => {
    const newVariations = [...variations];
    newVariations[index] = { 
      ...newVariations[index], 
      stock,
      // Desativar automaticamente se estoque = 0
      is_active: stock > 0 ? newVariations[index].is_active : false
    };
    onVariationsChange(newVariations);
  };

  const updateVariationSku = (index: number, sku: string) => {
    const newVariations = [...variations];
    newVariations[index] = { ...newVariations[index], sku };
    onVariationsChange(newVariations);
  };

  const removeVariation = (index: number) => {
    onVariationsChange(variations.filter((_, i) => i !== index));
  };

  const generateAllCombinations = () => {
    if (selectedGroups.length === 0) {
      onVariationsChange([]);
      return;
    }

    const groupCombinations: string[][] = [];

    if (selectedGroups.length === 1) {
      const groupId = selectedGroups[0];
      const groupValues = selectedValues[groupId] || [];
      groupValues.forEach((valueId) => {
        const value = values.find((v) => v.id === valueId);
        if (value) {
          groupCombinations.push([value.value]);
        }
      });
    } else {
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

        selectedGroups.forEach((groupId, groupIndex) => {
          const group = groups.find((g) => g.id === groupId);
          if (!group) return;

          const value = combination[groupIndex];
          if (!value) return;

          switch (group.attribute_key) {
            case "color":
              variation.color = value;
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
              variation.variation_value = value;
              break;
          }
        });

        return variation;
      }
    );

    onVariationsChange(newVariations);
  };

  const handleValueAdded = () => {
    refetch();
  };

  const filteredVariations = showInactiveOnly 
    ? variations.filter(v => !v.is_active)
    : variations;

  const activeCount = variations.filter(v => v.is_active).length;
  const inactiveCount = variations.filter(v => !v.is_active).length;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Variações do Produto
          {variations.length > 0 && (
            <div className="flex gap-2 ml-auto">
              <Badge variant="secondary">
                {activeCount} Ativas
              </Badge>
              {inactiveCount > 0 && (
                <Badge variant="destructive">
                  {inactiveCount} Inativas
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
                onClick={() => {
                  setSelectedGroups(prev => 
                    prev.includes(group.id)
                      ? prev.filter(id => id !== group.id)
                      : [...prev, group.id]
                  );
                }}
              >
                <div className="flex items-center gap-2 mb-2">
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
                    onClick={() => {
                      setSelectedValues(prev => ({
                        ...prev,
                        [groupId]: prev[groupId]?.includes(value.id)
                          ? prev[groupId].filter(id => id !== value.id)
                          : [...(prev[groupId] || []), value.id]
                      }));
                    }}
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
              </div>
            </div>
          );
        })}

        {/* Botão para gerar combinações */}
        {selectedGroups.length > 0 && (
          <Button onClick={generateAllCombinations} className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Todas as Combinações (
            {selectedGroups.reduce((total, groupId) => {
              const groupValueCount = selectedValues[groupId]?.length || 0;
              return total === 0 ? groupValueCount : total * groupValueCount;
            }, 0)}{" "}
            variações)
          </Button>
        )}

        {variations.length > 0 && (
          <>
            <Separator />
            
            {/* Controles de visualização */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label>Filtros de Visualização</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showInactiveOnly}
                    onCheckedChange={setShowInactiveOnly}
                  />
                  <Label className="text-sm">
                    {showInactiveOnly ? (
                      <span className="flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Mostrar apenas inativas
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Mostrar todas
                      </span>
                    )}
                  </Label>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVariationsChange([])}
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Todas
              </Button>
            </div>

            {/* Lista de variações */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredVariations.map((variation, index) => {
                const actualIndex = variations.findIndex(v => v.id === variation.id);
                const isOutOfStock = variation.stock === 0;
                const isInactive = !variation.is_active;
                
                return (
                  <div
                    key={variation.id || index}
                    className={`border rounded-lg p-4 space-y-3 ${
                      isInactive ? 'border-red-200 bg-red-50/30' : 'border-border'
                    }`}
                  >
                    {/* Cabeçalho da variação */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={variation.is_active ? "default" : "secondary"}
                          size="sm"
                          onClick={() => toggleVariationActive(actualIndex)}
                          className="h-6 w-6 p-0"
                        >
                          {variation.is_active ? (
                            <Power className="w-3 h-3" />
                          ) : (
                            <PowerOff className="w-3 h-3" />
                          )}
                        </Button>
                        
                        <div className="flex gap-1">
                          {variation.color && (
                            <Badge variant="secondary" className="text-xs">
                              {variation.hex_color && (
                                <div
                                  className="w-2 h-2 rounded-full mr-1 border"
                                  style={{ backgroundColor: variation.hex_color }}
                                />
                              )}
                              {variation.color}
                            </Badge>
                          )}
                          {variation.size && (
                            <Badge variant="secondary" className="text-xs">
                              {variation.size}
                            </Badge>
                          )}
                          {variation.material && (
                            <Badge variant="secondary" className="text-xs">
                              {variation.material}
                            </Badge>
                          )}
                        </div>

                        {isOutOfStock && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-2 h-2 mr-1" />
                            Sem Estoque
                          </Badge>
                        )}
                        
                        {isInactive && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            Inativa
                          </Badge>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariation(actualIndex)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Campos de edição */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">SKU</Label>
                        <Input
                          value={variation.sku || ''}
                          onChange={(e) => updateVariationSku(actualIndex, e.target.value)}
                          placeholder="SKU da variação"
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Estoque</Label>
                        <QuantityInput
                          value={variation.stock}
                          onChange={(stock) => updateVariationStock(actualIndex, stock)}
                          min={0}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    {/* Alertas */}
                    {isOutOfStock && variation.is_active && (
                      <Alert className="py-2">
                        <AlertTriangle className="h-3 w-3" />
                        <AlertDescription className="text-xs">
                          Esta variação está ativa mas sem estoque. Considere desativá-la ou adicionar estoque.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredVariations.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                {showInactiveOnly 
                  ? "Nenhuma variação inativa encontrada"
                  : "Nenhuma variação configurada"
                }
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovedVariationManager;
