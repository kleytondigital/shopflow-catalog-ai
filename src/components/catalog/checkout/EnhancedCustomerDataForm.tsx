
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, User, Mail, Phone } from 'lucide-react';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

interface EnhancedCustomerDataFormProps {
  customerData: CustomerData;
  onDataChange: (data: CustomerData) => void;
}

const EnhancedCustomerDataForm: React.FC<EnhancedCustomerDataFormProps> = ({ 
  customerData, 
  onDataChange 
}) => {
  const [fieldStatus, setFieldStatus] = useState({
    name: false,
    email: false,
    phone: false
  });

  const handleChange = (field: keyof CustomerData, value: string) => {
    onDataChange({ ...customerData, [field]: value });
    
    // Validação em tempo real
    setFieldStatus(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  };

  const validateField = (field: keyof CustomerData, value: string): boolean => {
    switch (field) {
      case 'name':
        return value.trim().length >= 2;
      case 'email':
        return value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(value);
      default:
        return false;
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50 to-purple-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold">1</span>
          </div>
          Seus Dados
          <div className="ml-auto flex gap-1">
            {Object.values(fieldStatus).filter(Boolean).length === 3 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome Completo *
            {fieldStatus.name && <CheckCircle className="h-4 w-4 text-green-500" />}
          </Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            value={customerData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`mt-1 transition-all ${
              fieldStatus.name 
                ? 'border-green-300 bg-green-50' 
                : customerData.name && !fieldStatus.name 
                  ? 'border-red-300 bg-red-50' 
                  : ''
            }`}
          />
          {customerData.name && !fieldStatus.name && (
            <p className="text-xs text-red-600">Nome deve ter pelo menos 2 caracteres</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              WhatsApp *
              {fieldStatus.phone && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={customerData.phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                handleChange('phone', formatted);
              }}
              className={`mt-1 transition-all ${
                fieldStatus.phone 
                  ? 'border-green-300 bg-green-50' 
                  : customerData.phone && !fieldStatus.phone 
                    ? 'border-red-300 bg-red-50' 
                    : ''
              }`}
              maxLength={15}
            />
            {customerData.phone && !fieldStatus.phone && (
              <p className="text-xs text-red-600">Formato: (11) 99999-9999</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email (opcional)
              {customerData.email && fieldStatus.email && <CheckCircle className="h-4 w-4 text-green-500" />}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={customerData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`mt-1 transition-all ${
                customerData.email && fieldStatus.email 
                  ? 'border-green-300 bg-green-50' 
                  : customerData.email && !fieldStatus.email 
                    ? 'border-red-300 bg-red-50' 
                    : ''
              }`}
            />
            {customerData.email && !fieldStatus.email && (
              <p className="text-xs text-red-600">Email inválido</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Importante:</strong> Após confirmar, você será redirecionado para o WhatsApp da loja automaticamente 
            para finalizar seu pedido.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCustomerDataForm;
