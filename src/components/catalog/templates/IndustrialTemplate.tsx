import React, { useState, memo, useCallback, useMemo } from "react";
import {
  Heart,
  ShoppingCart,
  Eye,
  TrendingUp,
  AlertTriangle,
  Share2,
  Star,
  AlertCircle,
  Wrench,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/hooks/useProducts";
import { CatalogType } from "@/hooks/useCatalog";
import { useProductVariations } from "@/hooks/useProductVariations";
import { useCart } from "@/hooks/useCart";
import { useCatalogMode } from "@/hooks/useCatalogMode";
import { useToast } from "@/hooks/use-toast";
import { createCartItem } from "@/utils/cartHelpers";
import ProductDetailsModal from "../ProductDetailsModal";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";

interface IndustrialTemplateProps {
  product: Product;
  catalogType: CatalogType;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
  showPrices: boolean;
  showStock: boolean;
}

const IndustrialTemplate: React.FC<IndustrialTemplateProps> = memo(
  ({
    product,
    catalogType,
    onAddToCart,
    onAddToWishlist,
    onQuickView,
    isInWishlist,
    showPrices,
    showStock,
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { variations } = useProductVariations(product.id);
    const { addItem, items } = useCart();
    const { toast } = useToast();

    const {
      catalogMode,
      currentCatalogType,
      calculatePrice,
      shouldShowSavingsIndicator,
      calculatePotentialSavings,
    } = useCatalogMode();

    const { priceModel, loading } = useStorePriceModel(product.store_id);
    const modelKey = priceModel?.price_model || "retail_only";

    // Usar variações do produto se disponíveis, senão usar do hook
    const productVariations = product.variations || variations || [];

    // Calcular quantidade atual no carrinho para este produto
    const cartQuantity = useMemo(() => {
      return items
        .filter((item) => item.product.id === product.id)
        .reduce((total, item) => total + item.quantity, 0);
    }, [items, product.id]);

    // Calcular preço baseado no modo e quantidade do carrinho
    const effectivePrice = useMemo(() => {
      return calculatePrice(product, cartQuantity + 1);
    }, [calculatePrice, product, cartQuantity]);

    // Calcular economia potencial
    const potentialSavings = useMemo(() => {
      if (!product.wholesale_price || !product.retail_price) return null;

      const maxSavings = product.retail_price - product.wholesale_price;
      const maxPercent = (maxSavings / product.retail_price) * 100;

      return {
        savings: maxSavings,
        savingsPercentage: maxPercent,
        maxDiscountPercent: Math.round(maxPercent),
      };
    }, [product.wholesale_price, product.retail_price]);

    // Verificar se deve mostrar indicador de economia
    const showSavings = useMemo(() => {
      return shouldShowSavingsIndicator(product, cartQuantity + 1);
    }, [shouldShowSavingsIndicator, product, cartQuantity]);

    const price =
      catalogType === "wholesale"
        ? product.wholesale_price
        : product.retail_price;
    const isWholesale = catalogType === "wholesale";
    const canShowWholesale =
      product.wholesale_price && product.min_wholesale_qty;
    const isLowStock = product.stock <= 5;

    const discountPercentage =
      catalogType === "wholesale" && product.wholesale_price
        ? Math.round(
            ((product.retail_price - product.wholesale_price) /
              product.retail_price) *
              100
          )
        : 0;

    const handleShare = useCallback(async () => {
      const shareData = {
        title: product.name,
        text: product.description || "Confira este produto incrível!",
        url: window.location.href + `/produto/${product.id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copiado!",
          description:
            "O link do produto foi copiado para a área de transferência.",
        });
      }
    }, [product.name, product.description, product.id, toast]);

    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading) return;
        let qty = 1;
        let price = product.retail_price;
        let isWholesale = false;

        if (modelKey === "wholesale_only") {
          qty = product.min_wholesale_qty || 1;
          price = product.wholesale_price || product.retail_price;
          isWholesale = true;
        }

        addItem(
          {
            id: `${product.id}-default`,
            product: { ...product, price_model: modelKey },
            quantity: qty,
            price,
            originalPrice: price,
            catalogType,
            isWholesalePrice: isWholesale,
          },
          modelKey
        );
        toast({
          title: "Produto adicionado!",
          description: `${product.name} foi adicionado ao carrinho.`,
        });
      },
      [addItem, product, catalogType, modelKey, toast, loading]
    );

    const handleAddToWishlist = useCallback(() => {
      onAddToWishlist(product);
    }, [onAddToWishlist, product]);

    const handleQuickView = useCallback(() => {
      onQuickView(product);
    }, [onQuickView, product]);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    const getStockStatus = () => {
      if (product.stock === 0) return { text: "Esgotado", color: "bg-red-500" };
      if (product.stock <= 5)
        return { text: "Últimas unidades", color: "bg-orange-500" };
      if (product.stock > 50)
        return { text: "Disponível", color: "bg-green-500" };
      return { text: `${product.stock} disponíveis`, color: "bg-blue-500" };
    };

    const stockStatus = getStockStatus();

    // Gerar avaliação fictícia baseada no ID do produto
    const rating = useMemo(() => {
      const hash = product.id.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      return 3.5 + (Math.abs(hash) % 15) / 10; // Entre 3.5 e 5.0
    }, [product.id]);

    const reviewCount = useMemo(() => {
      const hash = product.name.length + (product.retail_price || 0);
      return Math.floor(5 + (hash % 45)); // Entre 5 e 50 avaliações
    }, [product.name, product.retail_price]);

    // Função para renderizar as estrelas
    const renderStars = (rating: number) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const stars = [];

      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          stars.push(
            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          );
        } else if (i === fullStars && hasHalfStar) {
          stars.push(
            <div key={i} className="relative h-3 w-3">
              <Star className="h-3 w-3 text-gray-300 absolute" />
              <div className="overflow-hidden w-1/2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          );
        } else {
          stars.push(<Star key={i} className="h-3 w-3 text-gray-300" />);
        }
      }
      return stars;
    };

    return (
      <>
        <Card
          className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 hover:border-slate-900 cursor-pointer"
          onClick={handleQuickView}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-0">
            {/* Chanfro superior direito */}
            <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-slate-900 to-slate-700 transform rotate-45 translate-x-3 -translate-y-3 z-10"></div>

            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
              {!imageError ? (
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  } ${isHovered ? "scale-110" : "scale-100"}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <AlertCircle className="h-12 w-12" />
                </div>
              )}

              {/* Overlay metálico */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Ações rápidas */}
              <div
                className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(true);
                  }}
                  className="w-9 h-9 p-0 bg-slate-100/95 hover:bg-slate-100 shadow-lg backdrop-blur-sm border border-slate-400 transition-all duration-200"
                >
                  <Eye className="h-4 w-4 text-slate-700 hover:text-blue-600 transition-colors duration-200" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWishlist(product);
                  }}
                  className="w-9 h-9 p-0 bg-slate-100/95 hover:bg-slate-100 shadow-lg backdrop-blur-sm border border-slate-400 transition-all duration-200"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isInWishlist
                        ? "fill-red-500 text-red-500"
                        : "text-slate-700 hover:text-red-500 transition-colors duration-200"
                    }`}
                  />
                </Button>
              </div>

              {/* Discount Badge - Top Left */}
              {product.wholesale_price && product.retail_price && (
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-2 py-1 font-bold shadow-lg">
                  <Wrench className="h-3 w-3 mr-1" />-
                  {Math.round(
                    ((product.retail_price - product.wholesale_price) /
                      product.retail_price) *
                      100
                  )}
                  %
                </Badge>
              )}

              {/* Desconto potencial */}
              {potentialSavings && potentialSavings.savingsPercentage > 0 && (
                <Badge className="absolute top-2 left-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs px-2 py-1 font-bold shadow-lg">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Até -{potentialSavings.maxDiscountPercent}%
                </Badge>
              )}

              {/* Stock Badge - Bottom Right */}
              {showStock && (
                <Badge
                  className={`absolute bottom-2 right-2 ${stockStatus.color} text-white text-xs px-2 py-1 font-bold shadow-lg`}
                >
                  {stockStatus.text}
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3 space-y-2 bg-gradient-to-br from-slate-50 to-white">
              {/* Category */}
              {product.category && (
                <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">
                  {product.category}
                </p>
              )}

              {/* Product Name */}
              <h3 className="font-bold text-slate-900 line-clamp-2 text-sm leading-5 min-h-[40px]">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">{renderStars(rating)}</div>
                <span className="text-xs text-slate-500">({reviewCount})</span>
              </div>

              {/* Prices */}
              {showPrices && (
                <div className="space-y-1">
                  {modelKey === "wholesale_only" ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-orange-700 font-semibold">
                        Atacado:
                      </span>
                      <span className="font-bold text-orange-700">
                        R$ {product.wholesale_price?.toFixed(2)}
                      </span>
                      {product.min_wholesale_qty && (
                        <span className="text-xs text-gray-500 ml-2">
                          Mín. {product.min_wholesale_qty} un.
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-semibold">
                          Varejo:
                        </span>
                        <span className="font-bold text-slate-900">
                          R$ {product.retail_price?.toFixed(2)}
                        </span>
                      </div>
                      {product.wholesale_price && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-red-600 font-semibold">
                            Atacado:
                          </span>
                          <span className="font-bold text-red-600">
                            R$ {product.wholesale_price.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Indicador de economia potencial */}
              {potentialSavings && potentialSavings.savingsPercentage > 0 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <TrendingDown className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      Economize até R$ {potentialSavings.savings.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full mt-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white text-sm py-2 font-bold shadow-lg border border-slate-700"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0
                  ? "Esgotado"
                  : productVariations.length > 0
                  ? "Ver Opções"
                  : "Comprar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Details Modal */}
        {showDetailsModal && (
          <ProductDetailsModal
            product={product}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            onAddToCart={(
              product: Product,
              quantity: number,
              variation?: any
            ) => {
              const cartItem = createCartItem(
                product,
                catalogType,
                quantity,
                variation
              );
              addItem(cartItem);

              toast({
                title: "Produto adicionado!",
                description: `${product.name} foi adicionado ao carrinho.`,
              });
            }}
            catalogType={catalogType}
          />
        )}
      </>
    );
  }
);

IndustrialTemplate.displayName = "IndustrialTemplate";

export default IndustrialTemplate;
