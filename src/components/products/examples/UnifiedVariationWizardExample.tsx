import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductVariation } from "@/types/product";
import UnifiedVariationWizard from "../wizard/UnifiedVariationWizard";
import ProductVariationsManager from "../ProductVariationsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Package, Palette, Shirt } from "lucide-react";

/**
 * Exemplos de como usar o UnifiedVariationWizard
 *
 * Este componente demonstra diferentes formas de integrar o novo sistema
 * de variações nos formulários de produtos existentes.
 */

const UnifiedVariationWizardExample: React.FC = () => {
  // Estados para diferentes cenários
  const [calçadoVariations, setCalçadoVariations] = useState<
    ProductVariation[]
  >([]);
  const [roupaVariations, setRoupaVariations] = useState<ProductVariation[]>(
    []
  );
  const [decoraçãoVariations, setDecoraçãoVariations] = useState<
    ProductVariation[]
  >([]);

  const exampleProducts = [
    {
      name: "Tênis Esportivo",
      category: "calçados",
      variations: calçadoVariations,
      setVariations: setCalçadoVariations,
      description: "Produto com grade - ideal para o wizard simplificado",
    },
    {
      name: "Camiseta Básica",
      category: "roupas",
      variations: roupaVariations,
      setVariations: setRoupaVariations,
      description: "Produto com variações tradicionais",
    },
    {
      name: "Quadro Decorativo",
      category: "decoração",
      variations: decoraçãoVariations,
      setVariations: setDecoraçãoVariations,
      description: "Produto único - sem variações",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Sistema de Variações Unificado
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Demonstração completa do novo sistema de variações com detecção
          automática, wizard simplificado e interface avançada.
        </p>
      </div>

      {/* Guia de Integração */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Como Integrar no Seu Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">1. Integração Simples</h4>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                {`<UnifiedVariationWizard
  variations={variations}
  onVariationsChange={setVariations}
  productId={productId}
  storeId={storeId}
  category={category}
  productName={productName}
  onComplete={() => console.log('Done!')}
/>`}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                2. Com ProductVariationsManager
              </h4>
              <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                {`<ProductVariationsManager
  variations={variations}
  onChange={setVariations}
  productId={productId}
  storeId={storeId}
  category={category}
  productName={productName}
/>`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemplos Práticos */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Exemplos Práticos</h2>

        <Tabs defaultValue="calçados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calçados">Calçados (Grade)</TabsTrigger>
            <TabsTrigger value="roupas">Roupas (Variações)</TabsTrigger>
            <TabsTrigger value="decoração">Decoração (Único)</TabsTrigger>
          </TabsList>

          {exampleProducts.map((product, index) => (
            <TabsContent key={product.category} value={product.category}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações do Produto */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {product.category === "calçados" && (
                          <Shirt className="w-5 h-5" />
                        )}
                        {product.category === "roupas" && (
                          <Palette className="w-5 h-5" />
                        )}
                        {product.category === "decoração" && (
                          <Package className="w-5 h-5" />
                        )}
                        {product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Categoria:</span>
                          <Badge variant="outline" className="ml-2">
                            {product.category}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Variações:</span>
                          <Badge variant="secondary" className="ml-2">
                            {product.variations.length}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {product.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resultado das Variações */}
                  {product.variations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Variações Criadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {product.variations.map((variation, idx) => (
                            <div
                              key={variation.id || idx}
                              className="p-2 border rounded-lg text-sm"
                            >
                              <div className="font-medium">
                                {variation.name ||
                                  `${variation.color || "Sem cor"} ${
                                    variation.size || variation.grade_name || ""
                                  }`.trim()}
                              </div>
                              <div className="text-gray-600 text-xs">
                                Estoque: {variation.stock || 0}
                                {variation.is_grade &&
                                  ` | Grade: ${variation.grade_name}`}
                                {variation.grade_sizes &&
                                  ` | Tamanhos: ${variation.grade_sizes.join(
                                    ", "
                                  )}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Wizard Unificado */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>UnifiedVariationWizard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UnifiedVariationWizard
                        variations={product.variations}
                        onVariationsChange={product.setVariations}
                        productId={`example-${index}`}
                        storeId="example-store"
                        category={product.category}
                        productName={product.name}
                        onComplete={() => {
                          console.log(
                            `✅ Variações configuradas para ${product.name}`
                          );
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Comparação de Abordagens */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação: Antes vs Depois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-red-700">
                ❌ Sistema Anterior
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Terminologia técnica ("atributos", "combinações")</li>
                <li>• Interface com múltiplas abas confusas</li>
                <li>• Sem detecção automática de tipo</li>
                <li>• Ausência de preview em tempo real</li>
                <li>• Dificuldade para usuários iniciantes</li>
                <li>• Processo manual e demorado</li>
                <li>• Falta de explicações contextuais</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-700">
                ✅ Sistema Novo
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Linguagem simples e cotidiana</li>
                <li>• Fluxo linear de 4 passos claros</li>
                <li>• Detecção automática por categoria</li>
                <li>• Preview em tempo real no catálogo</li>
                <li>• Assistente guiado para iniciantes</li>
                <li>• Configuração rápida e intuitiva</li>
                <li>• Explicações e dicas em cada etapa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentação Técnica */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900">
            Documentação Técnica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Arquivos Criados:</strong> O sistema inclui 8 novos
                componentes que trabalham em conjunto para fornecer uma
                experiência unificada de criação de variações.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-semibold mb-2">Componentes Principais:</h5>
                <ul className="space-y-1 text-purple-800">
                  <li>• UnifiedVariationWizard.tsx</li>
                  <li>• VariationWizardSelector.tsx</li>
                  <li>• SimpleGradeWizard.tsx</li>
                  <li>• ProductTypeDetector.tsx</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Componentes de Suporte:</h5>
                <ul className="space-y-1 text-purple-800">
                  <li>• EnhancedIntelligentVariationsForm.tsx</li>
                  <li>• VariationPreview.tsx</li>
                  <li>• GradeExplanationCard.tsx</li>
                  <li>• GradeHelpTooltips.tsx</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedVariationWizardExample;
