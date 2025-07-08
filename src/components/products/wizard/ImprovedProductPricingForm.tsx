
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DollarSign, Package } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { QuantityInput } from '@/components/ui/quantity-input';

interface PriceTier {
  id: string;
  name: string;
  minQuantity: number;
  price: number;
  enabled: boolean;
}

interface ImprovedProductPricingFormProps {
  retailPrice: number;
  wholesalePrice?: number;
  minWholesaleQty?: number;
  stock: number;
  priceTiers: PriceTier[];
  onRetailPriceChange: (price: number) => void;
  onWholesalePriceChange: (price: number | undefined) => void;
  onMinWholesaleQtyChange: (qty: number) => void;
  onStockChange: (stock: number) => void;
  onPriceTiersChange: (tiers: PriceTier[]) => void;
}

const ImprovedProductPricingForm: React.FC<ImprovedProductPricingFormProps> = ({
  retailPrice,
  wholesalePrice,
  minWholesaleQty = 1,
  stock,
  priceTiers,
  onRetailPriceChange,
  onWholesalePriceChange,
  onMinWholesaleQtyChange,
  onStockChange,
  onPriceTiersChange,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços Principais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retail_price">Preço de Varejo *</Label>
              <CurrencyInput
                id="retail_price"
                value={retailPrice}
                onChange={onRetailPriceChange}
              />
            </div>

            <div>
              <Label htmlFor="wholesale_price">Preço de Atacado</Label>
              <CurrencyInput
                id="wholesale_price"
                value={wholesalePrice || 0}
                onChange={(value) => onWholesalePriceChange(value > 0 ? value : undefined)}
              />
            </div>

            <div>
              <Label htmlFor="min_wholesale_qty">Quantidade Mínima Atacado</Label>
              <QuantityInput
                id="min_wholesale_qty"
                value={minWholesaleQty}
                onChange={onMinWholesaleQtyChange}
                min={1}
              />
            </div>

            <div>
              <Label htmlFor="stock">Estoque Disponível *</Label>
              <QuantityInput
                id="stock"
                value={stock}
                onChange={onStockChange}
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Resumo de Preços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-900">Varejo</div>
              <div className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(retailPrice)}
              </div>
            </div>

            {wholesalePrice && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-green-900">Atacado</div>
                <div className="text-xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
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
    </div>
  );
};

export default ImprovedProductPricingForm;
