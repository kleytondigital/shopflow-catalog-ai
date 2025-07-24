
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const ProductsPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestão de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Página de produtos em desenvolvimento. Aqui você poderá gerenciar todos os produtos da sua loja.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
