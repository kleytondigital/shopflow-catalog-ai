import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, MapPin, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShippingSettings from "@/components/settings/ShippingSettings";
import ShippingCalculatorCard from "@/components/shipping/ShippingCalculatorCard";
import ShippingZonesCard from "@/components/shipping/ShippingZonesCard";

const Shipping = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculadora
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Zonas de Entrega
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" />
                Configurações de Envio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <ShippingCalculatorCard />
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <ShippingZonesCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Shipping;
