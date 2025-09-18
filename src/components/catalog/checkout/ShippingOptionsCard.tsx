import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin, Clock, Smartphone } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

interface ShippingMethod {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  price: number;
  estimated_days?: number;
  config?: {
    instructions?: string;
    pickup_address?: string;
    delivery_zones?: string[];
  };
}

interface ShippingOptionsCardProps {
  shippingMethods: ShippingMethod[];
  selectedShippingMethodId: string;
  onSelectShippingMethod: (id: string) => void;
  onUpdateShippingAddress: (address: string) => void;
  currentShippingAddress: string;
}

const ShippingOptionsCard: React.FC<ShippingOptionsCardProps> = ({
  shippingMethods,
  selectedShippingMethodId,
  onSelectShippingMethod,
  onUpdateShippingAddress,
  currentShippingAddress,
}) => {
  const getShippingIcon = (type: string) => {
    switch (type) {
      case "pickup":
        return <Package className="h-5 w-5" />;
      case "delivery":
        return <Truck className="h-5 w-5" />;
      case "correios":
        return <Package className="h-5 w-5" />;
      case "combine":
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  const getShippingLabel = (type: string) => {
    switch (type) {
      case "pickup":
        return "Retirada na Loja";
      case "delivery":
        return "Entrega Local";
      case "correios":
        return "Correios";
      case "combine":
        return "A Combinar";
      default:
        return type;
    }
  };

  // Opções padrão quando não há métodos configurados
  const defaultMethods = [
    {
      id: "pickup",
      name: "Retirar na Loja",
      type: "pickup",
      is_active: true,
      price: 0,
      estimated_days: undefined,
      config: {
        instructions: "Retire seu pedido diretamente na loja",
        pickup_address: "Endereço da loja",
        delivery_zones: [],
      },
    },
    {
      id: "delivery",
      name: "Entrega a Combinar",
      type: "delivery",
      is_active: true,
      price: 0,
      estimated_days: undefined,
      config: {
        instructions: "Entrega a combinar via WhatsApp",
        pickup_address: "",
        delivery_zones: [],
      },
    },
  ];

  // Sempre usar os métodos padrão para garantir que as opções apareçam
  const methodsToShow = defaultMethods;

  if (methodsToShow.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Nenhum método de entrega configurado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Métodos de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedShippingMethodId}
          onValueChange={onSelectShippingMethod}
          className="space-y-3"
        >
          {methodsToShow.map((method) => (
            <div key={method.id} className="flex items-center space-x-3">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label
                htmlFor={method.id}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-green-600">
                    {getShippingIcon(method.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">
                      {getShippingLabel(method.type)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {method.price === 0
                        ? "Grátis"
                        : formatPrice(method.price)}
                    </div>
                    {method.estimated_days && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {method.estimated_days} dia(s)
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Endereço de Entrega */}
        {selectedShippingMethodId && selectedShippingMethodId !== "pickup" && (
          <div className="space-y-3">
            <Label htmlFor="shipping-address">Endereço de Entrega</Label>
            <Input
              id="shipping-address"
              placeholder="Digite seu endereço completo"
              value={currentShippingAddress}
              onChange={(e) => onUpdateShippingAddress(e.target.value)}
            />
          </div>
        )}

        {/* Instruções do método selecionado */}
        {selectedShippingMethodId && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800">
              <strong>Instruções:</strong>
              <p className="mt-1">
                {shippingMethods.find((m) => m.id === selectedShippingMethodId)
                  ?.config?.instructions ||
                  "Siga as instruções fornecidas pelo vendedor para a entrega."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingOptionsCard;
