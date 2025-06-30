import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Settings, Lightbulb } from "lucide-react";
import MasterVariationSelector from "./MasterVariationSelector";
import AdvancedVariationManager from "./AdvancedVariationManager";
import { ProductVariation } from "@/types/variation";

const VariationDemoPage: React.FC = () => {
  const [basicVariations, setBasicVariations] = useState<ProductVariation[]>(
    []
  );
  const [advancedVariations, setAdvancedVariations] = useState<
    ProductVariation[]
  >([]);

  const problemsResolved = [
    {
      problem: "Não conseguia remover combinações específicas (ex: Preto 39)",
      solution:
        "Agora você pode ativar/desativar combinações individualmente na matriz",
      resolved: true,
    },
    {
      problem: "Todas as combinações eram geradas automaticamente",
      solution:
        "Modo manual permite criar apenas as combinações que você possui",
      resolved: true,
    },
    {
      problem: "Difícil visualizar quais combinações existem",
      solution:
        "Visualização em matriz mostra claramente o que está ativo/inativo",
      resolved: true,
    },
    {
      problem: "Gerenciamento de estoque por combinação era complexo",
      solution:
        "Edição de estoque diretamente na matriz ou na visualização em lista",
      resolved: true,
    },
  ];

  const improvements = [
    {
      title: "Modo Manual vs Automático",
      description:
        "Escolha entre gerar todas as combinações automaticamente ou criar apenas as que você precisa",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      title: "Visualização em Matriz",
      description:
        "Veja todas as combinações possíveis em formato de tabela, ative/desative com um clique",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      title: "Gerenciamento Individual",
      description:
        "Remova combinações específicas, edite estoque e preços independentemente",
      icon: <XCircle className="w-5 h-5" />,
    },
    {
      title: "Estatísticas Detalhadas",
      description:
        "Visualize resumos de variações ativas, estoque total, e outros indicadores importantes",
      icon: <Lightbulb className="w-5 h-5" />,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Sistema de Variações Melhorado</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Resolução completa dos problemas de gerenciamento de variações de
          produtos, com controle total sobre combinações específicas de cor,
          tamanho e outros atributos.
        </p>
      </div>

      {/* Problemas Resolvidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Problemas Resolvidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {problemsResolved.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-green-900">
                    Problema: {item.problem}
                  </p>
                  <p className="text-sm text-green-700">
                    Solução: {item.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Melhorias Implementadas */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Melhorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {improvements.map((improvement, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border rounded-lg"
              >
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {improvement.icon}
                </div>
                <div>
                  <h4 className="font-medium mb-1">{improvement.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {improvement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demonstração dos Componentes */}
      <Card>
        <CardHeader>
          <CardTitle>Teste os Componentes Melhorados</CardTitle>
          <p className="text-sm text-muted-foreground">
            Experimente ambas as versões para ver as diferenças
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="improved" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="improved">Versão Melhorada</TabsTrigger>
              <TabsTrigger value="basic">Versão Básica</TabsTrigger>
            </TabsList>

            <TabsContent value="improved" className="space-y-4">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Versão Melhorada:</strong> Inclui modo manual,
                  visualização em matriz, e controle individual de combinações.
                  Perfeito para o seu cenário de não ter todas as combinações em
                  estoque.
                </AlertDescription>
              </Alert>

              <AdvancedVariationManager
                variations={advancedVariations}
                onVariationsChange={setAdvancedVariations}
              />

              {/* Resumo das Variações Criadas */}
              {advancedVariations.length > 0 && (
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Resumo das Variações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {advancedVariations.map((variation, index) => (
                        <div
                          key={variation.id}
                          className="flex items-center justify-between p-2 bg-white rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                variation.is_active ? "default" : "secondary"
                              }
                            >
                              {[variation.color, variation.size]
                                .filter(Boolean)
                                .join(" - ")}
                            </Badge>
                            {!variation.is_active && (
                              <Badge variant="outline">Inativa</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>Estoque: {variation.stock}</span>
                            <span>
                              Preço: {variation.price_adjustment > 0 ? "+" : ""}
                              R$ {variation.price_adjustment.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="basic" className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Versão Básica:</strong> Sistema original que gera
                  automaticamente todas as combinações possíveis. Não permite
                  remoção de combinações específicas.
                </AlertDescription>
              </Alert>

              <MasterVariationSelector
                variations={basicVariations}
                onVariationsChange={setBasicVariations}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Exemplo Prático */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplo Prático: Tênis com Variações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Cenário:</strong> Você vende tênis em cores Preto e
                Branco, tamanhos 35 ao 39. Porém, você não tem tamanho 39 na cor
                Preta em estoque.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">
                  ❌ Problema Anterior:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • Sistema criava automaticamente: Preto 35, 36, 37, 38, 39
                  </li>
                  <li>
                    • Sistema criava automaticamente: Branco 35, 36, 37, 38, 39
                  </li>
                  <li>• Não era possível remover "Preto 39"</li>
                  <li>• Cliente via produto indisponível sem explicação</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-green-600">
                  ✅ Solução Atual:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Ative modo manual no componente melhorado</li>
                  <li>
                    • Use a matriz para ativar apenas: Preto 35-38, Branco 35-39
                  </li>
                  <li>• Configure estoque individual para cada combinação</li>
                  <li>• Cliente vê apenas opções realmente disponíveis</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar o Sistema Melhorado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">1. Selecionar Tipos</div>
                <p className="text-sm text-muted-foreground">
                  Escolha quais tipos de variação usar (cor, tamanho, material,
                  etc.)
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">2. Escolher Valores</div>
                <p className="text-sm text-muted-foreground">
                  Selecione os valores específicos para cada tipo (vermelho,
                  azul, P, M, G, etc.)
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">3. Gerenciar Combinações</div>
                <p className="text-sm text-muted-foreground">
                  Use modo automático para todas as combinações ou manual para
                  controle total
                </p>
              </div>
            </div>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Dica:</strong> Para o seu caso específico, use o modo
                manual e a visualização em matriz para ativar apenas as
                combinações que você realmente possui em estoque.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VariationDemoPage;
