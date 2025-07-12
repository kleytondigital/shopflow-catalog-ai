import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wand2,
  Settings,
  HelpCircle,
  Lightbulb,
  Package,
  Palette,
  Shirt,
  ArrowRight,
  Info,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import SimpleGradeWizard from "./SimpleGradeWizard";
import IntelligentVariationsForm from "./IntelligentVariationsForm";
import EnhancedIntelligentVariationsForm from "./EnhancedIntelligentVariationsForm";
import GradeExplanationCard from "./GradeExplanationCard";
import ProductTypeDetector from "./ProductTypeDetector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VariationWizardSelectorProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
  category?: string;
  productName?: string;
}

type WizardMode = "selector" | "simple" | "advanced" | "help";

const VariationWizardSelector: React.FC<VariationWizardSelectorProps> = ({
  variations,
  onVariationsChange,
  productId,
  storeId,
  category,
  productName,
}) => {
  const [wizardMode, setWizardMode] = useState<WizardMode>("selector");
  const [showHelp, setShowHelp] = useState(false);

  // Detectar se já existem variações para sugerir modo apropriado
  const hasExistingVariations = variations.length > 0;
  const hasGradeVariations = variations.some(
    (v) => v.variation_type === "grade" || v.is_grade
  );

  const renderSelector = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Assistente de Variações
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Vamos criar as variações do seu produto da forma mais fácil para você.
          Escolha a opção que melhor se adapta ao seu conhecimento e
          necessidades.
        </p>
      </div>

      {/* Detector automático de tipo de produto */}
      {(category || productName) && (
        <ProductTypeDetector category={category} productName={productName} />
      )}

      {hasExistingVariations && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Variações existentes detectadas:</strong>{" "}
            {variations.length} variações encontradas.
            {hasGradeVariations && " Algumas são variações de grade."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wizard Simples */}
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wand2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Assistente Simples</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  Recomendado
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Ideal para iniciantes ou produtos com grades (calçados, kits de
              tamanhos).
            </p>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-700">
                ✅ Perfeito para:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Primeira vez criando variações</li>
                <li>• Produtos com grades (sapatos, chinelos)</li>
                <li>• Vendas para revendedores</li>
                <li>• Produtos vendidos em kits</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-blue-700">
                🎯 Características:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Linguagem simples e clara</li>
                <li>• Passo a passo guiado</li>
                <li>• Grades pré-definidas</li>
                <li>• Explicações visuais</li>
              </ul>
            </div>

            <Button
              onClick={() => setWizardMode("simple")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <User className="w-4 h-4 mr-2" />
              Usar Assistente Simples
            </Button>
          </CardContent>
        </Card>

        {/* Wizard Avançado */}
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Configuração Avançada</CardTitle>
                <Badge variant="outline" className="mt-1">
                  Para experientes
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Controle total sobre variações, atributos personalizados e
              configurações técnicas.
            </p>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-700">
                ✅ Perfeito para:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Usuários experientes</li>
                <li>• Produtos complexos</li>
                <li>• Atributos personalizados</li>
                <li>• Controle fino de preços</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-purple-700">
                🔧 Características:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Todos os atributos disponíveis</li>
                <li>• Configurações técnicas</li>
                <li>• Bulk operations</li>
                <li>• Máxima flexibilidade</li>
              </ul>
            </div>

            <Button
              onClick={() => setWizardMode("advanced")}
              variant="outline"
              className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Users className="w-4 h-4 mr-2" />
              Usar Configuração Avançada
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Ajuda */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900 mb-2">
                Não sabe qual escolher?
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Não se preocupe! Preparamos um guia completo para ajudar você a
                entender os diferentes tipos de variações e qual é o melhor para
                seu produto.
              </p>
              <div className="flex gap-2">
                <Dialog open={showHelp} onOpenChange={setShowHelp}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-600 text-yellow-700"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Ver Guia Completo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Guia Completo de Variações</DialogTitle>
                    </DialogHeader>
                    <GradeExplanationCard />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWizardMode("simple")}
                  className="border-blue-600 text-blue-700"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Começar com Simples
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Comparação Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <Package className="w-8 h-8 text-green-600 mx-auto" />
              <h4 className="font-medium">Produto Único</h4>
              <p className="text-xs text-gray-600">Sem variações</p>
              <p className="text-xs text-gray-500">Ex: Caneca branca</p>
            </div>
            <div className="space-y-2">
              <Palette className="w-8 h-8 text-purple-600 mx-auto" />
              <h4 className="font-medium">Com Variações</h4>
              <p className="text-xs text-gray-600">
                Cores/tamanhos individuais
              </p>
              <p className="text-xs text-gray-500">Ex: Camiseta P, M, G</p>
            </div>
            <div className="space-y-2">
              <Shirt className="w-8 h-8 text-blue-600 mx-auto" />
              <h4 className="font-medium">Com Grade</h4>
              <p className="text-xs text-gray-600">Kits de tamanhos</p>
              <p className="text-xs text-gray-500">Ex: Sapatos 33-38</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWizard = () => {
    switch (wizardMode) {
      case "simple":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setWizardMode("selector")}
                size="sm"
              >
                ← Voltar
              </Button>
              <Badge variant="secondary">Assistente Simples</Badge>
            </div>
            <SimpleGradeWizard
              variations={variations}
              onVariationsChange={onVariationsChange}
              productId={productId}
              storeId={storeId}
              category={category}
              productName={productName}
            />
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setWizardMode("selector")}
                size="sm"
              >
                ← Voltar
              </Button>
              <Badge variant="outline">Configuração Avançada</Badge>
            </div>
            <EnhancedIntelligentVariationsForm
              variations={variations}
              onVariationsChange={onVariationsChange}
              productId={productId}
              storeId={storeId}
            />
          </div>
        );

      default:
        return renderSelector();
    }
  };

  return <div className="min-h-screen bg-gray-50 py-6">{renderWizard()}</div>;
};

export default VariationWizardSelector;
