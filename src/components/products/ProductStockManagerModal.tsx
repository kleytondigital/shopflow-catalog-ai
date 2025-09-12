import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductVariation } from "@/types/product";
import {
  Package,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

interface ProductStockManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onStockUpdated?: () => void;
}

interface VariationStock {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  newStock: number;
  hasChanges: boolean;
}

const ProductStockManagerModal: React.FC<ProductStockManagerModalProps> = ({
  isOpen,
  onClose,
  product,
  onStockUpdated,
}) => {
  const [variations, setVariations] = useState<VariationStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Carregar variações quando o modal abre
  useEffect(() => {
    if (isOpen && product.variations) {
      const variationStocks: VariationStock[] = product.variations.map(
        (variation) => ({
          id: variation.id,
          name:
            variation.name ||
            `${variation.color || ""} ${variation.size || ""}`.trim(),
          sku: variation.sku || "",
          currentStock: variation.stock || 0,
          newStock: variation.stock || 0,
          hasChanges: false,
        })
      );
      setVariations(variationStocks);
    }
  }, [isOpen, product.variations]);

  // Atualizar estoque de uma variação
  const updateVariationStock = (variationId: string, newStock: number) => {
    setVariations((prev) =>
      prev.map((variation) => {
        if (variation.id === variationId) {
          const hasChanges = newStock !== variation.currentStock;
          return {
            ...variation,
            newStock,
            hasChanges,
          };
        }
        return variation;
      })
    );
  };

  // Resetar todas as alterações
  const resetAllChanges = () => {
    setVariations((prev) =>
      prev.map((variation) => ({
        ...variation,
        newStock: variation.currentStock,
        hasChanges: false,
      }))
    );
  };

  // Salvar alterações
  const saveChanges = async () => {
    setSaving(true);
    try {
      const changes = variations.filter((v) => v.hasChanges);

      if (changes.length === 0) {
        toast({
          title: "Nenhuma alteração",
          description: "Não há alterações para salvar.",
        });
        return;
      }

      // Atualizar cada variação com alterações
      for (const variation of changes) {
        const { error } = await supabase
          .from("product_variations")
          .update({ stock: variation.newStock })
          .eq("id", variation.id);

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Estoque atualizado!",
        description: `${changes.length} variação(ões) atualizada(s) com sucesso.`,
      });

      // Notificar atualização
      if (onStockUpdated) {
        onStockUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      toast({
        title: "Erro ao atualizar estoque",
        description: "Não foi possível atualizar o estoque das variações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Calcular totais
  const totalCurrentStock = variations.reduce(
    (sum, v) => sum + v.currentStock,
    0
  );
  const totalNewStock = variations.reduce((sum, v) => sum + v.newStock, 0);
  const totalChanges = variations.filter((v) => v.hasChanges).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gerenciar Estoque - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Resumo */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {variations.length}
                  </div>
                  <div className="text-sm text-blue-700">Variações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {totalCurrentStock}
                  </div>
                  <div className="text-sm text-green-700">Estoque Atual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalNewStock}
                  </div>
                  <div className="text-sm text-purple-700">Novo Estoque</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {totalChanges}
                  </div>
                  <div className="text-sm text-orange-700">Alterações</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Variações */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {variations.map((variation, index) => (
                <Card
                  key={variation.id}
                  className={`transition-all ${
                    variation.hasChanges
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Informações da Variação */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {variation.name || `Variação ${index + 1}`}
                          </h4>
                          {variation.sku && (
                            <Badge variant="outline" className="text-xs">
                              {variation.sku}
                            </Badge>
                          )}
                          {variation.hasChanges && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-700"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Alterado
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            Estoque atual:{" "}
                            <span className="font-medium">
                              {variation.currentStock}
                            </span>
                          </div>
                          {variation.hasChanges && (
                            <div className="text-sm text-orange-600">
                              → Novo:{" "}
                              <span className="font-medium">
                                {variation.newStock}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Input de Estoque */}
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`stock-${variation.id}`}
                          className="text-sm font-medium"
                        >
                          Estoque:
                        </Label>
                        <Input
                          id={`stock-${variation.id}`}
                          type="number"
                          min="0"
                          value={variation.newStock}
                          onChange={(e) =>
                            updateVariationStock(
                              variation.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 text-center"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateVariationStock(
                              variation.id,
                              variation.currentStock
                            )
                          }
                          className="h-8 w-8 p-0"
                          title="Resetar"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {totalChanges > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700"
                >
                  {totalChanges} alteração(ões) pendente(s)
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={resetAllChanges}
                disabled={totalChanges === 0 || saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar Tudo
              </Button>

              <Button variant="outline" onClick={onClose} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>

              <Button
                onClick={saveChanges}
                disabled={totalChanges === 0 || saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductStockManagerModal;
