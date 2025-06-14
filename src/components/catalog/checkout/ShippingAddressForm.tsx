
import React, { useState } from 'react';
import { Calculator, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useShippingCalculator } from '@/hooks/useShippingCalculator';

interface ShippingAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ShippingAddressFormProps {
  address: ShippingAddress;
  onAddressChange: (address: ShippingAddress) => void;
  onCalculateShipping: () => void;
  onShippingCalculated?: (options: any[]) => void;
  storeSettings?: any;
}

const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  address,
  onAddressChange,
  onCalculateShipping,
  onShippingCalculated,
  storeSettings
}) => {
  const { loading, fetchAddressByZipCode, calculateShipping } = useShippingCalculator();
  const [zipCodeLoading, setZipCodeLoading] = useState(false);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    onAddressChange({ ...address, [field]: value });
  };

  const handleZipCodeBlur = async () => {
    if (address.zipCode.length >= 8) {
      setZipCodeLoading(true);
      const addressData = await fetchAddressByZipCode(address.zipCode);
      
      if (addressData) {
        onAddressChange({
          ...address,
          street: addressData.street,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state
        });
      }
      setZipCodeLoading(false);
    }
  };

  const handleCalculateShipping = async () => {
    if (address.zipCode.length >= 8) {
      const options = await calculateShipping(address.zipCode, 0.5, storeSettings);
      if (onShippingCalculated) {
        onShippingCalculated(options);
      }
      onCalculateShipping();
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

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold">3</span>
          </div>
          Endereço de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="00000-000"
              value={formatZipCode(address.zipCode)}
              onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, ''))}
              onBlur={handleZipCodeBlur}
              maxLength={9}
              className="pr-10"
            />
            {zipCodeLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={handleCalculateShipping} 
            disabled={loading || address.zipCode.length < 8}
            className="px-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calculator size={16} />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Rua"
              value={address.street}
              onChange={(e) => handleChange('street', e.target.value)}
            />
          </div>
          <Input
            placeholder="Número"
            value={address.number}
            onChange={(e) => handleChange('number', e.target.value)}
          />
        </div>

        <Input
          placeholder="Complemento"
          value={address.complement}
          onChange={(e) => handleChange('complement', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Bairro"
            value={address.neighborhood}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
          />
          <Input
            placeholder="Cidade"
            value={address.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          <Input
            placeholder="Estado"
            value={address.state}
            onChange={(e) => handleChange('state', e.target.value)}
          />
        </div>

        {address.zipCode.length >= 8 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              Digite o CEP e clique em calcular para ver as opções de frete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingAddressForm;
