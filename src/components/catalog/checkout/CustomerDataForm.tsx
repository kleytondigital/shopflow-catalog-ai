
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

interface CustomerDataFormProps {
  customerData: CustomerData;
  onDataChange: (data: CustomerData) => void;
}

const CustomerDataForm: React.FC<CustomerDataFormProps> = ({ customerData, onDataChange }) => {
  const handleChange = (field: keyof CustomerData, value: string) => {
    onDataChange({ ...customerData, [field]: value });
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold">1</span>
          </div>
          Dados do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            value={customerData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={customerData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={customerData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDataForm;
