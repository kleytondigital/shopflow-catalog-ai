import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Layers,
  Plus,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Eye,
  Package,
  Palette,
  Ruler,
  Grid3X3,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ColorSizeWizardProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  onBack: () => void;
  productName?: string;
}

interface ColorConfig {
  name: string;
  selected: boolean;
  hex?: string;
}

interface SizeConfig {
  name: string;
  selected: boolean;
}

interface VariationConfig {
  color: string;
  size: string;
  stock: number;
  priceAdjustment: number;
}

const ColorSizeWizard: React.FC<ColorSizeWizardProps> = ({
  variations,
  onVariationsChange,
  onBack,
  productName = "Produto",
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [customColorInput, setCustomColorInput] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [colorConfigs, setColorConfigs] = useState<ColorConfig[]>([]);
  const [sizeConfigs, setSizeConfigs] = useState<SizeConfig[]>([]);
  const [variationConfigs, setVariationConfigs] = useState<VariationConfig[]>(
    []
  );
  const [bulkStock, setBulkStock] = useState(10);
  const [bulkPriceAdjustment, setBulkPriceAdjustment] = useState(0);

  // Cores pré-definidas
  const predefinedColors = [
    { name: "Preto", hex: "#000000" },
    { name: "Branco", hex: "#FFFFFF" },
    { name: "Azul", hex: "#2563EB" },
    { name: "Vermelho", hex: "#DC2626" },
    { name: "Verde", hex: "#16A34A" },
    { name: "Rosa", hex: "#EC4899" },
    { name: "Amarelo", hex: "#EAB308" },
    { name: "Roxo", hex: "#9333EA" },
  ];

  // Tamanhos pré-definidos por categoria
  const sizeTemplates = {
    roupas: ["PP", "P", "M", "G", "GG", "XGG"],
    basicas: ["P", "M", "G", "GG"],
    calcados: ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42"],
  };

  // Inicializar configurações
  React.useEffect(() => {
    if (colorConfigs.length === 0) {
      setColorConfigs(
        predefinedColors.map((color) => ({
          name: color.name,
          hex: color.hex,
          selected: false,
        }))
      );
    }

    if (sizeConfigs.length === 0) {
      setSizeConfigs(
        sizeTemplates.roupas.map((size) => ({
          name: size,
          selected: false,
        }))
      );
    }
  }, []);

  const steps = [
    {
      id: 0,
      title: "Selecionar Cores",
      description: "Escolha as cores disponíveis",
    },
    {
      id: 1,
      title: "Selecionar Tamanhos",
      description: "Escolha os tamanhos disponíveis",
    },
    {
      id: 2,
      title: "Configurar Matriz",
      description: "Configure estoque e preços por combinação",
    },
    {
      id: 3,
      title: "Revisar e Finalizar",
      description: "Confirme as variações criadas",
    },
  ];

  const selectedColors = React.useMemo(() => 
    colorConfigs.filter((color) => color.selected), 
    [colorConfigs]
  );
  
  const selectedSizes = React.useMemo(() => 
    sizeConfigs.filter((size) => size.selected), 
    [sizeConfigs]
  );

  // Gerar combinações quando cores e tamanhos mudarem
  React.useEffect(() => {
    if (selectedColors.length > 0 && selectedSizes.length > 0) {
      const combinations: VariationConfig[] = [];
      selectedColors.forEach((color) => {
        selectedSizes.forEach((size) => {
          combinations.push({
            color: color.name,
            size: size.name,
            stock: bulkStock,
            priceAdjustment: bulkPriceAdjustment,
          });
        });
      });
      setVariationConfigs(combinations);
    } else {
      setVariationConfigs([]);
    }
  }, [selectedColors, selectedSizes, bulkStock, bulkPriceAdjustment]);

  const toggleColor = (colorName: string) => {
    setColorConfigs((prev) =>
      prev.map((color) =>
        color.name === colorName
          ? { ...color, selected: !color.selected }
          : color
      )
    );
  };

  const toggleSize = (sizeName: string) => {
    setSizeConfigs((prev) =>
      prev.map((size) =>
        size.name === sizeName ? { ...size, selected: !size.selected } : size
      )
    );
  };

  const addCustomColor = () => {
    if (!customColorInput.trim()) return;

    if (
      colorConfigs.find(
        (c) => c.name.toLowerCase() === customColorInput.toLowerCase()
      )
    ) {
      toast({
        title: "Cor já existe",
        description: "Esta cor já foi adicionada à lista.",
        variant: "destructive",
      });
      return;
    }

    setColorConfigs((prev) => [
      ...prev,
      {
        name: customColorInput.trim(),
        selected: true,
      },
    ]);

    setCustomColorInput("");
    toast({
      title: "Cor adicionada!",
      description: `A cor "${customColorInput}" foi adicionada.`,
    });
  };

  const addCustomSize = () => {
    if (!customSizeInput.trim()) return;

    if (
      sizeConfigs.find(
        (s) => s.name.toLowerCase() === customSizeInput.toLowerCase()
      )
    ) {
      toast({
        title: "Tamanho já existe",
        description: "Este tamanho já foi adicionado à lista.",
        variant: "destructive",
      });
      return;
    }

    setSizeConfigs((prev) => [
      ...prev,
      {
        name: customSizeInput.trim(),
        selected: true,
      },
    ]);

    setCustomSizeInput("");
    toast({
      title: "Tamanho adicionado!",
      description: `O tamanho "${customSizeInput}" foi adicionado.`,
    });
  };

  const applySizeTemplate = (template: string[]) => {
    setSizeConfigs(
      template.map((size) => ({
        name: size,
        selected: false,
      }))
    );
  };

  const updateVariationConfig = (
    color: string,
    size: string,
    field: "stock" | "priceAdjustment",
    value: number
  ) => {
    setVariationConfigs((prev) =>
      prev.map((variation) =>
        variation.color === color && variation.size === size
          ? { ...variation, [field]: value }
          : variation
      )
    );
  };

  const applyBulkConfig = () => {
    setVariationConfigs((prev) =>
      prev.map((variation) => ({
        ...variation,
        stock: bulkStock,
        priceAdjustment: bulkPriceAdjustment,
      }))
    );

    toast({
      title: "Configuração aplicada!",
      description: "Valores aplicados a todas as combinações.",
    });
  };

  const generateVariations = useCallback(() => {
    const newVariations: ProductVariation[] = variationConfigs.map(
      (config, index) => ({
        id: `color-size-${Date.now()}-${index}`,
        product_id: "",
        color: config.color,
        size: config.size,
        sku: `${config.color.toLowerCase()}-${config.size.toLowerCase()}`.replace(
          /\s+/g,
          "-"
        ),
        stock: config.stock,
        price_adjustment: config.priceAdjustment,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: index + 1,
        variation_type: "color_size",
      })
    );

    onVariationsChange(newVariations);

    toast({
      title: "✅ Variações criadas!",
      description: `${newVariations.length} variações foram configuradas.`,
    });
  }, [variationConfigs, onVariationsChange, toast]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return selectedColors.length > 0;
      case 1:
        return selectedSizes.length > 0;
      case 2:
        return variationConfigs.every((config) => config.stock >= 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep === 2) {
        generateVariations();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Palette className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Selecione as Cores</h3>
              <p className="text-gray-600">
                Escolha todas as cores disponíveis
              </p>
            </div>

            {/* Cores pré-definidas */}
            <div>
              <Label className="text-sm font-medium">Cores Populares</Label>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-2">
                {predefinedColors.map((color) => {
                  const config = colorConfigs.find(
                    (c) => c.name === color.name
                  );
                  const isSelected = config?.selected || false;

                  return (
                    <div
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`relative cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border mx-auto mb-2"
                        style={{
                          backgroundColor: color.hex,
                          borderColor:
                            color.hex === "#FFFFFF" ? "#e5e7eb" : color.hex,
                        }}
                      />
                      <p className="text-xs text-center font-medium">
                        {color.name}
                      </p>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1">
                          <Check className="w-4 h-4 text-blue-600 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adicionar cor customizada */}
            <div>
              <Label className="text-sm font-medium">
                Adicionar Cor Personalizada
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Ex: Azul Bebê, Verde Limão"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomColor()}
                />
                <Button onClick={addCustomColor} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Cores selecionadas */}
            {selectedColors.length > 0 && (
              <div>
                <Label className="text-sm font-medium">
                  Cores Selecionadas ({selectedColors.length})
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedColors.map((color) => (
                    <Badge
                      key={color.name}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Palette className="w-3 h-3" />
                      {color.name}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => toggleColor(color.name)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Ruler className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Selecione os Tamanhos</h3>
              <p className="text-gray-600">Escolha os tamanhos disponíveis</p>
            </div>

            {/* Templates de tamanho */}
            <div>
              <Label className="text-sm font-medium">
                Templates de Tamanho
              </Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySizeTemplate(sizeTemplates.basicas)}
                >
                  P, M, G, GG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySizeTemplate(sizeTemplates.roupas)}
                >
                  PP ao XGG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySizeTemplate(sizeTemplates.calcados)}
                >
                  Calçados (33-42)
                </Button>
              </div>
            </div>

            {/* Tamanhos disponíveis */}
            <div>
              <Label className="text-sm font-medium">
                Tamanhos Disponíveis
              </Label>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
                {sizeConfigs.map((size) => (
                  <div
                    key={size.name}
                    onClick={() => toggleSize(size.name)}
                    className={`cursor-pointer p-3 rounded-lg border-2 text-center transition-all duration-200 hover:scale-105 ${
                      size.selected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-medium">{size.name}</span>
                    {size.selected && (
                      <Check className="w-3 h-3 text-green-600 mx-auto mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Adicionar tamanho customizado */}
            <div>
              <Label className="text-sm font-medium">
                Adicionar Tamanho Personalizado
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Ex: 42, XXG, 10-12 anos"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomSize()}
                />
                <Button onClick={addCustomSize} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tamanhos selecionados */}
            {selectedSizes.length > 0 && (
              <div>
                <Label className="text-sm font-medium">
                  Tamanhos Selecionados ({selectedSizes.length})
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSizes.map((size) => (
                    <Badge
                      key={size.name}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Ruler className="w-3 h-3" />
                      {size.name}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => toggleSize(size.name)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Grid3X3 className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Configure a Matriz</h3>
              <p className="text-gray-600">
                {selectedColors.length} cores × {selectedSizes.length} tamanhos
                = {variationConfigs.length} variações
              </p>
            </div>

            {/* Configuração em massa */}
            <Card className="p-4 bg-blue-50">
              <h4 className="font-medium mb-3">
                ⚡ Configuração Rápida (aplicar a todas)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Estoque por variação</Label>
                  <Input
                    type="number"
                    min="0"
                    value={bulkStock}
                    onChange={(e) =>
                      setBulkStock(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm">Ajuste de preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={bulkPriceAdjustment}
                    onChange={(e) =>
                      setBulkPriceAdjustment(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={applyBulkConfig} className="w-full">
                    Aplicar a Todas
                  </Button>
                </div>
              </div>
            </Card>

            {/* Matriz de variações */}
            <div>
              <Label className="text-sm font-medium">Matriz de Variações</Label>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left text-sm font-medium">Cor</th>
                      <th className="p-2 text-left text-sm font-medium">
                        Tamanho
                      </th>
                      <th className="p-2 text-left text-sm font-medium">
                        Estoque
                      </th>
                      <th className="p-2 text-left text-sm font-medium">
                        Ajuste (R$)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variationConfigs.slice(0, 20).map((config, index) => (
                      <tr
                        key={`${config.color}-${config.size}`}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{
                                backgroundColor:
                                  colorConfigs.find(
                                    (c) => c.name === config.color
                                  )?.hex || "#ccc",
                              }}
                            />
                            <span className="text-sm">{config.color}</span>
                          </div>
                        </td>
                        <td className="p-2 text-sm">{config.size}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            value={config.stock}
                            onChange={(e) =>
                              updateVariationConfig(
                                config.color,
                                config.size,
                                "stock",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16 h-8 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={config.priceAdjustment}
                            onChange={(e) =>
                              updateVariationConfig(
                                config.color,
                                config.size,
                                "priceAdjustment",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 h-8 text-xs"
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {variationConfigs.length > 20 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Mostrando 20 de {variationConfigs.length} variações. Use a
                    configuração rápida para ajustar todas de uma vez.
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Eye className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Revisar Variações</h3>
              <p className="text-gray-600">
                Confirme as {variationConfigs.length} variações criadas para{" "}
                {productName}
              </p>
            </div>

            {/* Resumo */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {variationConfigs.length} variações configuradas
                </span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>Cores: {selectedColors.map((c) => c.name).join(", ")}</p>
                <p>Tamanhos: {selectedSizes.map((s) => s.name).join(", ")}</p>
                <p>
                  Total de unidades:{" "}
                  {variationConfigs.reduce(
                    (sum, config) => sum + config.stock,
                    0
                  )}
                </p>
              </div>
            </div>

            {/* Preview das variações */}
            <div>
              <Label className="text-sm font-medium">
                Preview das Variações
              </Label>
              <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                {variationConfigs.slice(0, 10).map((config, index) => (
                  <Card key={`${config.color}-${config.size}`} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">
                          {productName} - {config.color} - {config.size}
                        </span>
                      </div>
                      <div className="text-right text-sm">
                        <div>
                          Estoque: <strong>{config.stock}</strong>
                        </div>
                        {config.priceAdjustment !== 0 && (
                          <div
                            className={
                              config.priceAdjustment > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {config.priceAdjustment > 0 ? "+" : ""}R${" "}
                            {config.priceAdjustment.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {variationConfigs.length > 10 && (
                  <p className="text-center text-sm text-gray-500">
                    ... e mais {variationConfigs.length - 10} variações
                  </p>
                )}
              </div>
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Pronto!</strong> Suas {variationConfigs.length}{" "}
                variações serão criadas automaticamente ao finalizar.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            🎨📏 Assistente de Cores + Tamanhos
          </h2>
          <Badge variant="outline">
            Passo {currentStep + 1} de {steps.length}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center ${
                  index <= currentStep ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? "bg-blue-600 text-white"
                      : index === currentStep
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm font-medium hidden md:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 rounded ${
                    index < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onBack : prevStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 0 ? "Voltar" : "Anterior"}
        </Button>

        <div className="flex items-center gap-3">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                toast({
                  title: "🎉 Sucesso!",
                  description: `${variationConfigs.length} variações configuradas com sucesso!`,
                });
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorSizeWizard;
