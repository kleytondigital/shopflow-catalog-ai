import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";
import ShippingMethodsSettings from "./ShippingMethodsSettings";

const ProtectedShippingSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Configurações de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ShippingMethodsSettings />
      </CardContent>
    </Card>
  );
};

export default ProtectedShippingSettings;
