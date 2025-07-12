import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Palette,
  Shirt,
  Package,
  Sparkles,
  Trash2,
  Grid,
  List,
  Eye,
  EyeOff,
  Wand2,
  Copy,
  Settings,
  Ruler,
  Layers,
} from "lucide-react";
import { useStoreVariations } from "@/hooks/useStoreVariations";
import { ProductVariation } from "@/types/product";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useProductVariations } from "@/hooks/useProductVariations";
import { useVariationMasterGroups } from "@/hooks/useVariationMasterGroups";

interface IntelligentVariationsFormProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
}

// Interface para configuração de grade
interface GradeConfig {
  id: string;
  name: string;
  sizes: string[];
  pairsPerSize: { [size: string]: number };
  minGradeQuantity: number;
}

const IntelligentVariationsForm: React.FC<IntelligentVariationsFormProps> = ({
  variations,
  onVariationsChange,
  productId,
  storeId,
}) => {
  const { groups, values, loading, refetch } = useStoreVariations(storeId);
  const { groups: masterGroups, values: masterValues } =
    useVariationMasterGroups();
  const { toast } = useToast();
  const { deleteVariationById } = useProductVariations(productId);

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    [groupId: string]: string[];
  }>({});
  const [viewMode, setViewMode] = useState<
    "wizard" | "matrix" | "list" | "grade"
  >("wizard");
  const [autoGenerateMode, setAutoGenerateMode] = useState(true);
  const [bulkStock, setBulkStock] = useState<number>(0);
  const [bulkPriceAdjustment, setBulkPriceAdjustment] = useState<number>(0);

  // Estado para configuração de grade
  const [gradeConfigs, setGradeConfigs] = useState<GradeConfig[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [gradeStock, setGradeStock] = useState<number>(0);
  const [gradePriceAdjustment, setGradePriceAdjustment] = useState<number>(0);
  const [newSize, setNewSize] = useState<string>("");
  const [gradePairsConfig, setGradePairsConfig] = useState<{
    [gradeName: string]: { [size: string]: number };
  }>({});

  // Carregar configurações de pares das grades pré-cadastradas
  useEffect(() => {
    if (selectedGrades.length > 0 && values.length > 0) {
      const newGradePairsConfig: {
        [gradeName: string]: { [size: string]: number };
      } = {};

      selectedGrades.forEach((gradeName) => {
        // Buscar a grade nos valores de variação da loja
        const gradeValue = values.find(
          (v) => v.value === gradeName && v.is_active !== false
        );

        if (gradeValue && gradeValue.grade_sizes && gradeValue.grade_pairs) {
          // Usar configuração da loja
          newGradePairsConfig[gradeName] = gradeValue.grade_pairs;
        } else {
          // Configuração padrão baseada no nome da grade (fallback)
          let defaultPairs: { [size: string]: number } = {};

          switch (gradeName.toLowerCase()) {
            case "alta":
              defaultPairs = {
                "35": 1,
                "36": 2,
                "37": 3,
                "38": 3,
                "39": 3,
                "40": 3,
                "41": 3,
                "42": 2,
                "43": 1,
              };
              break;
            case "baixa":
              defaultPairs = {
                "33": 1,
                "34": 2,
                "35": 3,
                "36": 3,
                "37": 3,
                "38": 2,
                "39": 1,
              };
              break;
            case "masculina":
              defaultPairs = {
                "39": 1,
                "40": 2,
                "41": 3,
                "42": 3,
                "43": 3,
                "44": 2,
                "45": 1,
                "46": 1,
              };
              break;
            case "feminina":
              defaultPairs = {
                "33": 1,
                "34": 2,
                "35": 3,
                "36": 3,
                "37": 3,
                "38": 3,
                "39": 2,
                "40": 1,
              };
              break;
            case "infantil":
              defaultPairs = {
                "20": 1,
                "21": 1,
                "22": 2,
                "23": 2,
                "24": 2,
                "25": 2,
                "26": 2,
                "27": 2,
                "28": 2,
                "29": 1,
                "30": 1,
              };
              break;
            default:
              // Para grades personalizadas, usar tamanhos padrão
              defaultPairs = {
                "35": 1,
                "36": 2,
                "37": 3,
                "38": 3,
                "39": 2,
                "40": 1,
              };
          }

          newGradePairsConfig[gradeName] = defaultPairs;
        }
      });

      setGradePairsConfig(newGradePairsConfig);
    }
  }, [selectedGrades, values]);

  // Função para atualizar pares de uma grade específica
  const updateGradePairs = (gradeName: string, size: string, pairs: number) => {
    setGradePairsConfig((prev) => ({
      ...prev,
      [gradeName]: {
        ...prev[gradeName],
        [size]: pairs,
      },
    }));
  };

  // Função para obter tamanhos de uma grade
  const getGradeSizes = (gradeName: string): string[] => {
    // Primeiro tentar buscar nos valores de variação da loja
    const gradeValue = values.find(
      (v) => v.value === gradeName && v.is_active !== false
    );

    if (gradeValue && gradeValue.grade_sizes) {
      return gradeValue.grade_sizes.sort((a, b) => parseInt(a) - parseInt(b));
    }

    // Fallback para configuração local
    const gradePairs = gradePairsConfig[gradeName] || {};
    return Object.keys(gradePairs).sort((a, b) => parseInt(a) - parseInt(b));
  };

  // Função para obter informações da grade
  const getGradeInfo = (gradeName: string) => {
    const gradeValue = values.find(
      (v) => v.value === gradeName && v.is_active !== false
    );

    return (
      gradeValue?.grade_config || {
        name: gradeName,
        description: `Grade ${gradeName}`,
        type: "custom",
      }
    );
  };

  // Detectar e carregar variações existentes
  useEffect(() => {
    if (variations.length > 0 && groups.length > 0 && values.length > 0) {
      console.log(
        "🔄 Inicializando com variações existentes:",
        variations.length
      );

      // Detectar grupos usados nas variações existentes
      const usedGroups: string[] = [];
      const usedValues: { [groupId: string]: string[] } = {};

      variations.forEach((variation) => {
        // Detectar cor
        if (variation.color) {
          const colorGroup = groups.find((g) => g.attribute_key === "color");
          if (colorGroup && !usedGroups.includes(colorGroup.id)) {
            usedGroups.push(colorGroup.id);
            usedValues[colorGroup.id] = [];
          }

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

        // Detectar tamanho
        if (variation.size) {
          const sizeGroup = groups.find((g) => g.attribute_key === "size");
          if (sizeGroup && !usedGroups.includes(sizeGroup.id)) {
            usedGroups.push(sizeGroup.id);
            usedValues[sizeGroup.id] = [];
          }

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

      setSelectedGroups(usedGroups);
      setSelectedValues(usedValues);
      setAutoGenerateMode(false); // Modo manual quando há variações existentes
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

  // ✅ GERAÇÃO INTELIGENTE DE COMBINAÇÕES
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

    // Detectar se há grupo de grade
    const isGrade = selectedGroups.some((groupId) => {
      const group = groups.find((g) => g.id === groupId);
      return group?.attribute_key === "grade";
    });

    // Converter combinações em variações
    const newVariations: ProductVariation[] = groupCombinations.map(
      (combination, index) => {
        const variation: ProductVariation = {
          id: `variation-${Date.now()}-${index}`,
          product_id: productId || "",
          sku: "",
          stock: bulkStock,
          price_adjustment: bulkPriceAdjustment,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          variation_type: isGrade ? "grade" : "standard",
          is_grade: isGrade,
          name: "", // Será preenchido abaixo
        };

        // Mapear valores para propriedades específicas
        const variationValues: string[] = [];
        selectedGroups.forEach((groupId, groupIndex) => {
          const group = groups.find((g) => g.id === groupId);
          if (!group) return;

          const value = combination[groupIndex];
          if (!value) return;

          variationValues.push(value);

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
            case "grade":
              variation.grade_name = value;
              break;
            default:
              variation.variation_value = value;
              break;
          }
        });

        // Definir nome da variação baseado nos valores
        variation.name = variationValues.join(" - ");

        return variation;
      }
    );

    onVariationsChange(newVariations);

    toast({
      title: "✅ Variações geradas com sucesso!",
      description: `${newVariations.length} combinações criadas automaticamente.`,
      duration: 3000,
    });
  };

  // ✅ OPERAÇÕES EM MASSA
  const applyBulkStock = () => {
    if (bulkStock < 0) return;

    const updatedVariations = variations.map((variation) => ({
      ...variation,
      stock: bulkStock,
    }));

    onVariationsChange(updatedVariations);
    setBulkStock(0);

    toast({
      title: "✅ Estoque aplicado em massa!",
      description: `${variations.length} variações atualizadas.`,
      duration: 2000,
    });
  };

  const applyBulkPriceAdjustment = () => {
    const updatedVariations = variations.map((variation) => ({
      ...variation,
      price_adjustment: bulkPriceAdjustment,
    }));

    onVariationsChange(updatedVariations);
    setBulkPriceAdjustment(0);

    toast({
      title: "✅ Ajuste de preço aplicado em massa!",
      description: `${variations.length} variações atualizadas.`,
      duration: 2000,
    });
  };

  const duplicateVariation = (variation: ProductVariation) => {
    const newVariation: ProductVariation = {
      ...variation,
      id: `copy-${Date.now()}`,
      sku: `${variation.sku}-copy`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onVariationsChange([...variations, newVariation]);

    toast({
      title: "✅ Variação duplicada!",
      description: "Uma cópia foi criada com sucesso.",
      duration: 2000,
    });
  };

  // Substituir a função removeVariation para usar deleteVariationById do hook
  const removeVariation = async (id: string) => {
    const ok = await deleteVariationById(id);
    if (ok) {
      onVariationsChange(variations.filter((v) => v.id !== id));
    }
  };

  const updateVariation = (
    id: string,
    field: keyof ProductVariation,
    value: any
  ) => {
    const updatedVariations = variations.map((variation) =>
      variation.id === id ? { ...variation, [field]: value } : variation
    );
    onVariationsChange(updatedVariations);
  };

  const toggleVariationStatus = (id: string) => {
    const updatedVariations = variations.map((variation) =>
      variation.id === id
        ? { ...variation, is_active: !variation.is_active }
        : variation
    );
    onVariationsChange(updatedVariations);
  };

  // ✅ GERAÇÃO INTELIGENTE DE SKU
  const generateSKU = (variation: ProductVariation) => {
    const colorCode = variation.color?.substring(0, 2).toUpperCase() || "XX";
    const sizeCode = variation.size?.substring(0, 2).toUpperCase() || "XX";
    const timestamp = Date.now().toString().slice(-4);
    const newSKU = `${colorCode}${sizeCode}-${timestamp}`;

    updateVariation(variation.id, "sku", newSKU);
  };

  // ✅ FUNÇÕES PARA GERENCIAMENTO DE GRADE
  const addGradeConfig = () => {
    const newGrade: GradeConfig = {
      id: `grade-${Date.now()}`,
      name: `Grade ${gradeConfigs.length + 1}`,
      sizes: [],
      pairsPerSize: {},
      minGradeQuantity: 1,
    };
    setGradeConfigs([...gradeConfigs, newGrade]);
  };

  const updateGradeConfig = (
    id: string,
    field: keyof GradeConfig,
    value: any
  ) => {
    setGradeConfigs(
      gradeConfigs.map((grade) =>
        grade.id === id ? { ...grade, [field]: value } : grade
      )
    );
  };

  const removeGradeConfig = (id: string) => {
    setGradeConfigs(gradeConfigs.filter((grade) => grade.id !== id));
  };

  const addSizeToGrade = (gradeId: string, size: string) => {
    const grade = gradeConfigs.find((g) => g.id === gradeId);
    if (grade && !grade.sizes.includes(size)) {
      const updatedGrade = {
        ...grade,
        sizes: [...grade.sizes, size],
        pairsPerSize: { ...grade.pairsPerSize, [size]: 1 },
      };
      setGradeConfigs(
        gradeConfigs.map((g) => (g.id === gradeId ? updatedGrade : g))
      );
    }
  };

  const removeSizeFromGrade = (gradeId: string, size: string) => {
    const grade = gradeConfigs.find((g) => g.id === gradeId);
    if (grade) {
      const updatedGrade = {
        ...grade,
        sizes: grade.sizes.filter((s) => s !== size),
        pairsPerSize: { ...grade.pairsPerSize },
      };
      delete updatedGrade.pairsPerSize[size];
      setGradeConfigs(
        gradeConfigs.map((g) => (g.id === gradeId ? updatedGrade : g))
      );
    }
  };

  const updatePairsPerSize = (gradeId: string, size: string, pairs: number) => {
    const grade = gradeConfigs.find((g) => g.id === gradeId);
    if (grade) {
      const updatedGrade = {
        ...grade,
        pairsPerSize: { ...grade.pairsPerSize, [size]: pairs },
      };
      setGradeConfigs(
        gradeConfigs.map((g) => (g.id === gradeId ? updatedGrade : g))
      );
    }
  };

  const addNewSize = (gradeId: string) => {
    if (newSize.trim() && !defaultSizes.includes(newSize.trim())) {
      addSizeToGrade(gradeId, newSize.trim());
      setNewSize("");
    }
  };

  const getAllSizes = () => {
    const allSizes = new Set([...defaultSizes]);
    gradeConfigs.forEach((grade) => {
      grade.sizes.forEach((size) => allSizes.add(size));
    });
    return Array.from(allSizes).sort((a, b) => parseInt(a) - parseInt(b));
  };

  // ✅ GERAÇÃO DE VARIAÇÕES POR GRADE (USANDO GRADES DA LOJA)
  const generateGradeVariations = () => {
    if (selectedColors.length === 0 || selectedGrades.length === 0) {
      toast({
        title: "⚠️ Configuração incompleta",
        description: "Selecione pelo menos uma cor e uma grade.",
        duration: 3000,
      });
      return;
    }

    const newVariations: ProductVariation[] = [];

    selectedColors.forEach((color, colorIdx) => {
      selectedGrades.forEach((gradeName, gradeIdx) => {
        const uniqueSuffix = `${Date.now()
          .toString()
          .slice(-4)}-${colorIdx}-${gradeIdx}`;

        // Obter tamanhos e pares da grade
        const gradeSizes = getGradeSizes(gradeName);
        const gradePairs = gradePairsConfig[gradeName] || {};

        const variation: ProductVariation = {
          id: `grade-${uniqueSuffix}`,
          product_id: productId || "",
          color: color,
          grade_name: gradeName,
          grade_sizes: gradeSizes,
          grade_pairs: gradeSizes.map((size) => gradePairs[size] || 1),
          grade_quantity: 1,
          sku: `${color.substring(0, 2).toUpperCase()}${gradeName
            .substring(0, 2)
            .toUpperCase()}-${uniqueSuffix}`,
          stock: gradeStock,
          price_adjustment: gradePriceAdjustment,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_grade: true,
          variation_type: "grade",
          name: `${color} - ${gradeName}`,
        };
        newVariations.push(variation);
      });
    });

    onVariationsChange([...variations, ...newVariations]);

    toast({
      title: "✅ Variações por grade criadas!",
      description: `${newVariations.length} variações compostas (cor + grade) foram adicionadas.`,
      duration: 3000,
    });
  };

  // Obter cores disponíveis
  const availableColors = values
    .filter((v) => {
      const group = groups.find((g) => g.id === v.group_id);
      return group?.attribute_key === "color" && v.is_active;
    })
    .map((v) => v.value);

  // Obter grades disponíveis da loja
  const availableGrades = values
    .filter((v) => {
      const group = groups.find((g) => g.id === v.group_id);
      return group?.attribute_key === "grade" && v.is_active;
    })
    .map((v) => v.value);

  // Tamanhos padrão para calçados
  const defaultSizes = [
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Variações Inteligentes
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
            Variações Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Nenhum grupo de variação encontrado para sua loja. Configure
              grupos de variação (cores, tamanhos, etc.) para usar a criação
              inteligente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {/* Remover o switch visual de 'Variação por Grade' */}
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Variações Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as any)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wizard">Assistente</TabsTrigger>
            <TabsTrigger value="matrix">Matriz</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="grade">Grade</TabsTrigger>
          </TabsList>

          {/* ✅ MODO ASSISTENTE INTELIGENTE */}
          <TabsContent value="wizard" className="space-y-6">
            {/* Configuração de Modo */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Modo de Criação</Label>
                <p className="text-xs text-muted-foreground">
                  {autoGenerateMode
                    ? "Geração automática de todas as combinações"
                    : "Configuração manual de variações específicas"}
                </p>
              </div>
              <Switch
                checked={autoGenerateMode}
                onCheckedChange={setAutoGenerateMode}
              />
            </div>

            {/* Seleção de Grupos */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                1. Selecione os tipos de variação
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Seleção de Valores */}
            {selectedGroups.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  2. Selecione os valores para cada tipo
                </Label>
                {selectedGroups.map((groupId) => {
                  const group = groups.find((g) => g.id === groupId);
                  const groupValues = values.filter(
                    (v) => v.group_id === groupId && v.is_active
                  );

                  if (!group) return null;

                  return (
                    <Card key={groupId}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getGroupIcon(group.attribute_key)}
                          {group.name}
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
                              onClick={() =>
                                handleValueToggle(groupId, value.id)
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedValues[groupId]?.includes(value.id) ||
                                  false
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

            {/* Configurações em Massa */}
            {selectedGroups.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  3. Configurações em massa (opcional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-stock">Estoque padrão</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bulk-stock"
                        type="number"
                        min="0"
                        value={bulkStock}
                        onChange={(e) =>
                          setBulkStock(parseInt(e.target.value) || 0)
                        }
                        placeholder="0"
                      />
                      <Button
                        onClick={applyBulkStock}
                        size="sm"
                        variant="outline"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-price">Ajuste de preço padrão</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bulk-price"
                        type="number"
                        step="0.01"
                        value={bulkPriceAdjustment}
                        onChange={(e) =>
                          setBulkPriceAdjustment(
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                      />
                      <Button
                        onClick={applyBulkPriceAdjustment}
                        size="sm"
                        variant="outline"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Geração */}
            {selectedGroups.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={generateAllCombinations}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  {autoGenerateMode
                    ? "Gerar Todas as Combinações"
                    : "Gerar Combinações Selecionadas"}
                  {selectedGroups.reduce((total, groupId) => {
                    const groupValueCount =
                      selectedValues[groupId]?.length || 0;
                    return total === 0
                      ? groupValueCount
                      : total * groupValueCount;
                  }, 0) > 0 && (
                    <Badge variant="secondary">
                      {selectedGroups.reduce((total, groupId) => {
                        const groupValueCount =
                          selectedValues[groupId]?.length || 0;
                        return total === 0
                          ? groupValueCount
                          : total * groupValueCount;
                      }, 0)}{" "}
                      variações
                    </Badge>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ✅ MODO MATRIZ */}
          <TabsContent value="matrix" className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <Grid className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Modo matriz em desenvolvimento</p>
              <p className="text-sm">
                Use o modo assistente para criar variações
              </p>
            </div>
          </TabsContent>

          {/* ✅ MODO LISTA */}
          <TabsContent value="list" className="space-y-4">
            {variations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma variação criada ainda</p>
                <p className="text-sm">
                  Use o modo assistente para criar variações
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {variations.map((variation, index) => (
                  <Card
                    key={variation.id}
                    className={`${!variation.is_active ? "opacity-60" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Variação #{index + 1}</Badge>
                          {/* Badge de Grade */}
                          {variation.grade_name && (
                            <Badge
                              variant="default"
                              className="bg-blue-600 text-white"
                            >
                              Grade: {variation.grade_name}
                            </Badge>
                          )}
                          {!variation.is_active && (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => toggleVariationStatus(variation.id)}
                            variant="ghost"
                            size="sm"
                          >
                            {variation.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => duplicateVariation(variation)}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => removeVariation(variation.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Exibir detalhes da grade se for variação de grade */}
                      {variation.grade_name && (
                        <div className="mb-2 text-xs text-blue-900 font-semibold flex flex-wrap gap-2">
                          <span>Grade: {variation.grade_name}</span>
                          {variation.grade_sizes &&
                            variation.grade_sizes.length > 0 && (
                              <span>
                                Tamanhos: {variation.grade_sizes.join(", ")}
                              </span>
                            )}
                          {variation.grade_pairs &&
                            variation.grade_pairs.length > 0 && (
                              <span>
                                Pares: {variation.grade_pairs.join(", ")}
                              </span>
                            )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label>Cor</Label>
                          <Input
                            value={variation.color || ""}
                            onChange={(e) =>
                              updateVariation(
                                variation.id,
                                "color",
                                e.target.value
                              )
                            }
                            placeholder="Ex: Azul"
                          />
                        </div>
                        {/* Campo Tamanho só para variações simples */}
                        {!variation.grade_name && (
                          <div>
                            <Label>Tamanho</Label>
                            <Input
                              value={variation.size || ""}
                              onChange={(e) =>
                                updateVariation(
                                  variation.id,
                                  "size",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: M"
                            />
                          </div>
                        )}
                        {/* Campo Grade somente leitura */}
                        {variation.grade_name && (
                          <div>
                            <Label>Grade</Label>
                            <Input
                              value={variation.grade_name}
                              readOnly
                              className="bg-gray-100 font-bold"
                            />
                          </div>
                        )}
                        <div>
                          <Label>SKU</Label>
                          <div className="flex gap-2">
                            <Input
                              value={variation.sku || ""}
                              onChange={(e) =>
                                updateVariation(
                                  variation.id,
                                  "sku",
                                  e.target.value
                                )
                              }
                              placeholder="Código único"
                            />
                            <Button
                              onClick={() => generateSKU(variation)}
                              size="sm"
                              variant="outline"
                            >
                              <Wand2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Estoque</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variation.stock}
                            onChange={(e) =>
                              updateVariation(
                                variation.id,
                                "stock",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Ajuste de Preço</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variation.price_adjustment}
                            onChange={(e) =>
                              updateVariation(
                                variation.id,
                                "price_adjustment",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ✅ MODO GRADE */}
          <TabsContent value="grade" className="space-y-6">
            <div className="text-center mb-6">
              <Layers className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold">
                Variações por Grade de Pares
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure grades (Baixa, Alta, etc.) com tamanhos e quantidades
                para vendas por grade
              </p>
            </div>

            {/* Seleção de Cores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  1. Selecione as Cores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableColors.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Nenhuma cor configurada. Configure cores na seção de
                      variações da loja primeiro.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableColors.map((color) => (
                      <div
                        key={color}
                        className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                          selectedColors.includes(color)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedColors((prev) =>
                            prev.includes(color)
                              ? prev.filter((c) => c !== color)
                              : [...prev, color]
                          );
                        }}
                      >
                        <Checkbox
                          checked={selectedColors.includes(color)}
                          onCheckedChange={() => {
                            setSelectedColors((prev) =>
                              prev.includes(color)
                                ? prev.filter((c) => c !== color)
                                : [...prev, color]
                            );
                          }}
                        />
                        <span className="text-sm">{color}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seleção de Grades da Loja */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  2. Selecione as Grades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableGrades.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Nenhuma grade configurada. As grades padrão (Baixa
                      Infantil, Baixa Feminino, etc.) serão criadas
                      automaticamente.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableGrades.map((grade) => (
                      <div
                        key={grade}
                        className={`flex items-center space-x-2 p-3 rounded border cursor-pointer transition-colors ${
                          selectedGrades.includes(grade)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedGrades((prev) =>
                            prev.includes(grade)
                              ? prev.filter((g) => g !== grade)
                              : [...prev, grade]
                          );
                        }}
                      >
                        <Checkbox
                          checked={selectedGrades.includes(grade)}
                          onCheckedChange={() => {
                            setSelectedGrades((prev) =>
                              prev.includes(grade)
                                ? prev.filter((g) => g !== grade)
                                : [...prev, grade]
                            );
                          }}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{grade}</span>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const gradeInfo = getGradeInfo(grade);
                              const gradeSizes = getGradeSizes(grade);
                              return gradeSizes.length > 0
                                ? `${gradeSizes.length} tamanhos configurados`
                                : gradeInfo.description || "Grade da loja";
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuração Avançada de Grades (Opcional) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    3. Configuração Avançada (Opcional)
                  </CardTitle>
                  <Button onClick={addGradeConfig} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Grade Personalizada
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {gradeConfigs.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Settings className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Nenhuma grade personalizada configurada
                    </p>
                    <p className="text-xs">
                      Use grades padrão ou adicione configurações personalizadas
                    </p>
                  </div>
                ) : (
                  gradeConfigs.map((grade) => (
                    <Card key={grade.id} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Input
                              value={grade.name}
                              onChange={(e) =>
                                updateGradeConfig(
                                  grade.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-32"
                              placeholder="Nome da grade"
                            />
                            <Badge variant="outline">
                              {grade.sizes.length} tamanhos
                            </Badge>
                          </div>
                          <Button
                            onClick={() => removeGradeConfig(grade.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Tamanhos da Grade */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">
                            Tamanhos da Grade:
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {getAllSizes().map((size) => (
                              <div
                                key={size}
                                className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                                  grade.sizes.includes(size)
                                    ? "bg-primary/10 border-primary"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => {
                                  if (grade.sizes.includes(size)) {
                                    removeSizeFromGrade(grade.id, size);
                                  } else {
                                    addSizeToGrade(grade.id, size);
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={grade.sizes.includes(size)}
                                  onCheckedChange={() => {
                                    if (grade.sizes.includes(size)) {
                                      removeSizeFromGrade(grade.id, size);
                                    } else {
                                      addSizeToGrade(grade.id, size);
                                    }
                                  }}
                                />
                                <span className="text-sm">{size}</span>
                              </div>
                            ))}
                          </div>

                          {/* Adicionar Novo Tamanho */}
                          <div className="flex gap-2 mt-3">
                            <Input
                              value={newSize}
                              onChange={(e) => setNewSize(e.target.value)}
                              placeholder="Novo tamanho (ex: 49)"
                              className="flex-1"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  addNewSize(grade.id);
                                }
                              }}
                            />
                            <Button
                              onClick={() => addNewSize(grade.id)}
                              size="sm"
                              variant="outline"
                              disabled={!newSize.trim()}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Quantidade de Pares por Tamanho */}
                        {grade.sizes.length > 0 && (
                          <div className="space-y-3 mt-4">
                            <Label className="text-sm font-medium">
                              Quantidade de Pares por Tamanho:
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {grade.sizes.map((size) => (
                                <div key={size} className="space-y-1">
                                  <Label className="text-xs">
                                    Tamanho {size}
                                  </Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={grade.pairsPerSize[size] || 1}
                                    onChange={(e) =>
                                      updatePairsPerSize(
                                        grade.id,
                                        size,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quantidade Mínima de Grades */}
                        <div className="mt-4">
                          <Label className="text-sm font-medium">
                            Quantidade Mínima de Grades:
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={grade.minGradeQuantity}
                            onChange={(e) =>
                              updateGradeConfig(
                                grade.id,
                                "minGradeQuantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-32 mt-1"
                            placeholder="1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Configurações em Massa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  4. Configurações em Massa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade-stock">Estoque por Grade</Label>
                    <Input
                      id="grade-stock"
                      type="number"
                      min="0"
                      value={gradeStock}
                      onChange={(e) =>
                        setGradeStock(parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade-price">
                      Ajuste de Preço por Grade
                    </Label>
                    <Input
                      id="grade-price"
                      type="number"
                      step="0.01"
                      value={gradePriceAdjustment}
                      onChange={(e) =>
                        setGradePriceAdjustment(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuração de Pares por Grade */}
            {selectedGrades.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    3. Configurar Pares por Tamanho
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedGrades.map((gradeName) => {
                    const gradeSizes = getGradeSizes(gradeName);
                    const gradePairs = gradePairsConfig[gradeName] || {};

                    return (
                      <div key={gradeName} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{gradeName}</h4>
                        {gradeSizes.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {gradeSizes.map((size) => (
                              <div key={size} className="space-y-1">
                                <Label className="text-xs">
                                  Tamanho {size}
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={gradePairs[size] || 1}
                                  onChange={(e) =>
                                    updateGradePairs(
                                      gradeName,
                                      size,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="text-sm"
                                  placeholder="Pares"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p className="text-sm">
                              Nenhum tamanho configurado para esta grade
                            </p>
                            <p className="text-xs">
                              Configure os tamanhos no grupo de variações
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Botão de Geração */}
            <div className="flex justify-center">
              <Button
                onClick={generateGradeVariations}
                size="lg"
                className="flex items-center gap-2"
                disabled={
                  selectedColors.length === 0 || selectedGrades.length === 0
                }
              >
                <Layers className="w-5 h-5" />
                Gerar Variações por Grade
                {selectedColors.length > 0 && selectedGrades.length > 0 && (
                  <Badge variant="secondary">
                    {selectedColors.length * selectedGrades.length} variações
                  </Badge>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IntelligentVariationsForm;
