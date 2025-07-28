
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Palette, Layers, AlertCircle, Eye, Edit, Trash2, Image } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useProductImages } from '@/hooks/useProductImages';

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
  const { images } = useProductImages(product.id);
  
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
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex gap-4">
          {/* Product Image Gallery */}
          <div className="flex-shrink-0">
            <div className="relative">
              {images.length > 0 ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={images[0].image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-200">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {/* Image Count Indicator */}
              {images.length > 1 && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  {images.length}
                </div>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold line-clamp-2 mb-3 text-gray-900">
              {product.name}
            </CardTitle>
            
            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {product.category && (
                <Badge variant="outline" className="text-xs font-medium">
                  {product.category}
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  ⭐ Destaque
                </Badge>
              )}
              {!product.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Inativo
                </Badge>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                <span className="text-green-700 font-medium">Estoque:</span>
                <span className={`font-bold ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalStock}
                  {totalStock <= (product.stock_alert_threshold || 5) && totalStock > 0 && (
                    <AlertCircle className="inline h-3 w-3 text-yellow-500 ml-1" />
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-blue-700 font-medium">Preço:</span>
                <span className="font-bold text-blue-600">{formatCurrency(product.retail_price)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Price Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Informações de Preço
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Varejo:</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(product.retail_price)}</span>
            </div>
            {product.wholesale_price && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">Atacado:</span>
                <span className="font-bold text-lg text-orange-600">
                  {formatCurrency(product.wholesale_price)}
                </span>
              </div>
            )}
            {product.min_wholesale_qty && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Qtd. Mín.:</span>
                <span className="font-medium text-gray-800">{product.min_wholesale_qty} un.</span>
              </div>
            )}
          </div>
        </div>

        {/* Variation Information */}
        {variationInfo?.hasVariations && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-gray-800">
                {variationInfo.total} Variações Disponíveis
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {variationInfo.colors > 0 && (
                <div className="text-center bg-white/70 py-2 px-3 rounded-lg">
                  <Palette className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-700">{variationInfo.colors}</div>
                  <div className="text-xs text-gray-500">cores</div>
                </div>
              )}
              {variationInfo.sizes > 0 && (
                <div className="text-center bg-white/70 py-2 px-3 rounded-lg">
                  <Package className="h-4 w-4 text-green-500 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-700">{variationInfo.sizes}</div>
                  <div className="text-xs text-gray-500">tamanhos</div>
                </div>
              )}
              {variationInfo.grades > 0 && (
                <div className="text-center bg-white/70 py-2 px-3 rounded-lg">
                  <Layers className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-700">{variationInfo.grades}</div>
                  <div className="text-xs text-gray-500">grades</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-medium text-gray-800 mb-2">Descrição</h4>
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleView}
            className="h-10 hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            className="h-10 hover:bg-green-50 hover:border-green-300 transition-all"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="h-10 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfoCard;
