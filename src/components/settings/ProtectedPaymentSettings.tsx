import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import PaymentMethodsSettings from "./PaymentMethodsSettings";

const ProtectedPaymentSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Configurações de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PaymentMethodsSettings />
      </CardContent>
    </Card>
  );
};

export default ProtectedPaymentSettings;
