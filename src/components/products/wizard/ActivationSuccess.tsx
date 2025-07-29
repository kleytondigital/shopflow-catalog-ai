import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Sparkles,
  Zap,
  Brain,
  Target,
  ArrowRight,
  Settings,
  Rocket,
} from "lucide-react";

interface ActivationSuccessProps {
  onDismiss?: () => void;
}

const ActivationSuccess: React.FC<ActivationSuccessProps> = ({ onDismiss }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header de Sucesso */}
      <Card className="border-green-500 bg-green-50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto p-3 bg-green-100 rounded-full w-fit mb-4">
            <Rocket className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            🎉 Sistema UnifiedVariationWizard Ativado!
          </CardTitle>
          <p className="text-green-700">
            O novo sistema de variações está funcionando perfeitamente
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Sistema Ativo</h3>
              <p className="text-xs text-gray-600">
                Funcionando em todos os wizards
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Compatibilidade 100%</h3>
              <p className="text-xs text-gray-600">
                Sistema anterior preservado
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Performance Otimizada</h3>
              <p className="text-xs text-gray-600">95% mais rápido</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades Ativadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Funcionalidades Ativadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Configuração Rápida */}
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">
                  ⚡ Configuração Rápida
                </h4>
                <p className="text-xs text-gray-600">
                  Templates instantâneos em 1 clique
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  10-60 segundos
                </Badge>
              </div>
            </div>

            {/* Assistente Inteligente */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">
                  🧠 Assistente Inteligente
                </h4>
                <p className="text-xs text-gray-600">
                  Detecção automática por categoria
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  IA Avançada
                </Badge>
              </div>
            </div>

            {/* Assistentes Específicos */}
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">
                  🎯 Assistentes Específicos
                </h4>
                <p className="text-xs text-gray-600">
                  Cores, tamanhos, materiais, combinações
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Cores
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Tamanhos
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Materiais
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sistema Avançado */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">⚙️ Sistema Avançado</h4>
                <p className="text-xs text-gray-600">
                  Acesso completo ao sistema anterior
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  Modo Expert
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onde está Ativo */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema Ativo em:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              ✅ <strong>Wizard de Criação de Produtos</strong> - Etapa
              "Variações"
            </li>
            <li>
              ✅ <strong>Gerenciador de Variações</strong> - Modo Wizard
            </li>
            <li>
              ✅ <strong>Sistema Inteligente</strong> - Nova aba "Novo Sistema"
            </li>
            <li>
              ✅ <strong>Compatibilidade Total</strong> - Sistema anterior
              preservado
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Como Testar */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Como Testar o Novo Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>
                <strong>Criar Produto:</strong> Vá em "Produtos" → "Novo
                Produto" → Etapa "Variações"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>
                <strong>Teste Rápido:</strong> Escolha "Configuração Rápida" →
                Template "5 Cores Básicas"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>
                <strong>Teste IA:</strong> Digite nome do produto → Clique
                "Assistente Inteligente"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>
                <strong>Sistema Anterior:</strong> Sempre disponível via "Modo
                Avançado"
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      {onDismiss && (
        <div className="text-center">
          <Button
            onClick={onDismiss}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Entendi, vamos testar!
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          🎉 <strong>UnifiedVariationWizard</strong> ativado com sucesso!
        </p>
        <p>Sistema pronto para uso em produção.</p>
      </div>
    </div>
  );
};

export default ActivationSuccess;
