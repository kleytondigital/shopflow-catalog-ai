import React, { useState, useEffect } from "react";
import { useProductPriceTiers } from "../../hooks/useProductPriceTiers";
import { useStorePriceModel } from "../../hooks/useStorePriceModel";
import { ProductPriceTier } from "../../types/price-models";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Loader2, DollarSign, TrendingDown, Info } from "lucide-react";

interface ProductPriceTiersManagerProps {
  productId: string;
  storeId: string;
  retailPrice: number;
}

const ProductPriceTiersManager: React.FC<ProductPriceTiersManagerProps> = ({
  productId,
  storeId,
  retailPrice,
}) => {
  const { tiers, loading, error, updateTier, createDefaultTiers } =
    useProductPriceTiers(productId, storeId);
  const { priceModel: storePriceModel, isModelActive } =
    useStorePriceModel(storeId);
  const [saving, setSaving] = useState(false);

  // Criar níveis padrão se não existirem
  const handleCreateDefaultTiers = async () => {
    setSaving(true);
    await createDefaultTiers(retailPrice);
    setSaving(false);
  };

  // Atualizar preço de um nível
  const handlePriceChange = async (tierId: string, newPrice: number) => {
    setSaving(true);
    await updateTier(tierId, { price: newPrice });
    setSaving(false);
  };

  // Atualizar quantidade mínima de um nível
  const handleMinQtyChange = async (tierId: string, newMinQty: number) => {
    setSaving(true);
    await updateTier(tierId, { min_quantity: newMinQty });
    setSaving(false);
  };

  // Atualizar nome de um nível
  const handleNameChange = async (tierId: string, newName: string) => {
    setSaving(true);
    await updateTier(tierId, { tier_name: newName });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando níveis de preço...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">Erro: {error}</div>
    );
  }

  // Se não há níveis e o modelo não é apenas varejo, mostrar botão para criar
  if (tiers.length === 0 && storePriceModel && !isModelActive("retail_only")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Níveis de Preço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-gray-600 mb-4">
              Este produto ainda não tem níveis de preço configurados.
            </p>
            <Button
              onClick={handleCreateDefaultTiers}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Níveis Padrão
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se modelo é apenas varejo, mostrar mensagem
  if (isModelActive("retail_only")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preço Único
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <Info className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">
              Sua loja está configurada para venda apenas no varejo. Para ativar
              níveis de atacado, configure o modelo de preço nas configurações
              da loja.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Níveis de Preço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={tier.tier_order === 1 ? "default" : "secondary"}
                  >
                    Nível {tier.tier_order}
                  </Badge>
                  <span className="font-medium">{tier.tier_name}</span>
                </div>
                {tier.tier_order > 1 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">
                      {((1 - tier.price / retailPrice) * 100).toFixed(0)}%
                      desconto
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`name-${tier.id}`}>Nome do Nível</Label>
                  <Input
                    id={`name-${tier.id}`}
                    value={tier.tier_name}
                    onChange={(e) => handleNameChange(tier.id, e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor={`price-${tier.id}`}>Preço (R$)</Label>
                  <Input
                    id={`price-${tier.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={tier.price}
                    onChange={(e) =>
                      handlePriceChange(tier.id, parseFloat(e.target.value))
                    }
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label htmlFor={`minqty-${tier.id}`}>Quantidade Mínima</Label>
                  <Input
                    id={`minqty-${tier.id}`}
                    type="number"
                    min="1"
                    value={tier.min_quantity}
                    onChange={(e) =>
                      handleMinQtyChange(tier.id, parseInt(e.target.value))
                    }
                    disabled={saving || tier.tier_order === 1}
                  />
                </div>
              </div>

              {tier.tier_order === 1 && (
                <div className="mt-2 text-sm text-gray-500">
                  O nível de varejo sempre tem quantidade mínima de 1.
                </div>
              )}
            </div>
          ))}
        </div>

        {tiers.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Como funciona:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Clientes compram pelo preço do nível que atende à quantidade
              </li>
              <li>• Quanto maior a quantidade, melhor o preço</li>
              <li>• Os descontos são aplicados automaticamente no checkout</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductPriceTiersManager;
