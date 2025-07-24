
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Palette, Layers, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface ProductInfoCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onView?: (product: Product) => void;
}

const ProductInfoCard: React.FC<ProductInfoCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
}) => {
  // Calcular informações sobre variações
  const variationInfo = React.useMemo(() => {
    if (!product.variations || product.variations.length === 0) {
      return null;
    }

    const colors = [...new Set(product.variations.filter(v => v.color).map(v => v.color))];
    const sizes = [...new Set(product.variations.filter(v => v.size).map(v => v.size))];
    const grades = product.variations.filter(v => v.is_grade || v.variation_type === 'grade');
    
    return {
      total: product.variations.length,
      colors: colors.length,
      sizes: sizes.length,
      grades: grades.length,
      hasVariations: true,
    };
  }, [product.variations]);

  const totalStock = React.useMemo(() => {
    if (variationInfo?.hasVariations) {
      return product.variations?.reduce((sum, variation) => sum + variation.stock, 0) || 0;
    }
    return product.stock;
  }, [product.variations, product.stock, variationInfo]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Tem certeza que deseja excluir este produto?')) {
      onDelete(product.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(product);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {product.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="text-xs bg-yellow-500">
                  Destaque
                </Badge>
              )}
              {!product.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Inativo
                </Badge>
              )}
            </div>
          </div>
          
          {/* Product Image */}
          <div className="ml-4 flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Preço Varejo:</span>
            <span className="font-semibold">{formatCurrency(product.retail_price)}</span>
          </div>
          {product.wholesale_price && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Preço Atacado:</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(product.wholesale_price)}
              </span>
            </div>
          )}
          {product.min_wholesale_qty && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Qtd. Mín. Atacado:</span>
              <span className="text-sm">{product.min_wholesale_qty} un.</span>
            </div>
          )}
        </div>

        {/* Stock Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estoque Total:</span>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalStock}
              </span>
              {totalStock <= (product.stock_alert_threshold || 5) && totalStock > 0 && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
          {product.reserved_stock && product.reserved_stock > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estoque Reservado:</span>
              <span className="text-sm text-yellow-600">{product.reserved_stock}</span>
            </div>
          )}
        </div>

        {/* Variation Information */}
        {variationInfo?.hasVariations && (
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {variationInfo.total} Variações
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {variationInfo.colors > 0 && (
                <div className="flex items-center gap-1">
                  <Palette className="h-3 w-3 text-blue-500" />
                  <span>{variationInfo.colors} cores</span>
                </div>
              )}
              {variationInfo.sizes > 0 && (
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-green-500" />
                  <span>{variationInfo.sizes} tamanhos</span>
                </div>
              )}
              {variationInfo.grades > 0 && (
                <div className="flex items-center gap-1">
                  <Layers className="h-3 w-3 text-purple-500" />
                  <span>{variationInfo.grades} grades</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleView}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfoCard;
