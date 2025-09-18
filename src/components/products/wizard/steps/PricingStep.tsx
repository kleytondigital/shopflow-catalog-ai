import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { WizardFormData } from "@/hooks/useImprovedProductFormWizard";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { useAuth } from "@/hooks/useAuth";

interface PricingStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
}

const PricingStep: React.FC<PricingStepProps> = ({
  formData,
  updateFormData,
}) => {
  const { profile } = useAuth();
  const { priceModel } = useStorePriceModel(profile?.store_id);

  const isWholesaleOnly = priceModel?.price_model === "wholesale_only";
  const isRetailOnly = priceModel?.price_model === "retail_only";
  const isSimpleWholesale = priceModel?.price_model === "simple_wholesale";
  const isGradualWholesale = priceModel?.price_model === "gradual_wholesale";

  // Determinar quais campos são obrigatórios
  const isRetailRequired =
    isRetailOnly || isSimpleWholesale || isGradualWholesale;
  const isWholesaleRequired =
    isWholesaleOnly || isSimpleWholesale || isGradualWholesale;

  console.log("🔍 PRICING STEP - Modelo de preço:", {
    priceModel: priceModel?.price_model,
    isRetailRequired,
    isWholesaleRequired,
    retailPrice: formData.retail_price,
    wholesalePrice: formData.wholesale_price,
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Preços e Estoque</h3>

      {/* Alerta do modelo de preço */}
      {isWholesaleOnly && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo Atacado:</strong> Sua loja está configurada para venda
            apenas no atacado. O preço de atacado é obrigatório.
          </AlertDescription>
        </Alert>
      )}

      {isRetailOnly && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo Varejo:</strong> Sua loja está configurada para venda
            apenas no varejo. O preço de varejo é obrigatório.
          </AlertDescription>
        </Alert>
      )}

      {isSimpleWholesale && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Varejo + Atacado:</strong> Sua loja vende no varejo e
            atacado. Ambos os preços são obrigatórios.
          </AlertDescription>
        </Alert>
      )}

      {isGradualWholesale && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Atacado Gradativo:</strong> Sua loja usa múltiplos níveis de
            preço. Configure pelo menos o preço de varejo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preço de Varejo */}
        {!isWholesaleOnly && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Preço de Varejo
                {isRetailRequired && (
                  <Badge variant="destructive" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retailPrice">
                  Preço de Varejo (R$) {isRetailRequired && "*"}
                </Label>
                <Input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retail_price || ""}
                  onChange={(e) =>
                    updateFormData({
                      retail_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0,00"
                  className={`${
                    isRetailRequired &&
                    (!formData.retail_price || formData.retail_price <= 0)
                      ? "border-red-300"
                      : ""
                  }`}
                />
                {isRetailRequired &&
                  (!formData.retail_price || formData.retail_price <= 0) && (
                    <p className="text-xs text-red-500">
                      Preço de varejo é obrigatório
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preço de Atacado */}
        {!isRetailOnly && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Preço de Atacado
                {isWholesaleRequired && (
                  <Badge variant="destructive" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wholesalePrice">
                  Preço de Atacado (R$) {isWholesaleRequired && "*"}
                </Label>
                <Input
                  id="wholesalePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.wholesale_price || ""}
                  onChange={(e) =>
                    updateFormData({
                      wholesale_price: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="0,00"
                  className={`${
                    isWholesaleRequired &&
                    (!formData.wholesale_price || formData.wholesale_price <= 0)
                      ? "border-red-300"
                      : ""
                  }`}
                />
                {isWholesaleRequired &&
                  (!formData.wholesale_price ||
                    formData.wholesale_price <= 0) && (
                    <p className="text-xs text-red-500">
                      Preço de atacado é obrigatório
                    </p>
                  )}
              </div>
              {(isSimpleWholesale || isGradualWholesale || isWholesaleOnly) && (
                <div className="space-y-2">
                  <Label htmlFor="minWholesaleQty">
                    Quantidade Mínima Atacado
                  </Label>
                  <Input
                    id="minWholesaleQty"
                    type="number"
                    min="1"
                    value={formData.min_wholesale_qty || 1}
                    onChange={(e) =>
                      updateFormData({
                        min_wholesale_qty: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controle de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Controle de Estoque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Inicial</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock || 0}
                onChange={(e) =>
                  updateFormData({ stock: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockAlert">Alerta de Estoque Baixo</Label>
              <Input
                id="stockAlert"
                type="number"
                min="0"
                value={formData.stock_alert_threshold || 5}
                onChange={(e) =>
                  updateFormData({
                    stock_alert_threshold: parseInt(e.target.value) || 5,
                  })
                }
                placeholder="5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Permitir Estoque Negativo</Label>
              <p className="text-xs text-muted-foreground">
                Permite vender mesmo sem estoque disponível
              </p>
            </div>
            <Switch
              checked={formData.allow_negative_stock || false}
              onCheckedChange={(checked) =>
                updateFormData({ allow_negative_stock: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Produto em Destaque</Label>
              <p className="text-xs text-muted-foreground">
                Aparecerá na seção de produtos em destaque
              </p>
            </div>
            <Switch
              checked={formData.is_featured || false}
              onCheckedChange={(checked) =>
                updateFormData({ is_featured: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingStep;
