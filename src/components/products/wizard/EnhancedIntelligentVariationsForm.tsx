import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  Info,
  Lightbulb,
  Settings,
  Eye,
  EyeOff,
  Package,
  Palette,
  Shirt,
  Sparkles,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import IntelligentVariationsForm from "./IntelligentVariationsForm";
import {
  GradeHelpTooltips,
  GradeConceptHelp,
  ColorGradeHelp,
  StockGradeHelp,
  WhenUseGradesHelp,
  GradeVsVariationHelp,
  SimpleGradeExamples,
} from "./GradeHelpTooltips";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface EnhancedIntelligentVariationsFormProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
}

const EnhancedIntelligentVariationsForm: React.FC<
  EnhancedIntelligentVariationsFormProps
> = ({ variations, onVariationsChange, productId, storeId }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [activeHelpSection, setActiveHelpSection] = useState<string | null>(
    null
  );

  const helpSections = [
    {
      id: "concepts",
      title: "Conceitos Básicos",
      icon: <Lightbulb className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Variações</strong> são diferentes versões do mesmo
              produto. Por exemplo: uma camiseta em cores diferentes ou tamanhos
              diferentes.
            </AlertDescription>
          </Alert>
          <GradeVsVariationHelp />
        </div>
      ),
    },
    {
      id: "grades",
      title: "Sistema de Grades",
      icon: <Package className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <WhenUseGradesHelp />
          <SimpleGradeExamples />
        </div>
      ),
    },
    {
      id: "attributes",
      title: "Atributos e Grupos",
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Grupos de Atributos</strong> são características que seus
              produtos podem ter:
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium">Cor</h4>
              </div>
              <p className="text-sm text-gray-600">
                Diferentes cores do mesmo produto (ex: Preto, Branco, Azul)
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shirt className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium">Tamanho</h4>
              </div>
              <p className="text-sm text-gray-600">
                Diferentes tamanhos (ex: P, M, G ou 38, 40, 42)
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                <h4 className="font-medium">Material</h4>
              </div>
              <p className="text-sm text-gray-600">
                Diferentes materiais (ex: Algodão, Poliéster, Seda)
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tips",
      title: "Dicas Importantes",
      icon: <HelpCircle className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">
                ✅ Boas Práticas
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Defina grupos antes de criar variações</li>
                <li>• Use nomes claros e consistentes</li>
                <li>• Configure estoque para cada variação</li>
                <li>• Teste as variações no catálogo</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Cuidados</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Muitas variações podem confundir clientes</li>
                <li>• Mantenha SKUs únicos</li>
                <li>• Gerencie estoque adequadamente</li>
                <li>• Use imagens para cada variação</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const renderHelpPanel = () => (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Central de Ajuda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {helpSections.map((section) => (
            <Collapsible
              key={section.id}
              open={activeHelpSection === section.id}
              onOpenChange={(open) =>
                setActiveHelpSection(open ? section.id : null)
              }
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                >
                  {section.icon}
                  <span className="ml-2">{section.title}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                {section.content}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <GradeHelpTooltips>
      <div className="space-y-6">
        {/* Header com controles */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Configuração Avançada de Variações
            </h2>
            <p className="text-gray-600">
              Controle total sobre atributos, grupos e configurações técnicas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2"
            >
              {showHelp ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showHelp ? "Ocultar" : "Mostrar"} Ajuda
            </Button>
          </div>
        </div>

        {/* Alertas contextuais */}
        <div className="space-y-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Modo Avançado:</strong> Esta interface oferece controle
              completo sobre variações. Se você é iniciante, considere usar o{" "}
              <strong>Assistente Simples</strong> para produtos com grade.
            </AlertDescription>
          </Alert>

          {variations.length > 0 && (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                <strong>Variações Existentes:</strong> Encontramos{" "}
                {variations.length} variações já configuradas. Você pode
                editá-las ou adicionar novas.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel de ajuda (condicional) */}
          {showHelp && <div className="lg:col-span-1">{renderHelpPanel()}</div>}

          {/* Formulário principal */}
          <div className={showHelp ? "lg:col-span-3" : "lg:col-span-4"}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Configurações de Variação
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <GradeConceptHelp />
                    <ColorGradeHelp />
                    <StockGradeHelp />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <IntelligentVariationsForm
                  variations={variations}
                  onVariationsChange={onVariationsChange}
                  productId={productId}
                  storeId={storeId}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de dicas rápidas */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-900 mb-2">
                  Dicas Rápidas para Configuração Avançada
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-yellow-800 text-sm mb-1">
                      Criando Grupos de Atributos:
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Defina grupos antes de criar variações</li>
                      <li>• Use nomes descritivos (ex: "Cor", "Tamanho")</li>
                      <li>• Configure valores para cada grupo</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 text-sm mb-1">
                      Gerenciando Variações:
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Use operações em lote para eficiência</li>
                      <li>• Configure estoque individualmente</li>
                      <li>• Ajuste preços por variação se necessário</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GradeHelpTooltips>
  );
};

export default EnhancedIntelligentVariationsForm;
