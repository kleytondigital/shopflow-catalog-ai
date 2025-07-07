
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign } from 'lucide-react';
import ProductPriceTiersSection from '../ProductPriceTiersSection';

interface PriceTier {
  id: string;
  name: string;
  minQuantity: number;
  price: number;
  enabled: boolean;
}

interface ProductPricingFormProps {
  retailPrice: number;
  wholesalePrice?: number;
  minWholesaleQty?: number;
  stock: number;
  stockAlertThreshold?: number;
  allowNegativeStock?: boolean;
  priceTiers: PriceTier[];
  onRetailPriceChange: (price: number) => void;
  onWholesalePriceChange: (price: number) => void;
  onMinWholesaleQtyChange: (qty: number) => void;
  onStockChange: (stock: number) => void;
  onStockAlertThresholdChange: (threshold: number) => void;
  onAllowNegativeStockChange: (allow: boolean) => void;
  onPriceTiersChange: (tiers: PriceTier[]) => void;
}

const ProductPricingForm: React.FC<ProductPricingFormProps> = ({
  retailPrice,
  wholesalePrice,
  minWholesaleQty,
  stock,
  stockAlertThreshold,
  allowNegativeStock,
  priceTiers,
  onRetailPriceChange,
  onWholesalePriceChange,
  onMinWholesaleQtyChange,
  onStockChange,
  onStockAlertThresholdChange,
  onAllowNegativeStockChange,
  onPriceTiersChange,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços e Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retail_price">Preço Varejo (R$) *</Label>
              <Input
                id="retail_price"
                type="number"
                step="0.01"
                value={retailPrice}
                onChange={(e) => onRetailPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="wholesale_price">Preço Atacado (R$)</Label>
              <Input
                id="wholesale_price"
                type="number"
                step="0.01"
                value={wholesalePrice || ''}
                onChange={(e) => onWholesalePriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Estoque *</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => onStockChange(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="min_wholesale_qty">Qtd. Mínima Atacado</Label>
              <Input
                id="min_wholesale_qty"
                type="number"
                value={minWholesaleQty || 1}
                onChange={(e) => onMinWholesaleQtyChange(parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="stock_alert_threshold">Alerta de Estoque Baixo</Label>
            <Input
              id="stock_alert_threshold"
              type="number"
              value={stockAlertThreshold || 5}
              onChange={(e) => onStockAlertThresholdChange(parseInt(e.target.value) || 5)}
              placeholder="5"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow_negative_stock"
              checked={allowNegativeStock || false}
              onCheckedChange={(checked) => onAllowNegativeStockChange(!!checked)}
            />
            <Label htmlFor="allow_negative_stock">Permitir estoque negativo</Label>
          </div>
        </CardContent>
      </Card>

      <ProductPriceTiersSection
        priceTiers={priceTiers}
        onPriceTiersChange={onPriceTiersChange}
        retailPrice={retailPrice}
      />
    </div>
  );
};

export default ProductPricingForm;
