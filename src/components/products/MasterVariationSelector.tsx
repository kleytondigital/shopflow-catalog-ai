
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Package, AlertCircle } from 'lucide-react';
import { useVariationMasterGroups } from '@/hooks/useVariationMasterGroups';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductVariationCombination {
  id: string;
  combination: Record<string, string>; // { color: 'Preto', size: '36' }
  sku?: string;
  stock: number;
  price_adjustment: number;
  is_active: boolean;
}

interface MasterVariationSelectorProps {
  selectedCombinations: ProductVariationCombination[];
  onChange: (combinations: ProductVariationCombination[]) => void;
}

const MasterVariationSelector: React.FC<MasterVariationSelectorProps> = ({
  selectedCombinations,
  onChange
}) => {
  const { groups, getValuesByGroup, loading } = useVariationMasterGroups();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});

  console.log('🔧 MASTER VARIATION SELECTOR - Renderizando:', {
    groupsCount: groups.length,
    selectedGroupsCount: selectedGroups.length,
    combinationsCount: selectedCombinations.length
  });

  // Gerar todas as combinações possíveis
  const generateCombinations = () => {
    if (selectedGroups.length === 0) return [];

    const groupsWithValues = selectedGroups.map(groupId => {
      const group = groups.find(g => g.id === groupId);
      const values = selectedValues[groupId] || [];
      return {
        groupId,
        attributeKey: group?.attribute_key || '',
        values: values.map(valueId => {
          const valueObj = getValuesByGroup(groupId).find(v => v.id === valueId);
          return { id: valueId, value: valueObj?.value || '' };
        })
      };
    });

    // Função recursiva para gerar combinações
    const generateRecursive = (index: number, currentCombination: Record<string, string>): Record<string, string>[] => {
      if (index >= groupsWithValues.length) {
        return [{ ...currentCombination }];
      }

      const group = groupsWithValues[index];
      const results: Record<string, string>[] = [];

      for (const value of group.values) {
        const newCombination = {
          ...currentCombination,
          [group.attributeKey]: value.value
        };
        results.push(...generateRecursive(index + 1, newCombination));
      }

      return results;
    };

    return generateRecursive(0, {});
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => {
      const newGroups = prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId];
      
      // Limpar valores selecionados do grupo removido
      if (!newGroups.includes(groupId)) {
        setSelectedValues(prevValues => {
          const newValues = { ...prevValues };
          delete newValues[groupId];
          return newValues;
        });
      }
      
      return newGroups;
    });
  };

  const handleValueToggle = (groupId: string, valueId: string) => {
    setSelectedValues(prev => {
      const groupValues = prev[groupId] || [];
      const newGroupValues = groupValues.includes(valueId)
        ? groupValues.filter(id => id !== valueId)
        : [...groupValues, valueId];
      
      return {
        ...prev,
        [groupId]: newGroupValues
      };
    });
  };

  const handleGenerateCombinations = () => {
    const combinations = generateCombinations();
    
    const newCombinations: ProductVariationCombination[] = combinations.map((combination, index) => {
      // Verificar se já existe uma combinação igual
      const existing = selectedCombinations.find(c => 
        JSON.stringify(c.combination) === JSON.stringify(combination)
      );

      return existing || {
        id: `combination-${Date.now()}-${index}`,
        combination,
        sku: '',
        stock: 0,
        price_adjustment: 0,
        is_active: true
      };
    });

    onChange(newCombinations);
  };

  const updateCombination = (combinationId: string, updates: Partial<ProductVariationCombination>) => {
    const updated = selectedCombinations.map(c => 
      c.id === combinationId ? { ...c, ...updates } : c
    );
    onChange(updated);
  };

  const removeCombination = (combinationId: string) => {
    const filtered = selectedCombinations.filter(c => c.id !== combinationId);
    onChange(filtered);
  };

  const getCombinationDisplay = (combination: Record<string, string>) => {
    return Object.entries(combination)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');
  };

  const possibleCombinations = generateCombinations();
  const totalStock = selectedCombinations.reduce((sum, c) => sum + c.stock, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Grupos de Variações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {groups.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum grupo de variação cadastrado. Acesse "Grupos de Variações" na sidebar para criar grupos.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={() => handleGroupToggle(group.id)}
                    />
                    <Label htmlFor={`group-${group.id}`} className="font-medium">
                      {group.name}
                    </Label>
                    <Badge variant="secondary">
                      {getValuesByGroup(group.id).length} valores
                    </Badge>
                  </div>

                  {selectedGroups.includes(group.id) && (
                    <div className="space-y-2 pl-6">
                      <Label className="text-sm text-muted-foreground">
                        Selecione os valores:
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {getValuesByGroup(group.id).map((value) => (
                          <div key={value.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`value-${value.id}`}
                              checked={(selectedValues[group.id] || []).includes(value.id)}
                              onCheckedChange={() => handleValueToggle(group.id, value.id)}
                            />
                            <Label htmlFor={`value-${value.id}`} className="text-sm flex items-center gap-1">
                              {value.hex_color && (
                                <div 
                                  className="w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: value.hex_color }}
                                />
                              )}
                              {value.value}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedGroups.length > 0 && (
            <div className="pt-4">
              <Button onClick={handleGenerateCombinations}>
                Gerar Combinações ({possibleCombinations.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCombinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Configurar Variações ({selectedCombinations.length})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Estoque total: {totalStock} unidades
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCombinations.map((combination) => (
              <div key={combination.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">
                      {getCombinationDisplay(combination.combination)}
                    </span>
                    {!combination.is_active && (
                      <Badge variant="secondary" className="ml-2">Inativa</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCombination(combination.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-sm">SKU</Label>
                    <Input
                      value={combination.sku || ''}
                      onChange={(e) => updateCombination(combination.id, { sku: e.target.value })}
                      placeholder="SKU"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Estoque</Label>
                    <Input
                      type="number"
                      value={combination.stock}
                      onChange={(e) => updateCombination(combination.id, { stock: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Ajuste de Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={combination.price_adjustment}
                      onChange={(e) => updateCombination(combination.id, { price_adjustment: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`active-${combination.id}`}
                        checked={combination.is_active}
                        onCheckedChange={(checked) => updateCombination(combination.id, { is_active: checked === true })}
                      />
                      <Label htmlFor={`active-${combination.id}`} className="text-sm">
                        Ativa
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MasterVariationSelector;
