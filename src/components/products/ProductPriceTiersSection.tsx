import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ProductPriceTiersManager from "./ProductPriceTiersManager";
import { useStorePriceModel } from "../../hooks/useStorePriceModel";
import { DollarSign, Settings, Info } from "lucide-react";

interface ProductPriceTiersSectionProps {
  productId: string;
  storeId: string;
  retailPrice: number;
}

const ProductPriceTiersSection: React.FC<ProductPriceTiersSectionProps> = ({
  productId,
  storeId,
  retailPrice,
}) => {
  const { priceModel: storePriceModel, isModelActive } =
    useStorePriceModel(storeId);

  if (!storePriceModel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Níveis de Preço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <Info className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">
              Carregando configurações de preço...
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
          <span className="text-sm font-normal text-gray-500">
            (
            {storePriceModel.price_model === "retail_only"
              ? "Apenas Varejo"
              : storePriceModel.price_model === "simple_wholesale"
              ? "Atacado Simples"
              : "Atacado Gradativo"}
            )
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tiers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tiers">Níveis de Preço</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="tiers" className="mt-4">
            <ProductPriceTiersManager
              productId={productId}
              storeId={storeId}
              retailPrice={retailPrice}
            />
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuração Atual
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <strong>Modelo:</strong>{" "}
                    {storePriceModel.price_model === "retail_only"
                      ? "Apenas Varejo"
                      : storePriceModel.price_model === "simple_wholesale"
                      ? "Atacado Simples"
                      : "Atacado Gradativo"}
                  </p>

                  {storePriceModel.price_model === "simple_wholesale" && (
                    <p>
                      <strong>Quantidade mínima para atacado:</strong>{" "}
                      {storePriceModel.simple_wholesale_min_qty}
                    </p>
                  )}

                  {storePriceModel.price_model === "gradual_wholesale" && (
                    <div>
                      <p>
                        <strong>Níveis ativos:</strong>
                      </p>
                      <ul className="ml-4 space-y-1">
                        {storePriceModel.tier_1_enabled && (
                          <li>• {storePriceModel.tier_1_name}</li>
                        )}
                        {storePriceModel.tier_2_enabled && (
                          <li>• {storePriceModel.tier_2_name}</li>
                        )}
                        {storePriceModel.tier_3_enabled && (
                          <li>• {storePriceModel.tier_3_name}</li>
                        )}
                        {storePriceModel.tier_4_enabled && (
                          <li>• {storePriceModel.tier_4_name}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Como Funciona
                </h4>
                <div className="text-sm text-green-700 space-y-2">
                  {storePriceModel.price_model === "retail_only" && (
                    <p>• Todos os clientes pagam o mesmo preço de varejo</p>
                  )}

                  {storePriceModel.price_model === "simple_wholesale" && (
                    <>
                      <p>
                        • Compras abaixo de{" "}
                        {storePriceModel.simple_wholesale_min_qty} unidades:
                        preço de varejo
                      </p>
                      <p>
                        • Compras de {storePriceModel.simple_wholesale_min_qty}{" "}
                        ou mais unidades: preço de atacado
                      </p>
                    </>
                  )}

                  {storePriceModel.price_model === "gradual_wholesale" && (
                    <>
                      <p>
                        • Múltiplos níveis de desconto baseados na quantidade
                      </p>
                      <p>• Quanto maior a quantidade, melhor o preço</p>
                      <p>• Descontos aplicados automaticamente no checkout</p>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Dica</h4>
                <p className="text-sm text-yellow-700">
                  Para alterar o modelo de preço da loja, acesse as
                  configurações da loja e vá para a seção "Modelo de Preço".
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProductPriceTiersSection;
