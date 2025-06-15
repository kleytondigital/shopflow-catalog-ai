
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, CreditCard, Crown, Lock } from 'lucide-react';
import { CheckoutOption } from '@/hooks/useCheckoutOptions';

interface CheckoutTypeSelectorProps {
  options: CheckoutOption[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  isPremiumRequired: boolean;
  onUpgradeClick?: () => void;
}

const CheckoutTypeSelector: React.FC<CheckoutTypeSelectorProps> = ({
  options,
  selectedType,
  onTypeChange,
  isPremiumRequired,
  onUpgradeClick
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp_only':
        return MessageCircle;
      case 'online_payment':
        return CreditCard;
      default:
        return MessageCircle;
    }
  };

  const availableOptions = options.filter(option => option.available);

  if (availableOptions.length <= 1) {
    return null; // Não mostrar seletor se só há uma opção
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold">1</span>
          </div>
          Tipo de Finalização
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedType} onValueChange={onTypeChange} className="space-y-3">
          {options.map((option) => {
            const IconComponent = getIcon(option.type);
            const isBlocked = !option.available && option.requiresUpgrade;
            
            return (
              <div key={option.type} className="space-y-2">
                <div 
                  className={`flex items-center space-x-4 p-4 border-2 rounded-xl transition-all ${
                    !option.available 
                      ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50' 
                      : selectedType === option.type 
                        ? 'border-primary bg-blue-50 cursor-pointer' 
                        : 'border-gray-200 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <RadioGroupItem 
                    value={option.type} 
                    id={option.type} 
                    disabled={!option.available}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <IconComponent size={20} className="text-primary" />
                      {isBlocked && (
                        <Lock className="h-3 w-3 absolute -top-1 -right-1 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label htmlFor={option.type} className="font-semibold cursor-pointer text-lg">
                          {option.name}
                        </label>
                        {isBlocked && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </div>
                
                {isBlocked && onUpgradeClick && (
                  <div className="ml-10 pl-4 border-l-2 border-orange-200">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-800 mb-2">
                        Pagamentos online estão disponíveis apenas no plano Premium
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={onUpgradeClick}
                        className="text-orange-700 border-orange-300 hover:bg-orange-100"
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        Fazer Upgrade
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default CheckoutTypeSelector;
