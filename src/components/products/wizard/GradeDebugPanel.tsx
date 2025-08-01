import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Bug, CheckCircle, AlertTriangle } from "lucide-react";
import { ProductVariation } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import UnifiedGradeManager from "./UnifiedGradeManager";

interface GradeDebugPanelProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
  productName?: string;
}

const GradeDebugPanel: React.FC<GradeDebugPanelProps> = ({
  variations,
  onVariationsChange,
  productId,
  storeId,
  productName = "Produto Teste",
}) => {
  const { toast } = useToast();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [testMode, setTestMode] = useState<"manual" | "auto">("manual");

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleVariationsChangeDebug = (newVariations: ProductVariation[]) => {
    addLog(
      `🔄 onVariationsChange chamado com ${newVariations.length} variações`
    );
    addLog(
      `📋 Variações: ${JSON.stringify(
        newVariations.map((v) => ({
          color: v.color,
          is_grade: v.is_grade,
          grade_sizes: v.grade_sizes,
        }))
      )}`
    );

    // Chamar o callback original
    onVariationsChange(newVariations);

    toast({
      title: "✅ Debug: Variações atualizadas",
      description: `${newVariations.length} variações foram processadas.`,
    });
  };

  const testManualGrade = () => {
    addLog("🧪 Testando criação manual de grade...");

    const testVariations: ProductVariation[] = [
      {
        id: `test-${Date.now()}`,
        product_id: productId || "",
        color: "Preto",
        size: null,
        stock: 10,
        price_adjustment: 0,
        is_active: true,
        sku: "TEST-PRETO",
        image_url: "",
        variation_type: "grade",
        is_grade: true,
        grade_name: "Grade Teste - Preto",
        grade_color: "Preto",
        grade_sizes: ["36", "37", "38", "39", "40"],
        grade_pairs: [1, 2, 2, 2, 1],
        grade_quantity: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: 0,
      },
    ];

    addLog(
      `✅ Grade de teste criada: ${testVariations[0].color} com ${testVariations[0].grade_quantity} pares`
    );
    handleVariationsChangeDebug(testVariations);
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6 text-orange-600" />
            Debug Panel - Sistema de Grades
          </h2>
          <p className="text-gray-600 text-sm">
            Teste e debug do sistema de variações de grade
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={clearLogs} size="sm">
            Limpar Logs
          </Button>
          <Button
            variant={testMode === "manual" ? "default" : "outline"}
            onClick={() => setTestMode("manual")}
            size="sm"
          >
            Manual
          </Button>
          <Button
            variant={testMode === "auto" ? "default" : "outline"}
            onClick={() => setTestMode("auto")}
            size="sm"
          >
            Automático
          </Button>
        </div>
      </div>

      {/* Status Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Status Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Variações:</span>
              <div className="font-medium">{variations.length}</div>
            </div>
            <div>
              <span className="text-gray-600">Grades:</span>
              <div className="font-medium">
                {variations.filter((v) => v.is_grade).length}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Product ID:</span>
              <div className="font-medium">{productId || "Não definido"}</div>
            </div>
            <div>
              <span className="text-gray-600">Store ID:</span>
              <div className="font-medium">{storeId || "Não definido"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testes */}
      {testMode === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Teste Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Teste a criação manual de uma grade para verificar se o sistema
                funciona.
              </p>

              <Button onClick={testManualGrade} className="w-full">
                🧪 Criar Grade de Teste (Preto - 8 pares)
              </Button>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Este teste cria uma grade simples para verificar se o callback
                  onVariationsChange está funcionando.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sistema Unificado */}
      {testMode === "auto" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Sistema Unificado (Análise Inteligente)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedGradeManager
              variations={variations}
              onVariationsChange={handleVariationsChangeDebug}
              productId={productId}
              storeId={storeId}
              productName={productName}
              onComplete={() => {
                addLog(
                  "✅ onComplete chamado - Grades configuradas com sucesso"
                );
                toast({
                  title: "✅ Debug: Grades configuradas",
                  description: "O sistema unificado funcionou corretamente.",
                });
              }}
              showPreview={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Logs de Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-gray-600" />
            Logs de Debug ({debugLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Nenhum log ainda. Execute um teste para ver os logs.
              </p>
            ) : (
              <div className="space-y-1">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-gray-700">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Variações Atuais */}
      {variations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Variações Atuais ({variations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {variations.map((variation, index) => (
                <div
                  key={variation.id || index}
                  className="p-3 border rounded bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {variation.color || "Sem cor"}
                        {variation.is_grade && (
                          <Badge variant="secondary" className="ml-2">
                            Grade
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        SKU: {variation.sku} • Estoque: {variation.stock}
                        {variation.grade_sizes && (
                          <span>
                            {" "}
                            • Tamanhos: {variation.grade_sizes.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GradeDebugPanel;
