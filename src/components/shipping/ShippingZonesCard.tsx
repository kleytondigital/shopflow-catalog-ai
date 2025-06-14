
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ShippingZonesCard = () => {
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          Zonas de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Configure suas Zonas de Entrega
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Defina regiões específicas para entrega local com preços e prazos personalizados.
          </p>
          <Button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Zona de Entrega
          </Button>
          <div className="mt-6 text-sm text-gray-500">
            Funcionalidade em desenvolvimento
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingZonesCard;
