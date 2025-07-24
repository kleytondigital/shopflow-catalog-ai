
import React from 'react';
import { ProductVariation } from '@/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3X3, ArrowRight, Package } from 'lucide-react';

interface VariationMatrixFormProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  groups?: any[];
  values?: any[];
}

const VariationMatrixForm: React.FC<VariationMatrixFormProps> = ({
  variations,
  onVariationsChange,
  groups = [],
  values = []
}) => {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-blue-100 rounded-lg">
              <Grid3X3 className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Matriz de Variações
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Para uma configuração mais precisa e personalizada, 
              recomendamos usar o sistema de <strong>Grades</strong>.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              📊 Por que usar Grades?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left max-w-sm mx-auto">
              <li>• Controle individual de pares por tamanho</li>
              <li>• Templates otimizados para diferentes produtos</li>
              <li>• Distribuição inteligente com curva ABC</li>
              <li>• Visualização clara do estoque total</li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={() => {
                // Esta ação será interceptada pelo componente pai
                console.log('Navegar para Grade sugerido');
              }}
            >
              <Package className="w-5 h-5" />
              Usar Sistema de Grades
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <p className="text-xs text-gray-500">
              Configuração mais eficiente para produtos com múltiplas variações
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VariationMatrixForm;
