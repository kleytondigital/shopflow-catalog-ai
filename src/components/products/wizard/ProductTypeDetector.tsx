import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  Package,
  Shirt,
  Palette,
  Star,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface ProductTypeDetectorProps {
  category?: string;
  productName?: string;
  onSuggestionApply?: (suggestion: ProductSuggestion) => void;
}

interface ProductSuggestion {
  productType: "single" | "variations" | "grade";
  confidence: "high" | "medium" | "low";
  suggestedGrades?: string[];
  suggestedColors?: string[];
  reasoning: string;
  tips: string[];
}

// Mapeamento de categorias para tipos de produto
const categoryMappings = {
  // Produtos que geralmente usam grades
  grade: {
    keywords: [
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
    ],
    categories: [
      "calçados",
      "sapatos",
      "tênis",
      "sandálias",
      "chinelos",
      "botas",
      "calçados femininos",
      "calçados masculinos",
      "calçados infantis",
    ],
  },

  // Produtos que geralmente usam variações tradicionais
  variations: {
    keywords: [
      "camiseta",
      "blusa",
      "camisa",
      "vestido",
      "saia",
      "calça",
      "short",
      "jaqueta",
      "casaco",
      "moletom",
      "regata",
      "polo",
      "social",
      "jeans",
      "legging",
      "bermuda",
      "cueca",
      "calcinha",
      "sutiã",
      "pijama",
      "lingerie",
    ],
    categories: [
      "roupas",
      "vestuário",
      "moda",
      "camisetas",
      "blusas",
      "vestidos",
      "calças",
      "shorts",
      "jaquetas",
      "casacos",
      "underwear",
      "lingerie",
      "moda feminina",
      "moda masculina",
      "moda infantil",
    ],
  },

  // Produtos únicos (sem variações)
  single: {
    keywords: [
      "caneca",
      "copo",
      "garrafa",
      "quadro",
      "poster",
      "adesivo",
      "chaveiro",
      "ímã",
      "mousepad",
      "almofada",
      "toalha",
      "lençol",
      "travesseiro",
      "luminária",
      "vela",
      "sabonete",
      "perfume",
      "shampoo",
      "condicionador",
    ],
    categories: [
      "casa",
      "decoração",
      "utensílios",
      "presentes",
      "personalizados",
      "cosméticos",
      "higiene",
      "beleza",
      "casa e jardim",
      "utilidades",
    ],
  },
};

// Grades sugeridas por categoria
const gradesSuggestions = {
  "calçados femininos": ["Baixa", "Média", "Alta"],
  "calçados masculinos": ["Masculina"],
  "calçados infantis": ["Infantil"],
  tênis: ["Baixa", "Média", "Alta", "Masculina"],
  sandálias: ["Baixa", "Média"],
  chinelos: ["Baixa", "Média", "Alta", "Masculina"],
  sapatos: ["Baixa", "Média", "Alta", "Masculina"],
  botas: ["Média", "Alta", "Masculina"],
  default: ["Baixa", "Alta"],
};

// Cores sugeridas por categoria
const colorsSuggestions = {
  calçados: ["Preto", "Branco", "Marrom", "Bege"],
  tênis: ["Preto", "Branco", "Azul", "Vermelho", "Cinza"],
  sandálias: ["Preto", "Branco", "Bege", "Rosa"],
  chinelos: ["Preto", "Branco", "Azul", "Rosa", "Verde"],
  roupas: ["Preto", "Branco", "Azul", "Vermelho", "Verde", "Rosa"],
  camisetas: ["Preto", "Branco", "Azul", "Vermelho", "Verde"],
  vestidos: ["Preto", "Branco", "Azul", "Rosa", "Vermelho"],
  default: ["Preto", "Branco", "Azul"],
};

const ProductTypeDetector: React.FC<ProductTypeDetectorProps> = ({
  category,
  productName,
  onSuggestionApply,
}) => {
  const detectProductType = (): ProductSuggestion => {
    const searchText = `${category || ""} ${productName || ""}`.toLowerCase();

    // Verificar se é produto de grade
    const gradeKeywords = categoryMappings.grade.keywords;
    const gradeCategories = categoryMappings.grade.categories;

    const gradeMatches = gradeKeywords.filter((keyword) =>
      searchText.includes(keyword)
    ).length;

    const gradeCategoryMatches = gradeCategories.filter((cat) =>
      searchText.includes(cat)
    ).length;

    // Verificar se é produto com variações
    const variationKeywords = categoryMappings.variations.keywords;
    const variationCategories = categoryMappings.variations.categories;

    const variationMatches = variationKeywords.filter((keyword) =>
      searchText.includes(keyword)
    ).length;

    const variationCategoryMatches = variationCategories.filter((cat) =>
      searchText.includes(cat)
    ).length;

    // Verificar se é produto único
    const singleKeywords = categoryMappings.single.keywords;
    const singleCategories = categoryMappings.single.categories;

    const singleMatches = singleKeywords.filter((keyword) =>
      searchText.includes(keyword)
    ).length;

    const singleCategoryMatches = singleCategories.filter((cat) =>
      searchText.includes(cat)
    ).length;

    // Determinar tipo baseado nas pontuações
    const gradeScore = gradeMatches + gradeCategoryMatches * 2;
    const variationScore = variationMatches + variationCategoryMatches * 2;
    const singleScore = singleMatches + singleCategoryMatches * 2;

    // Sugestões de grades baseadas na categoria
    const getSuggestedGrades = (category: string): string[] => {
      const categoryLower = category.toLowerCase();

      for (const [key, grades] of Object.entries(gradesSuggestions)) {
        if (categoryLower.includes(key)) {
          return grades;
        }
      }

      return gradesSuggestions.default;
    };

    // Sugestões de cores baseadas na categoria
    const getSuggestedColors = (category: string): string[] => {
      const categoryLower = category.toLowerCase();

      for (const [key, colors] of Object.entries(colorsSuggestions)) {
        if (categoryLower.includes(key)) {
          return colors;
        }
      }

      return colorsSuggestions.default;
    };

    // Determinar resultado
    if (
      gradeScore >= variationScore &&
      gradeScore >= singleScore &&
      gradeScore > 0
    ) {
      return {
        productType: "grade",
        confidence:
          gradeScore >= 3 ? "high" : gradeScore >= 2 ? "medium" : "low",
        suggestedGrades: getSuggestedGrades(category || ""),
        suggestedColors: getSuggestedColors(category || ""),
        reasoning: `Detectamos que "${productName}" na categoria "${category}" é tipicamente vendido em grades (kits de tamanhos).`,
        tips: [
          "Grades são ideais para calçados e produtos vendidos para revendedores",
          "Cada grade contém múltiplos tamanhos vendidos em conjunto",
          "Facilita a gestão de estoque por conjunto de tamanhos",
        ],
      };
    }

    if (variationScore >= singleScore && variationScore > 0) {
      return {
        productType: "variations",
        confidence:
          variationScore >= 3 ? "high" : variationScore >= 2 ? "medium" : "low",
        suggestedColors: getSuggestedColors(category || ""),
        reasoning: `Detectamos que "${productName}" na categoria "${category}" geralmente tem variações de cor e tamanho.`,
        tips: [
          "Variações são ideais para roupas e produtos com tamanhos individuais",
          "Clientes escolhem cor e tamanho específicos",
          "Facilita a gestão de estoque por item individual",
        ],
      };
    }

    if (singleScore > 0) {
      return {
        productType: "single",
        confidence:
          singleScore >= 3 ? "high" : singleScore >= 2 ? "medium" : "low",
        reasoning: `Detectamos que "${productName}" na categoria "${category}" é tipicamente vendido como produto único.`,
        tips: [
          "Produtos únicos não precisam de variações",
          "Ideais para itens personalizados ou específicos",
          "Simplifica o processo de cadastro e venda",
        ],
      };
    }

    // Fallback - sugerir variações como padrão
    return {
      productType: "variations",
      confidence: "low",
      suggestedColors: colorsSuggestions.default,
      reasoning:
        "Não conseguimos detectar automaticamente o tipo. Sugerimos variações como padrão.",
      tips: [
        "Se seu produto tem cores ou tamanhos diferentes, use variações",
        "Se é calçado vendido em kits, use grades",
        "Se é produto único, escolha produto único",
      ],
    };
  };

  const suggestion = detectProductType();

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "grade":
        return <Shirt className="w-5 h-5 text-blue-600" />;
      case "variations":
        return <Palette className="w-5 h-5 text-purple-600" />;
      case "single":
        return <Package className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "grade":
        return "Produto com Grade";
      case "variations":
        return "Produto com Variações";
      case "single":
        return "Produto Único";
      default:
        return "Não identificado";
    }
  };

  if (!category && !productName) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          Detecção Automática de Tipo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {getTypeIcon(suggestion.productType)}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">
              {getTypeName(suggestion.productType)}
            </h4>
            <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
          </div>
          <Badge
            className={`${getConfidenceColor(suggestion.confidence)} border`}
          >
            {getConfidenceIcon(suggestion.confidence)}
            <span className="ml-1 capitalize">{suggestion.confidence}</span>
          </Badge>
        </div>

        {suggestion.suggestedGrades &&
          suggestion.suggestedGrades.length > 0 && (
            <div>
              <h5 className="font-medium text-sm mb-2">Grades Sugeridas:</h5>
              <div className="flex flex-wrap gap-1">
                {suggestion.suggestedGrades.map((grade) => (
                  <Badge key={grade} variant="outline" className="text-xs">
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {suggestion.suggestedColors &&
          suggestion.suggestedColors.length > 0 && (
            <div>
              <h5 className="font-medium text-sm mb-2">Cores Sugeridas:</h5>
              <div className="flex flex-wrap gap-1">
                {suggestion.suggestedColors.map((color) => (
                  <Badge key={color} variant="outline" className="text-xs">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        <div>
          <h5 className="font-medium text-sm mb-2">Dicas:</h5>
          <ul className="text-xs text-gray-600 space-y-1">
            {suggestion.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-blue-600 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {suggestion.confidence === "low" && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Confiança baixa:</strong> Recomendamos revisar a sugestão
              e escolher manualmente o tipo mais apropriado para seu produto.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductTypeDetector;
