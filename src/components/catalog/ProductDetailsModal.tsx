
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Package, Truck, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, ProductVariation } from '@/types/product';
import { CatalogType } from '@/hooks/useCatalog';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import MultipleVariationSelector from './MultipleVariationSelector';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number, variation?: ProductVariation) => void;
  catalogType: CatalogType;
}

interface VariationSelection {
  variation: ProductVariation;
  quantity: number;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  catalogType
}) => {
  const [selectedVariations, setSelectedVariations] = useState<VariationSelection[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!product) return null;

  const price = catalogType === 'wholesale' && product.wholesale_price 
    ? product.wholesale_price 
    : product.retail_price;

  const minQuantity = catalogType === 'wholesale' && product.min_wholesale_qty 
    ? product.min_wholesale_qty 
    : 1;

  const handleAddToCart = (selections: VariationSelection[]) => {
    if (selections.length === 0) return;
    
    // Adicionar cada seleção ao carrinho
    selections.forEach(({ variation, quantity }) => {
      onAddToCart(product, quantity, variation);
    });
    
    onClose();
  };

  const hasVariations = product.variations && product.variations.length > 0;
  const totalQuantity = selectedVariations.reduce((sum, sel) => sum + sel.quantity, 0);
  const totalValue = selectedVariations.reduce((sum, sel) => {
    const variationPrice = price + (sel.variation.price_adjustment || 0);
    return sum + (variationPrice * sel.quantity);
  }, 0);

  const isDescriptionLong = product.description && product.description.length > 120;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-10 p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-left pr-8">
              {product.name}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Image Gallery */}
            <div className="order-1">
              <ProductImageGallery
                productId={product.id || ''}
                productName={product.name}
              />
            </div>

            {/* Product Information */}
            <div className="order-2 space-y-6">
              {/* Price and Category */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  {product.category && (
                    <Badge variant="secondary" className="text-sm">
                      {product.category}
                    </Badge>
                  )}
                </div>
                
                {catalogType === 'wholesale' && product.min_wholesale_qty && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Quantidade mínima: {product.min_wholesale_qty} unidades</span>
                  </div>
                )}
              </div>

              {/* Description - Concise */}
              {product.description && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">Descrição</h3>
                  <div className="space-y-2">
                    <p className={`text-sm text-muted-foreground leading-relaxed ${
                      !showFullDescription && isDescriptionLong ? 'line-clamp-3' : ''
                    }`}>
                      {product.description}
                    </p>
                    {isDescriptionLong && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                      >
                        <span className="flex items-center gap-1">
                          {showFullDescription ? 'Ver menos' : 'Ver mais'}
                          {showFullDescription ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Multiple Variation Selector */}
              {hasVariations && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Selecione Opções e Quantidades</h3>
                  <MultipleVariationSelector
                    product={product}
                    variations={product.variations || []}
                    onAddToCart={handleAddToCart}
                    catalogType={catalogType}
                  />
                </div>
              )}

              {/* Selection Summary */}
              {selectedVariations.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Resumo da Seleção</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de itens:</span>
                      <span className="font-medium">{totalQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor total:</span>
                      <span className="font-bold text-primary">
                        R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Only show if no variations or simple add to cart */}
              {!hasVariations && (
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => onAddToCart(product, minQuantity)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Adicionar ao Carrinho
                  </Button>

                  <Button variant="outline" size="lg" className="w-full">
                    <Heart className="h-5 w-5 mr-2" />
                    Adicionar aos Favoritos
                  </Button>
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-2 text-sm text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>Entrega rápida disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Compra protegida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
