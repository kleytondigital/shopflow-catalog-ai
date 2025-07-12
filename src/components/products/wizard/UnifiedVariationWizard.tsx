import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  Settings,
  Wand2,
  HelpCircle,
  Package,
  Info,
  CheckCircle,
  ArrowRight,
  User,
  Users,
  Lightbulb,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import VariationWizardSelector from "./VariationWizardSelector";
import ProductTypeDetector from "./ProductTypeDetector";
import { useToast } from "@/hooks/use-toast";

interface UnifiedVariationWizardProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
  category?: string;
  productName?: string;
  onComplete?: () => void;
}

type WizardStep = "welcome" | "detection" | "wizard" | "complete";

const UnifiedVariationWizard: React.FC<UnifiedVariationWizardProps> = ({
  variations,
  onVariationsChange,
  productId,
  storeId,
  category,
  productName,
  onComplete,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>("welcome");
  const [initialVariationCount, setInitialVariationCount] = useState(0);

  useEffect(() => {
    setInitialVariationCount(variations.length);

    // Se já há variações, pular para o wizard
    if (variations.length > 0) {
      setCurrentStep("wizard");
    }
  }, []);

  useEffect(() => {
    // Detectar quando variações são criadas/modificadas
    if (variations.length > initialVariationCount) {
      toast({
        title: "✅ Variações atualizadas!",
        description: `${variations.length} variações configuradas com sucesso.`,
      });
    }
  }, [variations.length, initialVariationCount, toast]);

  const handleVariationsChange = (newVariations: ProductVariation[]) => {
    onVariationsChange(newVariations);

    // Se variações foram criadas, ir para tela de conclusão
    if (newVariations.length > 0 && currentStep === "wizard") {
      setCurrentStep("complete");
    }
  };

  const renderWelcome = () => (
    <div className="max-w-4xl mx-auto text-center space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Criador de Variações
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Vamos configurar as variações do seu produto de forma inteligente e
          personalizada. Nosso sistema detecta automaticamente o melhor tipo de
          variação para seu produto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Assistente Inteligente</h3>
            <p className="text-sm text-gray-600">
              Detectamos automaticamente o tipo de produto e sugerimos as
              melhores configurações
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Fácil de Usar</h3>
            <p className="text-sm text-gray-600">
              Interface simples para iniciantes ou avançada para usuários
              experientes
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Preview em Tempo Real</h3>
            <p className="text-sm text-gray-600">
              Veja como suas variações aparecerão no catálogo antes de finalizar
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {(category || productName) && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Detectamos que você está configurando:{" "}
              <strong>{productName}</strong>
              {category && ` na categoria "${category}"`}. Vamos usar essas
              informações para sugerir as melhores configurações.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setCurrentStep("detection")}
            className="flex items-center gap-2"
            size="lg"
          >
            <Sparkles className="w-5 h-5" />
            Começar Configuração
          </Button>

          {variations.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep("wizard")}
              className="flex items-center gap-2"
              size="lg"
            >
              <Settings className="w-5 h-5" />
              Editar Variações Existentes
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderDetection = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Análise do Produto</h2>
        <p className="text-gray-600">
          Analisando seu produto para sugerir a melhor configuração de variações
        </p>
      </div>

      {(category || productName) && (
        <ProductTypeDetector category={category} productName={productName} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Tipos de Variação Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-green-600" />
                <h4 className="font-medium">Produto Único</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Sem variações, um produto específico
              </p>
              <p className="text-xs text-gray-500">
                Ex: Caneca personalizada, poster específico
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium">Variações Tradicionais</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Cores e tamanhos individuais
              </p>
              <p className="text-xs text-gray-500">
                Ex: Camiseta P/M/G, vestido em várias cores
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">Sistema de Grades</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Kits de tamanhos vendidos juntos
              </p>
              <p className="text-xs text-gray-500">
                Ex: Sapatos do 33 ao 38, chinelos em grade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => setCurrentStep("welcome")}>
          Voltar
        </Button>
        <Button
          onClick={() => setCurrentStep("wizard")}
          className="flex items-center gap-2"
        >
          Continuar para Configuração
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderWizard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configuração de Variações
          </h2>
          <p className="text-gray-600">
            Escolha o método que melhor se adapta ao seu produto
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentStep("detection")}
          size="sm"
        >
          ← Voltar
        </Button>
      </div>

      <VariationWizardSelector
        variations={variations}
        onVariationsChange={handleVariationsChange}
        productId={productId}
        storeId={storeId}
        category={category}
        productName={productName}
      />
    </div>
  );

  const renderComplete = () => (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Variações Configuradas!
          </h2>
        </div>
        <p className="text-lg text-gray-600">
          Suas {variations.length} variações foram criadas com sucesso e estão
          prontas para uso.
        </p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Próximos Passos:</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-green-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Configure imagens</h4>
                <p className="text-sm text-gray-600">
                  Adicione imagens específicas para cada variação
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Ajuste preços</h4>
                <p className="text-sm text-gray-600">
                  Configure preços específicos se necessário
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-green-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Teste no catálogo</h4>
                <p className="text-sm text-gray-600">
                  Visualize como aparece para os clientes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => setCurrentStep("wizard")}>
          Editar Variações
        </Button>
        <Button onClick={onComplete} className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Finalizar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {currentStep === "welcome" && renderWelcome()}
        {currentStep === "detection" && renderDetection()}
        {currentStep === "wizard" && renderWizard()}
        {currentStep === "complete" && renderComplete()}
      </div>
    </div>
  );
};

export default UnifiedVariationWizard;
