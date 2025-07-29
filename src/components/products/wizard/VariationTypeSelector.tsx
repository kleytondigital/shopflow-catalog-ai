import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Ruler,
  Package2,
  Layers,
  Sparkles,
  Settings,
  ChevronRight,
  Info,
} from "lucide-react";
import { ProductVariation } from "@/types/product";

interface VariationType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  fields: ("color" | "size" | "material")[];
  examples: string[];
  difficulty: "easy" | "medium" | "advanced";
  recommended: boolean;
}

interface VariationTypeSelectorProps {
  onTypeSelect: (type: VariationType) => void;
  productCategory?: string;
  productName?: string;
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
}

const VariationTypeSelector: React.FC<VariationTypeSelectorProps> = ({
  onTypeSelect,
  productCategory = "",
  productName = "",
  variations,
  onVariationsChange,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const variationTypes: VariationType[] = [
    {
      id: "color_only",
      name: "Apenas Cores",
      description: "Produto disponível em várias cores",
      icon: <Palette className="w-6 h-6" />,
      fields: ["color"],
      examples: [
        "Camiseta básica",
        "Caneca personalizada",
        "Capinha de celular",
      ],
      difficulty: "easy",
      recommended:
        productCategory.toLowerCase().includes("camiseta") ||
        productCategory.toLowerCase().includes("caneca"),
    },
    {
      id: "size_only",
      name: "Apenas Tamanhos",
      description: "Produto disponível em vários tamanhos",
      icon: <Ruler className="w-6 h-6" />,
      fields: ["size"],
      examples: ["Meia unissex", "Cueca", "Luva"],
      difficulty: "easy",
      recommended:
        productCategory.toLowerCase().includes("meia") ||
        productCategory.toLowerCase().includes("cueca"),
    },
    {
      id: "material_only",
      name: "Apenas Materiais",
      description: "Produto disponível em diferentes materiais",
      icon: <Package2 className="w-6 h-6" />,
      fields: ["material"],
      examples: ["Pulseira", "Colar", "Anel", "Bolsa básica"],
      difficulty: "easy",
      recommended:
        productCategory.toLowerCase().includes("bijuteria") ||
        productCategory.toLowerCase().includes("acessório"),
    },
    {
      id: "color_size",
      name: "Cores + Tamanhos",
      description: "Produto com variações de cor e tamanho",
      icon: <Layers className="w-6 h-6" />,
      fields: ["color", "size"],
      examples: ["Roupas", "Vestidos", "Calças", "Blusas"],
      difficulty: "medium",
      recommended:
        productCategory.toLowerCase().includes("roupa") ||
        productCategory.toLowerCase().includes("vestido") ||
        productCategory.toLowerCase().includes("blusa"),
    },
    {
      id: "color_material",
      name: "Cores + Materiais",
      description: "Produto com variações de cor e material",
      icon: <Layers className="w-6 h-6" />,
      fields: ["color", "material"],
      examples: ["Bolsas", "Carteiras", "Sapatos especiais"],
      difficulty: "medium",
      recommended:
        productCategory.toLowerCase().includes("bolsa") ||
        productCategory.toLowerCase().includes("carteira"),
    },
    {
      id: "grade_system",
      name: "Sistema de Grades",
      description: "Para produtos vendidos por atacado com grades",
      icon: <Package2 className="w-6 h-6" />,
      fields: ["color", "size"],
      examples: ["Calçados", "Produtos por atacado"],
      difficulty: "medium",
      recommended:
        productCategory.toLowerCase().includes("calçado") ||
        productCategory.toLowerCase().includes("sapato") ||
        productCategory.toLowerCase().includes("tênis"),
    },
    {
      id: "advanced",
      name: "Configuração Avançada",
      description: "Sistema completo com todas as opções",
      icon: <Settings className="w-6 h-6" />,
      fields: ["color", "size", "material"],
      examples: ["Produtos complexos", "Múltiplas variações"],
      difficulty: "advanced",
      recommended: false,
    },
  ];

  // Ordenar tipos: recomendados primeiro, depois por dificuldade
  const sortedTypes = [...variationTypes].sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;

    const difficultyOrder = { easy: 1, medium: 2, advanced: 3 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  const handleTypeSelect = (type: VariationType) => {
    setSelectedType(type.id);
    onTypeSelect(type);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Médio";
      case "advanced":
        return "Avançado";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          🎯 Que tipo de variação seu produto possui?
        </h2>
        <p className="text-gray-600">
          Escolha a opção que melhor descreve como seu produto varia
        </p>
        {productName && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Configurando: <strong>{productName}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Grid de tipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTypes.map((type) => (
          <Card
            key={type.id}
            className={`relative cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              selectedType === type.id
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            } ${type.recommended ? "border-green-400" : ""}`}
            onClick={() => handleTypeSelect(type)}
          >
            {type.recommended && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-green-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      type.difficulty === "easy"
                        ? "bg-green-100 text-green-600"
                        : type.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {type.name}
                    </CardTitle>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                {type.description}
              </p>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={getDifficultyColor(type.difficulty)}
                >
                  {getDifficultyLabel(type.difficulty)}
                </Badge>
                <div className="flex gap-1">
                  {type.fields.map((field) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field === "color"
                        ? "🎨"
                        : field === "size"
                        ? "📏"
                        : "🧵"}{" "}
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500 font-medium">Exemplos:</p>
                <p className="text-xs text-gray-600">
                  {type.examples.slice(0, 2).join(", ")}
                  {type.examples.length > 2 && "..."}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dica */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <Info className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            💡 Dica: Escolha a opção mais simples que atende suas necessidades
          </span>
        </div>
      </div>
    </div>
  );
};

export default VariationTypeSelector;
