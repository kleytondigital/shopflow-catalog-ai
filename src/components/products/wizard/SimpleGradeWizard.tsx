
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight } from "lucide-react";
import { ProductVariation } from "@/types/product";

export interface SimpleGradeWizardProps {
  variations?: ProductVariation[];
  onVariationsChange?: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
  category?: string;
  productName?: string;
  onClose?: () => void;
  onSave?: (variations: ProductVariation[]) => void;
  onNavigateToGrade?: () => void;
}

const SimpleGradeWizard: React.FC<SimpleGradeWizardProps> = ({
  variations = [],
  onVariationsChange,
  productId,
  storeId,
  category,
  productName,
  onClose,
  onSave,
  onNavigateToGrade,
}) => {
  const [currentVariations, setCurrentVariations] = useState<ProductVariation[]>(variations);

  const handleVariationsUpdate = (newVariations: ProductVariation[]) => {
    setCurrentVariations(newVariations);
    if (onVariationsChange) {
      onVariationsChange(newVariations);
    }
  };

  const handleNavigateToGrade = () => {
    if (onNavigateToGrade) {
      onNavigateToGrade();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(currentVariations);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Package className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Sistema de Grades
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Perfeito para produtos vendidos em kits de tamanhos, como calçados, 
          chinelos, ou qualquer produto que você vende por grade.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Configurar Sistema de Grades</CardTitle>
          <Badge variant="secondary" className="mx-auto">
            Recomendado para seu produto
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              ✅ Ideal para produtos como:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Calçados (sapatos, tênis, chinelos, sandálias)</li>
              <li>• Kits de roupas por tamanho</li>
              <li>• Produtos vendidos para revendedores</li>
              <li>• Qualquer item com conjunto de tamanhos</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              🎯 Como funciona:
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Escolha as cores disponíveis</li>
              <li>• Configure as grades de tamanhos</li>
              <li>• Defina quantos pares por tamanho</li>
              <li>• O sistema gera todas as combinações</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleNavigateToGrade}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Configurar Grades Agora
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between max-w-2xl mx-auto">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <div></div>
      </div>
    </div>
  );
};

export default SimpleGradeWizard;
