import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  Save,
} from "lucide-react";
import { ProductVariation } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useGradeVariations } from "@/hooks/useGradeVariations";
import GradeConfigurationForm from "./GradeConfigurationForm";

interface UnifiedGradeManagerProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
  productName?: string;
  onComplete?: () => void;
  showPreview?: boolean;
}

const UnifiedGradeManager: React.FC<UnifiedGradeManagerProps> = ({
  variations,
  onVariationsChange,
  productId,
  storeId,
  productName = "Produto",
  onComplete,
  showPreview = true,
}) => {
  const { toast } = useToast();

  // Usar o hook unificado para gerenciar variações de grade
  const {
    gradeVariations: existingGradeVariations,
    hasGradeVariations,
    isGenerating,
    replaceWithGrades,
    getStatistics,
  } = useGradeVariations({
    initialVariations: variations,
    onVariationsChange,
    productId,
    storeId,
  });

  const handleGradeGenerated = useCallback(
    async (gradeVariations: ProductVariation[]) => {
      console.log(
        "🎯 UNIFIED GRADE - Variações geradas:",
        gradeVariations.length
      );

      try {
        // Usar o hook para substituir as variações
        const result = await replaceWithGrades(gradeVariations);

        console.log(
          "✅ UNIFIED GRADE - Resultado do replaceWithGrades:",
          result.length
        );

        if (result.length > 0) {
          // Chamar callback de conclusão se fornecido
          if (onComplete) {
            console.log("✅ UNIFIED GRADE - Chamando onComplete");
            onComplete();
          }
        }
      } catch (error) {
        console.error("❌ Erro ao processar grades:", error);
      }
    },
    [replaceWithGrades, onComplete]
  );

  const handleSaveGrades = useCallback(async () => {
    if (existingGradeVariations.length === 0) {
      toast({
        title: "Nenhuma grade para salvar",
        description: "Gere as grades primeiro antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // As variações já foram passadas para o componente pai
      // O salvamento será feito pelo hook useProductVariations
      toast({
        title: "✅ Grades salvas!",
        description: `${existingGradeVariations.length} grade(s) foram salvas com sucesso.`,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("❌ Erro ao salvar grades:", error);
      toast({
        title: "❌ Erro ao salvar grades",
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    }
  }, [existingGradeVariations, onComplete, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Sistema Unificado de Grades
          </h2>
          <p className="text-gray-600 text-sm">
            Configure e gerencie grades de produtos de forma consistente
          </p>
        </div>

        {existingGradeVariations.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {existingGradeVariations.length} grade(s) pronta(s)
          </Badge>
        )}
      </div>

      {/* Alertas informativos */}
      {existingGradeVariations.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Atenção:</strong> Este produto já possui{" "}
            {existingGradeVariations.length} variação(ões) de grade. Gerar novas
            grades irá substituir as existentes.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuração de Grades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Configuração de Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GradeConfigurationForm
            variations={variations}
            onVariationsGenerated={handleGradeGenerated}
            productId={productId}
            storeId={storeId}
            productName={productName}
          />
        </CardContent>
      </Card>

      {/* Preview das Grades Geradas */}
      {showPreview && existingGradeVariations.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Eye className="w-5 h-5" />
              Preview das Grades Geradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingGradeVariations.map((variation, index) => (
                <div
                  key={variation.id || index}
                  className="bg-white p-3 rounded border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">
                      Grade {index + 1}:{" "}
                      {variation.grade_name ||
                        `${productName} - ${variation.color}`}
                    </h5>
                    <Badge variant="secondary">
                      {variation.grade_quantity || 0} pares
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Cor:</strong> {variation.color} •{" "}
                    <strong>Tamanhos:</strong>{" "}
                    {variation.grade_sizes?.join(", ")} • <strong>SKU:</strong>{" "}
                    {variation.sku}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-green-700">
                  <strong>Total:</strong> {existingGradeVariations.length}{" "}
                  grade(s) •{" "}
                  {existingGradeVariations.reduce(
                    (sum, v) => sum + (v.grade_quantity || 0),
                    0
                  )}{" "}
                  pares
                </div>

                <Button
                  onClick={handleSaveGrades}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isGenerating}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Grades
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status de Geração */}
      {isGenerating && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Gerando grades...</strong> Aguarde enquanto processamos as
            variações.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UnifiedGradeManager;
