
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Clock } from 'lucide-react';
import { Product } from '@/hooks/useProducts';

interface StockIndicatorProps {
  product: Product;
  availableStock: number;
  isLowStock: boolean;
}

const StockIndicator: React.FC<StockIndicatorProps> = ({ 
  product, 
  availableStock, 
  isLowStock 
}) => {
  const getStockColor = () => {
    if (availableStock <= 0) return 'bg-red-100 text-red-800';
    if (isLowStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockIcon = () => {
    if (availableStock <= 0) return <AlertTriangle className="h-3 w-3 mr-1" />;
    if (isLowStock) return <AlertTriangle className="h-3 w-3 mr-1" />;
    return <Package className="h-3 w-3 mr-1" />;
  };

  const getStockText = () => {
    if (availableStock <= 0) {
      return product.allow_negative_stock ? 'Sob encomenda' : 'Esgotado';
    }
    if (isLowStock) return `Estoque baixo (${availableStock})`;
    return `Em estoque (${availableStock})`;
  };

  return (
    <div className="flex flex-col gap-1">
      <Badge className={getStockColor()}>
        {getStockIcon()}
        {getStockText()}
      </Badge>
      
      {product.reserved_stock > 0 && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {product.reserved_stock} reservado(s)
        </Badge>
      )}
      
      <div className="text-xs text-muted-foreground">
        Total: {product.stock} | Disponível: {availableStock}
      </div>
    </div>
  );
};

export default StockIndicator;
