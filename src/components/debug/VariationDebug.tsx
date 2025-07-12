import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductVariation } from "@/types/product";
import { Copy, Download } from "lucide-react";

interface VariationDebugProps {
  variations: ProductVariation[];
  title?: string;
}

const VariationDebug: React.FC<VariationDebugProps> = ({
  variations,
  title = "Debug das Variações",
}) => {
  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const analyzeVariations = () => {
    const analysis = {
      total: variations.length,
      types: {} as Record<string, number>,
      hasGradeFields: {
        is_grade: 0,
        grade_name: 0,
        grade_color: 0,
        grade_quantity: 0,
        grade_sizes: 0,
        grade_pairs: 0,
      },
      hasName: 0,
      hasVariationType: 0,
      sampleVariation: variations[0] || null,
    };

    variations.forEach((variation) => {
      // Contar tipos
      const type = variation.variation_type || "undefined";
      analysis.types[type] = (analysis.types[type] || 0) + 1;

      // Contar campos de grade
      if (variation.is_grade) analysis.hasGradeFields.is_grade++;
      if (variation.grade_name) analysis.hasGradeFields.grade_name++;
      if (variation.grade_color) analysis.hasGradeFields.grade_color++;
      if (variation.grade_quantity) analysis.hasGradeFields.grade_quantity++;
      if (variation.grade_sizes) analysis.hasGradeFields.grade_sizes++;
      if (variation.grade_pairs) analysis.hasGradeFields.grade_pairs++;

      // Contar outros campos
      if (variation.name) analysis.hasName++;
      if (variation.variation_type) analysis.hasVariationType++;
    });

    return analysis;
  };

  const analysis = analyzeVariations();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔍 {title}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(variations)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copiar JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadJson(variations, "variations-debug.json")}
            >
              <Download className="w-4 h-4 mr-1" />
              Baixar JSON
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Geral */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analysis.total}
            </div>
            <div className="text-sm text-blue-700">Total Variações</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analysis.hasName}
            </div>
            <div className="text-sm text-green-700">Com Nome</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analysis.hasVariationType}
            </div>
            <div className="text-sm text-purple-700">Com Tipo</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {analysis.hasGradeFields.is_grade}
            </div>
            <div className="text-sm text-orange-700">São Grade</div>
          </div>
        </div>

        {/* Tipos de Variação */}
        <div>
          <h3 className="font-semibold mb-3">📊 Tipos de Variação</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analysis.types).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-sm">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Campos de Grade */}
        <div>
          <h3 className="font-semibold mb-3">🎯 Campos de Grade</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(analysis.hasGradeFields).map(([field, count]) => (
              <div
                key={field}
                className={`p-3 rounded-lg border ${
                  count > 0
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="text-sm font-medium text-gray-700">{field}</div>
                <div
                  className={`text-lg font-bold ${
                    count > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variação de Exemplo */}
        {analysis.sampleVariation && (
          <div>
            <h3 className="font-semibold mb-3">📝 Variação de Exemplo</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(analysis.sampleVariation, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Lista Detalhada */}
        <div>
          <h3 className="font-semibold mb-3">📋 Lista Detalhada</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {variations.map((variation, index) => (
              <div
                key={variation.id || index}
                className="border rounded-lg p-3 bg-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
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
                    {variation.is_grade && (
                      <Badge className="bg-blue-600 text-white">Grade</Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    Estoque: {variation.stock}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Nome:</span>{" "}
                    <span
                      className={
                        variation.name ? "text-green-600" : "text-red-600"
                      }
                    >
                      {variation.name || "❌ Não definido"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Cor:</span>{" "}
                    <span
                      className={
                        variation.color ? "text-green-600" : "text-gray-500"
                      }
                    >
                      {variation.color || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Tamanho:</span>{" "}
                    <span
                      className={
                        variation.size ? "text-green-600" : "text-gray-500"
                      }
                    >
                      {variation.size || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">SKU:</span>{" "}
                    <span
                      className={
                        variation.sku ? "text-green-600" : "text-gray-500"
                      }
                    >
                      {variation.sku || "—"}
                    </span>
                  </div>
                </div>

                {/* Campos de Grade */}
                {(variation.is_grade ||
                  variation.variation_type === "grade") && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-xs font-medium text-blue-700 mb-1">
                      Campos de Grade:
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Grade:</span>{" "}
                        <span
                          className={
                            variation.grade_name
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {variation.grade_name || "❌"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Cor Grade:</span>{" "}
                        <span
                          className={
                            variation.grade_color
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {variation.grade_color || "❌"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Qtd:</span>{" "}
                        <span
                          className={
                            variation.grade_quantity
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {variation.grade_quantity || "❌"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Tamanhos:</span>{" "}
                        <span
                          className={
                            variation.grade_sizes
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {variation.grade_sizes
                            ? `${variation.grade_sizes.length} itens`
                            : "❌"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VariationDebug;
