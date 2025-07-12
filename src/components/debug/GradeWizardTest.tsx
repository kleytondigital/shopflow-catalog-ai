import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductVariation } from "@/types/product";
import SimpleGradeWizard from "@/components/products/wizard/SimpleGradeWizard";
import VariationDebug from "./VariationDebug";

const GradeWizardTest: React.FC = () => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  const handleVariationsChange = (newVariations: ProductVariation[]) => {
    console.log("🧪 TESTE - Variações recebidas:", newVariations);
    setVariations(newVariations);
  };

  const createTestVariations = () => {
    const testVariations: ProductVariation[] = [
      {
        id: "test-1",
        product_id: "test-product",
        color: "Preto",
        hex_color: "#000000",
        size: "",
        sku: "PRE-BAI-123",
        stock: 5,
        price_adjustment: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variation_type: "grade",
        is_grade: true,
        grade_name: "Baixa",
        grade_color: "Preto",
        grade_quantity: 5,
        grade_sizes: ["33", "34", "35", "36", "37", "38"],
        grade_pairs: [1, 1, 1, 1, 1, 1],
        name: "Preto - Baixa",
      },
      {
        id: "test-2",
        product_id: "test-product",
        color: "Branco",
        hex_color: "#FFFFFF",
        size: "",
        sku: "BRA-ALT-456",
        stock: 3,
        price_adjustment: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variation_type: "grade",
        is_grade: true,
        grade_name: "Alta",
        grade_color: "Branco",
        grade_quantity: 3,
        grade_sizes: ["35", "36", "37", "38", "39", "40"],
        grade_pairs: [1, 1, 1, 1, 1, 1],
        name: "Branco - Alta",
      },
    ];

    console.log("🧪 TESTE - Criando variações de teste:", testVariations);
    setVariations(testVariations);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Teste do Wizard de Grade
        </h1>
        <p className="text-gray-600">
          Teste para verificar se as variações de grade estão sendo criadas
          corretamente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controles de teste */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={createTestVariations} variant="outline">
                Criar Variações de Teste
              </Button>
              <Button
                onClick={() => setShowWizard(!showWizard)}
                variant={showWizard ? "destructive" : "default"}
              >
                {showWizard ? "Ocultar" : "Mostrar"} Wizard
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Status:</h4>
              <div className="space-y-1 text-sm">
                <div>
                  Variações criadas: <Badge>{variations.length}</Badge>
                </div>
                <div>
                  Wizard visível:{" "}
                  <Badge variant={showWizard ? "default" : "secondary"}>
                    {showWizard ? "Sim" : "Não"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações das variações */}
        <Card>
          <CardHeader>
            <CardTitle>Informações das Variações</CardTitle>
          </CardHeader>
          <CardContent>
            {variations.length > 0 ? (
              <div className="space-y-2">
                {variations.map((variation, index) => (
                  <div key={variation.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <Badge
                        variant={
                          variation.variation_type === "grade"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {variation.variation_type || "sem tipo"}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>Nome:</strong>{" "}
                        {variation.name || "❌ Não definido"}
                      </div>
                      <div>
                        <strong>Grade:</strong>{" "}
                        {variation.grade_name || "❌ Não definido"}
                      </div>
                      <div>
                        <strong>Cor:</strong>{" "}
                        {variation.grade_color || "❌ Não definido"}
                      </div>
                      <div>
                        <strong>Quantidade:</strong>{" "}
                        {variation.grade_quantity || "❌ Não definido"}
                      </div>
                      <div>
                        <strong>Tamanhos:</strong>{" "}
                        {variation.grade_sizes
                          ? variation.grade_sizes.join(", ")
                          : "❌ Não definido"}
                      </div>
                      <div>
                        <strong>É Grade:</strong>{" "}
                        {variation.is_grade ? "✅ Sim" : "❌ Não"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma variação criada ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wizard */}
      {showWizard && (
        <Card>
          <CardHeader>
            <CardTitle>Wizard de Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleGradeWizard
              variations={variations}
              onVariationsChange={handleVariationsChange}
              productId="test-product"
              storeId="test-store"
              category="calçados"
              productName="Tênis Teste"
            />
          </CardContent>
        </Card>
      )}

      {/* Debug das variações */}
      {variations.length > 0 && (
        <VariationDebug
          variations={variations}
          title="Debug das Variações de Teste"
        />
      )}
    </div>
  );
};

export default GradeWizardTest;
