
import React from 'react';
import { ProductVariation } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

interface VariationWizardPanelProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  groups?: any[];
  values?: any[];
  loading?: boolean;
  onNavigateToGrade?: () => void;
}

const VariationWizardPanel: React.FC<VariationWizardPanelProps> = ({
  variations,
  onVariationsChange,
  groups = [],
  values = [],
  loading = false,
  onNavigateToGrade
}) => {
  const handleNavigateToGrade = () => {
    console.log('🎯 Navegando para Grade via prop onNavigateToGrade');
    if (onNavigateToGrade) {
      onNavigateToGrade();
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-purple-100 rounded-lg">
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Assistente Inteligente de Variações
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Para uma experiência mais eficiente, recomendamos usar o sistema de 
              <strong> Grades</strong> para configurar suas variações.
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">
              🎯 Configuração Recomendada
            </h4>
            <p className="text-sm text-purple-700">
              O sistema de Grades permite configurar pares individuais por tamanho, 
              cores personalizadas e templates otimizados para diferentes tipos de produtos.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 gap-2"
              onClick={handleNavigateToGrade}
            >
              <Sparkles className="w-5 h-5" />
              Ir para Sistema de Grades
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <p className="text-xs text-gray-500">
              Ou continue explorando as outras abas para diferentes métodos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VariationWizardPanel;
