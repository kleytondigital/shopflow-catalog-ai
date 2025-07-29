import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package2,
  Plus,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Eye,
  Package,
  Gem,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MaterialOnlyWizardProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  onBack: () => void;
  productName?: string;
}

interface MaterialConfig {
  name: string;
  selected: boolean;
  stock: number;
  priceAdjustment: number;
  description?: string;
}

interface MaterialCategory {
  name: string;
  description: string;
  materials: Array<{
    name: string;
    description: string;
    premium?: boolean;
  }>;
}

const MaterialOnlyWizard: React.FC<MaterialOnlyWizardProps> = ({
  variations,
  onVariationsChange,
  onBack,
  productName = "Produto",
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [customMaterialInput, setCustomMaterialInput] = useState("");
  const [materialConfigs, setMaterialConfigs] = useState<MaterialConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Categorias e materiais pré-definidos
  const materialCategories: MaterialCategory[] = [
    {
      name: "Metais",
      description: "Para bijuterias e acessórios metálicos",
      materials: [
        { name: "Prata", description: "Prata 925 ou folheada", premium: true },
        { name: "Dourado", description: "Banho dourado ou folheado a ouro" },
        { name: "Rosé Gold", description: "Banho rosé gold", premium: true },
        { name: "Inox", description: "Aço inoxidável" },
        { name: "Bronze", description: "Bronze ou liga bronze" },
        { name: "Cobre", description: "Cobre natural ou oxidado" },
      ],
    },
    {
      name: "Tecidos",
      description: "Para roupas e acessórios têxteis",
      materials: [
        { name: "Algodão", description: "100% algodão" },
        { name: "Poliéster", description: "Tecido sintético" },
        { name: "Viscose", description: "Fibra semi-sintética" },
        { name: "Seda", description: "Seda natural", premium: true },
        { name: "Linho", description: "Linho natural" },
        { name: "Jeans", description: "Tecido denim" },
      ],
    },
    {
      name: "Couros",
      description: "Para bolsas, sapatos e acessórios",
      materials: [
        {
          name: "Couro Legítimo",
          description: "Couro bovino natural",
          premium: true,
        },
        { name: "Couro Sintético", description: "Imitação de couro" },
        { name: "Camurça", description: "Couro camurçado", premium: true },
        { name: "Verniz", description: "Couro envernizado" },
        { name: "Couro Ecológico", description: "Material sustentável" },
      ],
    },
    {
      name: "Pedras",
      description: "Para bijuterias e decoração",
      materials: [
        {
          name: "Quartzo",
          description: "Cristal de quartzo natural",
          premium: true,
        },
        { name: "Ametista", description: "Pedra semi-preciosa", premium: true },
        { name: "Ágata", description: "Pedra natural colorida" },
        { name: "Cristal", description: "Cristal sintético" },
        { name: "Resina", description: "Imitação de pedra" },
        { name: "Vidro", description: "Pedra de vidro" },
      ],
    },
    {
      name: "Plásticos",
      description: "Para produtos diversos",
      materials: [
        { name: "Acrílico", description: "Plástico transparente" },
        { name: "Silicone", description: "Material flexível" },
        { name: "PVC", description: "Vinil resistente" },
        { name: "Plástico ABS", description: "Plástico rígido" },
        { name: "TPU", description: "Plástico flexível" },
      ],
    },
  ];

  // Inicializar com categoria de metais por padrão
  React.useEffect(() => {
    if (materialConfigs.length === 0) {
      const defaultCategory = materialCategories[0]; // Metais
      const initialConfigs = defaultCategory.materials.map((material) => ({
        name: material.name,
        description: material.description,
        selected: false,
        stock: 10,
        priceAdjustment: material.premium ? 5 : 0,
      }));
      setMaterialConfigs(initialConfigs);
      setSelectedCategory(defaultCategory.name);
    }
  }, []);

  const steps = [
    {
      id: 0,
      title: "Selecionar Materiais",
      description: "Escolha os materiais disponíveis para seu produto",
    },
    {
      id: 1,
      title: "Configurar Estoque",
      description: "Defina quantidade e preços para cada material",
    },
    {
      id: 2,
      title: "Revisar e Finalizar",
      description: "Confirme as variações criadas",
    },
  ];

  const selectedMaterials = materialConfigs.filter(
    (material) => material.selected
  );

  const applyCategory = (category: MaterialCategory) => {
    setMaterialConfigs(
      category.materials.map((material) => ({
        name: material.name,
        description: material.description,
        selected: false,
        stock: 10,
        priceAdjustment: material.premium ? 5 : 0,
      }))
    );
    setSelectedCategory(category.name);

    toast({
      title: "Categoria aplicada!",
      description: `Categoria "${category.name}" carregada com ${category.materials.length} materiais.`,
    });
  };

  const toggleMaterial = (materialName: string) => {
    setMaterialConfigs((prev) =>
      prev.map((material) =>
        material.name === materialName
          ? { ...material, selected: !material.selected }
          : material
      )
    );
  };

  const addCustomMaterial = () => {
    if (!customMaterialInput.trim()) return;

    if (
      materialConfigs.find(
        (m) => m.name.toLowerCase() === customMaterialInput.toLowerCase()
      )
    ) {
      toast({
        title: "Material já existe",
        description: "Este material já foi adicionado à lista.",
        variant: "destructive",
      });
      return;
    }

    setMaterialConfigs((prev) => [
      ...prev,
      {
        name: customMaterialInput.trim(),
        description: "Material personalizado",
        selected: true,
        stock: 10,
        priceAdjustment: 0,
      },
    ]);

    setCustomMaterialInput("");

    toast({
      title: "Material adicionado!",
      description: `O material "${customMaterialInput}" foi adicionado.`,
    });
  };

  const updateMaterialConfig = (
    materialName: string,
    field: "stock" | "priceAdjustment",
    value: number
  ) => {
    setMaterialConfigs((prev) =>
      prev.map((material) =>
        material.name === materialName
          ? { ...material, [field]: value }
          : material
      )
    );
  };

  const generateVariations = useCallback(() => {
    const newVariations: ProductVariation[] = selectedMaterials.map(
      (material, index) => ({
        id: `material-${Date.now()}-${index}`,
        product_id: "",
        material: material.name,
        sku: `mat-${material.name.toLowerCase().replace(/\s+/g, "-")}`,
        stock: material.stock,
        price_adjustment: material.priceAdjustment,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: index + 1,
        variation_type: "material_only",
      })
    );

    onVariationsChange(newVariations);

    toast({
      title: "✅ Variações criadas!",
      description: `${newVariations.length} variações de material foram configuradas.`,
    });
  }, [selectedMaterials, onVariationsChange, toast]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return selectedMaterials.length > 0;
      case 1:
        return selectedMaterials.every((material) => material.stock >= 0);
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
              <Package2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Selecione os Materiais</h3>
              <p className="text-gray-600">
                Escolha uma categoria ou configure manualmente os materiais
                disponíveis
              </p>
            </div>

            {/* Categorias */}
            <div>
              <Label className="text-sm font-medium">
                Categorias de Materiais
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {materialCategories.map((category) => (
                  <Card
                    key={category.name}
                    onClick={() => applyCategory(category)}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      selectedCategory === category.name
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{category.name}</h4>
                        {selectedCategory === category.name && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {category.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {category.materials.slice(0, 3).map((material) => (
                          <Badge
                            key={material.name}
                            variant="outline"
                            className={`text-xs ${
                              material.premium
                                ? "border-yellow-400 text-yellow-700"
                                : ""
                            }`}
                          >
                            {material.premium && "⭐"} {material.name}
                          </Badge>
                        ))}
                        {category.materials.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.materials.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Materiais da categoria selecionada */}
            {materialConfigs.length > 0 && (
              <div>
                <Label className="text-sm font-medium">
                  Materiais Disponíveis{" "}
                  {selectedCategory && `(${selectedCategory})`}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {materialConfigs.map((material) => (
                    <Card
                      key={material.name}
                      onClick={() => toggleMaterial(material.name)}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        material.selected
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm flex items-center gap-1">
                            {material.priceAdjustment > 0 && (
                              <Gem className="w-3 h-3 text-yellow-500" />
                            )}
                            {material.name}
                          </span>
                          {material.selected && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {material.description}
                        </p>
                        {material.priceAdjustment > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs mt-1 border-yellow-400 text-yellow-700"
                          >
                            Premium
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionar material customizado */}
            <div>
              <Label className="text-sm font-medium">
                Adicionar Material Personalizado
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Ex: Bambu, Cortiça, Titânio"
                  value={customMaterialInput}
                  onChange={(e) => setCustomMaterialInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomMaterial()}
                />
                <Button
                  onClick={addCustomMaterial}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Materiais selecionados */}
            {selectedMaterials.length > 0 && (
              <div>
                <Label className="text-sm font-medium">
                  Materiais Selecionados ({selectedMaterials.length})
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMaterials.map((material) => (
                    <Badge
                      key={material.name}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Package2 className="w-3 h-3" />
                      {material.name}
                      {material.priceAdjustment > 0 && (
                        <Gem className="w-3 h-3 text-yellow-500" />
                      )}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => toggleMaterial(material.name)}
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
                Defina a quantidade e ajustes de preço para cada material
              </p>
            </div>

            {/* Configurações por material */}
            <div className="space-y-4">
              {selectedMaterials.map((material) => (
                <Card key={material.name} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gem className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">{material.name}</span>
                      {material.description && (
                        <Badge variant="outline" className="text-xs">
                          {material.description}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Quantidade em Estoque</Label>
                      <Input
                        type="number"
                        min="0"
                        value={material.stock}
                        onChange={(e) =>
                          updateMaterialConfig(
                            material.name,
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
                        value={material.priceAdjustment}
                        onChange={(e) =>
                          updateMaterialConfig(
                            material.name,
                            "priceAdjustment",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="mt-1"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Materiais premium podem ter acréscimo no preço
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
                <strong>💎 Dica:</strong> Materiais nobres como prata, couro
                legítimo ou seda geralmente têm um acréscimo no preço.
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
                  {selectedMaterials.length} variações de material configuradas
                </span>
              </div>
              <p className="text-sm text-green-700">
                Total de unidades:{" "}
                {selectedMaterials.reduce(
                  (sum, material) => sum + material.stock,
                  0
                )}
              </p>
            </div>

            {/* Lista de variações */}
            <div className="space-y-3">
              {selectedMaterials.map((material, index) => (
                <Card key={material.name} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">
                        {productName} - {material.name}
                      </span>
                      {material.priceAdjustment > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Gem className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div>
                        Estoque: <strong>{material.stock}</strong>
                      </div>
                      {material.priceAdjustment !== 0 && (
                        <div
                          className={
                            material.priceAdjustment > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {material.priceAdjustment > 0 ? "+" : ""}R${" "}
                          {material.priceAdjustment.toFixed(2)}
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
            🧵 Assistente de Materiais
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
                  description:
                    "Variações de material configuradas com sucesso!",
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

export default MaterialOnlyWizard;
