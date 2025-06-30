import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStoreVariations } from "@/hooks/useStoreVariations";
import { ProductVariation } from "@/types/variation";

const TestStoreVariations = () => {
  const { groups, values, loading } = useStoreVariations();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: string[];
  }>({});
  const [generatedVariations, setGeneratedVariations] = useState<
    ProductVariation[]
  >([]);

  const handleGroupToggle = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups((prev) => prev.filter((id) => id !== groupId));
      const newSelectedValues = { ...selectedValues };
      delete newSelectedValues[groupId];
      setSelectedValues(newSelectedValues);
    } else {
      setSelectedGroups((prev) => [...prev, groupId]);
    }
  };

  const handleValueToggle = (groupId: string, valueId: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [groupId]: prev[groupId]?.includes(valueId)
        ? prev[groupId].filter((id) => id !== valueId)
        : [...(prev[groupId] || []), valueId],
    }));
  };

  const generateVariations = () => {
    console.log("🧪 Teste: Gerando variações");
    console.log("Grupos selecionados:", selectedGroups);
    console.log("Valores selecionados:", selectedValues);

    const combinations: string[][] = [];

    if (selectedGroups.length === 1) {
      const groupId = selectedGroups[0];
      const groupValues = selectedValues[groupId] || [];

      groupValues.forEach((valueId) => {
        const value = values.find((v) => v.id === valueId);
        if (value) {
          combinations.push([value.value]);
        }
      });
    } else if (selectedGroups.length === 2) {
      const [group1, group2] = selectedGroups;
      const values1 = selectedValues[group1] || [];
      const values2 = selectedValues[group2] || [];

      values1.forEach((valueId1) => {
        values2.forEach((valueId2) => {
          const value1 = values.find((v) => v.id === valueId1);
          const value2 = values.find((v) => v.id === valueId2);
          if (value1 && value2) {
            combinations.push([value1.value, value2.value]);
          }
        });
      });
    }

    console.log("Combinações geradas:", combinations);

    const newVariations: ProductVariation[] = combinations.map(
      (combo, index) => ({
        id: `test-${Date.now()}-${index}`,
        variation_type: "master",
        color: combo[0] || undefined,
        size: combo[1] || undefined,
        stock: 0,
        price_adjustment: 0,
        is_active: true,
        sku: "",
        image_url: null,
        image_file: null,
      })
    );

    console.log("Variações finais:", newVariations);
    setGeneratedVariations(newVariations);
  };

  if (loading) {
    return <div>Carregando variações...</div>;
  }

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-lg text-green-800">
          🧪 Teste de Variações - Diagnóstico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">
            Grupos Disponíveis ({groups.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <Badge
                key={group.id}
                variant={
                  selectedGroups.includes(group.id) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => handleGroupToggle(group.id)}
              >
                {group.name} (
                {values.filter((v) => v.group_id === group.id).length} valores)
              </Badge>
            ))}
          </div>
        </div>

        {selectedGroups.map((groupId) => {
          const group = groups.find((g) => g.id === groupId);
          const groupValues = values.filter((v) => v.group_id === groupId);

          return (
            <div key={groupId}>
              <h5 className="font-medium mb-2">{group?.name}</h5>
              <div className="flex flex-wrap gap-2">
                {groupValues.map((value) => (
                  <Badge
                    key={value.id}
                    variant={
                      selectedValues[groupId]?.includes(value.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleValueToggle(groupId, value.id)}
                  >
                    {value.value}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}

        {selectedGroups.length > 0 && (
          <Button onClick={generateVariations} className="w-full">
            Gerar Teste (
            {Object.values(selectedValues).reduce((acc, vals) => {
              return acc === 0 ? vals.length : acc * vals.length;
            }, 0)}{" "}
            combinações)
          </Button>
        )}

        {generatedVariations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">
              Variações Geradas ({generatedVariations.length})
            </h4>
            <div className="space-y-2">
              {generatedVariations.map((variation) => (
                <div key={variation.id} className="p-2 bg-white rounded border">
                  {variation.color && (
                    <Badge variant="secondary">{variation.color}</Badge>
                  )}
                  {variation.size && (
                    <Badge variant="secondary">{variation.size}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-600">
          Debug: {groups.length} grupos, {values.length} valores carregados
        </div>
      </CardContent>
    </Card>
  );
};

export default TestStoreVariations;
