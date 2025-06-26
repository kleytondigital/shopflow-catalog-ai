
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/ui/currency-input';
import { ProductFormData } from '@/hooks/useProductFormWizard';

interface ProductPricingFormProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

const ProductPricingForm: React.FC<ProductPricingFormProps> = ({
  formData,
  updateFormData
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="retail_price">Preço Varejo *</Label>
          <CurrencyInput
            value={formData.retail_price}
            onChange={(value) => updateFormData({ retail_price: value })}
            placeholder="R$ 0,00"
          />
        </div>

        <div>
          <Label htmlFor="wholesale_price">Preço Atacado</Label>
          <CurrencyInput
            value={formData.wholesale_price || 0}
            onChange={(value) => updateFormData({ wholesale_price: value || undefined })}
            placeholder="R$ 0,00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Estoque</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => updateFormData({ stock: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="min_wholesale_qty">Quantidade Mínima Atacado</Label>
          <Input
            id="min_wholesale_qty"
            type="number"
            min="1"
            value={formData.min_wholesale_qty || 1}
            onChange={(e) => updateFormData({ min_wholesale_qty: parseInt(e.target.value) || 1 })}
            placeholder="1"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="allow_negative_stock">Permitir Estoque Negativo</Label>
          <Switch
            id="allow_negative_stock"
            checked={formData.allow_negative_stock || false}
            onCheckedChange={(checked) => updateFormData({ allow_negative_stock: checked })}
          />
        </div>

        <div>
          <Label htmlFor="stock_alert_threshold">Alerta de Estoque Baixo</Label>
          <Input
            id="stock_alert_threshold"
            type="number"
            min="0"
            value={formData.stock_alert_threshold || 5}
            onChange={(e) => updateFormData({ stock_alert_threshold: parseInt(e.target.value) || 5 })}
            placeholder="5"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPricingForm;
