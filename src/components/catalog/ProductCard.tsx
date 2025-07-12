import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/product";
import { CatalogType } from "@/hooks/useCatalog";
import { ShoppingCart, Eye, Heart, Star, Package } from "lucide-react";
import { useProductPriceTiers } from "@/hooks/useProductPriceTiers";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import ProductImageCarousel from "./ProductImageCarousel";
import ProductPriceDisplay from "./ProductPriceDisplay";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Product;
  catalogType?: CatalogType;
  onClick?: () => void;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  catalogType = "retail",
  onClick,
  onAddToCart,
  onViewDetails,
  onToggleWishlist,
  isInWishlist = false,
}) => {
  // ✅ HOOK PARA NÍVEIS DE PREÇO
  const { tiers: priceTiers } = useProductPriceTiers(product.id, {
    wholesale_price: product.wholesale_price,
    min_wholesale_qty: product.min_wholesale_qty,
    retail_price: product.retail_price,
  });

  // Obter modelo de preço da loja
  const { priceModel, loading } = useStorePriceModel(product.store_id);
  const modelKey = priceModel?.price_model || "retail_only";

  // ✅ LÓGICA INTELIGENTE: Verificar se tem variações ativas
  const hasActiveVariations = () => {
    return product.variations && product.variations.length > 0;
  };

  // ✅ DETECTAR VARIAÇÕES DE GRADE
  const hasGradeVariations = () => {
    if (!product.variations || product.variations.length === 0) return false;
    return product.variations.some(
      (v) => v.variation_type === "grade" || v.is_grade === true
    );
  };

  // ✅ DETECTAR VARIAÇÕES TRADICIONAIS (cor/tamanho)
  const hasTraditionalVariations = () => {
    if (!product.variations || product.variations.length === 0) return false;
    return product.variations.some(
      (v) =>
        (v.variation_type !== "grade" && v.is_grade !== true) ||
        (!v.variation_type && !v.is_grade)
    );
  };

  // ✅ OBTER INFORMAÇÕES DE GRADE
  const getGradeInfo = () => {
    if (!hasGradeVariations()) return null;

    const gradeVariations =
      product.variations?.filter(
        (v) => v.variation_type === "grade" || v.is_grade === true
      ) || [];

    if (gradeVariations.length === 0) return null;

    // Agrupar por grade_name para obter informações únicas
    const gradesByName = gradeVariations.reduce((acc, variation) => {
      const gradeName = variation.grade_name || "Grade";
      if (!acc[gradeName]) {
        acc[gradeName] = {
          name: gradeName,
          colors: new Set<string>(),
          sizes: new Set<string>(),
          totalStock: 0,
          variations: [],
        };
      }

      if (variation.grade_color)
        acc[gradeName].colors.add(variation.grade_color);
      if (variation.grade_sizes) {
        variation.grade_sizes.forEach((size) => acc[gradeName].sizes.add(size));
      }
      acc[gradeName].totalStock += variation.stock || 0;
      acc[gradeName].variations.push(variation);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(gradesByName);
  };

  // ✅ LÓGICA INTELIGENTE: Verificar estoque total (produto + variações)
  const getTotalStock = () => {
    let totalStock = product.stock || 0;

    if (product.variations && product.variations.length > 0) {
      const variationsStock = product.variations.reduce((sum, variation) => {
        return sum + (variation.stock || 0);
      }, 0);

      // Se tem variações, usar o estoque das variações
      if (variationsStock > 0) {
        return variationsStock;
      }
    }

    return totalStock;
  };

  // ✅ VERIFICAR SE TEM PREÇO ATACADO DISPONÍVEL
  const hasWholesalePrice =
    product.wholesale_price && product.wholesale_price < product.retail_price;

  // ✅ VERIFICAR SE TEM NÍVEIS DE PREÇO CONFIGURADOS
  const hasPriceTiers = priceTiers && priceTiers.length > 1;

  // ✅ VERIFICAR SE TEM ATACADO DISPONÍVEL (preço simples OU níveis)
  const hasWholesaleAvailable = hasWholesalePrice || hasPriceTiers;

  const hasVariations = hasActiveVariations();
  const isGradeProduct = hasGradeVariations();
  const isTraditionalProduct = hasTraditionalVariations();
  const gradeInfo = getGradeInfo();
  const totalStock = getTotalStock();
  const isInStock = totalStock > 0;

  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
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
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  // ✅ GERAÇÃO DE AVALIAÇÃO FICTÍCIA
  const generateRating = () => {
    const hash = product.id.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 3.5 + (Math.abs(hash) % 15) / 10;
  };

  const rating = generateRating();
  const reviewCount = Math.floor(
    5 + ((product.name.length + (product.retail_price || 0)) % 45)
  );

  // ✅ RENDERIZAR ESTRELAS
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

  // ✅ BADGES MOBILE: Priorizar badges mais importantes
  const mobileBadges = [];
  if (product.is_featured)
    mobileBadges.push(
      <Badge
        key="destaque"
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-[9px] px-1.5 py-0.5"
      >
        ⭐ Destaque
      </Badge>
    );

  // Badge específico para grade
  if (isGradeProduct) {
    const firstGrade = gradeInfo?.[0];
    mobileBadges.push(
      <Badge
        key="grade"
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 text-[9px] px-1.5 py-0.5"
      >
        Grade: {firstGrade?.name || "Grade"}
      </Badge>
    );
  }
  // Badge para variações tradicionais
  else if (isTraditionalProduct) {
    mobileBadges.push(
      <Badge
        key="variacoes"
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[9px] px-1.5 py-0.5"
      >
        Variações
      </Badge>
    );
  }

  if (mobileBadges.length < 2 && priceTiers.length > 0)
    mobileBadges.push(
      <Badge
        key="atacado"
        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 text-[9px] px-1.5 py-0.5"
      >
        Atacado
      </Badge>
    );

  // ✅ TAMANHOS DISPONÍVEIS (para variações tradicionais)
  let availableSizes: string[] = [];
  if (
    isTraditionalProduct &&
    product.variations &&
    product.variations.length > 0
  ) {
    availableSizes = Array.from(
      new Set(
        product.variations
          .filter(
            (v) =>
              v.size &&
              v.stock > 0 &&
              v.variation_type !== "grade" &&
              !v.is_grade
          )
          .map((v) => v.size)
      )
    ).sort((a, b) => {
      // Ordenação numérica se possível
      const na = Number(a),
        nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b));
    });
  }

  // Filtrar tiers com preço > 0
  const positivePriceTiers = priceTiers.filter((tier) => tier.price > 0);

  // Função para renderizar preço conforme modelo de preço
  const renderPrice = () => {
    if (modelKey === "wholesale_only") {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-lg sm:text-xl font-bold text-primary">
            {formatCurrency(product.wholesale_price)}
          </span>
          <span className="text-xs text-orange-700 font-semibold">
            Preço Atacado
            {product.min_wholesale_qty
              ? ` • mín. ${product.min_wholesale_qty} un.`
              : ""}
          </span>
        </div>
      );
    }
    // ... lógica original para outros modelos ...
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-lg sm:text-xl font-bold text-primary">
          {formatCurrency(product.retail_price)}
        </span>
        {/* Preço Atacado Destacado */}
        {positivePriceTiers.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-green-600 font-semibold">
              {positivePriceTiers[0].tier_name}:{" "}
              {formatCurrency(positivePriceTiers[0].price)}
            </span>
            {positivePriceTiers.length > 1 && (
              <span
                className="text-[10px] sm:text-xs text-gray-400 cursor-pointer"
                title={positivePriceTiers
                  .map(
                    (tier) =>
                      `${tier.tier_name}: ${
                        tier.min_quantity
                      }+ un. - ${formatCurrency(tier.price)}`
                  )
                  .join("\n")}
              >
                +{positivePriceTiers.length - 1} níveis
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* BADGES MOBILE FORA DA IMAGEM */}
      <div className="flex flex-row flex-wrap gap-1 px-2 pt-2 sm:hidden">
        {mobileBadges.slice(0, 2)}
      </div>
      {/* ✅ CARROSSEL DE IMAGENS INTELIGENTE */}
      <div className="relative">
        <ProductImageCarousel
          productId={product.id}
          productName={product.name}
          showThumbnails={false}
          showNavigation={true}
          showCounter={true}
          autoPlay={false}
        />
        {/* BADGES DESKTOP SOBRE A IMAGEM */}
        <div className="absolute top-2 left-2 flex-col gap-1 z-30 hidden sm:flex">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
              ⭐ Destaque
            </Badge>
          )}
          {/* Badge específico para grade */}
          {isGradeProduct && gradeInfo?.[0] && (
            <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 text-xs">
              Grade: {gradeInfo[0].name}
            </Badge>
          )}
          {/* Badge para variações tradicionais */}
          {isTraditionalProduct && !isGradeProduct && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
              Variações
            </Badge>
          )}
          {priceTiers.length > 0 && (
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 text-xs">
              Atacado
            </Badge>
          )}
          {!isInStock && (
            <Badge variant="destructive" className="text-xs">
              Sem estoque
            </Badge>
          )}
          {isInStock && totalStock <= (product.stock_alert_threshold || 5) && (
            <Badge className="bg-orange-500 text-white text-xs">
              Estoque baixo
            </Badge>
          )}
        </div>
        {/* Botão Wishlist */}
        {onToggleWishlist && (
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all z-30 ${
              isInWishlist
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`}
            />
          </button>
        )}
      </div>
      {/* ✅ CONTEÚDO COM INFORMAÇÕES ESSENCIAIS */}
      <div className="p-2 sm:p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {product.name}
            </h3>
          </div>

          {/* ✅ INFORMAÇÕES DE GRADE */}
          {isGradeProduct && gradeInfo && gradeInfo.length > 0 && (
            <div className="space-y-2">
              {gradeInfo.map((grade, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-lg p-2 border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                      Grade: {grade.name}
                    </Badge>
                    <span className="text-xs text-blue-700 font-semibold">
                      {grade.totalStock} disponível
                    </span>
                  </div>

                  {grade.colors.size > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] sm:text-xs text-blue-700 font-medium">
                          Cores:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(grade.colors).map((color, colorIndex) => (
                          <span
                            key={colorIndex}
                            className="text-[10px] sm:text-xs text-blue-800 font-medium bg-blue-100 px-2 py-1 rounded-full border border-blue-300"
                          >
                            {String(color)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {grade.sizes.size > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] sm:text-xs text-blue-700 font-medium">
                          Tamanhos:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(grade.sizes)
                          .slice(0, 8)
                          .map((size, sizeIndex) => (
                            <span
                              key={sizeIndex}
                              className="text-[10px] sm:text-xs text-gray-800 bg-white px-2 py-1 rounded-full border border-gray-300 font-medium"
                            >
                              {size}
                            </span>
                          ))}
                        {grade.sizes.size > 8 && (
                          <span className="text-[10px] sm:text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                            +{grade.sizes.size - 8} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {product.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 truncate">
              {product.description}
            </p>
          )}
        </div>
        {/* ✅ PREÇO PADRONIZADO USANDO COMPONENTE REUTILIZÁVEL */}
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            {renderPrice()}
            {isInStock && !isGradeProduct && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {totalStock} disponível
              </span>
            )}
          </div>
          {/* ✅ TAMANHOS DISPONÍVEIS (apenas para variações tradicionais) */}
          {isTraditionalProduct &&
            !isGradeProduct &&
            availableSizes.length > 0 && (
              <div className="mt-1">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-1">
                  Disponível nos tamanhos:
                </div>
                <div className="flex flex-row flex-wrap gap-1 max-w-full overflow-x-auto pb-1">
                  {availableSizes.map((size) => (
                    <span
                      key={size}
                      className="px-2 py-0.5 rounded-md border border-gray-300 bg-gray-100 text-[11px] sm:text-xs text-gray-700 font-semibold shadow-sm select-none"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
        {/* ✅ CATEGORIA E AVALIAÇÃO */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mt-1">
          {product.category && (
            <span className="inline-block text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full truncate max-w-[90px]">
              {product.category}
            </span>
          )}
          {/* ✅ AVALIAÇÃO COM ESTRELAS */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">{renderStars(rating)}</div>
            <span className="text-[10px] sm:text-xs text-gray-500">
              ({reviewCount})
            </span>
          </div>
        </div>
        {/* ✅ BOTÃO PRINCIPAL MOBILE */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          {/* Mobile: dois botões se não tem variações */}
          <div className="block sm:hidden w-full">
            {hasVariations ? (
              <Button
                size="sm"
                onClick={handleViewDetails}
                className="w-full h-9 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver detalhes
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewDetails}
                  className="w-full h-9 mb-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
                {onAddToCart && isInStock ? (
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="w-full h-9 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                ) : (
                  <Button size="sm" disabled className="w-full h-9">
                    Indisponível
                  </Button>
                )}
              </>
            )}
          </div>
          {/* Desktop: botões originais */}
          <div className="hidden sm:flex gap-2 w-full">
            {hasVariations ? (
              <Button
                size="sm"
                onClick={handleViewDetails}
                className="flex-1 h-9 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver detalhes
              </Button>
            ) : (
              <>
                {onViewDetails && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewDetails}
                    className="flex-1 h-9"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                )}
                {onAddToCart && isInStock && (
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="flex-1 h-9 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                )}
                {!isInStock && (
                  <Button size="sm" disabled className="flex-1 h-9">
                    Indisponível
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
