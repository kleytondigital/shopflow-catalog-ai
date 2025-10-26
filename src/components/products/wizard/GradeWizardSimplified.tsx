/**
 * Wizard Simplificado para Configuração de Grades
 * 
 * Perguntas diretas e simples para usuários iniciantes
 * Configura grade flexível em 3 passos fáceis
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Package,
  TrendingUp,
  Users,
  Sparkles,
  Info,
} from "lucide-react";
import type { FlexibleGradeConfig } from "@/types/flexible-grade";
import { DEFAULT_FLEXIBLE_GRADE_CONFIG } from "@/types/flexible-grade";

interface GradeWizardSimplifiedProps {
  /** Callback quando configuração está completa */
  onComplete: (config: FlexibleGradeConfig) => void;
  /** Callback para cancelar */
  onCancel: () => void;
}

type Step = 1 | 2 | 3 | 4;

const GradeWizardSimplified: React.FC<GradeWizardSimplifiedProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [config, setConfig] = useState<FlexibleGradeConfig>(DEFAULT_FLEXIBLE_GRADE_CONFIG);

  // Respostas do usuário
  const [purchaseStyle, setPurchaseStyle] = useState<string>("");
  const [halfGradeDiscount, setHalfGradeDiscount] = useState<number>(0);
  const [allowColorMix, setAllowColorMix] = useState<string>("");

  // Avançar para próxima etapa
  const goNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  // Voltar para etapa anterior
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  // Finalizar e aplicar configuração
  const handleFinish = () => {
    // Montar configuração baseada nas respostas
    const finalConfig: FlexibleGradeConfig = {
      ...DEFAULT_FLEXIBLE_GRADE_CONFIG,
      
      // Aplicar escolhas do usuário
      allow_full_grade: purchaseStyle !== 'custom_only',
      allow_half_grade: purchaseStyle === 'sometimes_half' || purchaseStyle === 'all_options',
      allow_custom_mix: purchaseStyle === 'prefer_choose' || purchaseStyle === 'all_options' || purchaseStyle === 'custom_only',
      
      // Desconto de meia grade
      half_grade_discount_percentage: halfGradeDiscount,
      
      // Mesclagem de cores
      custom_mix_max_colors: allowColorMix === 'any_combo' ? 5 : allowColorMix === 'limited' ? 3 : 1,
      custom_mix_allow_any_size: true,
      custom_mix_min_pairs: 6,
      
      // Precificação
      pricing_mode: 'unit_based',
      apply_quantity_tiers: true,
      tier_calculation_mode: 'per_pair',
    };

    onComplete(finalConfig);
  };

  // Renderizar etapa atual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Package className="w-16 h-16 mx-auto text-blue-600" />
              <h2 className="text-2xl font-bold">Como seus clientes costumam comprar?</h2>
              <p className="text-gray-600">Escolha a opção que melhor descreve seu negócio</p>
            </div>

            <div className="space-y-3">
              {/* Opção 1 */}
              <Card
                className={`cursor-pointer transition-all ${
                  purchaseStyle === 'always_full' 
                    ? 'border-blue-600 border-2 bg-blue-50' 
                    : 'hover:border-blue-300'
                }`}
                onClick={() => setPurchaseStyle('always_full')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      purchaseStyle === 'always_full' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {purchaseStyle === 'always_full' && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Sempre em grade completa</h4>
                      <p className="text-sm text-gray-600">
                        Meus clientes sempre compram a grade inteira (ex: 21 pares)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opção 2 */}
              <Card
                className={`cursor-pointer transition-all ${
                  purchaseStyle === 'sometimes_half' 
                    ? 'border-orange-600 border-2 bg-orange-50' 
                    : 'hover:border-orange-300'
                }`}
                onClick={() => setPurchaseStyle('sometimes_half')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      purchaseStyle === 'sometimes_half' ? 'border-orange-600 bg-orange-600' : 'border-gray-300'
                    }`}>
                      {purchaseStyle === 'sometimes_half' && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Às vezes compram meia grade</h4>
                      <p className="text-sm text-gray-600">
                        Alguns preferem grade completa, outros meia grade (ex: 12 pares)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opção 3 */}
              <Card
                className={`cursor-pointer transition-all ${
                  purchaseStyle === 'prefer_choose' 
                    ? 'border-purple-600 border-2 bg-purple-50' 
                    : 'hover:border-purple-300'
                }`}
                onClick={() => setPurchaseStyle('prefer_choose')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      purchaseStyle === 'prefer_choose' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {purchaseStyle === 'prefer_choose' && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Preferem escolher os tamanhos</h4>
                      <p className="text-sm text-gray-600">
                        Clientes gostam de montar a grade com os tamanhos que precisam
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opção 4 */}
              <Card
                className={`cursor-pointer transition-all ${
                  purchaseStyle === 'all_options' 
                    ? 'border-green-600 border-2 bg-green-50' 
                    : 'hover:border-green-300'
                }`}
                onClick={() => setPurchaseStyle('all_options')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      purchaseStyle === 'all_options' ? 'border-green-600 bg-green-600' : 'border-gray-300'
                    }`}>
                      {purchaseStyle === 'all_options' && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        Todas as opções
                        <Badge className="bg-green-600">Recomendado</Badge>
                      </h4>
                      <p className="text-sm text-gray-600">
                        Oferecer máxima flexibilidade para os clientes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <TrendingUp className="w-16 h-16 mx-auto text-orange-600" />
              <h2 className="text-2xl font-bold">Qual desconto para meia grade?</h2>
              <p className="text-gray-600">Incentive compras de meia grade com desconto</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 0, label: "Sem desconto", desc: "Mesmo preço unitário" },
                { value: 5, label: "5% de desconto", desc: "Pequeno incentivo" },
                { value: 10, label: "10% de desconto", desc: "Recomendado", recommended: true },
                { value: 15, label: "15% de desconto", desc: "Grande incentivo" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    halfGradeDiscount === option.value 
                      ? 'border-orange-600 border-2 bg-orange-50' 
                      : 'hover:border-orange-300'
                  }`}
                  onClick={() => setHalfGradeDiscount(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        halfGradeDiscount === option.value ? 'border-orange-600 bg-orange-600' : 'border-gray-300'
                      }`}>
                        {halfGradeDiscount === option.value && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {option.label}
                          {option.recommended && (
                            <Badge className="bg-orange-600">Recomendado</Badge>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Exemplo:</strong> Se um par custa R$ 30,00 e você der 10% de desconto, 
                na meia grade o par sairá por R$ 27,00.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className="w-16 h-16 mx-auto text-purple-600" />
              <h2 className="text-2xl font-bold">Permitir mistura de cores?</h2>
              <p className="text-gray-600">Clientes podem montar grade com cores diferentes?</p>
            </div>

            <div className="space-y-3">
              {[
                { 
                  value: 'any_combo', 
                  label: "Sim, qualquer combinação", 
                  desc: "Até 5 cores diferentes na mesma grade",
                  icon: <Sparkles className="w-5 h-5 text-purple-600" />
                },
                { 
                  value: 'limited', 
                  label: "Sim, mas com limite", 
                  desc: "Até 3 cores diferentes",
                  icon: <Users className="w-5 h-5 text-blue-600" />,
                  recommended: true
                },
                { 
                  value: 'no_mix', 
                  label: "Não, só uma cor por grade", 
                  desc: "Mantém grade tradicional",
                  icon: <Package className="w-5 h-5 text-gray-600" />
                },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all ${
                    allowColorMix === option.value 
                      ? 'border-purple-600 border-2 bg-purple-50' 
                      : 'hover:border-purple-300'
                  }`}
                  onClick={() => setAllowColorMix(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        allowColorMix === option.value ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                      }`}>
                        {allowColorMix === option.value && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="mr-3">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {option.label}
                          {option.recommended && (
                            <Badge className="bg-purple-600">Recomendado</Badge>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        // Resumo e confirmação
        const summary = {
          modes: [] as string[],
          discount: halfGradeDiscount,
          colorMix: allowColorMix === 'any_combo' ? 'Até 5 cores' : allowColorMix === 'limited' ? 'Até 3 cores' : 'Apenas 1 cor',
        };

        if (purchaseStyle === 'always_full') {
          summary.modes.push('Grade Completa');
        } else if (purchaseStyle === 'sometimes_half') {
          summary.modes.push('Grade Completa', 'Meia Grade');
        } else if (purchaseStyle === 'prefer_choose') {
          summary.modes.push('Grade Completa', 'Montar Grade');
        } else if (purchaseStyle === 'all_options') {
          summary.modes.push('Grade Completa', 'Meia Grade', 'Montar Grade');
        } else if (purchaseStyle === 'custom_only') {
          summary.modes.push('Montar Grade');
        }

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
              <h2 className="text-2xl font-bold">Configuração Concluída!</h2>
              <p className="text-gray-600">Revise suas escolhas antes de confirmar</p>
            </div>

            {/* Resumo */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">📋 Resumo da Configuração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-green-700 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Modos de Venda:</h4>
                      <p className="text-sm text-green-800">
                        {summary.modes.join(', ')}
                      </p>
                    </div>
                  </div>

                  {(purchaseStyle === 'sometimes_half' || purchaseStyle === 'all_options') && (
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-700 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900">Desconto Meia Grade:</h4>
                        <p className="text-sm text-green-800">
                          {summary.discount}% de desconto
                        </p>
                      </div>
                    </div>
                  )}

                  {(purchaseStyle !== 'always_full' && purchaseStyle !== 'sometimes_half') && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-green-700 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900">Mesclagem de Cores:</h4>
                        <p className="text-sm text-green-800">
                          {summary.colorMix}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Dica:</strong> Você pode alterar essas configurações a qualquer momento 
                editando o produto.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  // Verificar se pode avançar
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return purchaseStyle !== "";
      case 2:
        return true; // Sempre pode avançar (0% é válido)
      case 3:
        return allowColorMix !== "";
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Configuração Rápida de Grade Flexível
            </CardTitle>
            <Badge variant="outline">
              Passo {currentStep} de 4
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Conteúdo da Etapa */}
          {renderStep()}
        </CardContent>

        {/* Footer com botões */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : goBack}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 1 ? "Cancelar" : "Voltar"}
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={goNext}
                disabled={!canGoNext()}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar Configuração
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GradeWizardSimplified;

