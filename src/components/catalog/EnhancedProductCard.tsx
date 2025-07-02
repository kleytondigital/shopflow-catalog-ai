import React, { useState, memo, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  Star,
  AlertCircle,
  Heart,
  Eye,
  Package,
  Zap,
  Badge as BadgeIcon,
  Truck,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { CatalogType } from "@/hooks/useCatalog";
import { useProductVariations } from "@/hooks/useProductVariations";
import { useCart } from "@/hooks/useCart";
import { useCatalogMode } from "@/hooks/useCatalogMode";
import { useToast } from "@/hooks/use-toast";
import { createCartItem } from "@/utils/cartHelpers";
import ProductDetailsModal from "./ProductDetailsModal";
import { useProductPriceTiers } from "@/hooks/useProductPriceTiers";

interface EnhancedProductCardProps {
  product: Product;
  catalogType: CatalogType;
  storeIdentifier?: string;
  variant?: "compact" | "standard" | "detailed";
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = memo(
  ({ product, catalogType, storeIdentifier, variant = "standard" }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { variations } = useProductVariations(product.id);
    const { addItem, items } = useCart();
    const { toast } = useToast();

    // Buscar níveis de preço do produto
    const { tiers, loading: tiersLoading } = useProductPriceTiers(
      product.id,
      product.store_id
    );

    const {
      catalogMode,
      currentCatalogType,
      calculatePrice,
      shouldShowSavingsIndicator,
      calculatePotentialSavings,
    } = useCatalogMode(storeIdentifier);

    // Usar variações do produto se disponíveis
    const productVariations = product.variations || variations;

    // Calcular quantidade atual no carrinho
    const cartQuantity = useMemo(() => {
      return items
        .filter((item) => item.product.id === product.id)
        .reduce((total, item) => total + item.quantity, 0);
    }, [items, product.id]);

    // Calcular preço efetivo
    const effectivePrice = useMemo(() => {
      return calculatePrice(product, cartQuantity + 1);
    }, [calculatePrice, product, cartQuantity]);

    // Calcular desconto potencial baseado nos níveis de preço
    const potentialSavings = useMemo(() => {
      if (!product.retail_price || tiersLoading || tiers.length <= 1) {
        return null;
      }

      // Filtrar apenas níveis ativos (exceto varejo)
      const activeTiers = tiers.filter(
        (tier) => tier.tier_order > 1 && tier.is_active
      );

      if (activeTiers.length === 0) {
        return null;
      }

      // Encontrar o nível com maior desconto
      const maxDiscountTier = activeTiers.reduce(
        (max, tier) => {
          const savingsAmount = product.retail_price - tier.price;
          const savingsPercentage =
            (savingsAmount / product.retail_price) * 100;
          return savingsPercentage > max.percentage
            ? { tier, percentage: savingsPercentage, amount: savingsAmount }
            : max;
        },
        { tier: activeTiers[0], percentage: 0, amount: 0 }
      );

      return {
        savings: maxDiscountTier.amount,
        savingsPercentage: maxDiscountTier.percentage,
        maxDiscountPercent: Math.round(maxDiscountTier.percentage),
        tier: maxDiscountTier.tier,
      };
    }, [product.retail_price, tiers, tiersLoading]);

    // Calcular desconto máximo possível (fallback para atacado simples)
    const maxDiscountPercent = useMemo(() => {
      if (potentialSavings) {
        return potentialSavings.maxDiscountPercent;
      }

      // Fallback para atacado simples
      if (!product.wholesale_price || !product.retail_price) return 0;

      const maxSavings = product.retail_price - product.wholesale_price;
      const maxPercent = (maxSavings / product.retail_price) * 100;
      return Math.round(maxPercent);
    }, [potentialSavings, product.wholesale_price, product.retail_price]);

    // Gerar avaliação baseada no ID
    const rating = useMemo(() => {
      const hash = product.id.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      return 3.5 + (Math.abs(hash) % 15) / 10;
    }, [product.id]);

    const reviewCount = useMemo(() => {
      const hash = product.name.length + (product.retail_price || 0);
      return Math.floor(15 + (hash % 85)); // Entre 15 e 100 avaliações
    }, [product.name, product.retail_price]);

    // Status do estoque
    const stockStatus = useMemo(() => {
      const stock = product.stock || 0;
      if (stock === 0)
        return {
          text: "Esgotado",
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          available: false,
        };
      if (stock <= 5)
        return {
          text: "Últimas unidades",
          color: "bg-orange-500",
          textColor: "text-orange-700",
          bgColor: "bg-orange-50",
          available: true,
        };
      if (stock > 50)
        return {
          text: "Em estoque",
          color: "bg-green-500",
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          available: true,
        };
      return {
        text: `${stock} disponíveis`,
        color: "bg-blue-500",
        textColor: "text-blue-700",
        bgColor: "bg-blue-50",
        available: true,
      };
    }, [product.stock]);

    // Calcular desconto se houver (para atacado simples)
    const hasDiscount =
      product.retail_price &&
      product.wholesale_price &&
      product.retail_price > product.wholesale_price;
    const discountPercent = hasDiscount
      ? Math.round(
          ((product.retail_price! - product.wholesale_price!) /
            product.retail_price!) *
            100
        )
      : 0;

    // Formatação de preço
    const formatPrice = (price: number) => {
      return price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      });
    };

    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!stockStatus.available) {
          toast({
            title: "Produto indisponível",
            description: "Este produto está fora de estoque.",
            variant: "destructive",
          });
          return;
        }

        if (productVariations.length > 0) {
          setShowDetailsModal(true);
        } else {
          const cartItem = createCartItem(product, catalogType, 1);
          addItem(cartItem);

          toast({
            title: "Produto adicionado!",
            description: `${product.name} foi adicionado ao carrinho.`,
          });
        }
      },
      [
        productVariations.length,
        product,
        catalogType,
        addItem,
        toast,
        stockStatus.available,
      ]
    );

    const handleCardClick = useCallback(() => {
      setShowDetailsModal(true);
    }, []);

    const handleModalAddToCart = useCallback(
      (product: Product, quantity: number, variation?: any) => {
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
      },
      [catalogType, addItem, toast]
    );

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    // Função para renderizar as estrelas
    const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const stars = [];
      const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          stars.push(
            <Star
              key={i}
              className={`${starSize} fill-yellow-400 text-yellow-400`}
            />
          );
        } else if (i === fullStars && hasHalfStar) {
          stars.push(
            <div key={i} className={`relative ${starSize}`}>
              <Star className={`${starSize} text-gray-300 absolute`} />
              <div className="overflow-hidden w-1/2">
                <Star
                  className={`${starSize} fill-yellow-400 text-yellow-400`}
                />
              </div>
            </div>
          );
        } else {
          stars.push(<Star key={i} className={`${starSize} text-gray-300`} />);
        }
      }
      return stars;
    };

    const getCardClasses = () => {
      const baseClasses =
        "group transition-all duration-300 overflow-hidden bg-white border border-gray-100 cursor-pointer";

      if (variant === "compact") {
        return `${baseClasses} hover:shadow-lg hover:scale-[1.02]`;
      }

      return `${baseClasses} hover:shadow-xl hover:scale-[1.02]`;
    };

    const getImageAspectClass = () => {
      return variant === "compact" ? "aspect-square" : "aspect-square";
    };

    return (
      <>
        <Card
          className={getCardClasses()}
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-0">
            {/* Container da Imagem */}
            <div
              className={`relative ${getImageAspectClass()} overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100`}
            >
              {!imageError ? (
                <img
                  src={
                    product.image_url ||
                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"
                  }
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  } ${isHovered ? "scale-110" : "scale-100"}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <AlertCircle className="h-12 w-12" />
                </div>
              )}

              {/* Overlay com ações rápidas */}
              <div
                className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4 text-gray-700 hover:text-blue-600 transition-colors duration-200" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="h-4 w-4 text-gray-700 hover:text-red-500 transition-colors duration-200" />
                  </Button>
                </div>
              </div>

              {/* Badges superiores */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {/* Status do estoque */}
                <Badge
                  className={`${stockStatus.color} text-white text-xs px-2 py-1 shadow-sm`}
                >
                  {stockStatus.text}
                </Badge>

                {/* Desconto atual (atacado simples) */}
                {hasDiscount && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1 shadow-sm">
                    -{discountPercent}%
                  </Badge>
                )}

                {/* Desconto potencial (níveis progressivos) */}
                {potentialSavings && potentialSavings.savingsPercentage > 0 && (
                  <Badge className="bg-orange-500 text-white text-xs px-2 py-1 shadow-sm">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Até -{maxDiscountPercent}%
                  </Badge>
                )}

                {/* Produto em destaque */}
                {product.is_featured && (
                  <Badge className="bg-purple-500 text-white text-xs px-2 py-1 shadow-sm">
                    <Zap className="h-3 w-3 mr-1" />
                    Destaque
                  </Badge>
                )}
              </div>

              {/* Badge de variações */}
              {productVariations.length > 0 && (
                <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 shadow-sm">
                  <Package className="h-3 w-3 mr-1" />
                  {productVariations.length} opções
                </Badge>
              )}
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4 space-y-3">
              {/* Categoria */}
              {product.category && variant !== "compact" && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}

              {/* Nome do produto */}
              <h3
                className={`font-semibold text-gray-900 leading-tight ${
                  variant === "compact"
                    ? "text-sm line-clamp-2"
                    : "text-base line-clamp-2"
                }`}
              >
                {product.name}
              </h3>

              {/* Avaliações */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">{renderStars(rating)}</div>
              </div>

              {/* Preços */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {/* Preço principal */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(
                          hasDiscount
                            ? product.wholesale_price!
                            : product.retail_price || 0
                        )}
                      </span>
                      {hasDiscount && product.retail_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.retail_price!)}
                        </span>
                      )}
                    </div>

                    {/* Preço atacado */}
                    {product.wholesale_price &&
                      catalogMode === "hybrid" &&
                      variant !== "compact" && (
                        <div className="text-sm text-green-600">
                          Atacado: {formatPrice(product.wholesale_price!)}
                          {product.min_wholesale_qty && (
                            <span className="text-xs text-gray-500 ml-1">
                              (min. {product.min_wholesale_qty})
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Indicador de economia potencial */}
              {potentialSavings && potentialSavings.savingsPercentage > 0 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <TrendingDown className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      Economize até {formatPrice(potentialSavings.savings)}
                      {potentialSavings.tier && (
                        <span className="text-orange-600">
                          {" "}
                          ({potentialSavings.tier.tier_name})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Botão de adicionar ao carrinho */}
              <Button
                onClick={handleAddToCart}
                disabled={!stockStatus.available}
                className={`w-full transition-all duration-200 ${
                  stockStatus.available
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                } ${variant === "compact" ? "h-8 text-xs" : "h-10"}`}
              >
                <ShoppingCart
                  className={`${
                    variant === "compact" ? "h-3 w-3" : "h-4 w-4"
                  } mr-2`}
                />
                {stockStatus.available
                  ? productVariations.length > 0
                    ? "Ver Opções"
                    : "Adicionar"
                  : "Indisponível"}
              </Button>

              {/* Quantidade no carrinho */}
              {cartQuantity > 0 && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {cartQuantity} no carrinho
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de detalhes */}
        <ProductDetailsModal
          product={product}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onAddToCart={handleModalAddToCart}
          catalogType={catalogType}
        />
      </>
    );
  }
);

EnhancedProductCard.displayName = "EnhancedProductCard";

export default EnhancedProductCard;
