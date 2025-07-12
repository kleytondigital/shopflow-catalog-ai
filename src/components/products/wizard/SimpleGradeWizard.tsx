import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Palette,
  Shirt,
  Package,
  Sparkles,
  Trash2,
  Info,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  X,
  Wand2,
  Bug,
  Eye,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VariationPreview from "./VariationPreview";
import VariationDebug from "@/components/debug/VariationDebug";

// Remover commonGrades e commonColors e auto-configuração automática
// Certificar que os tipos estão definidos
interface SimpleGradeWizardProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
  category?: string;
  productName?: string;
}

interface SimpleColor {
  id: string;
  name: string;
  hexColor: string;
}

interface SimpleGrade {
  id: string;
  name: string;
  sizes: string[];
  pairsPerSize: { [size: string]: number };
  totalPairs: number;
}

const SimpleGradeWizard: React.FC<SimpleGradeWizardProps> = ({
  variations,
  onVariationsChange,
  productId,
  storeId,
  category,
  productName,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState<
    "single" | "variations" | "grade"
  >("");

  // Estados para configuração de grade
  const [colors, setColors] = useState<SimpleColor[]>([]);
  const [grades, setGrades] = useState<SimpleGrade[]>([]);
  const [stockPerGrade, setStockPerGrade] = useState<number>(1);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [customGradeName, setCustomGradeName] = useState("");
  const [customGradeSizes, setCustomGradeSizes] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  // Detectar automaticamente se é produto com grade
  useEffect(() => {
    if (category || productName) {
      const searchText = `${category || ""} ${productName || ""}`.toLowerCase();

      // Palavras-chave que indicam produtos com grade
      const gradeKeywords = [
        "calçado",
        "sapato",
        "tênis",
        "sandália",
        "chinelo",
        "bota",
        "sapatilha",
        "rasteirinha",
        "scarpin",
        "oxford",
        "mocassim",
        "alpargata",
        "papete",
        "chuteira",
        "salto",
        "plataforma",
        "sneaker",
        "all star",
        "vans",
      ];

      const isGradeProduct = gradeKeywords.some((keyword) =>
        searchText.includes(keyword)
      );

      if (isGradeProduct && productType === "") {
        setProductType("grade");
        toast({
          title: "🎯 Produto com Grade Detectado!",
          description:
            "Detectamos que seu produto é ideal para o sistema de grades. Vamos configurar as variações automaticamente.",
        });
      }
    }
  }, [category, productName, productType, toast]);

  // Remover o useEffect de auto-configuração automática

  const addColor = (colorName: string, hexColor?: string) => {
    // Verificar se a cor já existe
    if (colors.some((c) => c.name.toLowerCase() === colorName.toLowerCase())) {
      return; // Silenciosamente ignorar se já existe
    }

    const newColor: SimpleColor = {
      id: Date.now().toString(),
      name: colorName,
      hexColor: hexColor || "#000000",
    };
    setColors([...colors, newColor]);
  };

  const addGrade = (gradeName: string, sizes: string[]) => {
    // Verificar se a grade já existe
    if (grades.some((g) => g.name.toLowerCase() === gradeName.toLowerCase())) {
      return; // Silenciosamente ignorar se já existe
    }

    const newGrade: SimpleGrade = {
      id: Date.now().toString(),
      name: gradeName,
      sizes: sizes,
      pairsPerSize: sizes.reduce((acc, size) => ({ ...acc, [size]: 1 }), {}),
      totalPairs: sizes.length,
    };
    setGrades([...grades, newGrade]);
  };

  const addCustomColor = () => {
    if (!customColorName.trim()) {
      toast({
        title: "Nome da cor obrigatório",
        description: "Digite um nome para a cor personalizada.",
        variant: "destructive",
      });
      return;
    }

    addColor(customColorName.trim(), customColorHex);
    setCustomColorName("");
    setCustomColorHex("#000000");
  };

  const addCustomGrade = () => {
    if (!customGradeName.trim()) {
      toast({
        title: "Nome da grade obrigatório",
        description: "Digite um nome para a grade personalizada.",
        variant: "destructive",
      });
      return;
    }

    if (!customGradeSizes.trim()) {
      toast({
        title: "Tamanhos obrigatórios",
        description: "Digite os tamanhos separados por vírgula (ex: 33,34,35).",
        variant: "destructive",
      });
      return;
    }

    const sizes = customGradeSizes
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (sizes.length === 0) {
      toast({
        title: "Tamanhos inválidos",
        description: "Digite pelo menos um tamanho válido.",
        variant: "destructive",
      });
      return;
    }

    addGrade(customGradeName.trim(), sizes);
    setCustomGradeName("");
    setCustomGradeSizes("");
  };

  const removeColor = (colorId: string) => {
    setColors(colors.filter((c) => c.id !== colorId));
  };

  const removeGrade = (gradeId: string) => {
    setGrades(grades.filter((g) => g.id !== gradeId));
  };

  const generateVariations = () => {
    if (colors.length === 0) {
      toast({
        title: "Nenhuma cor selecionada",
        description: "Adicione pelo menos uma cor para gerar as variações.",
        variant: "destructive",
      });
      return;
    }

    if (grades.length === 0) {
      toast({
        title: "Nenhuma grade selecionada",
        description: "Adicione pelo menos uma grade para gerar as variações.",
        variant: "destructive",
      });
      return;
    }

    console.log("🔍 DEBUG - Iniciando geração de variações");
    console.log("🔍 DEBUG - Cores:", colors);
    console.log("🔍 DEBUG - Grades:", grades);
    console.log("🔍 DEBUG - Stock por grade:", stockPerGrade);

    const newVariations: ProductVariation[] = [];
    let variationIndex = 0;

    colors.forEach((color) => {
      grades.forEach((grade) => {
        // Criar variação simplificada que funciona sem campos específicos de grade
        const variation: ProductVariation = {
          id: `${Date.now()}-${variationIndex++}`,
          product_id: productId || "",
          color: color.name,
          hex_color: color.hexColor,
          size: "", // Para grades, o size fica vazio
          sku: `${color.name.substring(0, 3).toUpperCase()}-${grade.name
            .substring(0, 3)
            .toUpperCase()}-${Date.now()}`,
          stock: stockPerGrade,
          price_adjustment: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          variation_type: "grade", // ✅ Identifica como grade
          name: `${color.name} - ${grade.name}`, // ✅ Nome descritivo
          // Campos de grade (opcionais - podem não existir no banco)
          is_grade: true,
          grade_name: grade.name,
          grade_color: color.name,
          grade_quantity: stockPerGrade,
          grade_sizes: grade.sizes,
          grade_pairs: grade.sizes.map((size) => grade.pairsPerSize[size] || 1),
        };

        console.log("🔍 DEBUG - Variação criada:", variation);
        newVariations.push(variation);
      });
    });

    console.log("🔍 DEBUG - Total de variações criadas:", newVariations.length);
    console.log("🔍 DEBUG - Primeira variação:", newVariations[0]);

    onVariationsChange(newVariations);
    toast({
      title: "✅ Variações de Grade Criadas!",
      description: `${newVariations.length} variações foram geradas com sucesso.`,
    });
  };

  // Gerar preview das variações em tempo real
  const generatePreviewVariations = (): ProductVariation[] => {
    if (colors.length === 0 || grades.length === 0) {
      return [];
    }

    const previewVariations: ProductVariation[] = [];
    let variationIndex = 0;

    colors.forEach((color) => {
      grades.forEach((grade) => {
        const variation: ProductVariation = {
          id: `preview-${variationIndex++}`,
          product_id: productId || "",
          color: color.name,
          hex_color: color.hexColor,
          size: "",
          sku: `${color.name.substring(0, 3).toUpperCase()}-${grade.name
            .substring(0, 3)
            .toUpperCase()}`,
          stock: stockPerGrade,
          price_adjustment: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          variation_type: "grade",
          is_grade: true,
          grade_name: grade.name,
          grade_color: color.name,
          grade_quantity: stockPerGrade,
          grade_sizes: grade.sizes,
          grade_pairs: grade.sizes.map((size) => grade.pairsPerSize[size] || 1),
          name: `${color.name} - ${grade.name}`,
        };

        previewVariations.push(variation);
      });
    });

    return previewVariations;
  };

  const previewVariations = generatePreviewVariations();

  // Se não é produto com grade, mostrar mensagem informativa
  if (productType !== "grade" && productType !== "") {
    return (
      <div className="p-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este wizard é específico para produtos com grade. Para outros tipos
            de produto, use o wizard de variações tradicional.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Se ainda não foi detectado o tipo, mostrar seleção
  if (productType === "") {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Wand2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Detecção de Tipo de Produto
            </h2>
          </div>
          <p className="text-gray-600">
            Vamos identificar o melhor tipo de variação para seu produto
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              Que tipo de produto você está cadastrando?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Escolha a opção que melhor descreve seu produto. Isso vai ajudar
                a configurar as variações corretas.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setProductType("single")}
                className="p-4 border-2 rounded-lg text-left transition-all border-gray-200 hover:border-gray-300"
              >
                <Package className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold">Produto Único</h3>
                <p className="text-sm text-gray-600">
                  Um produto sem variações (ex: uma caneca branca)
                </p>
              </button>

              <button
                onClick={() => setProductType("variations")}
                className="p-4 border-2 rounded-lg text-left transition-all border-gray-200 hover:border-gray-300"
              >
                <Palette className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-semibold">Produto com Variações</h3>
                <p className="text-sm text-gray-600">
                  Mesmo produto em cores/tamanhos diferentes (ex: camiseta P, M,
                  G)
                </p>
              </button>

              <button
                onClick={() => setProductType("grade")}
                className="p-4 border-2 rounded-lg text-left transition-all border-gray-200 hover:border-gray-300"
              >
                <Shirt className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-semibold">Produto com Grade</h3>
                <p className="text-sm text-gray-600">
                  Calçados ou produtos vendidos em kits de tamanhos (ex: sapatos
                  do 33 ao 38)
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step > stepNumber ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              stepNumber
            )}
          </div>
          {stepNumber < 4 && (
            <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Tipo de Produto Confirmado: Grade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Perfeito! Vamos configurar as variações de grade para seu produto.
            Grades são ideais para calçados e produtos vendidos em kits de
            tamanhos.
          </AlertDescription>
        </Alert>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">O que são Grades?</h4>
          <p className="text-sm text-blue-800">
            Grades são conjuntos de tamanhos vendidos juntos. Por exemplo, uma
            grade "Baixa" pode conter tamanhos 33, 34, 35, 36, 37, 38. Isso é
            comum em calçados vendidos para revendedores ou em kits.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => setStep(2)}
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Quais cores o seu produto tem?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Selecione todas as cores disponíveis do seu produto. Você pode
            escolher das cores comuns ou adicionar cores personalizadas.
          </AlertDescription>
        </Alert>

        <div>
          <h4 className="font-medium mb-3">Cores Comuns:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {/* commonColors.map((color) => ( */}
            {/* <button */}
            {/* key={color.name} */}
            {/* onClick={() => addColor(color.name, color.hex)} */}
            {/* className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 text-sm transition-colors" */}
            {/* disabled={colors.some( */}
            {/* (c) => c.name.toLowerCase() === color.name.toLowerCase() */}
            {/* )} */}
            {/* > */}
            {/* <div */}
            {/* className="w-4 h-4 rounded-full border" */}
            {/* style={{ backgroundColor: color.hex }} */}
            {/* /> */}
            {/* {color.name} */}
            {/* </button> */}
            {/* ))} */}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Adicionar Cor Personalizada:</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Nome da cor"
              value={customColorName}
              onChange={(e) => setCustomColorName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={customColorHex}
              onChange={(e) => setCustomColorHex(e.target.value)}
              className="w-20"
            />
            <Button onClick={addCustomColor} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">
            Cores Adicionadas ({colors.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Badge
                key={color.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: color.hexColor }}
                />
                {color.name}
                <button
                  onClick={() => removeColor(color.id)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            Voltar
          </Button>
          <Button
            onClick={() => setStep(3)}
            disabled={colors.length === 0}
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-blue-600" />
          Quais grades você quer criar?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Escolha as grades (conjuntos de tamanhos) que você quer vender. Cada
            grade será disponível em todas as cores que você selecionou.
          </AlertDescription>
        </Alert>

        <div>
          <h4 className="font-medium mb-3">Grades Cadastradas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* storeGrades.map((grade) => ( */}
            {/* <button */}
            {/* key={grade.id} */}
            {/* onClick={() => addGrade(grade.value, grade.grade_sizes || [])} */}
            {/* className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors" */}
            {/* disabled={grades.some( */}
            {/* (g) => g.name.toLowerCase() === grade.value.toLowerCase() */}
            {/* )} */}
            {/* > */}
            {/* <div className="font-medium">{grade.value}</div> */}
            {/* <div className="text-sm text-gray-600"> */}
            {/* Tamanhos: {(grade.grade_sizes || []).join(", ")} */}
            {/* </div> */}
            {/* </button> */}
            {/* ))} */}
          </div>
        </div>

        <h4 className="font-medium mb-3">Criar Grade Personalizada:</h4>
        <div className="space-y-2">
          <Input
            placeholder="Nome da grade (ex: Especial)"
            value={customGradeName}
            onChange={(e) => setCustomGradeName(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Tamanhos separados por vírgula (ex: 33,34,35,36)"
              value={customGradeSizes}
              onChange={(e) => setCustomGradeSizes(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addCustomGrade} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">
            Grades Criadas ({grades.length}):
          </h4>
          <div className="space-y-2">
            {grades.map((grade) => (
              <div
                key={grade.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
              >
                <div>
                  <div className="font-medium">{grade.name}</div>
                  <div className="text-sm text-gray-600">
                    Tamanhos: {grade.sizes.join(", ")}
                  </div>
                </div>
                <button
                  onClick={() => removeGrade(grade.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            Voltar
          </Button>
          <Button
            onClick={() => setStep(4)}
            disabled={grades.length === 0}
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Confirme as suas variações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Revise as variações que serão criadas. Cada combinação de cor +
            grade será uma variação do seu produto.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">
              Cores Selecionadas ({colors.length}):
            </h4>
            <div className="space-y-1">
              {colors.map((color) => (
                <div key={color.id} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: color.hexColor }}
                  />
                  {color.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">
              Grades Selecionadas ({grades.length}):
            </h4>
            <div className="space-y-1">
              {grades.map((grade) => (
                <div key={grade.id} className="text-sm">
                  <span className="font-medium">{grade.name}</span>
                  <span className="text-gray-600">
                    {" "}
                    ({grade.sizes.length} tamanhos)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Será criado um total de {colors.length * grades.length} variações:
          </h4>
          <div className="text-sm text-blue-800 max-h-40 overflow-y-auto">
            {colors.map((color) =>
              grades.map((grade) => (
                <div key={`${color.id}-${grade.id}`}>
                  • {color.name} - {grade.name} (com {grade.sizes.length}{" "}
                  tamanhos)
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="stockPerGrade">Quantidade inicial por grade:</Label>
          <Input
            id="stockPerGrade"
            type="number"
            value={stockPerGrade}
            onChange={(e) => setStockPerGrade(Number(e.target.value))}
            min="0"
            className="w-32"
          />
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(3)}>
            Voltar
          </Button>
          <Button
            onClick={generateVariations}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Criar Variações
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Assistente de Criação de Grades
          </h2>
          <p className="text-gray-600">
            Vamos criar as variações do seu produto de forma simples e rápida
          </p>
        </div>

        {renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wizard principal */}
          <div className="lg:col-span-2">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>

          {/* Preview lateral */}
          <div className="lg:col-span-1">
            {step >= 2 && (
              <div className="sticky top-6">
                <VariationPreview
                  variations={previewVariations}
                  productName="Seu Produto"
                  productPrice={99.9}
                  showPreview={showPreview}
                  onTogglePreview={() => setShowPreview(!showPreview)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Debug das variações */}
        {variations.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Bug className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Debug das Variações</h3>
            </div>
            <VariationDebug variations={variations} title="Variações Atuais" />
          </div>
        )}

        {/* Debug das variações de preview */}
        {previewVariations.length > 0 && step >= 2 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">
                Debug das Variações de Preview
              </h3>
            </div>
            <VariationDebug
              variations={previewVariations}
              title="Variações de Preview"
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SimpleGradeWizard;
