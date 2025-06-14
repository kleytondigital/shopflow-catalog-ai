
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Package, Clock } from 'lucide-react';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  carrier: string;
}

interface ShippingOptionsCardProps {
  options: ShippingOption[];
  selectedOption: string;
  onOptionChange: (option: string) => void;
  freeDeliveryAmount?: number;
  cartTotal?: number;
}

const ShippingOptionsCard: React.FC<ShippingOptionsCardProps> = ({
  options,
  selectedOption,
  onOptionChange,
  freeDeliveryAmount = 0,
  cartTotal = 0
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'pickup':
        return MapPin;
      case 'delivery':
        return Package;
      default:
        return Truck;
    }
  };

  const isFreeDelivery = (option: ShippingOption) => {
    return freeDeliveryAmount > 0 && cartTotal >= freeDeliveryAmount && option.id === 'delivery';
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
            <Truck className="h-5 w-5 text-white" />
          </div>
          Opções de Frete
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedOption} onValueChange={onOptionChange} className="space-y-3">
          {options.map((option) => {
            const IconComponent = getIcon(option.id);
            const finalPrice = isFreeDelivery(option) ? 0 : option.price;
            
            return (
              <div key={option.id} className="flex items-center space-x-4 p-4 border-2 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all cursor-pointer">
                <RadioGroupItem value={option.id} id={option.id} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <IconComponent size={20} className="text-green-600" />
                    <label htmlFor={option.id} className="font-semibold cursor-pointer text-lg">
                      {option.name}
                    </label>
                    <Badge variant="outline" className="text-xs">
                      {option.carrier}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-600">{option.deliveryTime}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isFreeDelivery(option) && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          Frete Grátis!
                        </Badge>
                      )}
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        finalPrice === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {finalPrice === 0 ? 'Grátis' : `R$ ${finalPrice.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {freeDeliveryAmount > 0 && cartTotal < freeDeliveryAmount && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-700">
              💡 <strong>Dica:</strong> Faltam apenas R$ {(freeDeliveryAmount - cartTotal).toFixed(2)} para frete grátis na entrega local!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingOptionsCard;
