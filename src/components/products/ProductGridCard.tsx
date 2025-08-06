import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProductImages } from "@/hooks/useProductImages";
import { useVariationStats } from "@/hooks/useVariationStats";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Image,
  Edit3,
  Trash2,
  Eye,
  ShoppingCart,
  Star,
  AlertTriangle,
  Camera,
} from "lucide-react";
import { Product } from "@/types/product";
import ProductStockBadge from "./ProductStockBadge";
import ProductImageManagerModal from "./ProductImageManagerModal";

interface ProductGridCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onView?: (product: Product) => void;
  onListUpdate?: () => void; // 🎯 NOVO: Callback para atualizar lista
}

const ProductGridCard: React.FC<ProductGridCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
  onListUpdate, // 🎯 NOVO: Receber callback
}) => {
  const { images } = useProductImages(product.id || "");
  const [showImageManager, setShowImageManager] = useState(false);

  // 🎯 CORRIGIDO: Calcular estoque usando o mesmo método do ProductListCard
  const totalStock = React.useMemo(() => {
    if (product.variations && product.variations.length > 0) {
      const stock = product.variations.reduce(
        (sum, variation) => sum + (variation.stock || 0),
        0
      );
      console.log(
        `📊 ${product.name}: ${stock} estoque (${product.variations.length} variações)`
      );
      return stock;
    }
    console.log(
      `📊 ${product.name}: ${product.stock || 0} estoque (produto simples)`
    );
    return product.stock || 0;
  }, [product.variations, product.stock, product.name]);

  const totalVariations = product.variations?.length || 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && product.id) {
      onDelete(product.id);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(product);
    }
  };

  // 🎯 NOVA FUNÇÃO: Abrir modal de gerenciamento de imagens
  const handleImageManagerOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImageManager(true);
  };

  // 🎯 NOVA FUNÇÃO: Callback quando imagens são atualizadas
  const handleImagesUpdated = () => {
    if (onListUpdate) {
      console.log(
        "🔄 CARD - Notificando atualização da lista após edição de imagens"
      );
      onListUpdate();
    }
  };

  return (
    <>
      <Card
        className={`group hover:shadow-lg transition-all duration-200 border overflow-hidden cursor-pointer bg-white ${
          product.is_featured
            ? "border-yellow-300 shadow-md ring-1 ring-yellow-200"
            : "border-border/50"
        }`}
      >
        <div className="relative">
          {/* Product Image Container */}
          <div className="relative aspect-square bg-muted">
            {images.length > 0 ? (
              <img
                src={images[0].image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* 🎯 NOVO: Badge de Imagens no Canto Superior Direito */}
            {images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                <Image className="h-3 w-3" />
                <span className="font-medium">{images.length}</span>
              </div>
            )}

            {/* 🎯 NOVO: Badge de Estoque no Canto Inferior Direito */}
            <div className="absolute bottom-2 right-2 bg-white/90 text-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm border border-border/30">
              <Package className="h-3 w-3" />
              <span
                className={`font-medium ${
                  totalStock > 0 ? "text-green-600" : "text-red-600"
                }`}
                title={`${totalStock} unidades em estoque${
                  totalVariations > 0 ? ` (${totalVariations} variações)` : ""
                }`}
              >
                {totalStock}
              </span>
              {totalStock <= (product.stock_alert_threshold || 5) &&
                totalStock > 0 && (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                )}
            </div>

            {/* Status Indicator */}
            <div
              className={`absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                product.is_active ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                {product.name}
              </h3>

              <div className="flex items-center gap-1.5 flex-wrap">
                {product.category && (
                  <Badge variant="outline" className="text-xs bg-background/60">
                    {product.category}
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    ⭐
                  </Badge>
                )}
                {!product.is_active && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-destructive/10 text-destructive"
                  >
                    Inativo
                  </Badge>
                )}
              </div>
            </div>

            {/* Price Info */}
            <div className="space-y-1">
              <div className="font-bold text-sm text-foreground">
                {formatCurrency(product.retail_price)}
              </div>
              {product.wholesale_price && (
                <div className="text-xs text-muted-foreground">
                  Atacado: {formatCurrency(product.wholesale_price)}
                </div>
              )}
              {product.min_wholesale_qty && (
                <div className="text-xs text-muted-foreground">
                  Mín: {product.min_wholesale_qty}un
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 🎯 NOVO: Modal de Gerenciamento de Imagens */}
      {product.id && (
        <ProductImageManagerModal
          isOpen={showImageManager}
          onClose={() => setShowImageManager(false)}
          productId={product.id}
          productName={product.name}
          onImagesUpdated={handleImagesUpdated} // 🎯 PASSAR CALLBACK PARA O MODAL
        />
      )}
    </>
  );
};

export default ProductGridCard;
