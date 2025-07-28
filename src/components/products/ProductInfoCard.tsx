
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
    <Card className="group hover:shadow-xl transition-all duration-500 border-0 shadow-md bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 hover:from-blue-50/30 hover:to-indigo-50/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {/* Enhanced Product Image Gallery */}
          <div className="flex-shrink-0">
            <div className="relative">
              {images.length > 0 ? (
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={images[0].image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
              )}
              
              {/* Enhanced Image Count Indicator */}
              {images.length > 1 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  <Image className="h-3 w-3" />
                  <span className="font-semibold">{images.length}</span>
                </div>
              )}
              
              {/* Status Indicator */}
              <div className={`absolute -bottom-2 -left-2 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                product.is_active ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          </div>
          
          {/* Enhanced Product Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold line-clamp-2 mb-2 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
              {product.name}
            </CardTitle>
            
            {/* Enhanced Status Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {product.category && (
                <Badge variant="outline" className="text-xs font-medium bg-white/80 border-blue-200 text-blue-700">
                  {product.category}
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                  ⭐ Destaque
                </Badge>
              )}
              {!product.is_active && (
                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                  Inativo
                </Badge>
              )}
            </div>
            
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2.5 rounded-lg border border-green-100">
                <span className="text-green-700 font-semibold">Estoque:</span>
                <span className={`font-bold text-lg ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalStock}
                  {totalStock <= (product.stock_alert_threshold || 5) && totalStock > 0 && (
                    <AlertCircle className="inline h-3 w-3 text-amber-500 ml-1" />
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2.5 rounded-lg border border-blue-100">
                <span className="text-blue-700 font-semibold">Preço:</span>
                <span className="font-bold text-lg text-blue-600">{formatCurrency(product.retail_price)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enhanced Price Information Card */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            Informações de Preço
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between bg-white/60 px-3 py-2 rounded-lg">
              <span className="text-sm text-gray-700 font-semibold">Varejo:</span>
              <span className="font-bold text-xl text-gray-900">{formatCurrency(product.retail_price)}</span>
            </div>
            {product.wholesale_price && (
              <div className="flex items-center justify-between bg-white/60 px-3 py-2 rounded-lg">
                <span className="text-sm text-gray-700 font-semibold">Atacado:</span>
                <span className="font-bold text-xl text-orange-600">
                  {formatCurrency(product.wholesale_price)}
                </span>
              </div>
            )}
            {product.min_wholesale_qty && (
              <div className="flex items-center justify-between text-sm bg-white/40 px-3 py-2 rounded-lg">
                <span className="text-gray-600 font-medium">Qtd. Mín.:</span>
                <span className="font-bold text-gray-800">{product.min_wholesale_qty} un.</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Variation Information */}
        {variationInfo?.hasVariations && (
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 p-4 rounded-2xl border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-purple-600" />
              <span className="font-bold text-gray-800">
                {variationInfo.total} Variações Disponíveis
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {variationInfo.colors > 0 && (
                <div className="text-center bg-white/80 py-3 px-3 rounded-xl border border-blue-100 shadow-sm">
                  <Palette className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm font-bold text-gray-700">{variationInfo.colors}</div>
                  <div className="text-xs text-gray-500 font-medium">cores</div>
                </div>
              )}
              {variationInfo.sizes > 0 && (
                <div className="text-center bg-white/80 py-3 px-3 rounded-xl border border-green-100 shadow-sm">
                  <Package className="h-5 w-5 text-green-500 mx-auto mb-2" />
                  <div className="text-sm font-bold text-gray-700">{variationInfo.sizes}</div>
                  <div className="text-xs text-gray-500 font-medium">tamanhos</div>
                </div>
              )}
              {variationInfo.grades > 0 && (
                <div className="text-center bg-white/80 py-3 px-3 rounded-xl border border-purple-100 shadow-sm">
                  <Layers className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                  <div className="text-sm font-bold text-gray-700">{variationInfo.grades}</div>
                  <div className="text-xs text-gray-500 font-medium">grades</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Description */}
        {product.description && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-500 to-slate-600 rounded-full"></div>
              Descrição
            </h4>
            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleView}
            className="h-11 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 font-semibold transition-all duration-300 hover:shadow-md"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            className="h-11 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700 font-semibold transition-all duration-300 hover:shadow-md"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="h-11 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-red-200 text-red-700 font-semibold transition-all duration-300 hover:shadow-md"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfoCard;
