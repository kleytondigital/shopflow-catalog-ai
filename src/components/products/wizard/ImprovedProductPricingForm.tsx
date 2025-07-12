import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Package, Settings, TrendingUp } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { QuantityInput } from "@/components/ui/quantity-input";
import { useStores } from "@/hooks/useStores";
import { supabase } from "@/integrations/supabase/client";

interface PriceTier {
  id: string;
  name: string;
  minQuantity: number;
  price: number;
  enabled: boolean;
}

interface PriceModel {
  price_model: string;
  simple_wholesale_enabled: boolean;
  simple_wholesale_min_qty: number;
  simple_wholesale_name: string;
  gradual_wholesale_enabled: boolean;
  tier_1_enabled: boolean;
  tier_1_name: string;
  tier_2_enabled: boolean;
  tier_2_name: string;
  tier_3_enabled: boolean;
  tier_3_name: string;
  tier_4_enabled: boolean;
  tier_4_name: string;
}

interface ImprovedProductPricingFormProps {
  retailPrice: number;
  wholesalePrice?: number;
  minWholesaleQty?: number;
  stock: number;
  enableGradualWholesale?: boolean;
  priceTiers: PriceTier[];
  onRetailPriceChange: (price: number) => void;
  onWholesalePriceChange: (price: number | undefined) => void;
  onMinWholesaleQtyChange: (qty: number) => void;
  onStockChange: (stock: number) => void;
  onEnableGradualWholesaleChange: (enabled: boolean) => void;
  onPriceTiersChange: (tiers: PriceTier[]) => void;
}

const ImprovedProductPricingForm: React.FC<ImprovedProductPricingFormProps> = ({
  retailPrice,
  wholesalePrice,
  minWholesaleQty = 1,
  stock,
  enableGradualWholesale = false,
  priceTiers,
  onRetailPriceChange,
  onWholesalePriceChange,
  onMinWholesaleQtyChange,
  onStockChange,
  onEnableGradualWholesaleChange,
  onPriceTiersChange,
}) => {
  const { currentStore } = useStores();
  const [priceModel, setPriceModel] = useState<PriceModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [localEnableGradualWholesale, setLocalEnableGradualWholesale] =
    useState(enableGradualWholesale);

  useEffect(() => {
    const loadPriceModel = async () => {
      if (!currentStore?.id) return;

      try {
        const { data, error } = await supabase
          .from("store_price_models")
          .select("*")
          .eq("store_id", currentStore.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPriceModel(data);
          // Verificar se atacado gradativo está habilitado na loja
          setLocalEnableGradualWholesale(
            data.gradual_wholesale_enabled && enableGradualWholesale
          );
          // Inicializar price tiers baseado no modelo
          initializePriceTiers(data);
        }
      } catch (error) {
        console.error("Erro ao carregar modelo de preços:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPriceModel();
  }, [currentStore?.id, enableGradualWholesale]);

  // Sincronizar com prop externa
  useEffect(() => {
    setLocalEnableGradualWholesale(enableGradualWholesale);
  }, [enableGradualWholesale]);

  const initializePriceTiers = (model: PriceModel) => {
    if (priceTiers.length > 0) return; // Já tem tiers

    const newTiers: PriceTier[] = [];

    if (model.gradual_wholesale_enabled) {
      if (model.tier_1_enabled) {
        newTiers.push({
          id: "tier_1",
          name: model.tier_1_name,
          minQuantity: 1,
          price: retailPrice,
          enabled: true,
        });
      }
      if (model.tier_2_enabled) {
        newTiers.push({
          id: "tier_2",
          name: model.tier_2_name,
          minQuantity: 10,
          price: retailPrice * 0.9,
          enabled: true,
        });
      }
      if (model.tier_3_enabled) {
        newTiers.push({
          id: "tier_3",
          name: model.tier_3_name,
          minQuantity: 50,
          price: retailPrice * 0.8,
          enabled: true,
        });
      }
      if (model.tier_4_enabled) {
        newTiers.push({
          id: "tier_4",
          name: model.tier_4_name,
          minQuantity: 100,
          price: retailPrice * 0.7,
          enabled: true,
        });
      }
    }

    if (newTiers.length > 0) {
      onPriceTiersChange(newTiers);
    }
  };

  const updateTierPrice = (tierId: string, price: number) => {
    const updatedTiers = priceTiers.map((tier) =>
      tier.id === tierId ? { ...tier, price } : tier
    );
    onPriceTiersChange(updatedTiers);
  };

  const updateTierQuantity = (tierId: string, minQuantity: number) => {
    const updatedTiers = priceTiers.map((tier) =>
      tier.id === tierId ? { ...tier, minQuantity } : tier
    );
    onPriceTiersChange(updatedTiers);
  };

  const handleGradualWholesaleToggle = (enabled: boolean) => {
    setLocalEnableGradualWholesale(enabled);
    onEnableGradualWholesaleChange(enabled);

    if (enabled && priceModel?.gradual_wholesale_enabled) {
      // Ativar atacado gradativo - inicializar tiers se não existirem
      if (priceTiers.length === 0) {
        initializePriceTiers(priceModel);
      }
    } else {
      // Desativar atacado gradativo - limpar tiers
      onPriceTiersChange([]);
    }
  };

  // Verificar se atacado gradativo pode ser ativado
  const canEnableGradualWholesale =
    priceModel?.gradual_wholesale_enabled && retailPrice > 0;

  // Alerta visual do modelo de preço praticado
  const renderPriceModelInfo = () => {
    switch (priceModel?.price_model) {
      case "wholesale_only":
        return (
          <div className="mb-4 p-3 rounded bg-orange-100 border border-orange-300 text-orange-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Modelo de Preço: Apenas Atacado</span>
            <span className="ml-2 text-sm">
              Venda somente em quantidade mínima, sem preço de varejo.
            </span>
          </div>
        );
      case "simple_wholesale":
        return (
          <div className="mb-4 p-3 rounded bg-green-100 border border-green-300 text-green-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">
              Modelo de Preço: Varejo + Atacado
            </span>
            <span className="ml-2 text-sm">
              Preço de varejo e preço de atacado com quantidade mínima.
            </span>
          </div>
        );
      case "gradual_wholesale":
        return (
          <div className="mb-4 p-3 rounded bg-purple-100 border border-purple-300 text-purple-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">
              Modelo de Preço: Atacado Gradual
            </span>
            <span className="ml-2 text-sm">
              Múltiplos níveis de preço conforme a quantidade.
            </span>
          </div>
        );
      default:
        return (
          <div className="mb-4 p-3 rounded bg-blue-100 border border-blue-300 text-blue-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Modelo de Preço: Apenas Varejo</span>
            <span className="ml-2 text-sm">
              Preço único para todos os clientes.
            </span>
          </div>
        );
    }
  };

  // Renderização condicional dos campos conforme modelo de preço
  const renderFields = () => {
    if (priceModel?.price_model === "wholesale_only") {
      return (
        <>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wholesale_price">Preço de Atacado (R$) *</Label>
                <CurrencyInput
                  id="wholesale_price"
                  value={wholesalePrice || 0}
                  onChange={onWholesalePriceChange}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="min_wholesale_qty">Quantidade Mínima *</Label>
                <QuantityInput
                  id="min_wholesale_qty"
                  value={minWholesaleQty || 1}
                  onChange={onMinWholesaleQtyChange}
                  min={1}
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="stock">Estoque *</Label>
            <QuantityInput
              id="stock"
              value={stock}
              onChange={onStockChange}
              min={0}
            />
          </div>
        </>
      );
    }
    // Demais modelos seguem como antes (varejo, atacado simples, gradual)
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="retail_price">Preço Varejo (R$) *</Label>
            <CurrencyInput
              id="retail_price"
              value={retailPrice}
              onChange={onRetailPriceChange}
              placeholder="0,00"
            />
          </div>
          <div>
            <Label htmlFor="wholesale_price">Preço de Atacado (R$)</Label>
            <CurrencyInput
              id="wholesale_price"
              value={wholesalePrice || 0}
              onChange={onWholesalePriceChange}
              placeholder="0,00"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="min_wholesale_qty">Quantidade Mínima</Label>
            <QuantityInput
              id="min_wholesale_qty"
              value={minWholesaleQty || 1}
              onChange={onMinWholesaleQtyChange}
              min={1}
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="stock">Estoque *</Label>
          <QuantityInput
            id="stock"
            value={stock}
            onChange={onStockChange}
            min={0}
          />
        </div>
        {/* Resumo de preço só se não for wholesale_only */}
        {priceModel?.price_model !== "wholesale_only" && (
          <div className="mt-4">
            <div className="bg-gray-50 border rounded p-4 flex flex-col md:flex-row gap-4">
              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  Preço Base
                </span>
                <span className="text-lg font-semibold text-blue-700">
                  {retailPrice?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  Estoque
                </span>
                <span className="text-lg font-semibold text-gray-700">
                  {stock} unidades
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderPriceModelInfo()}
          {renderFields()}
        </CardContent>
      </Card>

      {/* Toggle de Atacado Gradativo */}
      {priceModel?.gradual_wholesale_enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atacado Gradativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="gradual_wholesale" className="font-medium">
                    Ativar Atacado Gradativo
                  </Label>
                  {!canEnableGradualWholesale && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Preço deve ser maior que zero
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Descontos progressivos por quantidade. Configure os níveis de
                  preço abaixo.
                </p>
              </div>
              <Switch
                id="gradual_wholesale"
                checked={
                  localEnableGradualWholesale && canEnableGradualWholesale
                }
                onCheckedChange={handleGradualWholesaleToggle}
                disabled={!canEnableGradualWholesale}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preços Graduais */}
      {localEnableGradualWholesale &&
        canEnableGradualWholesale &&
        priceTiers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Níveis de Preço Gradativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {priceTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg"
                >
                  <div>
                    <Label className="font-medium">{tier.name}</Label>
                    <p className="text-sm text-gray-500">
                      A partir de {tier.minQuantity} unidades
                    </p>
                  </div>
                  <div>
                    <Label>Quantidade Mínima</Label>
                    <QuantityInput
                      value={tier.minQuantity}
                      onChange={(qty) => updateTierQuantity(tier.id, qty)}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label>Preço por Unidade</Label>
                    <CurrencyInput
                      value={tier.price}
                      onChange={(price) => updateTierPrice(tier.id, price)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      {/* Atacado Simples */}
      {priceModel?.simple_wholesale_enabled &&
        !localEnableGradualWholesale &&
        priceModel?.price_model !== "wholesale_only" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {priceModel.simple_wholesale_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wholesale_price">
                    Preço de {priceModel.simple_wholesale_name}
                  </Label>
                  <CurrencyInput
                    id="wholesale_price"
                    value={wholesalePrice || 0}
                    onChange={(value) =>
                      onWholesalePriceChange(value > 0 ? value : undefined)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="min_wholesale_qty">Quantidade Mínima</Label>
                  <QuantityInput
                    id="min_wholesale_qty"
                    value={minWholesaleQty}
                    onChange={onMinWholesaleQtyChange}
                    min={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Resumo de Preços */}
      {priceModel?.price_model !== "wholesale_only" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Resumo de Preços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-blue-900">Preço Base</div>
                <div className="text-xl font-bold text-blue-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(retailPrice)}
                </div>
              </div>

              {localEnableGradualWholesale &&
                priceTiers.map((tier) => (
                  <div key={tier.id} className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-green-900">
                      {tier.name}
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(tier.price)}
                    </div>
                    <div className="text-xs text-green-700">
                      Mín. {tier.minQuantity} unidades
                    </div>
                  </div>
                ))}

              {wholesalePrice && !localEnableGradualWholesale && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-900">
                    {priceModel?.simple_wholesale_name || "Atacado"}
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(wholesalePrice)}
                  </div>
                  <div className="text-xs text-green-700">
                    Mín. {minWholesaleQty} unidades
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">Estoque</div>
                <div className="text-xl font-bold text-gray-600">
                  {stock} unidades
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImprovedProductPricingForm;
