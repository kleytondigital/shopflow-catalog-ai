import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Target,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  TrendingUp,
  Package,
  Palette,
  Ruler,
  Package2,
} from "lucide-react";
import {
  getCategorySuggestions,
  CategoryTemplate,
} from "@/utils/categoryTemplates";

interface DetectionResult {
  type: string;
  confidence: "high" | "medium" | "low";
  reasons: string[];
  suggestions: string[];
  icon: React.ReactNode;
  recommendedAction: string;
}

interface EnhancedProductTypeDetectorProps {
  productName: string;
  productCategory: string;
  onTypeSelected: (type: string, result: DetectionResult) => void;
  className?: string;
}

const EnhancedProductTypeDetector: React.FC<
  EnhancedProductTypeDetectorProps
> = ({ productName, productCategory, onTypeSelected, className = "" }) => {
  const [detectionResult, setDetectionResult] =
    useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Regras de detecção aprimoradas
  const detectionRules = {
    grade_system: {
      keywords: [
        "calçado",
        "sapato",
        "tênis",
        "sandália",
        "chinelo",
        "bota",
        "sapatilha",
        "mocassim",
        "scarpin",
        "rasteirinha",
      ],
      categoryKeywords: ["calçados", "shoes", "footwear"],
      confidence: "high" as const,
      reasons: [
        "Produtos de calçados são tradicionalmente vendidos por grades",
        "Sistema de grades otimiza gestão de estoque por atacado",
        "Permite configurar pares individuais por tamanho",
      ],
      suggestions: [
        "Use grades pré-definidas (Baixa, Média, Alta)",
        "Configure cores e quantidades por tamanho",
        "Ideal para vendas no atacado",
      ],
    },
    color_only: {
      keywords: [
        "camiseta",
        "caneca",
        "capinha",
        "case",
        "adesivo",
        "mousepad",
        "almofada",
        "quadro",
        "poster",
        "chaveiro",
      ],
      categoryKeywords: ["personalizados", "customizados", "decoração"],
      confidence: "high" as const,
      reasons: [
        "Produto com design único que varia apenas na cor",
        "Fácil de gerenciar com poucas variações",
        "Comum em produtos personalizados",
      ],
      suggestions: [
        "Escolha 3-5 cores populares",
        "Cores neutras vendem mais",
        "Considere cores sazonais",
      ],
    },
    size_only: {
      keywords: [
        "meia",
        "cueca",
        "calcinha",
        "sutiã",
        "luva",
        "boné",
        "gorro",
        "cinto",
        "pulseira tamanho",
      ],
      categoryKeywords: ["íntimas", "acessórios básicos", "unissex"],
      confidence: "high" as const,
      reasons: [
        "Produto padronizado que varia apenas no tamanho",
        "Design uniforme independente do tamanho",
        "Gestão simplificada de estoque",
      ],
      suggestions: [
        "Use templates de tamanho (P, M, G)",
        "Considere tamanhos especiais (PP, XGG)",
        "Mantenha estoque equilibrado",
      ],
    },
    material_only: {
      keywords: [
        "pulseira",
        "colar",
        "anel",
        "brinco",
        "bracelete",
        "corrente",
        "pingente",
        "aliança",
      ],
      categoryKeywords: ["bijuterias", "joias", "acessórios", "metais"],
      confidence: "high" as const,
      reasons: [
        "Bijuterias variam principalmente no material",
        "Diferentes materiais têm valores distintos",
        "Cliente escolhe por preferência e orçamento",
      ],
      suggestions: [
        "Ofereça opções de diferentes preços",
        "Materiais nobres com acréscimo",
        "Inclua opções acessíveis",
      ],
    },
    color_size: {
      keywords: [
        "blusa",
        "vestido",
        "calça",
        "short",
        "saia",
        "jaqueta",
        "casaco",
        "moletom",
        "regata",
        "camisa",
      ],
      categoryKeywords: ["roupas", "moda", "vestuário", "fashion"],
      confidence: "medium" as const,
      reasons: [
        "Roupas tradicionalmente variam em cor e tamanho",
        "Oferece mais opções para o cliente",
        "Padrão da indústria de moda",
      ],
      suggestions: [
        "Equilibre cores e tamanhos",
        "Cores neutras em todos os tamanhos",
        "Considere público-alvo (feminino/masculino)",
      ],
    },
    color_material: {
      keywords: [
        "bolsa",
        "carteira",
        "mochila",
        "necessaire",
        "estojo",
        "porta",
        "case premium",
      ],
      categoryKeywords: ["bolsas", "acessórios", "couro"],
      confidence: "medium" as const,
      reasons: [
        "Acessórios combinam cor e material",
        "Material afeta durabilidade e preço",
        "Estética e funcionalidade",
      ],
      suggestions: [
        "Combine cores neutras com materiais premium",
        "Ofereça opções para diferentes orçamentos",
        "Destaque materiais de qualidade",
      ],
    },
  };

  // Função de análise inteligente
  const analyzeProduct = useCallback(() => {
    setIsAnalyzing(true);

    // Simular processo de análise
    setTimeout(() => {
      // Usar nossos templates de categoria
      const categoryAnalysis = getCategorySuggestions(
        productName,
        productCategory
      );

      let result: DetectionResult;

      if (categoryAnalysis.template && categoryAnalysis.confidence > 30) {
        const template = categoryAnalysis.template;
        const confidence =
          categoryAnalysis.confidence >= 70
            ? "high"
            : categoryAnalysis.confidence >= 40
            ? "medium"
            : "low";

        result = {
          type: template.suggestedType,
          confidence,
          reasons: [
            `Produto identificado como: ${template.name}`,
            template.description,
            `Análise baseada em ${categoryAnalysis.confidence}% de confiança`,
          ],
          suggestions: categoryAnalysis.suggestions,
          icon: getTypeIcon(template.suggestedType),
          recommendedAction: `Configure como ${template.name}`,
        };
      } else {
        // Nenhuma detecção clara - sugerir análise manual
        result = {
          type: "manual",
          confidence: "low",
          reasons: [
            "Não foi possível detectar automaticamente",
            "Produto pode ter características únicas",
            "Recomendamos análise manual",
          ],
          suggestions: [
            "Use a configuração avançada",
            "Escolha manualmente o tipo de variação",
            "Considere as características específicas do produto",
          ],
          icon: <Brain className="w-6 h-6" />,
          recommendedAction: "Escolher manualmente o tipo de variação",
        };
      }

      setDetectionResult(result);
      setIsAnalyzing(false);
    }, 1500);
  }, [productName, productCategory]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "grade_system":
        return <Package className="w-6 h-6" />;
      case "color_only":
        return <Palette className="w-6 h-6" />;
      case "size_only":
        return <Ruler className="w-6 h-6" />;
      case "material_only":
        return <Package2 className="w-6 h-6" />;
      case "color_size":
        return <Target className="w-6 h-6" />;
      case "color_material":
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Brain className="w-6 h-6" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "grade_system":
        return "Sistema de Grades";
      case "color_only":
        return "Apenas Cores";
      case "size_only":
        return "Apenas Tamanhos";
      case "material_only":
        return "Apenas Materiais";
      case "color_size":
        return "Cores + Tamanhos";
      case "color_material":
        return "Cores + Materiais";
      case "manual":
        return "Configuração Manual";
      default:
        return "Desconhecido";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <CheckCircle className="w-4 h-4" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4" />;
      case "low":
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Executar análise quando props mudarem
  useEffect(() => {
    if (productName || productCategory) {
      analyzeProduct();
    }
  }, [productName, productCategory, analyzeProduct]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Análise Inteligente</h3>
        </div>
        <p className="text-sm text-gray-600">
          Analisando "{productName}" na categoria "{productCategory}"
        </p>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-sm text-gray-600">
                Analisando produto...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Result */}
      {detectionResult && !isAnalyzing && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  {detectionResult.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {getTypeName(detectionResult.type)}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Sugestão baseada na análise do produto
                  </p>
                </div>
              </div>
              <Badge className={getConfidenceColor(detectionResult.confidence)}>
                {getConfidenceIcon(detectionResult.confidence)}
                <span className="ml-1">
                  {detectionResult.confidence === "high"
                    ? "Alta Confiança"
                    : detectionResult.confidence === "medium"
                    ? "Média Confiança"
                    : "Baixa Confiança"}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Razões */}
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Por que esta sugestão?
              </h4>
              <ul className="space-y-1">
                {detectionResult.reasons.map((reason, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sugestões */}
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Dicas para esta configuração
              </h4>
              <ul className="space-y-1">
                {detectionResult.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <Target className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                onClick={() =>
                  onTypeSelected(detectionResult.type, detectionResult)
                }
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {detectionResult.recommendedAction}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Alert */}
      {detectionResult && detectionResult.confidence === "low" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Não tem certeza?</strong> Nossa análise não encontrou um
            padrão claro. Recomendamos usar a configuração avançada para ter
            mais controle sobre as variações.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedProductTypeDetector;
