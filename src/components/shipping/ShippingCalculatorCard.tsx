
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Package, Truck } from 'lucide-react';
import { useShippingCalculator } from '@/hooks/useShippingCalculator';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';

const ShippingCalculatorCard = () => {
  const [zipCode, setZipCode] = useState('');
  const [weight, setWeight] = useState('0.5');
  const { calculateShipping, shippingOptions, loading } = useShippingCalculator();
  const { settings } = useCatalogSettings();

  const handleCalculate = async () => {
    if (zipCode) {
      await calculateShipping(zipCode, parseFloat(weight) || 0.5, settings);
    }
  };

  const formatZipCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return cleaned;
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    setZipCode(formatted);
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Calculadora de Frete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="zipcode">CEP de Destino</Label>
            <Input
              id="zipcode"
              placeholder="00000-000"
              value={zipCode}
              onChange={handleZipCodeChange}
              maxLength={9}
            />
          </div>
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleCalculate} 
              disabled={!zipCode || loading}
              className="w-full"
            >
              {loading ? 'Calculando...' : 'Calcular Frete'}
            </Button>
          </div>
        </div>

        {shippingOptions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Opções de Envio</h3>
            <div className="grid gap-3">
              {shippingOptions.map((option) => (
                <div key={option.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {option.carrier === 'Loja' ? (
                      <Package className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Truck className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <h4 className="font-medium">{option.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {option.deliveryTime} • {option.carrier}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingCalculatorCard;
