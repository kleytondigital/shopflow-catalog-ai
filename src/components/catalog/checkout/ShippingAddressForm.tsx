
import React from 'react';
import { Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
}

const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  address,
  onAddressChange,
  onCalculateShipping
}) => {
  const handleChange = (field: keyof ShippingAddress, value: string) => {
    onAddressChange({ ...address, [field]: value });
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
          <Input
            placeholder="CEP"
            value={address.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            onBlur={onCalculateShipping}
            className="flex-1"
          />
          <Button variant="outline" onClick={onCalculateShipping} className="px-4">
            <Calculator size={16} />
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
      </CardContent>
    </Card>
  );
};

export default ShippingAddressForm;
