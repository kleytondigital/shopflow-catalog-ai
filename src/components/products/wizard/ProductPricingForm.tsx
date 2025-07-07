
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Package, AlertTriangle } from "lucide-react";

export interface ProductPricingFormProps {
  retailPrice: number;
  wholesalePrice?: number;
  minWholesaleQty?: number;
  stock: number;
  stockAlertThreshold?: number;
  allowNegativeStock: boolean;
  priceTiers: Array<{
    id: string;
    name: string;
    minQuantity: number;
    price: number;
    enabled: boolean;
  }>;
  onRetailPriceChange: (value: number) => void;
  onWholesalePriceChange: (value: number) => void;
  onMinWholesaleQtyChange: (value: number) => void;
  onStockChange: (value: number) => void;
  onStockAlertThresholdChange: (value: number) => void;
  onAllowNegativeStockChange: (value: boolean) => void;
  onPriceTiersChange: (tiers: any[]) => void;
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
            Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retail-price">
                Preço Varejo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="retail-price"
                type="number"
                min="0"
                step="0.01"
                value={retailPrice}
                onChange={(e) => onRetailPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wholesale-price">Preço Atacado</Label>
              <Input
                id="wholesale-price"
                type="number"
                min="0"
                step="0.01"
                value={wholesalePrice || 0}
                onChange={(e) => onWholesalePriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-wholesale-qty">Quantidade Mínima Atacado</Label>
            <Input
              id="min-wholesale-qty"
              type="number"
              min="1"
              value={minWholesaleQty || 1}
              onChange={(e) => onMinWholesaleQtyChange(parseInt(e.target.value) || 1)}
              placeholder="1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">
                Quantidade em Estoque <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => onStockChange(parseInt(e.target.value) || 0)}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-alert">Alerta de Estoque Baixo</Label>
              <Input
                id="stock-alert"
                type="number"
                min="0"
                value={stockAlertThreshold || 5}
                onChange={(e) => onStockAlertThresholdChange(parseInt(e.target.value) || 5)}
                placeholder="5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Permitir Estoque Negativo
              </Label>
              <p className="text-sm text-gray-500">
                Permite vendas mesmo com estoque zerado
              </p>
            </div>
            <Switch
              checked={allowNegativeStock}
              onCheckedChange={onAllowNegativeStockChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductPricingForm;
