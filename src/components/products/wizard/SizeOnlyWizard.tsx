import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Ruler,
  Plus,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Eye,
  Package,
  Shirt,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SizeOnlyWizardProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  onBack: () => void;
  productName?: string;
}

interface SizeConfig {
  name: string;
  selected: boolean;
  stock: number;
  priceAdjustment: number;
}

interface SizeTemplate {
  name: string;
  description: string;
  sizes: string[];
  category: string;
}

const SizeOnlyWizard: React.FC<SizeOnlyWizardProps> = ({
  variations,
  onVariationsChange,
  onBack,
  productName = "Produto",
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [sizeConfigs, setSizeConfigs] = useState<SizeConfig[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Templates de tamanhos pré-definidos
  const sizeTemplates: SizeTemplate[] = [
    {
      name: "Roupas Básicas",
      description: "P, M, G, GG",
      sizes: ["P", "M", "G", "GG"],
      category: "roupas",
    },
    {
      name: "Roupas Completas",
      description: "PP, P, M, G, GG, XGG",
      sizes: ["PP", "P", "M", "G", "GG", "XGG"],
      category: "roupas",
    },
    {
      name: "Roupas Infantis",
      description: "RN, P, M, G, 1, 2, 4, 6, 8",
      sizes: ["RN", "P", "M", "G", "1", "2", "4", "6", "8"],
      category: "infantil",
    },
    {
      name: "Calçados Femininos",
      description: "33 ao 39",
      sizes: ["33", "34", "35", "36", "37", "38", "39"],
      category: "calcados",
    },
    {
      name: "Calçados Masculinos",
      description: "38 ao 44",
      sizes: ["38", "39", "40", "41", "42", "43", "44"],
      category: "calcados",
    },
    {
      name: "Meias/Cuecas",
      description: "P, M, G",
      sizes: ["P", "M", "G"],
      category: "intimas",
    },
    {
      name: "Números Únicos",
      description: "Único",
      sizes: ["Único"],
      category: "unico",
    },
  ];

  // Inicializar configurações se não existirem
  React.useEffect(() => {
    if (sizeConfigs.length === 0) {
      // Começar com template básico selecionado
      const basicTemplate = sizeTemplates[0];
      const initialConfigs = basicTemplate.sizes.map((size) => ({
        name: size,
        selected: true,
        stock: 10,
        priceAdjustment: 0,
      }));
      setSizeConfigs(initialConfigs);
      setSelectedTemplate(basicTemplate.name);
    }
  }, []);

  const steps = [
    {
      id: 0,
      title: "Selecionar Tamanhos",
      description: "Escolha os tamanhos disponíveis para seu produto",
    },
    {
      id: 1,
      title: "Configurar Estoque",
      description: "Defina quantidade e preços para cada tamanho",
    },
    {
      id: 2,
      title: "Revisar e Finalizar",
      description: "Confirme as variações criadas",
    },
  ];

  const selectedSizes = sizeConfigs.filter((size) => size.selected);

  const applyTemplate = (template: SizeTemplate) => {
    setSizeConfigs(
      template.sizes.map((size) => ({
        name: size,
        selected: true,
        stock: 10,
        priceAdjustment: 0,
      }))
    );
    setSelectedTemplate(template.name);

    toast({
      title: "Template aplicado!",
      description: `Template "${template.name}" foi aplicado com ${template.sizes.length} tamanhos.`,
    });
  };

  const toggleSize = (sizeName: string) => {
    setSizeConfigs((prev) =>
      prev.map((size) =>
        size.name === sizeName ? { ...size, selected: !size.selected } : size
      )
    );
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
        stock: 10,
        priceAdjustment: 0,
      },
    ]);

    setCustomSizeInput("");
    setSelectedTemplate(null); // Desmarcar template quando adicionar customizado

    toast({
      title: "Tamanho adicionado!",
      description: `O tamanho "${customSizeInput}" foi adicionado.`,
    });
  };

  const updateSizeConfig = (
    sizeName: string,
    field: "stock" | "priceAdjustment",
    value: number
  ) => {
    setSizeConfigs((prev) =>
      prev.map((size) =>
        size.name === sizeName ? { ...size, [field]: value } : size
      )
    );
  };

  const generateVariations = useCallback(() => {
    const newVariations: ProductVariation[] = selectedSizes.map(
      (size, index) => ({
        id: `size-${Date.now()}-${index}`,
        product_id: "",
        size: size.name,
        sku: `size-${size.name.toLowerCase().replace(/\s+/g, "-")}`,
        stock: size.stock,
        price_adjustment: size.priceAdjustment,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: index + 1,
        variation_type: "size_only",
      })
    );

    onVariationsChange(newVariations);

    toast({
      title: "✅ Variações criadas!",
      description: `${newVariations.length} variações de tamanho foram configuradas.`,
    });
  }, [selectedSizes, onVariationsChange, toast]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return selectedSizes.length > 0;
      case 1:
        return selectedSizes.every((size) => size.stock >= 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep === 1) {
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
            {/* Header do passo */}
            <div className="text-center">
              <Ruler className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Selecione os Tamanhos</h3>
              <p className="text-gray-600">
                Escolha um template ou configure manualmente os tamanhos
                disponíveis
              </p>
            </div>

            {/* Templates */}
            <div>
              <Label className="text-sm font-medium">Templates Prontos</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {sizeTemplates.map((template) => (
                  <Card
                    key={template.name}
                    onClick={() => applyTemplate(template)}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      selectedTemplate === template.name
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        {selectedTemplate === template.name && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.sizes.slice(0, 4).map((size) => (
                          <Badge
                            key={size}
                            variant="outline"
                            className="text-xs"
                          >
                            {size}
                          </Badge>
                        ))}
                        {template.sizes.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.sizes.length - 4}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Tamanhos atuais */}
            {sizeConfigs.length > 0 && (
              <div>
                <Label className="text-sm font-medium">
                  Tamanhos Configurados
                </Label>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
                  {sizeConfigs.map((size) => (
                    <div
                      key={size.name}
                      onClick={() => toggleSize(size.name)}
                      className={`relative cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 text-center ${
                        size.selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-sm font-medium">{size.name}</span>
                      {size.selected && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

      case 1:
        return (
          <div className="space-y-6">
            {/* Header do passo */}
            <div className="text-center">
              <Package className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">
                Configure Estoque e Preços
              </h3>
              <p className="text-gray-600">
                Defina a quantidade e ajustes de preço para cada tamanho
              </p>
            </div>

            {/* Configurações por tamanho */}
            <div className="space-y-4">
              {selectedSizes.map((size) => (
                <Card key={size.name} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">Tamanho {size.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Quantidade em Estoque</Label>
                      <Input
                        type="number"
                        min="0"
                        value={size.stock}
                        onChange={(e) =>
                          updateSizeConfig(
                            size.name,
                            "stock",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Ajuste de Preço (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={size.priceAdjustment}
                        onChange={(e) =>
                          updateSizeConfig(
                            size.name,
                            "priceAdjustment",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="mt-1"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Deixe 0 para mesmo preço, ou adicione valor extra para
                        tamanhos especiais
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Dica para preços */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>💡 Dica:</strong> Tamanhos maiores (GG, XGG) ou
                especiais podem ter um pequeno acréscimo no preço.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Header do passo */}
            <div className="text-center">
              <Eye className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Revisar Variações</h3>
              <p className="text-gray-600">
                Confirme as variações que serão criadas para {productName}
              </p>
            </div>

            {/* Resumo */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {selectedSizes.length} variações de tamanho configuradas
                </span>
              </div>
              <p className="text-sm text-green-700">
                Total de unidades:{" "}
                {selectedSizes.reduce((sum, size) => sum + size.stock, 0)}
              </p>
            </div>

            {/* Lista de variações */}
            <div className="space-y-3">
              {selectedSizes.map((size, index) => (
                <Card key={size.name} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">
                        {productName} - Tamanho {size.name}
                      </span>
                    </div>
                    <div className="text-right text-sm">
                      <div>
                        Estoque: <strong>{size.stock}</strong>
                      </div>
                      {size.priceAdjustment !== 0 && (
                        <div
                          className={
                            size.priceAdjustment > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {size.priceAdjustment > 0 ? "+" : ""}R${" "}
                          {size.priceAdjustment.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Pronto!</strong> Suas variações serão criadas
                automaticamente ao finalizar. Você poderá editá-las
                individualmente depois se necessário.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            📏 Assistente de Tamanhos
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
                  description: "Variações de tamanho configuradas com sucesso!",
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

export default SizeOnlyWizard;
